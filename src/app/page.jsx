// Enhanced main page component with hybrid location tracking
"use client"
import Slide from "@/components/Headline_news_comps/Tabs/Slide";
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./(auth)/AuthContext";
import AuthModal from "@/components/Headline_news_comps/AuthModal";  
import { useDispatch } from "react-redux";
import { setJustInContent } from "@/Redux/Slices/ViewContentSlice";
import useHybridLocationTracker from "@/components/External_News/HybridLocationTracker";
import { 
  ensureServerHasFreshNews,
  getContentWithFreshNews,
  useFreshNewsContent,
  shouldFetchExternalNews,
  markExternalNewsFetchTriggered
} from "@/components/External_News/ExternalNewsService"

import HeadlineSocket from "@/components/Socket io/HeadlineSocket";
import ContentFeedSkeleton from "@/components/Headline_news_comps/Tabs/Headline_Tabs_Comps/SubFeedComps/ContentFeedSkeleton";
import SwipeTutorial from "@/components/Headline_news_comps/Tabs/Headline_Tabs_Comps/SubFeedComps/SwipeTutorial";
import SEO from "@/components/SeoDir/Seo";

const Page = () => {
  const [channels, setChannels] = useState([]);
  const [headlineContents, setHeadlineContents] = useState([]);
  const [justInContents, setJustInContents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();
  const dispatch = useDispatch();
  const [showTutorial, setShowTutorial] = useState(false);
  
  // Use refs to prevent unnecessary re-renders and state loops
  const initializationRef = useRef({
    hasInitialized: false,
    freshNewsTriggered: false,
    isInitializing: false
  });
  
  // Use hybrid location tracker instead of IP-based tracking
  const { 
    locationData, 
    isLoading: isLocationLoading,
    permissionStatus,
    requestGeolocationPermission,
    isUsingBrowserLocation,
    accuracy
  } = useHybridLocationTracker(300000); // 5 minutes
  
  // Use the enhanced external news service hook
  const { fetchWithFreshNews, loading: freshNewsLoading, error: freshNewsError } = useFreshNewsContent();

  // Location permission prompt (optional - shown once)
  useEffect(() => {
    if (permissionStatus === 'prompt' && !localStorage.getItem('locationPromptShown')) {
      // Show a custom UI prompt after 5 seconds
      setTimeout(() => {
        if (window.confirm('Allow location access for more accurate local news?')) {
          requestGeolocationPermission();
        }
        localStorage.setItem('locationPromptShown', 'true');
      }, 5000);
    }
  }, [permissionStatus, requestGeolocationPermission]);

  useEffect(() => {
    if (user?.isNewUser && !localStorage.getItem('hasSeenHeadlineNewsTutorial')) {
      setShowTutorial(true);
    }
  }, [user]);
  
  const handleTutorialComplete = () => {
    localStorage.setItem('hasSeenHeadlineNewsTutorial', 'true');
    setShowTutorial(false);
  };

  // Improved data fetching function with hybrid location support
  const fetchInitialData = useCallback(async (forceRefresh = false) => {
    // Prevent multiple simultaneous fetches
    if (initializationRef.current.isInitializing && !forceRefresh) {
      console.log('🔄 Data fetch already in progress, skipping...');
      return;
    }

    try {
      console.log('🔄 Fetching initial data...');
      setIsLoading(true);
      setError(null);
      initializationRef.current.isInitializing = true;
      
      // Only trigger fresh news if really needed
      const shouldForceFresh = forceRefresh || 
        (!initializationRef.current.freshNewsTriggered && shouldFetchExternalNews());
      
      if (shouldForceFresh) {
        console.log('🚀 Triggering fresh news with location:', locationData);
        const freshNewsSuccess = await ensureServerHasFreshNews(locationData);
        
        if (freshNewsSuccess) {
          initializationRef.current.freshNewsTriggered = true;
          markExternalNewsFetchTriggered();
        }
      }
      
      // Direct fetch
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
      
      const [channelsData, headlineContentsData, justInContentsData] = await Promise.all([
        fetch(`${baseUrl}/api/HeadlineNews/Channel`).then(res => res.ok ? res.json() : []),
        fetch(`${baseUrl}/api/HeadlineNews/GetJustIn/headline?page=1&limit=100`).then(res => res.ok ? res.json() : []),
        fetch(`${baseUrl}/api/HeadlineNews/GetJustIn/just-in`).then(res => res.ok ? res.json() : [])
      ]);
      
      console.log('📊 Data fetched successfully:');
      console.log('- Channels:', channelsData?.length || 0);
      console.log('- Headlines:', headlineContentsData?.length || 0);
      console.log('- Just In:', justInContentsData?.length || 0);
      
      setChannels(channelsData || []);
      setHeadlineContents(headlineContentsData || []);
      setJustInContents(justInContentsData || []);
      dispatch(setJustInContent(justInContentsData || []));
      
      initializationRef.current.hasInitialized = true;
      setError(null);
      
    } catch (error) {
      console.error('❌ Error fetching initial data:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
      initializationRef.current.isInitializing = false;
    }
  }, [dispatch, locationData]);

  // Single initialization effect that runs only once  
  useEffect(() => {
    if (initializationRef.current.hasInitialized) {
      return; // Already initialized, don't run again
    }

    console.log('🌅 App starting - single initialization...');
    
    const initializeApp = async () => {
      try {
        await fetchInitialData(true);
      } catch (error) {
        console.error('❌ App initialization failed:', error);
        setError('Failed to initialize app. Please refresh the page.');
      }
    };
    
    initializeApp();
    
    // Cleanup function
    return () => {
      console.log('🛑 Component unmounting');
    };
  }, []); // Empty dependency array, runs only once

  // Simplified periodic refresh (less aggressive)
  useEffect(() => {
    if (!initializationRef.current.hasInitialized) {
      return; // Don't start periodic refresh until initialized
    }

    const intervalId = setInterval(() => {
      if (shouldFetchExternalNews() && !initializationRef.current.isInitializing) {
        console.log('⏰ Periodic refresh triggered');
        fetchInitialData(false); // Don't force, just check if needed
      }
    }, 30 * 60 * 1000); // Every 30 minutes
    
    return () => clearInterval(intervalId);
  }, [fetchInitialData]);

  // Manual refresh
  const handleManualRefresh = useCallback(async () => {
    console.log('🔄 Manual refresh requested');
    
    try {
      setError(null);
      await fetchInitialData(true);
    } catch (error) {
      console.error('❌ Manual refresh failed:', error);
      setError('Manual refresh failed. Please try again.');
    }
  }, [fetchInitialData]);

  useEffect(() => {
  let tabHiddenTime = null;

  // Enhanced visibility change handler with minimum away time
  const handleVisibilityChange = async () => {
    if (document.hidden) {
      // Tab became hidden - record the time
      tabHiddenTime = Date.now();
      console.log('👋 User left tab at:', new Date().toLocaleTimeString());
    } else {
      // Tab became visible - check how long user was away
      const now = Date.now();
      const awayTime = tabHiddenTime ? now - tabHiddenTime : 0;
      const minimumAwayTime = 5 * 60 * 1000; // 5 minutes minimum
      
      console.log('👀 User returned to tab after:', Math.round(awayTime / 1000), 'seconds');
      
      if (awayTime > minimumAwayTime && 
          initializationRef.current.hasInitialized && 
          !initializationRef.current.isInitializing &&
          shouldFetchExternalNews()) {
        
        console.log('🔄 User was away long enough - checking for fresh news');
        fetchInitialData(false);
      } else {
        console.log('⏭️ User returned too quickly, skipping refresh');
      }
      
      tabHiddenTime = null; // Reset
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, [fetchInitialData]);

  // Network status handler
  useEffect(() => {
    const handleOnline = async () => {
      if (initializationRef.current.hasInitialized && !initializationRef.current.isInitializing) {
        console.log('🌐 Network restored - fetching data');
        fetchInitialData(false);
      }
    };
    
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [fetchInitialData]);

  // Auth modal logic
  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => {
        setShowAuthModal(true);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [user]);

  // Simplified loading state check
  const isActuallyLoading = isLoading || (freshNewsLoading && !initializationRef.current.hasInitialized);

  if (isActuallyLoading) {
    return (
      <div className="h-screen overflow-y-scroll bg-red-50 dark:bg-gray-900 snap-y snap-mandatory">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="h-screen snap-start">
            <div className="max-w-md tablet:max-w-2xl desktop:max-w-4xl mx-auto pt-4">
              <ContentFeedSkeleton />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error || freshNewsError) {
    return (
      <div className="h-screen flex items-center justify-center bg-red-50 dark:bg-gray-900">
        <div className="text-center p-8 bg-white dark:bg-gray-700 rounded-lg shadow-md border border-red-300 max-w-md tablet:max-w-lg desktop:max-w-xl">
          <h2 className="text-2xl font-bold mb-4 dark:text-gray-200">
            Loading Fresh News...
          </h2>
          <p className="text-gray-600 dark:text-gray-200 mb-4">
            {error || freshNewsError || 'Fetching the latest news for you.'}
          </p>
          <button 
            onClick={handleManualRefresh}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50"
            disabled={isActuallyLoading}
          >
            {isActuallyLoading ? 'Loading...' : 'Try Again'}
          </button>
        </div>
      </div>
    );
  }

  // Filter channels that have content
  const channelsWithContent = channels.filter(channel => 
    headlineContents.some(content => content.channelId === channel._id) || 
    justInContents.some(content => content.channelId === channel._id)
  );

  // No content state
  if (channelsWithContent.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-red-50 dark:bg-gray-900">
        <div className="text-center p-8 bg-white dark:bg-gray-700 rounded-lg shadow-md border border-red-300 max-w-md tablet:max-w-lg desktop:max-w-xl">
          <h2 className="text-2xl font-bold mb-4 dark:text-gray-200">Loading News Content</h2>
          <p className="text-gray-600 dark:text-gray-200 mb-4">
            We&apos;re fetching the latest news for you. Please wait a moment...
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
          <button 
            onClick={handleManualRefresh}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50"
            disabled={isActuallyLoading}
          >
            {isActuallyLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="TruePace News - Latest Headlines"
        description="Breaking news headlines and the latest stories from TruePace News."
        canonical="/"
        tags={["news", "headlines", "breaking news", "just in"]}
      />
      
      <HeadlineSocket/>
      
      {showTutorial && <SwipeTutorial onComplete={handleTutorialComplete} />}
      
      <div className="flex justify-center">
        <div className="w-full max-w-md tablet:max-w-2xl desktop:max-w-4xl h-screen">
          {/* Enhanced debug info with hybrid location tracking */}
          {process.env.NODE_ENV === 'development' && (
            <div className="fixed top-0 right-0 bg-black bg-opacity-75 text-white p-2 text-xs z-50 max-w-xs">
              <div>📺 Channels: {channels.length}</div>
              <div>📰 Headlines: {headlineContents.length}</div>
              <div className="text-green-400">🌐 External Headlines: {headlineContents.filter(c => c.source === 'external').length}</div>
              <div>📋 Just In: {justInContents.length}</div>
              <div className="text-green-400">🌐 External Just In: {justInContents.filter(c => c.source === 'external').length}</div>
              <div className="text-blue-400">🚀 Initialized: {initializationRef.current.hasInitialized ? '✅' : '⏳'}</div>
              <div className="text-purple-400">
                📍 Location: {locationData?.city || 'Loading...'}
                {isUsingBrowserLocation && ' 🎯'}
              </div>
              <div className="text-yellow-400">
                📏 Accuracy: {accuracy ? `${Math.round(accuracy)}m` : 'City-level'}
              </div>
              <div className="text-cyan-400">
                🔒 Permission: {permissionStatus}
              </div>
              <button 
                onClick={handleManualRefresh} 
                className="mt-1 px-2 py-1 bg-blue-500 rounded text-xs hover:bg-blue-600 disabled:opacity-50"
                disabled={isActuallyLoading}
              >
                {isActuallyLoading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          )}
          
          <div className="h-full overflow-y-scroll snap-y snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {channelsWithContent.map((channel) => (
              <div key={channel._id} className="h-screen snap-start">
                <Slide
                  channel={channel}
                  headlineContents={headlineContents.filter(content => content.channelId === channel._id)}
                  justInContents={justInContents}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}

export default Page;