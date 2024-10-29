"use client"
import Slide from "@/components/Headline_news_comps/Tabs/Slide";
import { fetchChannels, fetchContents, fetchJustInContents, fetchHeadlineContents } from "@/components/Utils/HeadlineNewsFetch";
import { useState, useEffect } from "react";
import { useAuth } from "./(auth)/AuthContext";
import AuthModal from "@/components/Headline_news_comps/AuthModal";  
import { useDispatch } from "react-redux";
import { setJustInContent } from "@/Redux/Slices/ViewContentSlice";
import { PersistGate } from 'redux-persist/integration/react';
import persistor from '@/Redux/store'
import HeadlineSocket from "@/components/Socket io/HeadlineSocket";
import ContentFeedSkeleton from "@/components/Headline_news_comps/Tabs/Headline_Tabs_Comps/SubFeedComps/ContentFeedSkeleton";
import InfiniteScroll from "react-infinite-scroll-component";

const Page = () => {
  const [channels, setChannels] = useState([]);
  const [headlineContents, setHeadlineContents] = useState([]);
  const [justInContents, setJustInContents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, [dispatch]);

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

  const fetchMoreData = async () => {
    if (!hasMore) return;
    try {
      const nextPage = page + 1;
      const moreHeadlineContents = await fetchHeadlineContents(nextPage);
      if (moreHeadlineContents.length === 0) {
        setHasMore(false);
      } else {
        setHeadlineContents(prev => [...prev, ...moreHeadlineContents]);
        setPage(nextPage);
      }
    } catch (error) {
      console.error("Error fetching more data:", error);
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
      <div className="h-screen overflow-y-scroll bg-red-50 snap-y snap-mandatory ">
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
      <div className="h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md border border-red-300 max-w-md tablet:max-w-lg desktop:max-w-xl">
          <h2 className="text-2xl font-bold mb-4">No Content Available</h2>
          <p className="text-gray-600">
            Headline News content is not available at the moment. Please check back later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <HeadlineSocket/>
      <div className="flex justify-center">
        <div className="w-full max-w-md tablet:max-w-2xl desktop:max-w-4xl h-screen">
          <div className="h-full overflow-y-scroll snap-y snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ">
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