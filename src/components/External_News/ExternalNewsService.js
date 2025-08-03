// ExternalNewsService.js - Cleaned version without wake-up service
import { useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

// Conservative localStorage handling with longer intervals
export const shouldFetchExternalNews = () => {
  try {
    const lastFetch = localStorage.getItem('lastExternalNewsFetch');
    const now = Date.now();
    const fetchInterval = 30 * 60 * 1000; // 30 minutes interval
    
    if (!lastFetch) {
      return true;
    }
    
    const timeSinceLastFetch = now - parseInt(lastFetch);
    console.log(`⏰ Time since last fetch: ${Math.round(timeSinceLastFetch / 60000)} minutes`);
    
    return timeSinceLastFetch > fetchInterval;
  } catch (error) {
    console.log('localStorage not available, assuming fresh fetch needed');
    return true;
  }
};

export const markExternalNewsFetchTriggered = () => {
  try {
    const timestamp = Date.now().toString();
    localStorage.setItem('lastExternalNewsFetch', timestamp);
    console.log('📝 Marked external news fetch at:', new Date(parseInt(timestamp)).toLocaleTimeString());
  } catch (error) {
    console.log('localStorage not available for marking fetch');
  }
};

// Simplified fresh news check - no server wake-up needed
export const ensureServerHasFreshNews = async (ipInfo = null, options = {}) => {
  const { skipIfRecent = true, timeoutMs = 15000 } = options;
  
  try {
    console.log('🔍 Checking if server needs fresh news...');
    
    // Skip if we recently fetched
    if (skipIfRecent && !shouldFetchExternalNews()) {
      console.log('ℹ️ Recent fetch detected, skipping fresh news check');
      return true;
    }
    
    // Check server status
    const statusResponse = await fetch(`${API_BASE_URL}/api/health/keep-alive`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(timeoutMs)
    });
    
    if (!statusResponse.ok) {
      console.warn('⚠️ Server status check failed');
      return false;
    }
    
    const status = await statusResponse.json();
    console.log('📊 Server status:', {
      needsFresh: status.needsFreshNews,
      isFetching: status.isFetching,
      uptime: status.uptime
    });
    
    // If server is already fetching or doesn't need fresh news, we're good
    if (status.isFetching || !status.needsFreshNews) {
      console.log('ℹ️ Server already has fresh news or is currently fetching');
      markExternalNewsFetchTriggered();
      return true;
    }
    
    // Force fresh news if server needs it
    if (status.needsFreshNews) {
      console.log('🚀 Server needs fresh news, forcing fetch...');
      
      const freshNewsResponse = await fetch(`${API_BASE_URL}/api/health/force-fresh-news`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ip: ipInfo?.ip || '8.8.8.8',
          urgent: false
        }),
        signal: AbortSignal.timeout(timeoutMs + 5000)
      });
      
      if (freshNewsResponse.ok) {
        const result = await freshNewsResponse.json();
        console.log('✅ Fresh news result:', result);
        markExternalNewsFetchTriggered();
        return result.success;
      } else {
        console.warn('⚠️ Force fresh news request failed');
        return false;
      }
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Error ensuring fresh news:', error);
    return false;
  }
};

// Simplified content fetching
export const getContentWithFreshNews = async (endpoint, options = {}) => {
  try {
    console.log(`🔄 Fetching content from ${endpoint}...`);
    
    // Only trigger fresh news check if really needed
    const needsFresh = shouldFetchExternalNews();
    if (needsFresh) {
      console.log('📰 Triggering fresh news check...');
      await ensureServerHasFreshNews(null, { skipIfRecent: false });
    }
    
    // Simple fetch with minimal retries
    let attempts = 0;
    const maxAttempts = 2;
    let lastError;
    
    while (attempts < maxAttempts) {
      try {
        attempts++;
        console.log(`📡 Attempt ${attempts}/${maxAttempts} for ${endpoint}`);
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          signal: AbortSignal.timeout(20000)
        });
        
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log(`✅ Content fetched from ${endpoint}:`, Array.isArray(data) ? `${data.length} items` : 'object');
        
        return data;
        
      } catch (error) {
        lastError = error;
        console.error(`❌ Attempt ${attempts} failed:`, error.message);
        
        if (attempts < maxAttempts) {
          console.log('⏳ Brief wait before retry...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
    
    throw lastError || new Error('Failed to fetch content after all attempts');
    
  } catch (error) {
    console.error(`❌ Error getting content from ${endpoint}:`, error);
    throw error;
  }
};

// Hook with better state management
export const useFreshNewsContent = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const fetchWithFreshNews = async (endpoint, options = {}) => {
    // Prevent multiple simultaneous fetches
    if (loading) {
      console.log('⏭️ Fetch already in progress, skipping...');
      return null;
    }
    
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