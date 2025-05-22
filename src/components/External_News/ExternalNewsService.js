// Create services/ExternalNewsService.js
const PARTNER_API_URL = process.env.NEXT_PUBLIC_PARTNER_API_URL;

export const fetchExternalNews = async (ipInfo) => {
  try {
    // Log for debugging

    console.log('Sending IP data to partner API:', ipInfo);
console.log('Received external news data:', data);
    console.log('Fetching external news with IP info:', ipInfo);
    
    // Start loading indicator if needed
    
    const response = await fetch(`${PARTNER_API_URL}/news`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Version': '1.0.0', // Adding version info can help with debugging
      },
      body: JSON.stringify({
        ip: ipInfo.ip,
        location: {
          country: ipInfo.country,
          countryCode: ipInfo.countryCode,
          city: ipInfo.city,
          region: ipInfo.region,
          coordinates: {
            latitude: ipInfo.latitude,
            longitude: ipInfo.longitude
          }
        },
        timestamp: Date.now() // Send timestamp to help partner track request timing
      }),
    });
    
    // Check if response was successful
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Partner API error:', errorData || response.statusText);
      throw new Error('Failed to fetch external news');
    }
    
    const data = await response.json();
    console.log('Received external news:', data);
    
    // Transform data and add uniqueId
    return data.news.map(item => ({
      _id: `ext-${item.id || Date.now() + Math.random().toString(36).substring(2, 7)}`,
      message: item.title + (item.description ? `\n\n${item.description}` : ''),
      picture: item.urlToImage || null,
      channelId: item.sourceId, // Will be replaced by external channel ID
      isJustIn: item.breaking || false,
      justInExpiresAt: item.breaking ? 
        new Date(Date.now() + 15 * 60 * 1000) : null,
      headlineExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      uploadedAt: new Date(item.publishedAt || Date.now()),
      likeCount: 0,
      dislikeCount: 0,
      commentCount: 0,
      shareCount: 0,
      tags: item.category ? [item.category] : [],
      source: 'external',
      originalSource: item.source?.name || 'News API',
      originalUrl: item.url || null,
      fetchedAt: new Date()
    }));
  } catch (error) {
    console.error('Error fetching external news:', error);
    // Show error toast if needed
    return [];
  }
};

// For mapping external sources to channels
export const createOrGetChannelForExternalSource = async (source) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/HeadlineNews/Channel/external/${encodeURIComponent(source)}`);
    
    if (response.ok) {
      return response.json();
    }
    
    // If channel doesn't exist, create one
    const createResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/HeadlineNews/Channel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: source,
        picture: '/default-news-source.png', // Use a default image
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

// Helper function to verify API connection is working
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