// Update your ExternalNewsService.js frontend file
import { useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

/**
 * Check if server needs fresh news and trigger if needed
 */
export const ensureServerHasFreshNews = async () => {
  try {
    console.log('🔍 Checking if server needs fresh news...');
    
    // First, check server status
    const statusResponse = await fetch(`${API_BASE_URL}/api/health/keep-alive`);
    
    if (!statusResponse.ok) {
      console.log('⚠️ Server not responding, it might be waking up...');
      return false;
    }
    
    const status = await statusResponse.json();
    console.log('📊 Server status:', status);
    
    // If server needs fresh news, force fetch it
    if (status.needsFreshNews) {
      console.log('🚀 Server needs fresh news - triggering force fetch...');
      
      const forceResponse = await fetch(`${API_BASE_URL}/api/health/force-fresh-news`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ip: 'auto' })
      });
      
      if (forceResponse.ok) {
        const result = await forceResponse.json();
        console.log('✅ Fresh news fetched:', result);
        return true;
      } else {
        console.log('❌ Failed to force fetch fresh news');
        return false;
      }
    } else {
      console.log('✅ Server already has fresh news');
      return true;
    }
    
  } catch (error) {
    console.error('❌ Error ensuring fresh news:', error);
    return false;
  }
};

/**
 * Enhanced function to get fresh news with fallback
 */
export const getContentWithFreshNews = async (endpoint, options = {}) => {
  try {
    // First try to get content normally
    let response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    if (!response.ok) {
      console.log('⚠️ First request failed, server might be sleeping...');
      
      // Wake up server and ensure fresh news
      await ensureServerHasFreshNews();
      
      // Wait a moment for the server to process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Try again
      response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    }
    
    if (!response.ok) {
      throw new Error(`Request failed: ${response.statusText}`);
    }
    
    return await response.json();
    
  } catch (error) {
    console.error('❌ Error getting content with fresh news:', error);
    throw error;
  }
};

/**
 * Use this in your React components instead of direct fetch calls
 */
export const useFreshNewsContent = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const fetchWithFreshNews = async (endpoint, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getContentWithFreshNews(endpoint, options);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  return { fetchWithFreshNews, loading, error };
};

// Original functions updated to work with the new system
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
 * Force fresh news fetch - use this when you really need fresh content
 */
export const forceFreshNews = async () => {
  try {
    console.log('🚀 Forcing fresh news fetch...');
    
    const response = await fetch(`${API_BASE_URL}/api/health/force-fresh-news`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ip: 'auto' })
    });
    
    if (!response.ok) {
      throw new Error(`Force fetch failed: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('✅ Force fetch completed:', result);
    
    return result.articlesProcessed || 0;
    
  } catch (error) {
    console.error('❌ Error forcing fresh news:', error);
    throw error;
  }
};

// Updated utility functions
export const shouldFetchExternalNews = () => {
  const lastFetch = localStorage.getItem('lastExternalNewsFetch');
  const now = Date.now();
  const fetchInterval = 30 * 60 * 1000; // 30 minutes
  
  if (!lastFetch) {
    return true;
  }
  
  return (now - parseInt(lastFetch)) > fetchInterval;
};

export const markExternalNewsFetchTriggered = () => {
  localStorage.setItem('lastExternalNewsFetch', Date.now().toString());
};