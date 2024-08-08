'use client'
import store from "@/Redux/Index";
import { Provider } from "react-redux";
import NotifyFakeExample from "@/Redux/NotifyFakeExample";
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
   <div class="h-screen overflow-scroll  snap-y  snap-mandatory">
   {channels.map((channel, index) => (
          <div key={channel.id} className="h-full snap-start inline-block w-full">
            <Slide 
              channel={channel}
              content={contents[index] || {}}
            />
          </div>
        ))}
</div>

<Provider store={store}>
            <NotifyFakeExample/>
               </Provider>

  </>
  );
}


export default page;
// {channels.map(
//   ({name,picture})=>
//     ( <div class="  h-full snap-start inline-block w-full ">{/*bg-blue-500 */}
// <Slide name={name} picture={picture} key={channels.id} />
// </div>
//  )
// )} 