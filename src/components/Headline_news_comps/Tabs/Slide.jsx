'use client';
import { useState,  useRef,useEffect } from 'react';
import SubscribeFeed from './Headline_Tabs_Comps/SubscribeFeed';
import ContentFeed from './Headline_Tabs_Comps/ContentFeed';
import EngagementFeed from './Headline_Tabs_Comps/EngagementFeed';

const items =[
  {
    title:'Headline News',
  content:(
    <>
    <div className=' border-blue-400 rounded-lg px-3.5 py-2'>{/* border-2*/}
    <SubscribeFeed/>
     <ContentFeed/>
     <EngagementFeed/>
    </div>
    </>
  )
  },
  {
    title:'Just In',
  content:(
    <>
    <div className='border-2  [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] overflow-x-scroll  whitespace-nowrap snap-x snap-mandatory w-full'>
      <div className='inline-block w-full  bg-green-400 h-screen  snap-start'>
     
         </div>
         <div  className='inline-block  w-full bg-red-400 h-screen snap-start'>
     
         </div>
         <div  className='inline-block  w-full bg-yellow-300 h-screen snap-start'>
     
         </div>
    </div>
    </>
  )
  }
  
]


const Slide = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const slideRef = useRef(null);

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
  

  return (
    <div ref={slideRef} className='  h-full  flex justify-center  py-10' >{/*bg-sky-100 removed */}
      <div className='max-w-md flex flex-col  w-full'>
        <div className='bg-red-600 p-1   rounded-lg flex justify-between items-center gap-x-2 font-semibold text-white '>
          {items.map((item, index) => (
            <button
           
              key={index}
              onClick={() => setSelectedTab(index)}
              className={`outline-none w-full p-1.5 rounded-lg text-center   ${
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
      </div>
    </div>
  );
};

export default Slide;



