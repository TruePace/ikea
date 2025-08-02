// Enhanced main page component with fixed reload issues
"use client"
import Slide from "@/components/Headline_news_comps/Tabs/Slide";
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./(auth)/AuthContext";
import AuthModal from "@/components/Headline_news_comps/AuthModal";  
import { useDispatch } from "react-redux";
import { setJustInContent } from "@/Redux/Slices/ViewContentSlice";
import useLocationTracker from "@/components/External_News/IpAddressTracker";
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
import wakeServerService from "@/components/External_News/WakeUpServiceServer";
// import { aggressiveStartup } from "@/components/External_News/WakeUpServiceServer";

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
  
  // FIXED: Use refs to prevent unnecessary re-renders and state loops
  const initializationRef = useRef({
    hasInitialized: false,
    freshNewsTriggered: false,
    serverWakeAttempts: 0,
    isInitializing: false
  });
  
  // Get user's location
  const { ipInfo, isLoading: isLocationLoading } = useLocationTracker(300000);
  
  // Use the enhanced external news service hook
  const { fetchWithFreshNews, loading: freshNewsLoading, error: freshNewsError } = useFreshNewsContent();

  useEffect(() => {
    if (user?.isNewUser && !localStorage.getItem('hasSeenHeadlineNewsTutorial')) {
      setShowTutorial(true);
    }
  }, [user]);
  
  const handleTutorialComplete = () => {
    localStorage.setItem('hasSeenHeadlineNewsTutorial', 'true');
    setShowTutorial(false);
  };

  // FIXED: Simplified and more reliable data fetching function
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
        console.log('🚀 Triggering fresh news...');
        const freshNewsSuccess = await ensureServerHasFreshNews(ipInfo);
        
        if (freshNewsSuccess) {
          initializationRef.current.freshNewsTriggered = true;
          markExternalNewsFetchTriggered();
        }
      }
      
      // FIXED: Simple direct fetch without excessive wake calls
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
      
      // Only retry on first failure
      if (initializationRef.current.serverWakeAttempts === 0) {
        initializationRef.current.serverWakeAttempts++;
        console.log('🔄 First attempt failed, waking server and retrying...');
        
        await wakeServerService.wakeServer(1);
        // Wait a bit and retry
        setTimeout(() => fetchInitialData(forceRefresh), 3000);
      }
    } finally {
      setIsLoading(false);
      initializationRef.current.isInitializing = false;
    }
  }, [dispatch, ipInfo]);

  // FIXED: Single initialization effect that runs only once
  useEffect(() => {
    if (initializationRef.current.hasInitialized) {
      return; // Already initialized, don't run again
    }

    console.log('🌅 App starting - single initialization...');
    
    const initializeApp = async () => {
      try {
        // Only wake server if it's the very first load
        if (initializationRef.current.serverWakeAttempts === 0) {
          console.log('🚀 First time wake-up...');
          await wakeServerService.wakeServer(1);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Brief wait
        }
        
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
  }, []); // FIXED: Empty dependency array, runs only once

  // FIXED: Simplified periodic refresh (less aggressive)
  useEffect(() => {
    if (!initializationRef.current.hasInitialized) {
      return; // Don't start periodic refresh until initialized
    }

    const intervalId = setInterval(() => {
      if (shouldFetchExternalNews() && !initializationRef.current.isInitializing) {
        console.log('⏰ Periodic refresh triggered');
        fetchInitialData(false); // Don't force, just check if needed
      }
    }, 30 * 60 * 1000); // Every 30 minutes (increased from 20)
    
    return () => clearInterval(intervalId);
  }, [fetchInitialData]); // Only depend on fetchInitialData

  // FIXED: Less aggressive manual refresh
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

  // FIXED: Less aggressive visibility change handler
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!document.hidden && 
          initializationRef.current.hasInitialized && 
          !initializationRef.current.isInitializing &&
          shouldFetchExternalNews()) {
        
        console.log('👀 User returned to tab - checking for fresh news');
        fetchInitialData(false); // Don't force, just check
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchInitialData]);

  // FIXED: Simplified network status handler
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

  // Auth modal logic (unchanged)
  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => {
        setShowAuthModal(true);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [user]);

  // FIXED: Simplified loading state check
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
        {initializationRef.current.serverWakeAttempts > 0 && (
          <div className="fixed bottom-4 left-4 bg-black bg-opacity-75 text-white p-2 rounded text-sm">
            🔄 Starting server... (Attempt {initializationRef.current.serverWakeAttempts})
          </div>
        )}
      </div>
    );
  }

  // Error state
  if (error || freshNewsError) {
    return (
      <div className="h-screen flex items-center justify-center bg-red-50 dark:bg-gray-900">
        <div className="text-center p-8 bg-white dark:bg-gray-700 rounded-lg shadow-md border border-red-300 max-w-md tablet:max-w-lg desktop:max-w-xl">
          <h2 className="text-2xl font-bold mb-4 dark:text-gray-200">
            {initializationRef.current.serverWakeAttempts > 0 ? 'Server Starting Up...' : 'Loading Fresh News...'}
          </h2>
          <p className="text-gray-600 dark:text-gray-200 mb-4">
            {initializationRef.current.serverWakeAttempts > 0 
              ? 'The server is waking up from sleep mode. This may take a moment on Render free tier.'
              : (error || freshNewsError || 'Fetching the latest news for you.')
            }
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
          {/* Simplified debug info */}
          {process.env.NODE_ENV === 'development' && (
            <div className="fixed top-0 right-0 bg-black bg-opacity-75 text-white p-2 text-xs z-50 max-w-xs">
              <div>📺 Channels: {channels.length}</div>
              <div>📰 Headlines: {headlineContents.length}</div>
              <div className="text-green-400">🌐 External Headlines: {headlineContents.filter(c => c.source === 'external').length}</div>
              <div>📋 Just In: {justInContents.length}</div>
              <div className="text-green-400">🌐 External Just In: {justInContents.filter(c => c.source === 'external').length}</div>
              <div className="text-blue-400">🚀 Initialized: {initializationRef.current.hasInitialized ? '✅' : '⏳'}</div>
              <div className="text-purple-400">📍 Location: {ipInfo?.city || 'Loading...'}</div>
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