'use client'
import {store, persistor} from "../Redux/store"
import { Provider } from "react-redux";
import { PersistGate } from 'redux-persist/integration/react';
import Slide from "@/components/Headline_news_comps/Tabs/Slide";
import { fetchChannels, fetchContents, fetchJustInContents, fetchHeadlineContents } from "@/components/Utils/HeadlineNewsFetch";
import { useState, useEffect } from "react";

const Page = () => {
  const [channels, setChannels] = useState([]);
  const [headlineContents, setHeadlineContents] = useState([]);
  const [justInContents, setJustInContents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [channelsData, headlineContentsData, justInContentsData] = await Promise.all([
          fetchChannels(),
          fetchHeadlineContents(),
          fetchJustInContents()
        ]);
        setChannels(channelsData);
        setHeadlineContents(headlineContentsData);
        setJustInContents(justInContentsData);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();

    const dataInterval = setInterval(fetchData, 30000);

    return () => clearInterval(dataInterval);
  }, []);

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

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
        <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <div className="h-screen overflow-y-scroll bg-red-50 snap-y snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {channels.map((channel) => (
              <div key={channel._id} className="h-screen snap-start">
                <Slide
                  channel={channel}
                  headlineContents={headlineContents.filter(content => content.channelId === channel._id)}
                  justInContents={justInContents}
                />
              </div>
            ))}
          </div>
        </PersistGate>
      </Provider>
    </>
  );
}

export default Page;

