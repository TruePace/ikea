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

// Updated Page component - Simplified external news handling
"use client"
import Slide from "@/components/Headline_news_comps/Tabs/Slide";
import { fetchChannels, fetchContents, fetchJustInContents, fetchHeadlineContents } from "@/components/Utils/HeadlineNewsFetch";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./(auth)/AuthContext";
import AuthModal from "@/components/Headline_news_comps/AuthModal";  
import { useDispatch } from "react-redux";
import { setJustInContent } from "@/Redux/Slices/ViewContentSlice";
import useLocationTracker from "@/components/External_News/IpAddressTracker";
import { fetchExternalNews, clearFetchedNewsCache } from "@/components/External_News/ExternalNewsService"
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

  useEffect(() => {
    if (user?.isNewUser && !localStorage.getItem('hasSeenHeadlineNewsTutorial')) {
      setShowTutorial(true);
    }
  }, [user]);
  
  const handleTutorialComplete = () => {
    localStorage.setItem('hasSeenHeadlineNewsTutorial', 'true');
    setShowTutorial(false);
  };

  // Fetch all data (internal + external from database)
  useEffect(() => {
    fetchInitialData();
  }, [dispatch]);

  // Fetch external news periodically and save to database
  useEffect(() => {
    if (ipInfo && !isLocationLoading) {
      fetchAndSaveExternalNews();
      
      // Set up periodic fetching every 30 minutes
      const intervalId = setInterval(() => {
        fetchAndSaveExternalNews();
      }, 30 * 60 * 1000); // 30 minutes
      
      return () => clearInterval(intervalId);
    }
  }, [ipInfo, isLocationLoading]);

  const fetchInitialData = async () => {
    try {
      const [channelsData, headlineContentsData, justInContentsData] = await Promise.all([
        fetchChannels(),
        fetchHeadlineContents(1),
        fetchJustInContents()
      ]);
      setChannels(channelsData);
      setHeadlineContents(headlineContentsData);
      setJustInContents(justInContentsData);
      dispatch(setJustInContent(justInContentsData));
      setIsLoading(false);
    } catch (error) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  const fetchAndSaveExternalNews = useCallback(async () => {
    try {
      // Prevent too frequent fetching
      const now = Date.now();
      if (lastExternalFetch && (now - lastExternalFetch) < 10 * 60 * 1000) { // 10 minutes minimum
        return;
      }
      
      console.log('Fetching and saving external news...');
      
      // This now saves to database and returns saved items
      const savedExternalNews = await fetchExternalNews(ipInfo);
      
      if (savedExternalNews.length === 0) {
        console.log('No new external news saved');
        return;
      }
      
      setLastExternalFetch(now);
      console.log(`Saved ${savedExternalNews.length} new external news items to database`);
      
      // Refresh the data from database to include new external news
      await fetchInitialData();
      
    } catch (error) {
      console.error("Error fetching and saving external news:", error);
    }
  }, [ipInfo, lastExternalFetch, dispatch]);

  // Clear external news cache periodically to allow fresh content
  useEffect(() => {
    const clearCacheInterval = setInterval(() => {
      clearFetchedNewsCache();
    }, 60 * 60 * 1000); // Clear every hour

    return () => clearInterval(clearCacheInterval);
  }, []);

  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => {
        setShowAuthModal(true);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [user]);

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
          <p className="text-gray-600 dark:text-gray-200">
            Headline News content is not available at the moment. Please check back later.
          </p>
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