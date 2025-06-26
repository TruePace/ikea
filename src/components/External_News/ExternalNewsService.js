// ExternalNewsService.js - Fixed client version
import { useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

// FIXED: Better localStorage handling
export const shouldFetchExternalNews = () => {
  try {
    const lastFetch = localStorage.getItem('lastExternalNewsFetch');
    const now = Date.now();
    const fetchInterval = 15 * 60 * 1000; // 15 minutes (reduced from 30)
    
    if (!lastFetch) {
      return true;
    }
    
    return (now - parseInt(lastFetch)) > fetchInterval;
  } catch (error) {
    console.log('localStorage not available, assuming fresh fetch needed');
    return true;
  }
};

export const markExternalNewsFetchTriggered = () => {
  try {
    localStorage.setItem('lastExternalNewsFetch', Date.now().toString());
  } catch (error) {
    console.log('localStorage not available for marking fetch');
  }
};

// FIXED: Better server wake-up
export const ensureServerHasFreshNews = async () => {
  try {
    console.log('🔍 Checking server status and triggering fresh news...');
    
    // Step 1: Wake up the server with keep-alive
    const statusResponse = await fetch(`${API_BASE_URL}/api/health/keep-alive`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!statusResponse.ok) {
      console.log('⚠️ Server not responding, might be waking up...');
      
      // Wait a bit for server to wake up
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Try again
      const retryResponse = await fetch(`${API_BASE_URL}/api/health/keep-alive`);
      if (!retryResponse.ok) {
        return false;
      }
    }
    
    const status = await (statusResponse.ok ? statusResponse : retryResponse).json();
    console.log('📊 Server status:', status);
    
    // Step 2: If server needs fresh news, force it
    if (status.needsFreshNews && !status.isFetching) {
      console.log('🚀 Forcing fresh news fetch...');
      
      const forceResponse = await fetch(`${API_BASE_URL}/api/health/force-fresh-news`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip: 'auto' })
      });
      
      if (forceResponse.ok) {
        const result = await forceResponse.json();
        console.log('✅ Fresh news triggered:', result);
        markExternalNewsFetchTriggered();
        return true;
      }
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Error ensuring fresh news:', error);
    return false;
  }
};

// FIXED: Better content fetching with retry
export const getContentWithFreshNews = async (endpoint, options = {}) => {
  try {
    console.log(`🔄 Fetching content from ${endpoint}...`);
    
    // First, ensure server has fresh news
    await ensureServerHasFreshNews();
    
    // Small delay to let server process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Try to get content
    let response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    if (!response.ok) {
      console.log('⚠️ First request failed, retrying...');
      
      // Wait a bit more
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Try again
      response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    }
    
    if (!response.ok) {
      throw new Error(`Request failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ Content fetched from ${endpoint}:`, Array.isArray(data) ? data.length : 'object');
    
    return data;
    
  } catch (error) {
    console.error(`❌ Error getting content from ${endpoint}:`, error);
    throw error;
  }
};

// Rest of your functions remain the same...
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