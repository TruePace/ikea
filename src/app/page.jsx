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

// Updated Page component - Enhanced external news handling
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
  refreshExternalChannels 
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
  const [lastExternalFetch, setLastExternalFetch] = useState(null);
  const [hasRefreshedChannels, setHasRefreshedChannels] = useState(false);

  useEffect(() => {
    if (user?.isNewUser && !localStorage.getItem('hasSeenHeadlineNewsTutorial')) {
      setShowTutorial(true);
    }
  }, [user]);
  
  const handleTutorialComplete = () => {
    localStorage.setItem('hasSeenHeadlineNewsTutorial', 'true');
    setShowTutorial(false);
  };

  // Initial data fetch
  useEffect(() => {
    fetchInitialData();
  }, [dispatch]);

  // Refresh external channels if needed (one time on app load)
  useEffect(() => {
    const refreshChannelsIfNeeded = async () => {
      if (!hasRefreshedChannels) {
        try {
          await refreshExternalChannels();
          setHasRefreshedChannels(true);
          // Refetch data after channel refresh
          await fetchInitialData();
        } catch (error) {
          console.error('Error refreshing external channels:', error);
        }
      }
    };

    refreshChannelsIfNeeded();
  }, [hasRefreshedChannels]);

  // Fetch external news periodically
  useEffect(() => {
    if (ipInfo && !isLocationLoading) {
      // Initial fetch
      fetchAndSaveExternalNews();
      
      // Set up periodic fetching every 30 minutes
      const intervalId = setInterval(() => {
        fetchAndSaveExternalNews();
      }, 30 * 60 * 1000);
      
      return () => clearInterval(intervalId);
    }
  }, [ipInfo, isLocationLoading]);

  const fetchInitialData = async () => {
    try {
      console.log('🔄 Fetching initial data...');
      
      const [channelsData, headlineContentsData, justInContentsData] = await Promise.all([
        fetchChannels(),
        fetchHeadlineContents(1, 20), // Increase limit to show more content
        fetchJustInContents()
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
      setError(error.message);
      setIsLoading(false);
    }
  };

  const fetchAndSaveExternalNews = useCallback(async () => {
    try {
      // Prevent too frequent fetching
      const now = Date.now();
      if (lastExternalFetch && (now - lastExternalFetch) < 10 * 60 * 1000) {
        console.log('⏰ Skipping external news fetch (too soon)');
        return;
      }
      
      console.log('🔄 Fetching and saving external news...');
      
      // Clear cache before fetching to allow new content
       clearFetchedNewsCache();
      
      // Fetch and save external news
      const savedExternalNews = await fetchExternalNews(ipInfo);
      
      if (savedExternalNews.length === 0) {
        console.log('ℹ️ No new external news saved');
        return;
      }
      
      setLastExternalFetch(now);
      console.log(`✅ Saved ${savedExternalNews.length} new external news items to database`);
      
      // Refresh the data to include new external news
      console.log('🔄 Refreshing data after external news save...');
      await fetchInitialData();
      
    } catch (error) {
      console.error("❌ Error fetching and saving external news:", error);
    }
  }, [ipInfo, lastExternalFetch]);

  // Auth modal logic
  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => {
        setShowAuthModal(true);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [user]);

  // Manual refresh function (you can call this from UI if needed)
  const handleManualRefresh = useCallback(async () => {
    console.log('🔄 Manual refresh triggered...');
   clearFetchedNewsCache();
    await fetchAndSaveExternalNews();
  }, [fetchAndSaveExternalNews]);

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
          <button 
            onClick={handleManualRefresh}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Refresh Content
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
          {/* Debug info (remove in production) */}
          {/* {process.env.NODE_ENV === 'development' && (
            <div className="fixed top-0 right-0 bg-black bg-opacity-75 text-white p-2 text-xs z-50">
              <div>Channels: {channels.length}</div>
              <div>Headlines: {headlineContents.length}</div>
              <div>External: {headlineContents.filter(c => c.source === 'external').length}</div>
              <div>Just In: {justInContents.length}</div>
              <button onClick={handleManualRefresh} className="mt-1 px-2 py-1 bg-blue-500 rounded text-xs">
                Refresh
              </button>
            </div>
          )} */}
          
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