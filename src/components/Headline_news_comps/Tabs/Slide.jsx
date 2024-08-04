'use client';
import { useState,  useRef,useEffect } from 'react';
import SubscribeFeed from './Headline_Tabs_Comps/SubscribeFeed';
import ContentFeed from './Headline_Tabs_Comps/ContentFeed';
import EngagementFeed from './Headline_Tabs_Comps/EngagementFeed';
import JustInSubscribeFeed from './Headline_Tabs_Comps/JustInSubscribeFeed';
import JustInContentFeed from './Headline_Tabs_Comps/JustInContentFeed';
import JustInEngagementFeed from './Headline_Tabs_Comps/JustInEngagementFeed';
import { fetchChannels,fetchContents } from '@/components/Utils/HeadlineNewsFetch';

const items =[
  {
    title:'Headline News',
    renderContent: (channels, contents) => (
      <div className='border-blue-400 rounded-lg px-4 py-2 break-words'>
        <SubscribeFeed channels={channels} />
        <ContentFeed contents={contents} />
        <EngagementFeed  contents={contents} />
      </div>
    )
  },
  {
    title:'Just In',
    renderContent: (channels, contents) => (
    <>
    <div className='border-2  [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] overflow-x-scroll  whitespace-nowrap snap-x  snap-mandatory w-full '>
      <div className=' w-full inline-block align-top  snap-start  h-screen whitespace-normal'>{/* bg-green-400*/}
     <div className='  border-blue-400 rounded-lg px-4 py-2  break-words'>{/* border-2*/}
     <JustInSubscribeFeed channels={channels} />
            <JustInContentFeed contents={contents} />
            <JustInEngagementFeed  contents={contents} />
    </div>
         </div>
         <div className=' w-full inline-block align-top  snap-start  h-screen whitespace-normal'>{/* bg-red-400*/}
         <div className='  border-blue-400 rounded-lg px-4 py-2  break-words'>{/* border-2*/}
    <JustInSubscribeFeed/>
     <JustInContentFeed/>
     <JustInEngagementFeed/>
    </div>
         </div>
         <div className=' w-full inline-block align-top  snap-start  h-screen whitespace-normal'>{/* bg-yellow-400*/}
         <div className='  border-blue-400 rounded-lg px-4 py-2  break-words'>{/* border-2*/}
    <JustInSubscribeFeed/>
     <JustInContentFeed/>
     <JustInEngagementFeed/>
    </div>
         </div>
    </div>
    </>
  )
  }
  
]


const Slide = () => {

// fetching data variables

const [channels, setChannels] = useState([]);
const [contents, setContents] = useState([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState(null);
const [selectedTab, setSelectedTab] = useState(0);
const slideRef = useRef(null);


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




 

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setSelectedTab(0); // Reset to default tab when the container is in view
          }
        });
      },
      { threshold: 0.5 } // Adjust threshold as needed
    );

    if (slideRef.current) {
      observer.observe(slideRef.current);
    }

    return () => {
      if (slideRef.current) {
        observer.unobserve(slideRef.current);
      }
    };
  }, []);
  
//   if (isLoading) return <div>Loading...</div>;
// if (error) return <div>Error: {error}</div>;
// // end of fetching data variables

const renderContent = () => {
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className=''>
      {items.map((item, index) => (
        <div className={`${selectedTab === index ? '' : 'hidden'}`} key={index}>
          {item.renderContent(channels, contents)}
        </div>
      ))}
    </div>
  );
};

  return (
    <div ref={slideRef} className=' h-full  flex justify-center ' >{/*bg-sky-100 removed */}
      <div className='max-w-md flex flex-col  w-full'>
        <div className='bg-red-600  p-1   rounded-lg flex justify-between items-center gap-x-2 font-semibold text-white '>
          {items.map((item, index) => (
            <button
           
              key={index}
              onClick={() => setSelectedTab(index)}
              className={`outline-none w-full p-1 rounded-lg text-center   ${
                selectedTab === index ? ' bg-white text-neutral-800' : ''
              } `}
           
            >
              {item.title}
            </button>
          ))}
        </div>

        <div className=''>
          {items.map((item, index) => (
            <div className={`${selectedTab === index ? '' : 'hidden'}`} key={index}>
              {item.content}
              
            </div>
          ))}
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default Slide;



