'use client';
import { useState,  useRef,useEffect } from 'react';
import SubscribeFeed from './Headline_Tabs_Comps/SubscribeFeed';
import ContentFeed from './Headline_Tabs_Comps/ContentFeed';
import EngagementFeed from './Headline_Tabs_Comps/EngagementFeed';
import JustInSubscribeFeed from './Headline_Tabs_Comps/JustInSubscribeFeed';
import JustInContentFeed from './Headline_Tabs_Comps/JustInContentFeed';
import JustInEngagementFeed from './Headline_Tabs_Comps/JustInEngagementFeed';



const Slide = ({ channel, content}) => {
const [selectedTab, setSelectedTab] = useState(0);
const slideRef = useRef(null);
 

const items = [
  {
    title: 'Headline News',
    renderContent: () => (
      <div className='border-blue-400 rounded-lg px-4 py-2 break-words'>
        <SubscribeFeed channel={channel} />
        <ContentFeed content={content}/>
        <EngagementFeed content={content}/>
      </div>
    )
  },
  {
    title: 'Just In',
    renderContent: () => (
      <div className='border-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] overflow-x-scroll whitespace-nowrap snap-x snap-mandatory w-full'>
        <div className='w-full inline-block align-top snap-start h-screen whitespace-normal'>
          <div className='border-blue-400 rounded-lg px-4 py-2 break-words'>
            <JustInSubscribeFeed  />
            <JustInContentFeed  />
            <JustInEngagementFeed   />
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
    )
  }
];


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
            {item.renderContent()}
              
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Slide;



