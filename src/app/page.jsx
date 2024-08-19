'use client'
import {store,persistor} from "../Redux/store"
import { Provider } from "react-redux";
import { PersistGate } from 'redux-persist/integration/react';
import Slide from "@/components/Headline_news_comps/Tabs/Slide";
import { fetchChannels,fetchContents ,fetchJustInContents,fetchHeadlineContents} from "@/components/Utils/HeadlineNewsFetch";
import { useState,useEffect } from "react";



// export const metadata = {
//   title: "TruePace Headline News title",
//   description: "Headline News description",
// } .... METADATA CAN'T BE USED HERE BECAUSE WE ARE USING 'USE CLIENT' ON THE PAGE


const page =  () => {
  // fetching data variables

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
          fetchContents(),
          fetchJustInContents(),
          fetchHeadlineContents()
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

    // / Set up intervals to fetch 'Just In' and 'Headline' content every minute
    const justInInterval = setInterval(() => {
      fetchJustInContents().then(setJustInContents);
    }, 60000);

    const headlineInterval = setInterval(() => {
      fetchHeadlineContents().then(setHeadlineContents);
    }, 60000);

    // Clean up intervals on component unmount
    return () => {
      clearInterval(justInInterval);
      clearInterval(headlineInterval);
    };
  

  }, []);


  
  

// to remove expired 'Just In' content:
useEffect(() => {
  const timer = setInterval(() => {
    setJustInContents(prevContents => 
      prevContents.filter(content => new Date(content.justInExpiresAt) > new Date())
    );
  }, 60000); // Check every minute

  return () => clearInterval(timer);
}, []);




 
if (isLoading) return <div>Loading...</div>;
if (error) return <div>Error: {error}</div>;


  return (
    <>
   
  {/* <Header/> */}
  <Provider store={store}>
<PersistGate loading={null} persistor={persistor}>
   <div class="h-screen overflow-scroll  snap-y  snap-mandatory">
   {channels.map((channel, index) => (
          <div key={channel.id} className="h-full snap-start inline-block w-full">
                 <Slide
            channel={channel}
            headlineContent={headlineContents.find(content => content.channelId === channel._id) || {}}
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


export default page;
