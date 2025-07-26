// ExternalNewsService.js - Enhanced with Wake Service Integration
import { useState } from "react";
import wakeServerService, { ensureServerAwake, forceFreshNews as forceServerFreshNews } from "./WakeUpServiceServer";

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

// ENHANCED: Server wake-up and fresh news fetch
export const ensureServerHasFreshNews = async (ipInfo = null) => {
  try {
    console.log('🔍 Ensuring server is awake and has fresh news...');
    
    // Step 1: Wake up the server first using the wake service
    const serverReady = await ensureServerAwake();
    
    if (!serverReady) {
      console.error('⚠️ Failed to wake server');
      // Still try to proceed - server might be partially responsive
    }
    
    // Step 2: Check server status
    const statusResponse = await fetch(`${API_BASE_URL}/api/health/keep-alive`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(20000) // 20 second timeout
    });
    
    if (!statusResponse.ok) {
      console.log('⚠️ Server status check failed');
      return false;
    }
    
    const status = await statusResponse.json();
    console.log('📊 Server status after wake:', status);
    
    // Step 3: If server needs fresh news, force it
    if (status.needsFreshNews && !status.isFetching) {
      console.log('🚀 Server needs fresh news, forcing fetch...');
      
      // Use the wake service's force fresh news method
      const freshNewsResult = await forceServerFreshNews(ipInfo);
      
      if (freshNewsResult) {
        console.log('✅ Fresh news triggered successfully:', freshNewsResult);
        markExternalNewsFetchTriggered();
        return true;
      } else {
        console.error('❌ Failed to force fresh news');
        return false;
      }
    }
    
    console.log('ℹ️ Server already has fresh news or is currently fetching');
    return true;
    
  } catch (error) {
    console.error('❌ Error ensuring fresh news:', error);
    return false;
  }
};

// ENHANCED: Content fetching with wake service
export const getContentWithFreshNews = async (endpoint, options = {}) => {
  try {
    console.log(`🔄 Fetching content from ${endpoint}...`);
    
    // First, ensure server is awake
    const serverReady = await ensureServerAwake();
    
    if (!serverReady) {
      console.warn('⚠️ Server may not be fully ready, proceeding anyway...');
    }
    
    // Then ensure it has fresh news
    await ensureServerHasFreshNews();
    
    // Small delay to let server process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Try to get content with retries
    let attempts = 0;
    const maxAttempts = 3;
    let lastError;
    
    while (attempts < maxAttempts) {
      try {
        attempts++;
        console.log(`📡 Attempt ${attempts}/${maxAttempts} for ${endpoint}`);
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          signal: AbortSignal.timeout(30000) // 30 second timeout
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
          // Wake server again before retry
          if (attempts === 2) {
            console.log('🔄 Re-waking server before final attempt...');
            await wakeServerService.wakeServer(1);
          }
          
          // Exponential backoff
          const waitTime = attempts * 2000;
          console.log(`⏳ Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    
    // All attempts failed
    throw lastError || new Error('Failed to fetch content after all attempts');
    
  } catch (error) {
    console.error(`❌ Error getting content from ${endpoint}:`, error);
    throw error;
  }
};

// Hook with wake service integration
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

// Initialize wake service when module loads
if (typeof window !== 'undefined') {
  console.log('🚀 Starting periodic server wake-up service');
  wakeServerService.startPeriodicWakeUp();
}