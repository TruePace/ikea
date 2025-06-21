// services/ExternalNewsService.js - Enhanced version with better duplicate handling and debugging
const PARTNER_API_URL = process.env.NEXT_PUBLIC_PARTNER_API_URL;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Keep track of processed items in current batch only
const currentBatchIds = new Set();

// Unicode-safe base64 encoding function
const safeBase64Encode = (str) => {
  try {
    // First encode as UTF-8, then base64
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
      return String.fromCharCode(parseInt(p1, 16));
    }));
  } catch (error) {
    // console.warn('Failed to encode string with btoa, using fallback:', error);
    // Fallback: create a simple hash-like ID
    return str.split('').map(char => char.charCodeAt(0).toString(16)).join('').substring(0, 40);
  }
};

// Alternative: Create hash-based unique ID (more reliable)
const createUniqueId = (str) => {
  // Simple hash function for creating consistent IDs
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `ext-${Math.abs(hash).toString(36)}${Date.now().toString(36)}`.substring(0, 30);
};

export const fetchExternalNews = async (ipInfo) => {
  try {
    // console.log('🔄 Fetching external news with IP info:', ipInfo);
    
    // Clear current batch tracking
    currentBatchIds.clear();
    
    const query = new URLSearchParams({
      ip: ipInfo.ip,
    }).toString();

    const response = await fetch(`${PARTNER_API_URL}?${query}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Version': '1.0.0',
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      // console.error('Partner API error:', errorData || response.statusText);
      throw new Error('Failed to fetch external news');
    }

    const data = await response.json();
    // console.log('📰 Received external news data:', {
    //   totalArticles: data.articles?.length || 0,
    //   status: data.status,
    //   totalResults: data.totalResults
    // });

    // Ensure we have articles
    if (!data.articles || !Array.isArray(data.articles)) {
      // console.log('❌ No articles found in response');
      return [];
    }

    // Enhanced processing with better tracking
    const savedNews = [];
    const skippedReasons = {
      missingContent: 0,
      duplicateInBatch: 0,
      existsInDatabase: 0,
      channelCreationFailed: 0,
      saveFailed: 0,
      expired: 0
    };
    
    const now = new Date();
    
    // console.log(`🔍 Processing ${data.articles.length} articles...`);
    
    for (let i = 0; i < data.articles.length; i++) {
      const item = data.articles[i];
      
      try {
        // console.log(`\n📄 Processing article ${i + 1}/${data.articles.length}: ${item.title?.substring(0, 50)}...`);
        
        // Skip articles without proper content
        if (!item.title || !item.url) {
          // console.log(`⚠️ Skipping article ${i + 1}: Missing title or URL`);
          skippedReasons.missingContent++;
          continue;
        }

        // Create more reliable unique ID
        const cleanTitle = (item.title || '').replace(/[^\w\s-]/g, '').trim();
        const cleanUrl = (item.url || '').replace(/[^\w\s-:/.-]/g, '');
        const publishedAt = item.publishedAt || '';
        
        // Use just URL for uniqueness to avoid title variations
        const contentForId = `${cleanUrl}`;
        
        // Use the safer encoding method
        let uniqueId;
        try {
          uniqueId = `ext-${safeBase64Encode(contentForId).replace(/[^a-zA-Z0-9]/g, '').substring(0, 30)}`;
        } catch (error) {
          // console.warn(`⚠️ Base64 encoding failed for article ${i + 1}, using hash method:`, error);
          uniqueId = createUniqueId(contentForId);
        }
        
        // console.log(`🔑 Generated unique ID: ${uniqueId}`);
        
        // Skip if already processed in this current batch
        if (currentBatchIds.has(uniqueId)) {
          // console.log(`⚠️ Skipping article ${i + 1}: Duplicate in current batch - ${uniqueId}`);
          skippedReasons.duplicateInBatch++;
          continue;
        }
        
        // Check if this news already exists in database using externalId
        try {
          const existsResponse = await fetch(`${API_BASE_URL}/api/HeadlineNews/Content/check-external/${uniqueId}`);
          if (existsResponse.ok) {
            const existingContent = await existsResponse.json();
            if (existingContent) {
              // console.log(`⚠️ Article ${i + 1} already exists in database: ${uniqueId}`);
              // Even if content exists, ensure its channel exists
              const sourceName = item.source?.name || 'External News';
              await createOrGetChannelForExternalSource(sourceName);
              skippedReasons.existsInDatabase++;
              continue;
            }
          }
        } catch (checkError) {
          // console.warn(`⚠️ Error checking if article ${i + 1} exists, proceeding with save:`, checkError.message);
        }
        
        // Create or get channel for this source FIRST
        const sourceName = item.source?.name || 'External News';
        // console.log(`🏢 Creating/getting channel for: ${sourceName}`);
        
        let channel;
        try {
          channel = await createOrGetChannelForExternalSource(sourceName);
        } catch (channelError) {
          // console.error(`❌ Failed to create/get channel for article ${i + 1} - ${sourceName}:`, channelError);
          skippedReasons.channelCreationFailed++;
          continue;
        }
        
        if (!channel || !channel._id) {
          // console.error(`❌ Article ${i + 1}: No valid channel returned for source: ${sourceName}`);
          skippedReasons.channelCreationFailed++;
          continue;
        }
        
        // console.log(`✅ Channel ready: ${channel.name} (${channel._id})`);
        
        // Add to current batch set (only for this fetch operation)
        currentBatchIds.add(uniqueId);
        
        const publishedAtDate = new Date(item.publishedAt || Date.now());
        const timeSincePublished = now - publishedAtDate;
        
        // Calculate expiration times
        const justInDuration = 15 * 60 * 1000; // 15 minutes
        const externalHeadlineDuration = 48 * 60 * 60 * 1000; // 48 hours for external news
        
        let isJustIn = false;
        let justInExpiresAt = null;
        
        // Only put in Just In if published within the last 15 minutes
        if (timeSincePublished < justInDuration) {
          isJustIn = true;
          justInExpiresAt = new Date(publishedAtDate.getTime() + justInDuration);
          // console.log(`⚡ Article ${i + 1} qualifies for Just In (published ${Math.round(timeSincePublished / 60000)} min ago)`);
        } else {
          // console.log(`📰 Article ${i + 1} going to Headlines (published ${Math.round(timeSincePublished / 60000)} min ago)`);
        }
        
        // External news gets 48 hours in headline news
        const headlineExpiresAt = new Date(publishedAtDate.getTime() + externalHeadlineDuration);
        
        // Don't include if it's already expired from headlines (after 48 hours)
        if (now > headlineExpiresAt) {
          // console.log(`⚠️ Article ${i + 1} already expired: ${item.title}`);
          skippedReasons.expired++;
          continue;
        }

        // Create comprehensive message with description
        let message = item.title || '';
        if (item.description && item.description.trim()) {
          message += `\n\n${item.description.trim()}`;
        }
        
        const newsContent = {
          // Remove custom _id - let MongoDB generate it
          externalId: uniqueId, // Use this field for tracking uniqueness
          message: message,
          picture: item.urlToImage || null,
          channelId: channel._id,
          isJustIn: isJustIn,
          justInExpiresAt: justInExpiresAt,
          headlineExpiresAt: headlineExpiresAt,
          uploadedAt: publishedAtDate,
          createdAt: publishedAtDate,
          likeCount: 0,
          dislikeCount: 0,
          commentCount: 0,
          shareCount: 0,
          tags: item.category ? [item.category] : ['external'],
          source: 'external',
          originalSource: sourceName,
          originalUrl: item.url || null,
          fetchedAt: now,
          engagementScore: 0,
          viralScore: 0,
          showInAllChannels: !isJustIn // Show in all channels if not in Just In
        };

        // console.log(`💾 Attempting to save article ${i + 1}: ${newsContent.message.substring(0, 50)}...`);
        
        // Save to database
        try {
          const saveResponse = await fetch(`${API_BASE_URL}/api/HeadlineNews/Content`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(newsContent),
          });
          
          if (saveResponse.ok) {
            const savedContent = await saveResponse.json();
            savedNews.push(savedContent);
            
            // Log success
            const destination = newsContent.isJustIn ? 'Just In (15min)' : 'Headline News (48hr)';
            // console.log(`✅ Article ${i + 1} saved to ${destination}: ${sourceName} - ${newsContent.message.substring(0, 50)}...`);
          } else {
            const errorText = await saveResponse.text();
            // console.error(`❌ Failed to save article ${i + 1}: ${errorText}`);
            // console.error('Failed content:', JSON.stringify(newsContent, null, 2));
            skippedReasons.saveFailed++;
          }
        } catch (saveError) {
          // console.error(`❌ Error saving article ${i + 1}:`, saveError);
          skippedReasons.saveFailed++;
        }
        
      } catch (itemError) {
        // console.error(`❌ Error processing article ${i + 1}:`, itemError);
        // console.error('Failed item:', item);
        skippedReasons.saveFailed++;
        // Continue processing other items even if one fails
        continue;
      }
    }

    // Summary report
    // console.log('\n📊 PROCESSING SUMMARY:');
    // console.log('='.repeat(50));
    // console.log(`📰 Total articles received: ${data.articles.length}`);
    // console.log(`✅ Successfully saved: ${savedNews.length}`);
    // console.log(`❌ Skipped articles: ${data.articles.length - savedNews.length}`);
    // console.log('\n📋 Skip reasons breakdown:');
    // console.log(`   • Missing content: ${skippedReasons.missingContent}`);
    // console.log(`   • Duplicate in batch: ${skippedReasons.duplicateInBatch}`);
    // console.log(`   • Already in database: ${skippedReasons.existsInDatabase}`);
    // console.log(`   • Channel creation failed: ${skippedReasons.channelCreationFailed}`);
    // console.log(`   • Save operation failed: ${skippedReasons.saveFailed}`);
    // console.log(`   • Content expired: ${skippedReasons.expired}`);
    // console.log('='.repeat(50));
    
    // Clear batch tracking after processing
    currentBatchIds.clear();
    
    return savedNews;
  } catch (error) {
    // console.error('❌ Error fetching external news:', error);
    return [];
  }
};

// Enhanced channel creation with better error handling
export const createOrGetChannelForExternalSource = async (source) => {
  try {
    // Normalize source name for consistent matching
    const normalizedSourceName = source.trim();
    
    // console.log(`🔍 Looking for channel: ${normalizedSourceName}`);
    
    // First try to get existing channel using the API endpoint
    const getResponse = await fetch(`${API_BASE_URL}/api/HeadlineNews/Channel/external/${encodeURIComponent(normalizedSourceName)}`);
    
    if (getResponse.ok) {
      const channel = await getResponse.json();
      // console.log(`✅ Found existing channel for ${normalizedSourceName}: ${channel._id}`);
      return channel;
    }
    
    // Double-check by fetching all channels and searching manually
    const allChannelsResponse = await fetch(`${API_BASE_URL}/api/HeadlineNews/Channel`);
    if (allChannelsResponse.ok) {
      const allChannels = await allChannelsResponse.json();
      const existingChannel = allChannels.find(ch => 
        ch.isExternal && 
        ch.name.toLowerCase().trim() === normalizedSourceName.toLowerCase().trim()
      );
      
      if (existingChannel) {
        // console.log(`✅ Found existing channel via manual search for ${normalizedSourceName}: ${existingChannel._id}`);
        return existingChannel;
      }
    }
    
    // If channel doesn't exist, create one
    // console.log(`🆕 Creating new channel for external source: ${normalizedSourceName}`);
    const createResponse = await fetch(`${API_BASE_URL}/api/HeadlineNews/Channel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: normalizedSourceName,
        picture: '/NopicAvatar.png',
        description: `External news from ${normalizedSourceName}`,
        tags: ['external'],
        isExternal: true,
        contentCount: 0,
        totalViews: 0,
        avgEngagementRate: 0,
        subscriberCount: 0
      }),
    });
    
    if (createResponse.ok) {
      const newChannel = await createResponse.json();
      // console.log(`✅ Created new channel for ${normalizedSourceName}: ${newChannel._id}`);
      return newChannel;
    } else {
      const errorText = await createResponse.text();
      // console.error(`❌ Failed to create channel for ${normalizedSourceName}: ${errorText}`);
      throw new Error(`Failed to create channel for ${normalizedSourceName}: ${errorText}`);
    }
  } catch (error) {
    // console.error('❌ Error creating/getting channel for external source:', error);
    throw error;
  }
};

// Clear current batch IDs
export const clearFetchedNewsCache = () => {
  currentBatchIds.clear();
  // console.log('🧹 External news batch cache cleared');
};

// Enhanced debugging function
export const debugExternalContent = async () => {
  try {
    // console.log('\n🔍 DEBUGGING EXTERNAL CONTENT');
    // console.log('='.repeat(50));
    
    // Fetch all headline content
    const headlineResponse = await fetch(`${API_BASE_URL}/api/HeadlineNews/JustIn/headline?limit=50`);
    if (headlineResponse.ok) {
      const headlines = await headlineResponse.json();
      const externalHeadlines = headlines.filter(h => h.source === 'external');
      
      // console.log(`📰 Total headlines in database: ${headlines.length}`);
      // console.log(`🌐 External headlines: ${externalHeadlines.length}`);
      
      if (externalHeadlines.length > 0) {
        // console.log('\n📄 External headlines breakdown:');
        const sourceBreakdown = {};
        externalHeadlines.forEach(content => {
          const source = content.originalSource || 'Unknown';
          sourceBreakdown[source] = (sourceBreakdown[source] || 0) + 1;
        });
        
        // Object.entries(sourceBreakdown).forEach(([source, count]) => {
        //   console.log(`   • ${source}: ${count} articles`);
        // });
        
        // console.log('\n📄 Sample external headlines:');
        // externalHeadlines.slice(0, 3).forEach((content, index) => {
        //   console.log(`${index + 1}. ${content.message.substring(0, 60)}...`);
        //   console.log(`   - Source: ${content.originalSource}`);
        //   console.log(`   - Channel: ${content.channelId}`);
        //   console.log(`   - Created: ${content.createdAt}`);
        //   console.log(`   - Expires: ${content.headlineExpiresAt}`);
        // });
      }
    }
    
    // Fetch Just In content
    const justInResponse = await fetch(`${API_BASE_URL}/api/HeadlineNews/JustIn/just-in`);
    if (justInResponse.ok) {
      const justIn = await justInResponse.json();
      const externalJustIn = justIn.filter(j => j.source === 'external');
      
      // console.log(`\n⚡ Total Just In: ${justIn.length}`);
      // console.log(`🌐 External Just In: ${externalJustIn.length}`);
    }
    
    // Check channels
    const channelsResponse = await fetch(`${API_BASE_URL}/api/HeadlineNews/Channel`);
    if (channelsResponse.ok) {
      const channels = await channelsResponse.json();
      const externalChannels = channels.filter(c => c.isExternal);
      
      // console.log(`\n📺 Total channels: ${channels.length}`);
      // console.log(`🌐 External channels: ${externalChannels.length}`);
      
      if (externalChannels.length > 0) {
        // console.log('\n📺 External channels:');
        // externalChannels.forEach((channel, index) => {
        //   console.log(`${index + 1}. ${channel.name} (${channel._id})`);
        // });
      }
    }
    
    // console.log('='.repeat(50));
    
  } catch (error) {
    // console.error('❌ Error debugging external content:', error);
  }
};

// Enhanced API connection test
export const testPartnerApiConnection = async () => {
  try {
    // console.log('🔗 Testing Partner API connection...');
    
    const response = await fetch(`${PARTNER_API_URL}/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      // console.error('❌ Partner API status check failed:', response.statusText);
      return false;
    }
    
    const data = await response.json();
    // console.log('✅ Partner API status:', data);
    return data.status === 'ok';
  } catch (error) {
    // console.error('❌ Partner API connection test failed:', error);
    return false;
  }
};