// "use client"
// import Slide from "@/components/Headline_news_comps/Tabs/Slide";
// import { fetchChannels, fetchContents, fetchJustInContents, fetchHeadlineContents } from "@/components/Utils/HeadlineNewsFetch";
// import { useState, useEffect } from "react";
// import { useAuth } from "./(auth)/AuthContext";
// import AuthModal from "@/components/Headline_news_comps/AuthModal";  
// import { useDispatch } from "react-redux";
// import { setJustInContent } from "@/Redux/Slices/ViewContentSlice";

// import HeadlineSocket from "@/components/Socket io/HeadlineSocket";
// import ContentFeedSkeleton from "@/components/Headline_news_comps/Tabs/Headline_Tabs_Comps/SubFeedComps/ContentFeedSkeleton";
// // import InfiniteScroll from "react-infinite-scroll-component";
// import SwipeTutorial from "@/components/Headline_news_comps/Tabs/Headline_Tabs_Comps/SubFeedComps/SwipeTutorial";
// import SEO from "@/components/SeoDir/Seo";




// const Page = () => {
//   const [channels, setChannels] = useState([]);
//   const [headlineContents, setHeadlineContents] = useState([]);
//   const [justInContents, setJustInContents] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [showAuthModal, setShowAuthModal] = useState(false);
//   const { user } = useAuth();
//   const dispatch = useDispatch();
//   const [showTutorial, setShowTutorial] = useState(false); 
 




  
//   useEffect(() => {
//     // Only show tutorial for new users who haven't seen it
//     if (user?.isNewUser && !localStorage.getItem('hasSeenHeadlineNewsTutorial')) {
//       setShowTutorial(true);
//       // console.log('Should show tutorial:', true); // Debug log
//     }
//   }, [user]);
  
//   const handleTutorialComplete = () => {
//     localStorage.setItem('hasSeenHeadlineNewsTutorial', 'true');
//     setShowTutorial(false);
//     // console.log('Tutorial completed and hidden'); // Debug log
//   };


//   useEffect(() => {
//     fetchInitialData();
//   }, [dispatch]);

//   const fetchInitialData = async () => {
//     try {
//       const [channelsData, headlineContentsData, justInContentsData] = await Promise.all([
//         fetchChannels(),
//         fetchHeadlineContents(1), // Fetch first page
//         fetchJustInContents()
//       ]);
//       setChannels(channelsData);
//       setHeadlineContents(headlineContentsData);
//       setJustInContents(justInContentsData);
//       dispatch(setJustInContent(justInContentsData));
//       setIsLoading(false);
//     } catch (error) {
//       setError(error.message);
//       setIsLoading(false);
//     }
//   };

  

//   useEffect(() => {
//     const moveExpiredContent = () => {
//       const now = new Date();
//       const expiredContent = justInContents.filter(content => new Date(content.justInExpiresAt) <= now);
      
//       if (expiredContent.length > 0) {
//         setJustInContents(prev => prev.filter(content => new Date(content.justInExpiresAt) > now));
//         setHeadlineContents(prev => [...expiredContent, ...prev]);
//       }
//     };

//     const expirationInterval = setInterval(moveExpiredContent, 60000);

//     return () => clearInterval(expirationInterval);
//   }, [justInContents]);

//   useEffect(() => {
//     if (!user) {
//       const timer = setTimeout(() => {
//         setShowAuthModal(true);
//       }, 10000); // Show modal after 10 seconds

//       return () => clearTimeout(timer);
//     }
//   }, [user]);

//   if (isLoading) {
//     return (
//       <div className="h-screen overflow-y-scroll  bg-red-50 dark:bg-gray-900 snap-y snap-mandatory ">
//         {[...Array(3)].map((_, index) => (
//           <div key={index} className="h-screen snap-start">
//             <div className="max-w-md tablet:max-w-2xl desktop:max-w-4xl mx-auto pt-4">
//               <ContentFeedSkeleton />
//             </div>
//           </div>
//         ))}
//       </div>
//     );
//   }

//   if (error) return <div>Error: {error}</div>;

//   // Filter channels that have content
//   const channelsWithContent = channels.filter(channel => 
//     headlineContents.some(content => content.channelId === channel._id) || 
//     justInContents.some(content => content.channelId === channel._id)
//   );


//   if (channelsWithContent.length === 0) {
//     return (
//       <div className="h-screen flex items-center justify-center bg-red-50 dark:bg-gray-900 ">
//         <div className="text-center p-8  bg-white dark:bg-gray-700 rounded-lg shadow-md border border-red-300 max-w-md tablet:max-w-lg desktop:max-w-xl">
//           <h2 className="text-2xl font-bold mb-4 dark:text-gray-200">No Content Available</h2>
//           <p className="text-gray-600 dark:text-gray-200">
//             Headline News content is not available at the moment. Please check back later.
//           </p>
//         </div>
//       </div>
//     );
//   }

 

//   return (
//     <>
//     <SEO 
//         title="TruePace News - Latest Headlines"
//         description="Breaking news headlines and the latest stories from TruePace News."
//         canonical="/"
//         tags={["news", "headlines", "breaking news", "just in"]}
//       />
      
//       <HeadlineSocket/>
//       {showTutorial && <SwipeTutorial onComplete={handleTutorialComplete} />}
//       <div className="flex justify-center">
//         <div className="w-full max-w-md tablet:max-w-2xl desktop:max-w-4xl h-screen">
//           <div className="h-full overflow-y-scroll snap-y snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ">
//             {channelsWithContent.map((channel) => (
//               <div key={channel._id} className="h-screen snap-start">
//                 <Slide
//                   channel={channel}
//                   headlineContents={headlineContents.filter(content => content.channelId === channel._id)}
//                   justInContents={justInContents}
//                 />
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//       <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
//     </>
//   );
// }

// export default Page;

// Updated Page component - Fixed external news handling
"use client"
import Slide from "@/components/Headline_news_comps/Tabs/Slide";
import { fetchChannels, fetchContents, fetchJustInContents, fetchHeadlineContents } from "@/components/Utils/HeadlineNewsFetch";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./(auth)/AuthContext";
import AuthModal from "@/components/Headline_news_comps/AuthModal";  
import { useDispatch } from "react-redux";
import { setJustInContent } from "@/Redux/Slices/ViewContentSlice";
import useLocationTracker from "@/components/External_News/IpAddressTracker";
import { 
  fetchExternalNews, 
  clearFetchedNewsCache,
  refreshExternalChannels,
  ensureServerHasFreshNews,
  getContentWithFreshNews,
  forceFreshNews,
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
  
  // Get user's location
  const { ipInfo, isLoading: isLocationLoading } = useLocationTracker(300000);
  const [hasRefreshedChannels, setHasRefreshedChannels] = useState(false);
  const [serverFreshNewsStatus, setServerFreshNewsStatus] = useState(null);

  // Use the enhanced fresh news content hook
  const { fetchWithFreshNews, loading: freshNewsLoading } = useFreshNewsContent();

  useEffect(() => {
    if (user?.isNewUser && !localStorage.getItem('hasSeenHeadlineNewsTutorial')) {
      setShowTutorial(true);
    }
  }, [user]);
  
  const handleTutorialComplete = () => {
    localStorage.setItem('hasSeenHeadlineNewsTutorial', 'true');
    setShowTutorial(false);
  };

  // Initial server check and data fetch
  useEffect(() => {
    initializeApp();
  }, [dispatch]);

  const initializeApp = async () => {
    try {
      console.log('🚀 Initializing app...');
      
      // First, ensure server has fresh news
      const hasFreshNews = await ensureServerHasFreshNews();
      setServerFreshNewsStatus(hasFreshNews);
      
      if (hasFreshNews) {
        console.log('✅ Server has fresh news, proceeding with data fetch...');
        await fetchInitialData();
      } else {
        console.log('⚠️ Server doesn\'t have fresh news, will retry...');
        // Wait a bit and try again
        setTimeout(async () => {
          await fetchInitialData();
        }, 5000);
      }
      
    } catch (error) {
      console.error('❌ Error initializing app:', error);
      // Fallback to normal data fetch
      await fetchInitialData();
    }
  };

  // Refresh external channels if needed (one time on app load)
  useEffect(() => {
    const refreshChannelsIfNeeded = async () => {
      if (!hasRefreshedChannels) {
        try {
          console.log('🔄 Refreshing external channels...');
          const success = await refreshExternalChannels();
          setHasRefreshedChannels(true);
          
          if (success) {
            console.log('✅ Channels refreshed, fetching data...');
            // Small delay before refetching to allow server to process
            setTimeout(fetchInitialData, 2000);
          }
        } catch (error) {
          console.error('Error refreshing external channels:', error);
        }
      }
    };

    refreshChannelsIfNeeded();
  }, [hasRefreshedChannels]);

  // Enhanced external news fetching with fresh news check
  useEffect(() => {
    if (ipInfo && !isLocationLoading) {
      // Check if we should fetch external news
      if (shouldFetchExternalNews()) {
        // Initial fetch after a short delay
        const initialTimer = setTimeout(() => {
          fetchAndSaveExternalNewsEnhanced();
        }, 3000);
        
        return () => clearTimeout(initialTimer);
      }
      
      // Set up periodic checking every 15 minutes
      const intervalId = setInterval(() => {
        if (shouldFetchExternalNews()) {
          fetchAndSaveExternalNewsEnhanced();
        }
      }, 15 * 60 * 1000);
      
      return () => clearInterval(intervalId);
    }
  }, [ipInfo, isLocationLoading]);

  const fetchInitialData = async () => {
    try {
      console.log('🔄 Fetching initial data...');
      setIsLoading(true);
      
      // Use the enhanced fetch function for data that might include external news
      const [channelsData, headlineContentsData, justInContentsData] = await Promise.all([
        getContentWithFreshNews('/api/channels'),
        getContentWithFreshNews('/api/headline-contents?page=1&limit=20'),
        getContentWithFreshNews('/api/just-in-contents')
      ]);
      
      console.log('📊 Initial data fetched:');
      console.log('- Channels:', channelsData?.length || 0);
      console.log('- Headline contents:', headlineContentsData?.length || 0);
      console.log('- Just In contents:', justInContentsData?.length || 0);
      
      // Debug external content specifically
      const externalHeadlines = headlineContentsData?.filter(content => content.source === 'external') || [];
      const externalJustIn = justInContentsData?.filter(content => content.source === 'external') || [];
      
      console.log('🌐 External content breakdown:');
      console.log('- External headlines:', externalHeadlines.length);
      console.log('- External Just In:', externalJustIn.length);
      
      if (externalHeadlines.length > 0) {
        console.log('📰 External headline samples:', externalHeadlines.slice(0, 2).map(c => ({
          id: c._id,
          message: c.message?.substring(0, 50) + '...',
          source: c.source,
          originalSource: c.originalSource,
          channelId: c.channelId
        })));
      }
      
      setChannels(channelsData);
      setHeadlineContents(headlineContentsData);
      setJustInContents(justInContentsData);
      dispatch(setJustInContent(justInContentsData));
      setIsLoading(false);
    } catch (error) {
      console.error('❌ Error fetching initial data:', error);
      // Fallback to original fetch methods
      try {
        const [channelsData, headlineContentsData, justInContentsData] = await Promise.all([
          fetchChannels(),
          fetchHeadlineContents(1, 20),
          fetchJustInContents()
        ]);
        
        setChannels(channelsData);
        setHeadlineContents(headlineContentsData);
        setJustInContents(justInContentsData);
        dispatch(setJustInContent(justInContentsData));
      } catch (fallbackError) {
        console.error('❌ Fallback fetch also failed:', fallbackError);
        setError(fallbackError.message);
      }
      setIsLoading(false);
    }
  };

  const fetchAndSaveExternalNewsEnhanced = useCallback(async () => {
    try {
      console.log('🔄 Enhanced external news fetching...');
      
      // First ensure server has fresh news
      const hasFreshNews = await ensureServerHasFreshNews();
      
      if (!hasFreshNews) {
        console.log('⚠️ Server doesn\'t have fresh news, forcing fresh fetch...');
        await forceFreshNews();
      }
      
      // Mark that we've triggered external news fetch
      markExternalNewsFetchTriggered();
      
      console.log('✅ External news process completed');
      
      // Refresh the data to include new external news after a short delay
      setTimeout(() => {
        console.log('🔄 Refreshing data after external news processing...');
        fetchInitialData();
      }, 3000);
      
    } catch (error) {
      console.error("❌ Error in enhanced external news fetch:", error);
      // Fallback to original method
      try {
        const articlesProcessed = await fetchExternalNews(ipInfo);
        console.log(`✅ Fallback: Processed ${articlesProcessed} articles`);
        
        if (articlesProcessed > 0) {
          setTimeout(fetchInitialData, 2000);
        }
      } catch (fallbackError) {
        console.error("❌ Fallback external news fetch failed:", fallbackError);
      }
    }
  }, [ipInfo]);

  // Auth modal logic
  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => {
        setShowAuthModal(true);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [user]);

  // Enhanced manual refresh function
  const handleManualRefresh = useCallback(async () => {
    console.log('🔄 Enhanced manual refresh triggered...');
    setIsLoading(true);
    
    try {
      // Force fresh news
      console.log('🚀 Forcing fresh news...');
      await forceFreshNews();
      
      // Clear cache
      clearFetchedNewsCache();
      
      // Refresh channels
      console.log('🔄 Refreshing channels...');
      await refreshExternalChannels();
      
      // Wait a moment for processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Refresh data
      console.log('🔄 Refreshing data...');
      await fetchInitialData();
      
      console.log('✅ Manual refresh completed');
    } catch (error) {
      console.error('❌ Enhanced manual refresh failed:', error);
      // Fallback to original refresh
      try {
        await refreshExternalChannels();
        await fetchAndSaveExternalNewsEnhanced();
        await fetchInitialData();
      } catch (fallbackError) {
        console.error('❌ Fallback refresh failed:', fallbackError);
      }
    }
  }, [fetchAndSaveExternalNewsEnhanced]);

  // Force refresh function for when content is completely missing
  const handleForceRefresh = useCallback(async () => {
    console.log('🚀 Force refresh with fresh news...');
    setIsLoading(true);
    
    try {
      // Force fresh news from server
      await forceFreshNews();
      
      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Refresh everything
      await fetchInitialData();
      
    } catch (error) {
      console.error('❌ Force refresh failed:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
      </div>
    );
  }

  if (error) return <div>Error: {error}</div>;

  // Filter channels that have content
  const channelsWithContent = channels.filter(channel => 
    headlineContents.some(content => content.channelId === channel._id) || 
    justInContents.some(content => content.channelId === channel._id)
  );

  if (channelsWithContent.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-red-50 dark:bg-gray-900">
        <div className="text-center p-8 bg-white dark:bg-gray-700 rounded-lg shadow-md border border-red-300 max-w-md tablet:max-w-lg desktop:max-w-xl">
          <h2 className="text-2xl font-bold mb-4 dark:text-gray-200">No Content Available</h2>
          <p className="text-gray-600 dark:text-gray-200 mb-4">
            Headline News content is not available at the moment. Please check back later.
          </p>
          <div className="flex gap-2 justify-center">
            <button 
              onClick={handleManualRefresh}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? 'Refreshing...' : 'Refresh Content'}
            </button>
            <button 
              onClick={handleForceRefresh}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? 'Forcing...' : 'Force Fresh News'}
            </button>
          </div>
          {serverFreshNewsStatus !== null && (
            <p className="text-sm text-gray-500 mt-2">
              Server Fresh News: {serverFreshNewsStatus ? '✅ Available' : '⚠️ Needs Update'}
            </p>
          )}
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
              <div>Channels: {channels.length}</div>
              <div>Headlines: {headlineContents.length}</div>
              <div>External: {headlineContents.filter(c => c.source === 'external').length}</div>
              <div>Just In: {justInContents.length}</div>
              <div>Fresh News: {serverFreshNewsStatus ? '✅' : '⚠️'}</div>
              <div className="flex gap-1 mt-1">
                <button onClick={handleManualRefresh} className="px-2 py-1 bg-blue-500 rounded text-xs">
                  Refresh
                </button>
                <button onClick={handleForceRefresh} className="px-2 py-1 bg-green-500 rounded text-xs">
                  Force
                </button>
              </div>
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