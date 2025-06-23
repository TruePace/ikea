// services/ExternalNewsService.js - Fixed version with proper unique ID generation
const PARTNER_API_URL = process.env.NEXT_PUBLIC_PARTNER_API_URL;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Fixed unique ID generation using full URL path + title
const createUniqueId = (url, title) => {
  // Normalize URL but keep the full path for uniqueness
  const normalizeUrl = (url) => {
    try {
      const urlObj = new URL(url);
      // Remove common tracking parameters but KEEP the path
      const paramsToRemove = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid'];
      paramsToRemove.forEach(param => urlObj.searchParams.delete(param));
      urlObj.hash = ''; // Remove fragment
      return urlObj.toString();
    } catch {
      return url.replace(/#.*$/, ''); // Fallback: only remove fragment, keep query params for uniqueness
    }
  };

  const normalizedUrl = normalizeUrl(url);
  
  // Also include title for additional uniqueness
  const titleSlug = title ? title.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 50) : '';
  const combinedString = `${normalizedUrl}::${titleSlug}`;
  
  // Create hash from combined URL and title
  let hash = 0;
  for (let i = 0; i < combinedString.length; i++) {
    const char = combinedString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  const uniqueId = `ext-${Math.abs(hash).toString(36)}`;
  console.log(`🔑 Generated unique ID for "${title?.substring(0, 30)}...": ${uniqueId}`);
  console.log(`📍 Source URL: ${normalizedUrl}`);
  
  return uniqueId;
};

// Alternative: Even more robust unique ID generation
const createUniqueIdAlternative = (url, title, publishedAt) => {
  // Create a more comprehensive unique identifier
  const normalizeUrl = (url) => {
    try {
      const urlObj = new URL(url);
      // Keep pathname for uniqueness but remove tracking params
      const paramsToRemove = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid'];
      paramsToRemove.forEach(param => urlObj.searchParams.delete(param));
      urlObj.hash = '';
      return urlObj.toString();
    } catch {
      return url.replace(/#.*$/, '');
    }
  };

  const normalizedUrl = normalizeUrl(url);
  const titleHash = title ? title.replace(/[^\w\s]/g, '').toLowerCase().trim() : '';
  const dateHash = publishedAt ? new Date(publishedAt).toISOString().split('T')[0] : '';
  
  // Combine URL, title, and date for maximum uniqueness
  const combinedString = `${normalizedUrl}||${titleHash}||${dateHash}`;
  
  let hash = 0;
  for (let i = 0; i < combinedString.length; i++) {
    const char = combinedString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return `ext-${Math.abs(hash).toString(36)}`;
};

// Process articles with proper sequential handling
const processArticlesBatch = async (articles, batchSize = 5) => {
  const results = [];
  const processedIds = new Set(); // Track unique IDs in current batch
  
  for (let i = 0; i < articles.length; i += batchSize) {
    const batch = articles.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (article, index) => {
      try {
        const globalIndex = i + index;
        console.log(`📄 Processing article ${globalIndex + 1}/${articles.length}: ${article.title?.substring(0, 50)}...`);
        
        // Skip articles without essential content
        if (!article.title || !article.url) {
          console.log(`⚠️ Skipping article ${globalIndex + 1}: Missing title or URL`);
          return { success: false, reason: 'missing_content' };
        }

        // Create unique ID using the fixed function
        const uniqueId = createUniqueId(article.url, article.title);
        
        // Check if this unique ID is already processed in this batch
        if (processedIds.has(uniqueId)) {
          console.log(`⚠️ Skipping article ${globalIndex + 1}: Duplicate ID in current batch - ${uniqueId}`);
          return { success: false, reason: 'duplicate_id_in_batch' };
        }
        processedIds.add(uniqueId);
        
        // Check database for existing content by externalId
        console.log(`🔍 Checking database for existing content with ID: ${uniqueId}`);
        const existsResponse = await fetch(`${API_BASE_URL}/api/HeadlineNews/Content/check-external/${uniqueId}`);
        
        if (existsResponse.ok) {
          const existingContent = await existsResponse.json();
          if (existingContent && existingContent._id) {
            console.log(`⚠️ Article ${globalIndex + 1} already exists in database: ${uniqueId}`);
            return { success: false, reason: 'exists_in_database' };
          }
        }
        
        // Create/get channel
        const sourceName = article.source?.name || 'External News';
        console.log(`🔍 Looking for channel: ${sourceName}`);
        const channel = await createOrGetChannelForExternalSource(sourceName);
        
        if (!channel || !channel._id) {
          console.error(`❌ Failed to get channel for article ${globalIndex + 1}`);
          return { success: false, reason: 'channel_failed' };
        }
        
        console.log(`✅ Found/created channel for ${sourceName}: ${channel._id}`);
        
        // Calculate timing
        const now = new Date();
        const publishedAt = new Date(article.publishedAt || now);
        const timeSincePublished = now - publishedAt;
        const justInDuration = 15 * 60 * 1000; // 15 minutes
        const headlineDuration = 48 * 60 * 60 * 1000; // 48 hours
        
        // Check if content is too old
        if (timeSincePublished > headlineDuration) {
          console.log(`⚠️ Article ${globalIndex + 1} too old: ${Math.round(timeSincePublished / (60 * 60 * 1000))} hours`);
          return { success: false, reason: 'too_old' };
        }
        
        const isJustIn = timeSincePublished < justInDuration;
        const justInExpiresAt = isJustIn ? new Date(publishedAt.getTime() + justInDuration) : null;
        const headlineExpiresAt = new Date(publishedAt.getTime() + headlineDuration);
        
        // Create content object
        let message = article.title;
        if (article.description && article.description.trim()) {
          message += `\n\n${article.description.trim()}`;
        }
        
        const newsContent = {
          externalId: uniqueId,
          message: message,
          picture: article.urlToImage || null,
          channelId: channel._id,
          isJustIn: isJustIn,
          justInExpiresAt: justInExpiresAt,
          headlineExpiresAt: headlineExpiresAt,
          uploadedAt: publishedAt,
          createdAt: publishedAt,
          likeCount: 0,
          dislikeCount: 0,
          commentCount: 0,
          shareCount: 0,
          tags: article.category ? [article.category] : ['external'],
          source: 'external',
          originalSource: sourceName,
          originalUrl: article.url,
          fetchedAt: now,
          engagementScore: 0,
          viralScore: 0,
          showInAllChannels: !isJustIn
        };
        
        console.log(`💾 Attempting to save article ${globalIndex + 1} with ID: ${uniqueId}`);
        
        // Save to database
        const saveResponse = await fetch(`${API_BASE_URL}/api/HeadlineNews/Content`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newsContent),
        });
        
        if (saveResponse.ok) {
          const savedContent = await saveResponse.json();
          const destination = isJustIn ? 'Just In' : 'Headlines';
          console.log(`✅ Article ${globalIndex + 1} saved to ${destination}: ${sourceName} (ID: ${uniqueId})`);
          return { success: true, content: savedContent, uniqueId };
        } else {
          const errorText = await saveResponse.text();
          console.error(`❌ Failed to save article ${globalIndex + 1}: ${errorText}`);
          return { success: false, reason: 'save_failed', error: errorText };
        }
        
      } catch (error) {
        console.error(`❌ Error processing article ${globalIndex + 1}:`, error);
        return { success: false, reason: 'processing_error', error: error.message };
      }
    });
    
    const batchResults = await Promise.allSettled(batchPromises);
    results.push(...batchResults.map(r => r.status === 'fulfilled' ? r.value : { success: false, reason: 'promise_rejected' }));
    
    // Small delay between batches to avoid overwhelming the database
    if (i + batchSize < articles.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  return results;
};

export const fetchExternalNews = async (ipInfo) => {
  try {
    console.log('🔄 Fetching external news...');
    
    const query = new URLSearchParams({ ip: ipInfo.ip }).toString();
    const response = await fetch(`${PARTNER_API_URL}?${query}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Version': '1.0.0',
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`📰 Received ${data.articles?.length || 0} articles`);

    if (!data.articles || !Array.isArray(data.articles)) {
      console.log('❌ No articles in response');
      return [];
    }

    // Process articles in batches
    const results = await processArticlesBatch(data.articles);
    
    // Generate detailed summary
    const summary = {
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      reasons: {},
      savedIds: results.filter(r => r.success).map(r => r.uniqueId)
    };
    
    results.filter(r => !r.success).forEach(r => {
      summary.reasons[r.reason] = (summary.reasons[r.reason] || 0) + 1;
    });
    
    console.log('\n📊 PROCESSING SUMMARY:');
    console.log(`✅ Successful: ${summary.successful}`);
    console.log(`❌ Failed: ${summary.failed}`);
    console.log('📋 Failure reasons:', summary.reasons);
    console.log('🆔 Saved unique IDs:', summary.savedIds);
    
    return results.filter(r => r.success).map(r => r.content);
    
  } catch (error) {
    console.error('❌ Error fetching external news:', error);
    return [];
  }
};

// Enhanced channel creation with retry logic
export const createOrGetChannelForExternalSource = async (source, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const normalizedSourceName = source.trim();
      
      // Check for existing channel
      const getResponse = await fetch(`${API_BASE_URL}/api/HeadlineNews/Channel/external/${encodeURIComponent(normalizedSourceName)}`);
      
      if (getResponse.ok) {
        const channel = await getResponse.json();
        console.log(`✅ Found existing channel for ${normalizedSourceName}: ${channel._id}`);
        return channel;
      }
      
      // Create new channel
      const createResponse = await fetch(`${API_BASE_URL}/api/HeadlineNews/Channel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        console.log(`✅ Created new channel: ${normalizedSourceName} (ID: ${newChannel._id})`);
        return newChannel;
      }
      
      if (attempt < retries) {
        console.log(`⚠️ Channel creation failed, retrying... (${attempt}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
      
    } catch (error) {
      console.error(`❌ Channel creation attempt ${attempt} failed:`, error);
      if (attempt === retries) throw error;
    }
  }
  
  throw new Error(`Failed to create channel after ${retries} attempts`);
};