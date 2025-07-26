// Updated main page component - Frontend-only approach
"use client"
import Slide from "@/components/Headline_news_comps/Tabs/Slide";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./(auth)/AuthContext";
import AuthModal from "@/components/Headline_news_comps/AuthModal";  
import { useDispatch } from "react-redux";
import { setJustInContent } from "@/Redux/Slices/ViewContentSlice";
import useLocationTracker from "@/components/External_News/IpAddressTracker";
import { useDirectNewsService } from "@/components/External_News/FrontendDirectNewsService";
import HeadlineSocket from "@/components/Socket io/HeadlineSocket";
import ContentFeedSkeleton from "@/components/Headline_news_comps/Tabs/Headline_Tabs_Comps/SubFeedComps/ContentFeedSkeleton";
import SwipeTutorial from "@/components/Headline_news_comps/Tabs/Headline_Tabs_Comps/SubFeedComps/SwipeTutorial";
import SEO from "@/components/SeoDir/Seo";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

const Page = () => {
  // Backend content state (user-generated content)
  const [backendChannels, setBackendChannels] = useState([]);
  const [backendHeadlineContents, setBackendHeadlineContents] = useState([]);
  const [backendJustInContents, setBackendJustInContents] = useState([]);
  
  // UI state
  const [isLoadingBackend, setIsLoadingBackend] = useState(true);
  const [backendError, setBackendError] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  
  const { user } = useAuth();
  const dispatch = useDispatch();
  
  // Get user's location (optional for external news)
  const { ipInfo, isLoading: isLocationLoading } = useLocationTracker(300000);
  
  // Use the new direct news service for external content
  const {
    channels: externalChannels,
    headlineContent: externalHeadlines,
    justInContent: externalJustIn,
    loading: externalLoading,
    error: externalError,
    lastFetch,
    refreshNews,
    clearCache
  } = useDirectNewsService();

  // Tutorial logic
  useEffect(() => {
    if (user?.isNewUser && !localStorage.getItem('hasSeenHeadlineNewsTutorial')) {
      setShowTutorial(true);
    }
  }, [user]);
  
  const handleTutorialComplete = () => {
    localStorage.setItem('hasSeenHeadlineNewsTutorial', 'true');
    setShowTutorial(false);
  };

  // Fetch backend content (user-generated content only)
  const fetchBackendContent = useCallback(async () => {
    try {
      console.log('🔄 Fetching backend content...');
      setIsLoadingBackend(true);
      setBackendError(null);
      
      // Fetch all backend data in parallel
      const [channelsData, headlineContentsData, justInContentsData] = await Promise.all([
        fetch(`${API_BASE_URL}/api/HeadlineNews/Channel`).then(res => res.json()),
        fetch(`${API_BASE_URL}/api/HeadlineNews/GetJustIn/headline?page=1&limit=100`).then(res => res.json()),
        fetch(`${API_BASE_URL}/api/HeadlineNews/GetJustIn/just-in`).then(res => res.json())
      ]);
      
      // Filter out external content (we get that directly from frontend now)
      const internalChannels = channelsData?.filter(channel => !channel.isExternal) || [];
      const internalHeadlines = headlineContentsData?.filter(content => content.source !== 'external') || [];
      const internalJustIn = justInContentsData?.filter(content => content.source !== 'external') || [];
      
      console.log('📊 Backend content fetched:');
      console.log('- Internal Channels:', internalChannels.length);
      console.log('- Internal Headlines:', internalHeadlines.length);
      console.log('- Internal Just In:', internalJustIn.length);
      
      setBackendChannels(internalChannels);
      setBackendHeadlineContents(internalHeadlines);
      setBackendJustInContents(internalJustIn);
      dispatch(setJustInContent(internalJustIn));
      
    } catch (error) {
      console.error('❌ Error fetching backend content:', error);
      setBackendError(error.message);
    } finally {
      setIsLoadingBackend(false);
    }
  }, [dispatch]);

  // Initialize backend content on mount
  useEffect(() => {
    fetchBackendContent();
  }, [fetchBackendContent]);

  // Merge external and internal content
  const allChannels = [...backendChannels, ...externalChannels];
  const allHeadlineContents = [...backendHeadlineContents, ...externalHeadlines];
  const allJustInContents = [...backendJustInContents, ...externalJustIn];

  // Filter channels that have content
  const channelsWithContent = allChannels.filter(channel => 
    allHeadlineContents.some(content => content.channelId === channel._id) || 
    allJustInContents.some(content => content.channelId === channel._id)
  );

  // Manual refresh function
  const handleManualRefresh = useCallback(async () => {
    console.log('🔄 Manual refresh triggered');
    await Promise.all([
      refreshNews(), // Refresh external news
      fetchBackendContent() // Refresh backend content
    ]);
  }, [refreshNews, fetchBackendContent]);

  // Auto-refresh when user returns to tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👀 User returned to tab - refreshing content');
        handleManualRefresh();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [handleManualRefresh]);

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
  const isLoading = isLoadingBackend || externalLoading;
  if (isLoading) {
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

  // Error state with better retry options
  const hasError = backendError || externalError;
  if (hasError && channelsWithContent.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-red-50 dark:bg-gray-900">
        <div className="text-center p-8 bg-white dark:bg-gray-700 rounded-lg shadow-md border border-red-300 max-w-md tablet:max-w-lg desktop:max-w-xl">
          <h2 className="text-2xl font-bold mb-4 dark:text-gray-200">Loading Fresh News...</h2>
          <p className="text-gray-600 dark:text-gray-200 mb-4">
            {backendError && `Backend: ${backendError}`}
            {backendError && externalError && ' | '}
            {externalError && `External: ${externalError}`}
          </p>
          <div className="flex gap-2 justify-center">
            <button 
              onClick={handleManualRefresh}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Try Again'}
            </button>
            <button 
              onClick={() => {
                clearCache();
                handleManualRefresh();
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Clear Cache & Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          {/* Enhanced debug info */}
          {process.env.NODE_ENV === 'development' && (
            <div className="fixed top-0 right-0 bg-black bg-opacity-75 text-white p-2 text-xs z-50 max-w-xs">
              <div className="text-blue-400">🏠 Backend:</div>
              <div>📺 Channels: {backendChannels.length}</div>
              <div>📰 Headlines: {backendHeadlineContents.length}</div>
              <div>📋 Just In: {backendJustInContents.length}</div>
              
              <div className="text-green-400 mt-2">🌐 External (Direct):</div>
              <div>📺 Channels: {externalChannels.length}</div>
              <div>📰 Headlines: {externalHeadlines.length}</div>
              <div>📋 Just In: {externalJustIn.length}</div>
              
              <div className="text-yellow-400 mt-2">📊 Total:</div>
              <div>📺 All Channels: {allChannels.length}</div>
              <div>📰 All Headlines: {allHeadlineContents.length}</div>
              <div>📋 All Just In: {allJustInContents.length}</div>
              
              {lastFetch && (
                <div className="text-purple-400 mt-2">
                  🕐 Last Fetch: {new Date(lastFetch).toLocaleTimeString()}
                </div>
              )}
              
              <div className="flex gap-1 mt-2">
                <button 
                  onClick={handleManualRefresh} 
                  className="px-2 py-1 bg-blue-500 rounded text-xs hover:bg-blue-600 disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? 'Refreshing...' : 'Refresh All'}
                </button>
                <button 
                  onClick={() => {
                    clearCache();
                    refreshNews();
                  }} 
                  className="px-2 py-1 bg-red-500 rounded text-xs hover:bg-red-600"
                >
                  Clear Cache
                </button>
              </div>
            </div>
          )}
          
          <div className="h-full overflow-y-scroll snap-y snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {channelsWithContent.map((channel) => (
              <div key={channel._id} className="h-screen snap-start">
                <Slide
                  channel={channel}
                  headlineContents={allHeadlineContents.filter(content => content.channelId === channel._id)}
                  justInContents={allJustInContents}
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