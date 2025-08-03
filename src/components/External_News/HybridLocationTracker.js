// Enhanced LocationTracker with Hybrid Approach (IP + Browser Geolocation)
import { useState, useEffect, useRef, useCallback } from 'react';

const useHybridLocationTracker = (refreshInterval = 300000) => { // Default 5 minutes
  const [locationData, setLocationData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState('prompt'); // 'granted', 'denied', 'prompt'
  
  // Refs to prevent multiple simultaneous requests
  const isFetchingRef = useRef(false);
  const watchIdRef = useRef(null);
  const lastGeolocationUpdateRef = useRef(0);
  const GEOLOCATION_THROTTLE = 60000; // Throttle geolocation updates to once per minute
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
  const PARTNER_API_URL = process.env.PARTNER_API_URL;


  // Calculate if locations are significantly different (threshold: ~1km)
  const hasLocationChanged = (oldLoc, newLoc, threshold = 0.01) => {
    if (!oldLoc || !newLoc) return true;
    const latDiff = Math.abs(oldLoc.latitude - newLoc.latitude);
    const lonDiff = Math.abs(oldLoc.longitude - newLoc.longitude);
    return latDiff > threshold || lonDiff > threshold;
  };

  // Fetch IP-based location (your existing logic)
  const fetchIpLocation = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/location/location`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      return {
        ip: data.ip,
        city: data.city,
        region: data.region,
        country: data.country,
        countryCode: data.countryCode,
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: 'city', // IP location is city-level accuracy
        source: 'ip'
      };
    } catch (err) {
      console.error('IP location fetch failed:', err);
      throw err;
    }
  };

  // Get browser geolocation
 const getBrowserGeolocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    console.log('🎯 Requesting browser geolocation...');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          source: 'browser'
        };
        
        console.log('✅ Browser geolocation success:', coords);
        console.log(`📍 Lat: ${coords.latitude}, Lng: ${coords.longitude}, Accuracy: ${coords.accuracy}m`);
        
        resolve(coords);
      },
      (error) => {
        console.error('❌ Browser geolocation failed:', error.message, error.code);
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );
  });
};

  // Main hybrid location fetch
  const fetchHybridLocation = useCallback(async (forceRefresh = false) => {
  if (isFetchingRef.current && !forceRefresh) return locationData;
  
  isFetchingRef.current = true;
  setIsLoading(true);
  
  console.log('🔄 Starting hybrid location fetch...');

  try {
    // Always get IP location as baseline
    console.log('🌐 Fetching IP location...');
    const ipLocation = await fetchIpLocation();
    console.log('📍 IP Location:', ipLocation);
    
    let finalLocation = { ...ipLocation };
    
    // Try to enhance with browser geolocation
    if (permissionStatus === 'granted' || permissionStatus === 'prompt') {
      try {
        const browserLoc = await getBrowserGeolocation();
        
        // Check if locations are significantly different
        const locationChanged = hasLocationChanged(ipLocation, browserLoc);
        console.log(`📏 Location comparison - Changed: ${locationChanged}`);
        
        if (locationChanged || !ipLocation.latitude) {
          finalLocation = {
            ...ipLocation,
            latitude: browserLoc.latitude,
            longitude: browserLoc.longitude,
            accuracy: browserLoc.accuracy,
            source: 'hybrid',
            browserLocationUsed: true
          };
          
          console.log('🎯 Using browser location (hybrid mode):', finalLocation);
          setPermissionStatus('granted');
        } else {
          console.log('📍 Using IP location (no significant change)');
        }
      } catch (geoError) {
        console.warn('⚠️ Browser geolocation unavailable, using IP only:', geoError.message);
        if (geoError.code === 1) {
          setPermissionStatus('denied');
        }
      }
    } else {
      console.log('🚫 Browser geolocation not available (permission denied)');
    }

    // Cache and set the location data
    const timestamp = Date.now();
    localStorage.setItem('hybridLocation', JSON.stringify(finalLocation));
    localStorage.setItem('hybridLocationTimestamp', timestamp.toString());
    
    setLocationData(finalLocation);
    setLastUpdated(new Date(timestamp));
    setError(null);
    
    console.log('✅ Final location data:', finalLocation);
    
    // Send to partner API
    await sendLocationToPartner(finalLocation);
    
    return finalLocation;
    
  } catch (err) {
    console.error('❌ Hybrid location fetch failed:', err);
    setError(err.message);
    
    // Try cached data
    const cached = localStorage.getItem('hybridLocation');
    if (cached) {
      const parsed = JSON.parse(cached);
      console.log('📦 Using cached location:', parsed);
      setLocationData(parsed);
      return parsed;
    }
    
    return null;
  } finally {
    setIsLoading(false);
    isFetchingRef.current = false;
  }
}, [locationData, permissionStatus]);

  // Send location to partner API
  const sendLocationToPartner = async (location) => {
  try {
    const partnerUrl = PARTNER_API_URL || `${API_BASE_URL}/api/partner/location-update`;
    
    console.log('📤 Sending location to partner:', partnerUrl);
    console.log('📦 Location data:', {
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
      city: location.city,
      source: location.source
    });
    
    await fetch(partnerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        city: location.city,
        country: location.country,
        source: location.source,
        timestamp: new Date().toISOString()
      })
    });
    
    console.log('✅ Successfully sent location to partner');
  } catch (err) {
    console.error('❌ Failed to send location to partner:', err);
  }
};
  // Set up continuous geolocation watching
  const startGeolocationWatch = useCallback(() => {
    if (!navigator.geolocation || permissionStatus === 'denied') return;
    
    // Clear existing watch
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const now = Date.now();
        
        // Throttle updates
        if (now - lastGeolocationUpdateRef.current < GEOLOCATION_THROTTLE) return;
        
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        
        // Only update if location changed significantly
        if (hasLocationChanged(locationData, newLocation)) {
          console.log('Significant location change detected');
          lastGeolocationUpdateRef.current = now;
          fetchHybridLocation(true);
        }
      },
      (error) => {
        console.warn('Geolocation watch error:', error);
        if (error.code === 1) setPermissionStatus('denied');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 30000,
        timeout: 27000
      }
    );
  }, [locationData, fetchHybridLocation, permissionStatus]);

  // Initial load from cache
  useEffect(() => {
    const cached = localStorage.getItem('hybridLocation');
    const cachedTime = localStorage.getItem('hybridLocationTimestamp');
    
    if (cached && cachedTime) {
      const timestamp = parseInt(cachedTime, 10);
      // Use cache if less than 15 minutes old
      if (Date.now() - timestamp < 15 * 60 * 1000) {
        setLocationData(JSON.parse(cached));
        setLastUpdated(new Date(timestamp));
        setIsLoading(false);
      }
    }
    
    // Always fetch fresh data
    fetchHybridLocation();
  }, []);

  // Set up geolocation watching
  useEffect(() => {
    if (permissionStatus === 'granted') {
      startGeolocationWatch();
    }
    
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [permissionStatus, startGeolocationWatch]);

  // Periodic refresh (IP location + check for geolocation changes)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchHybridLocation();
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [refreshInterval, fetchHybridLocation]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && lastUpdated) {
        const timeSinceUpdate = Date.now() - lastUpdated.getTime();
        if (timeSinceUpdate > refreshInterval) {
          fetchHybridLocation();
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [lastUpdated, refreshInterval, fetchHybridLocation]);

  // Manual refresh function
  const refreshLocation = async () => {
    return await fetchHybridLocation(true);
  };

  // Request geolocation permission
  const requestGeolocationPermission = async () => {
    try {
      const result = await getBrowserGeolocation();
      if (result) {
        setPermissionStatus('granted');
        fetchHybridLocation(true);
      }
    } catch (err) {
      if (err.code === 1) {
        setPermissionStatus('denied');
      }
    }
  };

  return {
    locationData,
    isLoading,
    error,
    lastUpdated,
    refreshLocation,
    permissionStatus,
    requestGeolocationPermission,
    isUsingBrowserLocation: locationData?.source === 'hybrid',
    accuracy: locationData?.accuracy
  };
};

export default useHybridLocationTracker;