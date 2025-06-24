// components/External_News/ExternalNewsService.js - Updated frontend service

// Use your backend URL, not the partner API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

/**
 * Trigger external news fetch on the server
 */
export const fetchExternalNews = async (ipInfo) => {
  try {
    console.log('🔄 Triggering server-side external news fetch...');
    
    const response = await fetch(`${API_BASE_URL}/api/external-news/fetch-external-news`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ipInfo })
    });

    if (!response.ok) {
      throw new Error(`Server request failed: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ External news fetch completed:', result);
    
    return result.articlesProcessed || 0;
    
  } catch (error) {
    console.error('❌ Error triggering external news fetch:', error);
    throw error;
  }
};

/**
 * Trigger external channels refresh on the server
 */
export const refreshExternalChannels = async () => {
  try {
    console.log('🔄 Triggering server-side channels refresh...');
    
    const response = await fetch(`${API_BASE_URL}/api/external-news/refresh-external-channels`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Server request failed: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ External channels refresh completed:', result);
    
    return result.success;
    
  } catch (error) {
    console.error('❌ Error triggering channels refresh:', error);
    return false;
  }
};

/**
 * Clear cache function (placeholder - not needed for server-side approach)
 */
export const clearFetchedNewsCache = () => {
  console.log('📝 Cache cleared (server-side handling)');
  // This is now handled server-side, so we just log
};

/**
 * Get external news status/stats from server
 */
export const getExternalNewsStatus = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/external-news/status`);
    
    if (!response.ok) {
      throw new Error(`Failed to get status: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('❌ Error getting external news status:', error);
    return null;
  }
};

/**
 * Utility function to check if external news fetching is needed
 */
export const shouldFetchExternalNews = () => {
  const lastFetch = localStorage.getItem('lastExternalNewsFetch');
  const now = Date.now();
  const fetchInterval = 30 * 60 * 1000; // 30 minutes
  
  if (!lastFetch) {
    return true;
  }
  
  return (now - parseInt(lastFetch)) > fetchInterval;
};

/**
 * Mark that external news fetch was triggered
 */
export const markExternalNewsFetchTriggered = () => {
  localStorage.setItem('lastExternalNewsFetch', Date.now().toString());
};