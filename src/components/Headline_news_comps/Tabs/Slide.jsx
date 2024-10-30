'use client';
import { useState, useRef, useEffect,useCallback } from 'react';
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
import useSwipeNavigation from './Headline_Tabs_Comps/SwipeableTabs';
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
  const [isAnimating, setIsAnimating] = useState(false);

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


  const renderHeadlineContent = () => {
    if (headlineContents.length === 0) {
      return (
        <div className="flex items-center justify-center h-[calc(100vh-8rem)] ">
          <div className="text-center dark:text-gray-200 ">
            <div className="text-4xl mb-4 flex items-center justify-center">
              <FaNewspaper className="mr-2" />
              <FaArrowLeft className="mx-2" />
              <FaCalendarAlt className="ml-2" />
            </div>
            <p className="text-xl text-gray-500 mb-4 capitalize dark:text-gray-200">
              News Only available on the Just In tab.
            </p>
            <p className="text-lg text-gray-400 capitalize dark:text-gray-200">
              Check back later!
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className='h-screen overflow-y-scroll snap-y snap-mandatory'>
        {headlineContents.map((content) => (
          <div key={content._id} className='h-screen snap-start'>
            <div className="relative border-blue-400 rounded-lg px-4 py-2 break-words">
              <SubscribeFeed channel={channel} />
              <ContentFeed 
                content={content} 
                onView={() => handleJustInView(content._id)} 
                isViewed={viewedIds.includes(content._id)} 
              />
              <EngagementFeed content={content} channel={channel}/>
              
              <div className="absolute bottom-24 left-0 flex items-center space-x-2">
                <CountdownTimer expirationTime={content.headlineExpiresAt} />
                <span className="text-xs text-red-800">
                  Uploaded: {new Date(content.uploadedAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };


  const renderJustInContent = () => {
    if (currentJustInContent.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] bg-white dark:text-gray-200 dark:bg-gray-900">
          <div className="text-4xl mb-4 flex items-center">
            <FaNewspaper className="mr-2" />
            <FaArrowLeft className="mx-2" />
            <FaCalendarAlt className="ml-2" />
          </div>
          <p className="text-center text-md mb-4 capitalize dark:text-gray-200">
            No breaking news right now.
            <br/>
            Recent updates moved to Headline News
          </p>
          <p className="text-center text-md capitalize dark:text-gray-200">
            Visit <b>Missed Just In</b> to catch up
          </p>
        </div>
      );
    }

    return (
      <div className="relative ">{/*h-[calc(100vh-8rem)] */}
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
        <div className='h-screen overflow-y-scroll snap-y snap-mandatory '>
          {headlineContents.length > 0 ? (
            headlineContents.map((content) => (
              <div key={content._id} className='h-screen snap-start'>
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


  const handleTabChange = useCallback((newTab) => {
    if (isAnimating) return; // Prevent tab change during animation
    setIsAnimating(true);
    setSelectedTab(newTab);
    // Reset animation state after transition completes
    setTimeout(() => setIsAnimating(false), 300); // Match this with CSS transition duration
  }, [isAnimating]);

  const { handlers } = useSwipeNavigation({
    onSwipeLeft: () => {
      if (selectedTab === 0) {
        handleTabChange(1);
      }
    },
    onSwipeRight: () => {
      if (selectedTab === 1) {
        handleTabChange(0);
      }
    },
    minSwipeDistance: 50
  });


  
  return (
    <div ref={slideRef} className="h-screen flex justify-center overflow-hidden">
      <div className="w-full max-w-md tablet:max-w-2xl desktop:max-w-4xl">
        {/* Tab buttons */}
        <div className="bg-red-600 p-1 rounded-lg flex justify-between items-center gap-x-2 font-semibold text-white mb-2">
          {['Headline News', 'Just In'].map((title, index) => (
            <button
              key={index}
              onClick={() => handleTabChange(index)}
              className={`outline-none w-full p-1 rounded-lg text-center 
                transition-all duration-300 ease-in-out relative
                ${selectedTab === index ? 'bg-white text-neutral-800' : ''}`}
            >
              {title}
              {index === 1 && unviewedCount > 0 && (
                <span className="absolute top-0 right-0 bg-yellow-500 text-white rounded-full px-2 py-1 text-xs">
                  <FaBell className="mr-1" />
                  {unviewedCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content wrapper */}
        <div 
          {...handlers} 
          className="relative flex-grow touch-pan-x"
          style={{ touchAction: 'pan-x pan-y' }}
        >
          {/* Headline News Tab */}
          <div 
            className={`absolute w-full transition-transform duration-300 ease-in-out
              ${selectedTab === 0 ? 'translate-x-0' : '-translate-x-full'}`}
            style={{ 
              visibility: selectedTab === 0 || isAnimating ? 'visible' : 'hidden',
              height: 'calc(100vh - 8rem)'
            }}
          >
            {renderHeadlineContent()}
          </div>

          {/* Just In Tab */}
          <div 
            className={`absolute w-full transition-transform duration-300 ease-in-out
              ${selectedTab === 1 ? 'translate-x-0' : 'translate-x-full'}`}
            style={{ 
              visibility: selectedTab === 1 || isAnimating ? 'visible' : 'hidden',
              height: 'calc(100vh - 8rem)'
            }}
          >
            {renderJustInContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Slide;

