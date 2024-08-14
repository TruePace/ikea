'use client'
import {store,persistor} from "../Redux/Store"
import { Provider } from "react-redux";
import { PersistGate } from 'redux-persist/integration/react';
import Slide from "@/components/Headline_news_comps/Tabs/Slide";
import { fetchChannels,fetchContents } from "@/components/Utils/HeadlineNewsFetch";
import { useState,useEffect } from "react";



// export const metadata = {
//   title: "TruePace Headline News title",
//   description: "Headline News description",
// } .... METADATA CAN'T BE USED HERE BECAUSE WE ARE USING 'USE CLIENT' ON THE PAGE


const page =  () => {
  // fetching data variables

const [channels, setChannels] = useState([]);
const [contents, setContents] = useState([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState(null);



  useEffect(() => {
    async function fetchData() {
      try {
        const [channelsData, contentsData] = await Promise.all([
          fetchChannels(),
          fetchContents()
          
        ]);
        setChannels(channelsData);
        setContents(contentsData);
        
      
  
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    }
  
    fetchData();
  }, []);
  
  useEffect(() => {
    console.log('Channels:', channels);
    console.log('Contents:', contents);
  }, [channels, contents]);
  
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
              content={contents[index] || {}}
              // comments={comments[index] || []}
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
