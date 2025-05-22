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

"use client"
import Slide from "@/components/Headline_news_comps/Tabs/Slide";
import { fetchChannels, fetchContents, fetchJustInContents, fetchHeadlineContents } from "@/components/Utils/HeadlineNewsFetch";
import { useState, useEffect } from "react";
import { useAuth } from "./(auth)/AuthContext";
import AuthModal from "@/components/Headline_news_comps/AuthModal";  
import { useDispatch } from "react-redux";
import { setJustInContent } from "@/Redux/Slices/ViewContentSlice";
import useLocationTracker from "@/components/External_News/IpAddressTracker";
import { fetchExternalNews, createOrGetChannelForExternalSource } from "@/components/External_News/ExternalNewsService"
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
  const { ipInfo, isLoading: isLocationLoading } = useLocationTracker(300000); // Refresh every 5 minutes
  const [externalNewsChannels, setExternalNewsChannels] = useState({});

  useEffect(() => {
    // Only show tutorial for new users who haven't seen it
    if (user?.isNewUser && !localStorage.getItem('hasSeenHeadlineNewsTutorial')) {
      setShowTutorial(true);
    }
  }, [user]);
  
  const handleTutorialComplete = () => {
    localStorage.setItem('hasSeenHeadlineNewsTutorial', 'true');
    setShowTutorial(false);
  };

  // Fetch internal data first
  useEffect(() => {
    fetchInitialData();
  }, [dispatch]);

  // Fetch external news when location is available
  useEffect(() => {
    if (ipInfo && !isLocationLoading) {
      fetchExternalNewsData();
    }
  }, [ipInfo, isLocationLoading]);

  const fetchInitialData = async () => {
    try {
      const [channelsData, headlineContentsData, justInContentsData] = await Promise.all([
        fetchChannels(),
        fetchHeadlineContents(1), // Fetch first page
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

  const fetchExternalNewsData = async () => {
    try {
      // Fetch news based on user's location
      const externalNews = await fetchExternalNews(ipInfo);
      
      if (externalNews.length === 0) return;
      
      // Create a map to store source channels
      const sourceChannelsMap = {...externalNewsChannels};
      
      // Process each news item to ensure we have channels for them
      const newsWithChannels = await Promise.all(
        externalNews.map(async (newsItem) => {
          if (!sourceChannelsMap[newsItem.originalSource]) {
            // Create or get channel for this source
            const channel = await createOrGetChannelForExternalSource(newsItem.originalSource);
            sourceChannelsMap[newsItem.originalSource] = channel;
            // Add to channels list if not already there
            if (!channels.some(c => c._id === channel._id)) {
              setChannels(prev => [...prev, channel]);
            }
          }
          
          // Update the channelId to the actual channel id
          return {
            ...newsItem,
            channelId: sourceChannelsMap[newsItem.originalSource]._id
          };
        })
      );
      
      // Save the source channel map for future use
      setExternalNewsChannels(sourceChannelsMap);
      
      // Split news into just-in and headline
      const justInNews = newsWithChannels.filter(news => news.isJustIn);
      const headlineNews = newsWithChannels.filter(news => !news.isJustIn);
      
      // Add external news to our content arrays, avoiding duplicates
      if (justInNews.length > 0) {
        setJustInContents(prev => {
          const existingIds = new Set(prev.map(item => item._id));
          const newItems = justInNews.filter(item => !existingIds.has(item._id));
          return [...prev, ...newItems];
        });
      }
      
      if (headlineNews.length > 0) {
        setHeadlineContents(prev => {
          const existingIds = new Set(prev.map(item => item._id));
          const newItems = headlineNews.filter(item => !existingIds.has(item._id));
          return [...prev, ...newItems];
        });
      }
    } catch (error) {
      console.error("Error fetching external news:", error);
      // Don't set error state to avoid blocking the whole page if external news fails
    }
  };

  useEffect(() => {
    const moveExpiredContent = () => {
      const now = new Date();
      const expiredContent = justInContents.filter(content => new Date(content.justInExpiresAt) <= now);
      
      if (expiredContent.length > 0) {
        setJustInContents(prev => prev.filter(content => new Date(content.justInExpiresAt) > now));
        setHeadlineContents(prev => [...expiredContent, ...prev]);
      }
    };

    const expirationInterval = setInterval(moveExpiredContent, 60000);

    return () => clearInterval(expirationInterval);
  }, [justInContents]);

  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => {
        setShowAuthModal(true);
      }, 10000); // Show modal after 10 seconds

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