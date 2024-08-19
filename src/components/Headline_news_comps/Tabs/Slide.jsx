'use client';
import { useState,  useRef,useEffect } from 'react';
import SubscribeFeed from './Headline_Tabs_Comps/SubscribeFeed';
import ContentFeed from './Headline_Tabs_Comps/ContentFeed';
import EngagementFeed from './Headline_Tabs_Comps/EngagementFeed';




const Slide = ({ channel, headlineContent, justInContents }) => {
const [selectedTab, setSelectedTab] = useState(0);
const slideRef = useRef(null);
 

const items = [
  {
    title: 'Headline News',
    renderContent: () => (
      <div className='border-blue-400 rounded-lg px-4 py-2 break-words'>
        <SubscribeFeed channel={channel} />
        <ContentFeed content={headlineContent}/>
        <EngagementFeed content={headlineContent}/>
      </div>
    )
  },
  {
    title: 'Just In',
    renderContent: () => (
      <div className='border-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] overflow-x-scroll whitespace-nowrap snap-x snap-mandatory w-full'>
        {justInContents.map((content) => (
          <div key={content._id} className='w-full inline-block align-top snap-start h-screen whitespace-normal'>
            <div className='border-blue-400 rounded-lg px-4 py-2 break-words'>
              <SubscribeFeed channel={content.channelId} />
              <ContentFeed content={content}/>
              <EngagementFeed content={content}/>
            </div>
          </div>
        ))}
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
  <div ref={slideRef} className='h-full flex justify-center'>
    <div className='max-w-md flex flex-col w-full'>
      <div className='bg-red-600 p-1 rounded-lg flex justify-between items-center gap-x-2 font-semibold text-white'>
        {items.map((item, index) => (
          <button
            key={index}
            onClick={() => setSelectedTab(index)}
            className={`outline-none w-full p-1 rounded-lg text-center transition-colors duration-300 ${
              selectedTab === index ? 'bg-white text-neutral-800' : ''
            }`}
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

// i have this page with css functionality called 'scroll-snap' 
//  in it and in that page i also have 'HeadlineNews' tab and 'Just In 'tab ..I have made a
//  functionality in it that when newly uploaded content is out,it first goes in to the 'just in' tab ,the
//   after 10mins it goes into the 'HeadlineNews' tab..Now the issue i am facing right now is that.
//   Each content when uploaded on the 'Just In' tab they tend to remain on the name on the channel tagged to 
//   the content such that it's only on the channel that the content is seen in the 'Just In'.I don't want such
//    thing.I want it that it will definitely be seen on the channel been tagged with it and every other
//     channels before going into the 'HeadlineNews' after 10 mins..I don't know if you get what i am asking for?

// second question 
// it's not working,it's only appearing on the targeted channel..I want it to appear on different channels so that they can all see the latest update on  the 'Just In'
