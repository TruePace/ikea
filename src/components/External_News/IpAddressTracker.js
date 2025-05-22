// Enhanced LocationTracker using backend proxy to avoid CORS
import { useState, useEffect, useRef } from 'react';

const useLocationTracker = (refreshInterval = 300000) => { // Default 5 minutes
  const [ipInfo, setIpInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Refs to prevent multiple simultaneous requests and track retry attempts
  const isFetchingRef = useRef(false);
  const retryCountRef = useRef(0);
  const lastFetchAttemptRef = useRef(0);
  const MIN_FETCH_INTERVAL = 30000; // Minimum 30 seconds between requests

  // Get API base URL from environment or use default
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

  // Try to get cached data from localStorage
  useEffect(() => {
    const cachedData = localStorage.getItem('ipInfo');
    const cachedTimestamp = localStorage.getItem('ipInfoTimestamp');
    
    if (cachedData && cachedTimestamp) {
      const parsedData = JSON.parse(cachedData);
      const timestamp = parseInt(cachedTimestamp, 10);
      
      // Use cached data if less than 15 minutes old
      if (Date.now() - timestamp < 15 * 60 * 1000) {
        setIpInfo(parsedData);
        setIsLoading(false);
        setLastUpdated(new Date(timestamp));
        console.log('Using cached IP info:', parsedData);
        return;
      }
    }
    
    // If no valid cached data, fetch new data
    fetchIpInfo();
  }, []);

  const fetchIpInfo = async () => {
    // Prevent multiple simultaneous requests
    if (isFetchingRef.current) {
      console.log('Fetch already in progress, skipping...');
      return ipInfo;
    }

    // Rate limiting: ensure minimum interval between requests
    const now = Date.now();
    if (now - lastFetchAttemptRef.current < MIN_FETCH_INTERVAL) {
      console.log('Rate limited: too soon since last request');
      return ipInfo;
    }

    // Exponential backoff for retries
    if (retryCountRef.current > 0) {
      const backoffDelay = Math.min(1000 * Math.pow(2, retryCountRef.current), 60000); // Max 1 minute
      if (now - lastFetchAttemptRef.current < backoffDelay) {
        console.log(`Backoff in effect: waiting ${backoffDelay}ms`);
        return ipInfo;
      }
    }

    isFetchingRef.current = true;
    lastFetchAttemptRef.current = now;
    setIsLoading(true);
  
    try {
      console.log('Attempting to fetch IP info from backend...');
      
      // Use your backend endpoint instead of external APIs
      const response = await fetch(`${API_BASE_URL}/api/location/location`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include' // Include credentials if needed
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('IP info successfully fetched from backend:', data);
      
      // Format the data to match your expected structure
      const formattedData = {
        ip: data.ip,
        city: data.city,
        region: data.region,
        country: data.country,
        countryCode: data.countryCode,
        latitude: data.latitude,
        longitude: data.longitude,
        source: data.source,
        requestedAt: data.requestedAt
      };

      // Reset retry count on success
      retryCountRef.current = 0;
      
      // Store in localStorage with timestamp
      localStorage.setItem('ipInfo', JSON.stringify(formattedData));
      localStorage.setItem('ipInfoTimestamp', Date.now().toString());
      
      setIpInfo(formattedData);
      setLastUpdated(new Date());
      setIsLoading(false);
      setError(null);
      
      // Send analytics event
      if (window.gtag) {
        window.gtag('event', 'location_update', {
          'event_category': 'user_location',
          'event_label': `${formattedData.city}, ${formattedData.country}`,
          'custom_parameters': {
            'location_source': formattedData.source
          }
        });
      }
      
      return formattedData;
    } catch (err) {
      console.error('Error fetching IP info from backend:', err);
      retryCountRef.current++;
      
      // Try fallback to cached data if available
      const cachedData = localStorage.getItem('ipInfo');
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        setIpInfo(parsedData);
        setError(`Using cached location data (${err.message})`);
        setIsLoading(false);
        console.log('Using cached data due to backend error:', parsedData);
        return parsedData;
      } else {
        setError(`Failed to get location data: ${err.message} (attempt ${retryCountRef.current})`);
        setIsLoading(false);
        return null;
      }
    } finally {
      isFetchingRef.current = false;
    }
  };

  const detectNetworkChange = () => {
    // Only set up network detection if the API is available
    if (!navigator.connection) {
      console.log('Network Connection API not available');
      return null;
    }

    let lastConnection = {
      type: navigator.connection.type || 'unknown',
      effectiveType: navigator.connection.effectiveType || 'unknown'
    };
    
    const handleConnectionChange = () => {
      const currentConnection = { 
        type: navigator.connection.type || 'unknown',
        effectiveType: navigator.connection.effectiveType || 'unknown'
      };
      
      // Only refresh if connection type actually changed and we have existing data
      if ((lastConnection.type !== currentConnection.type || 
           lastConnection.effectiveType !== currentConnection.effectiveType) && 
          ipInfo) {
        
        console.log('Network change detected:', { from: lastConnection, to: currentConnection });
        lastConnection = currentConnection;
        
        // Add a small delay to avoid immediate requests after network change
        setTimeout(() => {
          fetchIpInfo();
        }, 2000);
      }
    };

    navigator.connection.addEventListener('change', handleConnectionChange);
    
    // Return cleanup function
    return () => {
      navigator.connection.removeEventListener('change', handleConnectionChange);
    };
  };

  useEffect(() => {
    // Set up network change detection
    const cleanupNetworkDetection = detectNetworkChange();
    
    // Set up regular refresh only if we have data
    let intervalId;
    if (ipInfo) {
      intervalId = setInterval(() => {
        // Only refresh if data is old enough
        if (!lastUpdated || (Date.now() - lastUpdated.getTime() > refreshInterval)) {
          fetchIpInfo();
        }
      }, refreshInterval);
    }
    
    // Refresh when user returns to tab (but with rate limiting)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && ipInfo) {
        // Only refresh if data is old enough
        if (!lastUpdated || (Date.now() - lastUpdated.getTime() > refreshInterval)) {
          setTimeout(fetchIpInfo, 1000); // Small delay when tab becomes visible
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Clean up
    return () => {
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (cleanupNetworkDetection) cleanupNetworkDetection();
    };
  }, [refreshInterval, ipInfo, lastUpdated]);

  // Manual refresh function with rate limiting
  const refreshLocation = async () => {
    const now = Date.now();
    if (now - lastFetchAttemptRef.current < MIN_FETCH_INTERVAL) {
      console.log('Manual refresh rate limited');
      return ipInfo;
    }
    
    return await fetchIpInfo();
  };

  return { 
    ipInfo, 
    isLoading, 
    error, 
    lastUpdated,
    refreshLocation,
    retryCount: retryCountRef.current
  };
};

export default useLocationTracker;