// ExternalNewsService.js - Fixed to prevent unnecessary refetches
import { useState } from "react";
import wakeServerService, { ensureServerAwake, forceFreshNews as forceServerFreshNews } from "./WakeUpServiceServer";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

// FIXED: More conservative localStorage handling with longer intervals
export const shouldFetchExternalNews = () => {
  try {
    const lastFetch = localStorage.getItem('lastExternalNewsFetch');
    const now = Date.now();
    const fetchInterval = 30 * 60 * 1000; // INCREASED: 30 minutes instead of 15
    
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

// FIXED: Less aggressive approach with better error handling
export const ensureServerHasFreshNews = async (ipInfo = null, options = {}) => {
  const { skipIfRecent = true, timeoutMs = 15000 } = options;
  
  try {
    console.log('🔍 Checking if server needs fresh news...');
    
    // FIXED: Don't always wake server - check if we really need fresh news first
    if (skipIfRecent && !shouldFetchExternalNews()) {
      console.log('ℹ️ Recent fetch detected, skipping fresh news check');
      return true;
    }
    
    // Step 1: Quick server status check (lighter than full wake)
    try {
      const statusResponse = await fetch(`${API_BASE_URL}/api/health/keep-alive`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(timeoutMs)
      });
      
      if (statusResponse.ok) {
        const status = await statusResponse.json();
        console.log('📊 Server status:', {
          needsFresh: status.needsFreshNews,
          isFetching: status.isFetching,
          uptime: status.uptime
        });
        
        // If server is already fetching or doesn't need fresh news, we're good
        if (status.isFetching || !status.needsFreshNews) {
          console.log('ℹ️ Server already has fresh news or is currently fetching');
          markExternalNewsFetchTriggered(); // Mark as handled
          return true;
        }
        
        // Only now try to force fresh news if server actually needs it
        if (status.needsFreshNews) {
          console.log('🚀 Server needs fresh news, forcing fetch...');
          
          const freshNewsResponse = await fetch(`${API_BASE_URL}/api/health/force-fresh-news`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              ip: ipInfo?.ip || '8.8.8.8',
              urgent: false
            }),
            signal: AbortSignal.timeout(timeoutMs + 5000) // Longer timeout for force fetch
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
      } else {
        console.warn('⚠️ Server status check failed, may need wake-up');
      }
    } catch (statusError) {
      console.warn('⚠️ Server status check failed:', statusError.message);
      
      // Only now try to wake server if status check completely failed
      console.log('🔄 Attempting to wake server...');
      const serverReady = await ensureServerAwake();
      
      if (!serverReady) {
        console.error('❌ Failed to wake server');
        return false;
      }
      
      // Wait a bit after waking and try force fresh news
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const freshNewsResult = await forceServerFreshNews(ipInfo);
      if (freshNewsResult) {
        markExternalNewsFetchTriggered();
        return true;
      }
    }
    
    return false;
    
  } catch (error) {
    console.error('❌ Error ensuring fresh news:', error);
    return false;
  }
};

// FIXED: Simpler content fetching with less retries
export const getContentWithFreshNews = async (endpoint, options = {}) => {
  try {
    console.log(`🔄 Fetching content from ${endpoint}...`);
    
    // FIXED: Don't always ensure fresh news - only if really needed
    const needsFresh = shouldFetchExternalNews();
    if (needsFresh) {
      console.log('📰 Triggering fresh news check...');
      await ensureServerHasFreshNews(null, { skipIfRecent: false });
    }
    
    // FIXED: Simpler fetch with fewer retries
    let attempts = 0;
    const maxAttempts = 2; // Reduced from 3
    let lastError;
    
    while (attempts < maxAttempts) {
      try {
        attempts++;
        console.log(`📡 Attempt ${attempts}/${maxAttempts} for ${endpoint}`);
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          signal: AbortSignal.timeout(20000) // Reduced timeout
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
          // Only wake server on final retry
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

// FIXED: Hook with better state management
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

// FIXED: More conservative wake service initialization
if (typeof window !== 'undefined') {
  // Only start wake service if we haven't fetched recently
  const shouldStartWakeService = shouldFetchExternalNews();
  
  if (shouldStartWakeService) {
    console.log('🚀 Starting periodic server wake-up service');
    wakeServerService.startPeriodicWakeUp();
  } else {
    console.log('⏭️ Skipping wake service start - recent fetch detected');
  }
}