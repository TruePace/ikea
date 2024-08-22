'use client';
import { useState, useRef, useEffect } from 'react';
import SubscribeFeed from './Headline_Tabs_Comps/SubscribeFeed';
import ContentFeed from './Headline_Tabs_Comps/ContentFeed';
import EngagementFeed from './Headline_Tabs_Comps/EngagementFeed';
import { FaNewspaper, FaArrowLeft, FaCalendarAlt } from 'react-icons/fa';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const Slide = ({ channel, headlineContents, justInContents }) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const slideRef = useRef(null);
  const [currentJustInContent, setCurrentJustInContent] = useState([]);
  const [channelsMap, setChannelsMap] = useState({});
  const hasJustInContent = currentJustInContent.length > 0;

  useEffect(() => {
    // Sort justInContents, prioritizing current channel but without removing duplicates
    const sortedContent = justInContents.sort((a, b) => {
      if (a.channelId === channel._id && b.channelId !== channel._id) return -1;
      if (b.channelId === channel._id && a.channelId !== channel._id) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  
    // Update the state with the sorted content
    setCurrentJustInContent(sortedContent);
  
    // Fetch channels for all unique channelIds in justInContents
    const uniqueChannelIds = [...new Set(sortedContent.map(content => content.channelId))];
    Promise.all(uniqueChannelIds.map(fetchChannel))
      .then(channels => {
        const newChannelsMap = {};
        channels.forEach(ch => {
          if (ch) newChannelsMap[ch._id] = ch;
        });
        setChannelsMap(newChannelsMap);
      });
  }, [justInContents, channel._id]);
  

  // Function to fetch a single channel
  const fetchChannel = async (channelId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/HeadlineNews/Channel/${channelId}`);
      if (!response.ok) throw new Error('Failed to fetch channel');
      return await response.json();
    } catch (error) {
      console.error('Error fetching channel:', error);
      return null;
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setSelectedTab(0);
          }
        });
      },
      { threshold: 0.5 }
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

  const items = [
    {
      title: 'Headline News',
      renderContent: () => (
        <div className='h-screen overflow-y-scroll snap-y snap-mandatory '>
          {headlineContents.map((content) => (
            <div key={content._id} className='h-screen snap-start'>
              <div className='border-blue-400 rounded-lg px-4 py-2 break-words'>
                <SubscribeFeed channel={channel} />
                <ContentFeed content={content}/>
                <EngagementFeed content={content}/>
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      title: 'Just In',
      renderContent: () => {
        const hasJustInContent = currentJustInContent.length > 0;
        return (
          <div className='border-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] overflow-x-scroll whitespace-nowrap snap-x snap-mandatory w-full'>
            {hasJustInContent ? (
              currentJustInContent.map((content) => (
                <div key={content._id} className='w-full inline-block align-top snap-start h-screen whitespace-normal'>
                  <div className='border-blue-400 rounded-lg px-4 py-2 break-words'>
                    <SubscribeFeed channel={channelsMap[content.channelId] || {}} />
                    <ContentFeed content={content}/>
                    <EngagementFeed content={content}/>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-screen  font-sans ">
               <div className="text-4xl mb-4 flex items-center">
    <FaNewspaper className="mr-2" />
    <FaArrowLeft className="mx-2" />
    <FaCalendarAlt className="ml-2" />
  </div>
                <p className="text-center text-md mb-4  capitalize ">
                  No breaking news right now. 
                  <br/>
                  Recent updates moved to  Headline News 
                </p>
                <p className="text-center text-md capitalize">
                 Visit <b> Missed Just In</b> to catch up
                </p>
              </div>
            )}
          </div>
        );
      }
    }
  ];

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
            <div  className={`${selectedTab === index ? '' : 'hidden'}`} key={index}>
              {item.renderContent()}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Slide;



