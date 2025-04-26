'use client'
import { useState, useEffect, useRef } from 'react';
import BeThumbVideo from './BeThumbVideo';
import BeThumbArticle from './BeThumbArticle';
import InfiniteScroll from 'react-infinite-scroll-component';
import ThumbnailSkeletonLoader from '../beyond-header/ThumbnailSkeletonLoader';
import { useScrollPosition } from './useScrollPosition';

// Function to safely interact with localStorage
const getFromStorage = (key, defaultValue) => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  } catch (e) {
    // console.error('Error getting from localStorage:', e);
    return defaultValue;
  }
};

const setToStorage = (key, value) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // console.error('Error setting to localStorage:', e);
  }
};

// Initialize content from localStorage if available
const initialContentCache = getFromStorage('contentCache', []);
const initialPageCache = getFromStorage('pageCache', 1);
const initialHasMoreCache = getFromStorage('hasMoreCache', true);

const BeyondContent = () => {
  const [combinedContent, setCombinedContent] = useState(initialContentCache);
  const [isLoading, setIsLoading] = useState(initialContentCache.length === 0);
  const [hasMore, setHasMore] = useState(initialHasMoreCache);
  const [page, setPage] = useState(initialPageCache);
  const didMount = useRef(false);
  const { setLastClickedItem, scrollContainerRef, recordNavigation } = useScrollPosition();
  const ITEMS_PER_PAGE = 10;
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  
  // Check if we should reset the content based on cache time
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Record that we're on this page
    recordNavigation();
    
    const cacheTimestamp = localStorage.getItem('contentCacheTimestamp');
    const now = Date.now();
    
    // Reset content if cache is over 1 hour old or no timestamp exists
    if (!cacheTimestamp || (now - parseInt(cacheTimestamp, 10)) > 60 * 60 * 1000) {
      // console.log('Cache expired or missing timestamp, resetting content');
      setCombinedContent([]);
      setPage(1);
      setHasMore(true);
      setIsLoading(true);
      localStorage.removeItem('contentCache');
      localStorage.removeItem('pageCache');
      localStorage.removeItem('hasMoreCache');
      localStorage.removeItem('contentCacheTimestamp');
    } else {
      // console.log('Using cached content, cache age:', (now - parseInt(cacheTimestamp, 10)) / 1000, 'seconds');
    }
  }, [recordNavigation]);
  
  // Handle clicks on content items
  const handleItemClick = (itemId) => {
    // console.log(`Thumbnail clicked: ${itemId}`);
    setLastClickedItem(itemId);
  };
  
  // Record navigation event on click
  const handleContentClick = () => {
    recordNavigation();
  };
  
  // Fetch content from API
  const fetchContent = async () => {
    try {
      // console.log(`Fetching content for page ${page}...`);
      const [videosResponse, articlesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/BeyondVideo?page=${page}&limit=${ITEMS_PER_PAGE}`),
        fetch(`${API_BASE_URL}/api/BeyondArticle?page=${page}&limit=${ITEMS_PER_PAGE}`)
      ]);
      
      if (videosResponse.ok && articlesResponse.ok) {
        const videos = await videosResponse.json();
        const articles = await articlesResponse.json();
        
        // Create a new array with both videos and articles
        const newContent = [
          ...videos.map(v => ({ ...v, type: 'video', uniqueId: `video-${v._id}` })),
          ...articles.map(a => ({ ...a, type: 'article', uniqueId: `article-${a._id}` }))
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // If it's the first page, set the content directly
        if (page === 1) {
          setCombinedContent(newContent);
          setToStorage('contentCache', newContent);
          // Set cache timestamp
          localStorage.setItem('contentCacheTimestamp', Date.now().toString());
        } else {
          // For subsequent pages, check for duplicates before adding
          setCombinedContent(prevContent => {
            const existingIds = new Set(prevContent.map(item => item.uniqueId));
            const uniqueNewContent = newContent.filter(item => !existingIds.has(item.uniqueId));
            const updatedContent = [...prevContent, ...uniqueNewContent];
            setToStorage('contentCache', updatedContent);
            // Update cache timestamp
            localStorage.setItem('contentCacheTimestamp', Date.now().toString());
            return updatedContent;
          });
        }
        
        // Update hasMore based on whether we received the full number of items
        const totalNewItems = videos.length + articles.length;
        const nextHasMore = totalNewItems >= ITEMS_PER_PAGE * 2;
        setHasMore(nextHasMore);
        setToStorage('hasMoreCache', nextHasMore);
        
        const nextPage = page + 1;
        setPage(nextPage);
        setToStorage('pageCache', nextPage);

        // console.log(`Fetched ${totalNewItems} items, updating page to ${nextPage}`);
      }
    } catch (error) {
      // console.error('Error fetching content:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initialize content on component mount
  useEffect(() => {
    // console.log('BeyondContent mounted');
    
    const initializeContent = async () => {
      // Check for cached content
      if (initialContentCache.length > 0) {
        // console.log(`Using cached content (${initialContentCache.length} items)`);
        setCombinedContent(initialContentCache);
        setIsLoading(false);
      } else {
        // console.log('No cached content, fetching fresh data');
        setIsLoading(true);
        await fetchContent();
      }
    };
    
    initializeContent();
    didMount.current = true;
    
    return () => {
      if (didMount.current) {
        // console.log('BeyondContent unmounting, state preserved');
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-4">
        {[...Array(6)].map((_, index) => (
          <ThumbnailSkeletonLoader key={index} type={index % 2 === 0 ? 'video' : 'article'} />
        ))}
      </div>
    );
  }

  return (
    <div onClick={handleContentClick}>
      <InfiniteScroll
        dataLength={combinedContent.length}
        next={fetchContent}
        hasMore={hasMore}
        loader={<h4>Loading...</h4>}
        scrollableTarget="beyondNewsContent"
      >
        <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-4">
          {combinedContent.map(content => (
            <div 
              key={content.uniqueId} 
              id={content.uniqueId} 
              className="w-full"
              data-content-id={content._id}
              data-content-type={content.type}
              onClick={() => handleItemClick(content.uniqueId)}
            >
              {content.type === 'video'
                ? <BeThumbVideo video={content} />
                : <BeThumbArticle article={content} />
              }
            </div>
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
};

export default BeyondContent;