// Enhanced main page component with Wake Service
"use client"
import Slide from "@/components/Headline_news_comps/Tabs/Slide";
import { useState, useEffect, useCallback } from "react";
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
// import wakeServerService from "@/components/External_News/WakeServerService";
import HeadlineSocket from "@/components/Socket io/HeadlineSocket";
import ContentFeedSkeleton from "@/components/Headline_news_comps/Tabs/Headline_Tabs_Comps/SubFeedComps/ContentFeedSkeleton";
import SwipeTutorial from "@/components/Headline_news_comps/Tabs/Headline_Tabs_Comps/SubFeedComps/SwipeTutorial";
import SEO from "@/components/SeoDir/Seo";
import wakeServerService from "@/components/External_News/WakeUpServiceServer";

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
  const [freshNewsTriggered, setFreshNewsTriggered] = useState(false);
  const [serverWakeAttempts, setServerWakeAttempts] = useState(0);
  
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

  // CRITICAL: Aggressive fresh news fetching with wake service
  const fetchInitialData = useCallback(async (forceRefresh = false) => {
    try {
      console.log('🔄 Fetching initial data with wake service...');
      setIsLoading(true);
      setError(null);
      setServerWakeAttempts(prev => prev + 1);
      
      // Check if we should force fresh news fetch
      const shouldForceFresh = forceRefresh || shouldFetchExternalNews() || !freshNewsTriggered;
      
      if (shouldForceFresh) {
        console.log('🚀 Triggering fresh news with location:', ipInfo?.city || 'Unknown');
        const freshNewsSuccess = await ensureServerHasFreshNews(ipInfo);
        
        if (freshNewsSuccess) {
          setFreshNewsTriggered(true);
          markExternalNewsFetchTriggered();
        } else {
          console.warn('⚠️ Fresh news trigger may have failed, continuing anyway...');
        }
      }
      
      // Fetch all data with enhanced service (includes wake functionality)
      const [channelsData, headlineContentsData, justInContentsData] = await Promise.all([
        getContentWithFreshNews('/api/HeadlineNews/Channel'),
        getContentWithFreshNews('/api/HeadlineNews/GetJustIn/headline?page=1&limit=100'),
        getContentWithFreshNews('/api/HeadlineNews/GetJustIn/just-in')
      ]);
      
      console.log('📊 Data fetched successfully:');
      console.log('- Channels:', channelsData?.length || 0);
      console.log('- Headlines:', headlineContentsData?.length || 0);
      console.log('- Just In:', justInContentsData?.length || 0);
      
      // Log external content for debugging
      const externalHeadlines = headlineContentsData?.filter(c => c.source === 'external') || [];
      const externalJustIn = justInContentsData?.filter(c => c.source === 'external') || [];
      
      console.log('🌐 External content:');
      console.log('- External headlines:', externalHeadlines.length);
      console.log('- External Just In:', externalJustIn.length);
      
      if (externalHeadlines.length > 0) {
        console.log('📰 Latest external headline:', {
          title: externalHeadlines[0].message?.substring(0, 60) + '...',
          source: externalHeadlines[0].originalSource,
          time: externalHeadlines[0].createdAt
        });
      }
      
      setChannels(channelsData || []);
      setHeadlineContents(headlineContentsData || []);
      setJustInContents(justInContentsData || []);
      dispatch(setJustInContent(justInContentsData || []));
      
      // Reset error on successful fetch
      setError(null);
      
    } catch (error) {
      console.error('❌ Error fetching initial data:', error);
      setError(error.message);
      
      // If this is the first attempt, try waking the server directly
      if (serverWakeAttempts === 1) {
        console.log('🔄 First attempt failed, trying direct server wake...');
        const wakeSuccess = await wakeServerService.wakeServer(2);
        if (wakeSuccess) {
          console.log('✅ Server awakened, retrying data fetch...');
          // Retry the fetch
          return fetchInitialData(forceRefresh);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, freshNewsTriggered, ipInfo, serverWakeAttempts]);

  // Initialize on mount - ALWAYS try fresh news first
  useEffect(() => {
    console.log('🌅 App starting - initializing with wake service and fresh news...');
    
    // Wake server immediately on app start
    wakeServerService.wakeServer(1).then(() => {
      fetchInitialData(true); // Force refresh on first load
    });
    
    // Clean up on unmount
    return () => {
      console.log('🛑 Stopping wake service on unmount');
      wakeServerService.stopPeriodicWakeUp();
    };
  }, []); // Empty dependency array for mount only

  // Set up periodic refresh when user is active
  useEffect(() => {
    if (freshNewsTriggered && !isLocationLoading) {
      const intervalId = setInterval(() => {
        if (shouldFetchExternalNews()) {
          console.log('⏰ Periodic refresh triggered');
          fetchInitialData(true);
        }
      }, 20 * 60 * 1000); // Every 20 minutes
      
      return () => clearInterval(intervalId);
    }
  }, [freshNewsTriggered, isLocationLoading, fetchInitialData]);

  // Manual refresh function with wake service
  const handleManualRefresh = useCallback(async () => {
    console.log('🔄 Manual refresh triggered with wake service');
    setServerWakeAttempts(0); // Reset attempts for manual refresh
    
    // Wake server before refresh
    await wakeServerService.wakeServer(1);
    await fetchInitialData(true);
  }, [fetchInitialData]);

  // Visibility change handler - refresh when user comes back to tab
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!document.hidden && shouldFetchExternalNews()) {
        console.log('👀 User returned to tab - waking server and checking for fresh news');
        
        // Wake server when tab becomes active
        await wakeServerService.wakeServer(1);
        fetchInitialData(true);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchInitialData]);

  // Network status change handler
  useEffect(() => {
    const handleOnline = async () => {
      console.log('🌐 Network restored - waking server and fetching data');
      await wakeServerService.wakeServer(1);
      fetchInitialData(true);
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

  // Loading state
  if (isLoading || freshNewsLoading) {
    return (
      <div className="h-screen overflow-y-scroll bg-red-50 dark:bg-gray-900 snap-y snap-mandatory">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="h-screen snap-start">
            <div className="max-w-md tablet:max-w-2xl desktop:max-w-4xl mx-auto pt-4">
              <ContentFeedSkeleton />
            </div>
          </div>
        ))}
        {/* Show wake status during loading */}
        {serverWakeAttempts > 0 && (
          <div className="fixed bottom-4 left-4 bg-black bg-opacity-75 text-white p-2 rounded text-sm">
            🔄 Waking server... (Attempt {serverWakeAttempts})
          </div>
        )}
      </div>
    );
  }

  // Error state with better retry options
  if (error || freshNewsError) {
    return (
      <div className="h-screen flex items-center justify-center bg-red-50 dark:bg-gray-900">
        <div className="text-center p-8 bg-white dark:bg-gray-700 rounded-lg shadow-md border border-red-300 max-w-md tablet:max-w-lg desktop:max-w-xl">
          <h2 className="text-2xl font-bold mb-4 dark:text-gray-200">
            {serverWakeAttempts > 1 ? 'Server Starting Up...' : 'Loading Fresh News...'}
          </h2>
          <p className="text-gray-600 dark:text-gray-200 mb-4">
            {serverWakeAttempts > 1 
              ? 'The server is waking up from sleep mode. This may take a moment on Render free tier.'
              : (error || freshNewsError || 'Fetching the latest news for you. This may take a moment on first load.')
            }
          </p>
          <button 
            onClick={handleManualRefresh}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Try Again'}
          </button>
          {serverWakeAttempts > 2 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              Tip: Render free tier servers sleep after 15 minutes of inactivity. First load may take up to 30 seconds.
            </p>
          )}
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
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Refresh'}
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
          {/* Debug info - now shows wake service status */}
          {process.env.NODE_ENV === 'development' && (
            <div className="fixed top-0 right-0 bg-black bg-opacity-75 text-white p-2 text-xs z-50 max-w-xs">
              <div>📺 Channels: {channels.length}</div>
              <div>📰 Headlines: {headlineContents.length}</div>
              <div className="text-green-400">🌐 External Headlines: {headlineContents.filter(c => c.source === 'external').length}</div>
              <div>📋 Just In: {justInContents.length}</div>
              <div className="text-green-400">🌐 External Just In: {justInContents.filter(c => c.source === 'external').length}</div>
              <div className="text-blue-400">🚀 Fresh News: {freshNewsTriggered ? '✅' : '⏳'}</div>
              <div className="text-yellow-400">🔔 Wake Attempts: {serverWakeAttempts}</div>
              <div className="text-purple-400">📍 Location: {ipInfo?.city || 'Loading...'}</div>
              <button 
                onClick={handleManualRefresh} 
                className="mt-1 px-2 py-1 bg-blue-500 rounded text-xs hover:bg-blue-600 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? 'Refreshing...' : 'Force Refresh'}
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