// services/ExternalNewsService.js - Fixed version
const PARTNER_API_URL = process.env.NEXT_PUBLIC_PARTNER_API_URL;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Keep track of fetched news to prevent duplicates
const fetchedNewsIds = new Set();

export const fetchExternalNews = async (ipInfo) => {
  try {
    console.log('Fetching external news with IP info:', ipInfo);
    
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
      console.error('Partner API error:', errorData || response.statusText);
      throw new Error('Failed to fetch external news');
    }

    const data = await response.json();
    console.log('Received external news data:', data);

    // Transform and save external news to database
    const transformedArticles = await Promise.all(
      data.articles.map(async (item) => {
        // Create consistent unique ID based on article URL or title
        const uniqueId = `ext-${item.url ? btoa(item.url).replace(/[^a-zA-Z0-9]/g, '').substring(0, 20) : 
          btoa(item.title).replace(/[^a-zA-Z0-9]/g, '').substring(0, 20)}`;
        
        // Skip if already fetched
        if (fetchedNewsIds.has(uniqueId)) {
          return null;
        }

        // Check if this news already exists in database
        const existsResponse = await fetch(`${API_BASE_URL}/api/HeadlineNews/Content/check/${uniqueId}`);
        if (existsResponse.ok) {
          const existingContent = await existsResponse.json();
          if (existingContent) {
            fetchedNewsIds.add(uniqueId);
            return null; // Skip if already in database
          }
        }
        
        // Add to fetched set
        fetchedNewsIds.add(uniqueId);
        
        const publishedAt = new Date(item.publishedAt || Date.now());
        const now = new Date();
        const timeSincePublished = now - publishedAt;
        
        // Calculate correct expiration times based on actual publish time
        const justInDuration = 15 * 60 * 1000; // 15 minutes
        const headlineDuration = 24 * 60 * 60 * 1000; // 24 hours
        
        let isJustIn = false;
        let justInExpiresAt = null;
        
        // Only put in Just In if published within the last 15 minutes
        if (timeSincePublished < justInDuration) {
          isJustIn = true;
          justInExpiresAt = new Date(publishedAt.getTime() + justInDuration);
        }
        
        const headlineExpiresAt = new Date(publishedAt.getTime() + headlineDuration);
        
        // Don't include if it's already expired from headlines
        if (now > headlineExpiresAt) {
          return null;
        }
        
        const newsContent = {
          _id: uniqueId,
          message: item.title + (item.description ? `\n\n${item.description}` : ''),
          picture: item.urlToImage || null,
          channelId: null, // Will be set after channel creation
          isJustIn: isJustIn,
          justInExpiresAt: justInExpiresAt,
          headlineExpiresAt: headlineExpiresAt,
          uploadedAt: publishedAt, // Use actual publish time
          createdAt: publishedAt,
          likeCount: 0,
          dislikeCount: 0,
          commentCount: 0,
          shareCount: 0,
          tags: item.category ? [item.category] : [],
          source: 'external',
          originalSource: item.source?.name || 'News API',
          originalUrl: item.url || null,
          fetchedAt: now
        };

        return newsContent;
      })
    );

    // Filter out null items (duplicates or expired)
    const validNews = transformedArticles.filter(item => item !== null);
    
    // Save valid news to database via API
    const savedNews = [];
    for (const newsItem of validNews) {
      try {
        // Create or get channel for this source
        const channel = await createOrGetChannelForExternalSource(newsItem.originalSource);
        newsItem.channelId = channel._id;
        
        // Save to database
        const saveResponse = await fetch(`${API_BASE_URL}/api/HeadlineNews/Content`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newsItem),
        });
        
        if (saveResponse.ok) {
          const savedContent = await saveResponse.json();
          savedNews.push(savedContent);
          console.log(`Saved external news: ${newsItem.originalSource} - ${newsItem.message.substring(0, 50)}...`);
        } else {
          console.error('Failed to save news item:', await saveResponse.text());
        }
      } catch (error) {
        console.error('Error saving news item:', error);
      }
    }

    return savedNews;
  } catch (error) {
    console.error('Error fetching external news:', error);
    return [];
  }
};

// Clear fetched IDs periodically to allow fresh content
export const clearFetchedNewsCache = () => {
  fetchedNewsIds.clear();
  console.log('External news cache cleared');
};

// For mapping external sources to channels
export const createOrGetChannelForExternalSource = async (source) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/HeadlineNews/Channel/external/${encodeURIComponent(source)}`);
    
    if (response.ok) {
      return response.json();
    }
    
    // If channel doesn't exist, create one
    const createResponse = await fetch(`${API_BASE_URL}/api/HeadlineNews/Channel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: source,
        picture: '/default-news-source.png',
        description: `News from ${source}`,
        tags: ['external'],
        isExternal: true
      }),
    });
    
    return createResponse.json();
  } catch (error) {
    console.error('Error creating/getting channel for external source:', error);
    throw error;
  }
};

export const testPartnerApiConnection = async () => {
  try {
    const response = await fetch(`${PARTNER_API_URL}/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error('Partner API status check failed:', response.statusText);
      return false;
    }
    
    const data = await response.json();
    console.log('Partner API status:', data);
    return data.status === 'ok';
  } catch (error) {
    console.error('Partner API connection test failed:', error);
    return false;
  }
};