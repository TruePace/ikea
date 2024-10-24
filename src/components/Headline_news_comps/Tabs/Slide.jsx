'use client';
import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { markAsViewed, updateUnviewedCount,setJustInContent } from '../../../Redux/Slices/ViewContentSlice';
import { FaBell } from 'react-icons/fa';
import SubscribeFeed from './Headline_Tabs_Comps/SubscribeFeed';
import ContentFeed from './Headline_Tabs_Comps/ContentFeed';
import EngagementFeed from './Headline_Tabs_Comps/EngagementFeed';
import { FaNewspaper, FaArrowLeft, FaCalendarAlt } from 'react-icons/fa';
import CountdownTimer from '@/components/Utils/CountdownTimer';
import JustInTimer from '@/components/Utils/JustInTimer';
import JustInPagination from './Headline_Tabs_Comps/SubFeedComps/JustInPagination';
import SwipeableTabs from './Headline_Tabs_Comps/SwipeableTabs';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const Slide = ({ channel, headlineContents, justInContents }) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [currentJustInIndex, setCurrentJustInIndex] = useState(0);
  const justInContainerRef = useRef(null);
  const slideRef = useRef(null);
  const [currentJustInContent, setCurrentJustInContent] = useState([]);
  const [channelsMap, setChannelsMap] = useState({});
  const hasJustInContent = currentJustInContent.length > 0;
  const dispatch = useDispatch();
  const viewedIds = useSelector(state => state.viewedContent.viewedIds);
  const unviewedCount = useSelector(state => state.viewedContent.unviewedCount);

  // console.log("Current Just In Content:", currentJustInContent);
  // console.log("Viewed Content:", viewedIds);
  // console.log("Unviewed Count:", unviewedCount);

  
  useEffect(() => {
    // console.log("Just In Contents:", justInContents);
    const sortedContent = [...justInContents].sort((a, b) => {
      if (a.channelId === channel._id && b.channelId !== channel._id) return -1;
      if (b.channelId === channel._id && a.channelId !== channel._id) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  
    setCurrentJustInContent(sortedContent);
    dispatch(setJustInContent(sortedContent));
    dispatch(updateUnviewedCount());
  
    const uniqueChannelIds = [...new Set(sortedContent.map(content => content.channelId))];
    Promise.all(uniqueChannelIds.map(fetchChannel))
      .then(channels => {
        const newChannelsMap = {};
        channels.forEach(ch => {
          if (ch) newChannelsMap[ch._id] = ch;
        });
        setChannelsMap(newChannelsMap);
      });
  }, [justInContents, channel._id, dispatch]);

  useEffect(() => {
    // console.log("Unviewed Count:", unviewedCount);
  }, [unviewedCount]);

  const handleJustInView = (contentId) => {
    dispatch(markAsViewed(contentId));
    dispatch(updateUnviewedCount());
  };


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


  const handleJustInScroll = () => {
    if (justInContainerRef.current) {
      const scrollLeft = justInContainerRef.current.scrollLeft;
      const slideWidth = justInContainerRef.current.offsetWidth;
      const newIndex = Math.round(scrollLeft / slideWidth);
      setCurrentJustInIndex(newIndex);
    }
  };

  const handlePageChange = (newIndex) => {
    setCurrentJustInIndex(newIndex);
  };

  const handleTabChange = (index) => {
    setSelectedTab(index);
  };

  const renderHeadlineContent = (content) => (
    <div className="relative border-blue-400 rounded-lg px-4 py-2 break-words">
      <SubscribeFeed channel={channel} />
      <ContentFeed content={content} onView={() => handleJustInView(content._id)} isViewed={viewedIds.includes(content._id)} />
      <EngagementFeed content={content} channel={channel}/>
      
      <div className="absolute bottom-80 left-0 flex items-center space-x-2">
        <CountdownTimer expirationTime={content.headlineExpiresAt} />
        <span className="text-xs text-red-800">
          Uploaded: {new Date(content.uploadedAt).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );

  const renderJustInContent = () => {
    if (currentJustInContent.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] bg-white">
          <div className="text-4xl mb-4 flex items-center">
            <FaNewspaper className="mr-2" />
            <FaArrowLeft className="mx-2" />
            <FaCalendarAlt className="ml-2" />
          </div>
          <p className="text-center text-md mb-4 capitalize">
            No breaking news right now.
            <br/>
            Recent updates moved to Headline News
          </p>
          <p className="text-center text-md capitalize">
            Visit <b>Missed Just In</b> to catch up
          </p>
        </div>
      );
    }

    return (
      <div className="relative h-[calc(100vh-8rem)]">
        <div 
          ref={justInContainerRef}
          className="h-full flex overflow-x-scroll snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          onScroll={handleJustInScroll}
        >
          {currentJustInContent.map((content) => (
            <div 
              key={content._id} 
              className="w-full flex-shrink-0 snap-start overflow-y-auto"
            >
              <div className="relative px-4 py-2">
                <SubscribeFeed channel={channelsMap[content.channelId] || {}} />
                <ContentFeed 
                  content={content} 
                  onView={() => handleJustInView(content._id)} 
                  isViewed={viewedIds.includes(content._id)} 
                />
                <EngagementFeed content={content} channel={channel} />
                
                <div className="absolute bottom-20 left-0 flex items-center space-x-2">
                  <JustInTimer expirationTime={content.justInExpiresAt} />
                  <span className="text-xs text-red-800">
                    Uploaded: {new Date(content.uploadedAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {currentJustInContent.length > 1 && (
          <JustInPagination 
            currentIndex={currentJustInIndex}
            totalPages={currentJustInContent.length}
            onPageChange={handlePageChange}
            containerRef={justInContainerRef}
          />
        )}
      </div>
    );
  };


  const items = [
    {
      title: 'Headline News',
      renderContent: () => (
        <div className='h-[calc(100vh-8rem)] overflow-y-scroll snap-y snap-mandatory'>
          {headlineContents.length > 0 ? (
            headlineContents.map((content) => (
              <div key={content._id} className='min-h-[calc(100vh-8rem)] snap-start'>
                {renderHeadlineContent(content)}
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-xl text-gray-500 capitalize">News Only available on the Just in tab. Check back later!</p>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Just In',
      renderContent: renderJustInContent
    }
  ];


  return (
    <div ref={slideRef} className="h-screen flex justify-center">
      <div className="w-full max-w-md tablet:max-w-2xl desktop:max-w-4xl">
        <SwipeableTabs
          items={items}
          unviewedCount={unviewedCount}
          selectedTab={selectedTab}
          onTabChange={handleTabChange}
        />
      </div>
    </div>
  );
};

export default Slide;