'use client'
import { useState, useEffect, useRef } from 'react';
import BeThumbVideo from './BeThumbVideo';
import BeThumbArticle from './BeThumbArticle';
import InfiniteScroll from 'react-infinite-scroll-component';
import ThumbnailSkeletonLoader from '../beyond-header/ThumbnailSkeletonLoader';
import { useScrollPosition } from './useScrollPosition';
import { usePathname } from 'next/navigation';

// Function to safely interact with localStorage
const getFromStorage = (key, defaultValue) => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

const setToStorage = (key, value) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // Handle error silently
  }
};

const BeyondContent = () => {
  const [combinedContent, setCombinedContent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const didMount = useRef(false);
  const contentLoaded = useRef(false);
  const { setLastClickedItem, scrollContainerRef, recordNavigation } = useScrollPosition();
  const pathname = usePathname();
  const ITEMS_PER_PAGE = 10;
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  
  // Fetch content from API
  const fetchContent = async (pageNum = page) => {
    try {
      setIsLoading(true);
      
      const [videosResponse, articlesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/BeyondVideo?page=${pageNum}&limit=${ITEMS_PER_PAGE}`),
        fetch(`${API_BASE_URL}/api/BeyondArticle?page=${pageNum}&limit=${ITEMS_PER_PAGE}`)
      ]);
      
      if (videosResponse.ok && articlesResponse.ok) {
        const videos = await videosResponse.json();
        const articles = await articlesResponse.json();
        
        const newContent = [
          ...videos.map(v => ({ ...v, type: 'video', uniqueId: `video-${v._id}` })),
          ...articles.map(a => ({ ...a, type: 'article', uniqueId: `article-${a._id}` }))
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        if (pageNum === 1) {
          setCombinedContent(newContent);
          setToStorage('contentCache', newContent);
          localStorage.setItem('contentCacheTimestamp', Date.now().toString());
          
          // Mark content as loaded after a brief delay to ensure DOM updates
          setTimeout(() => {
            contentLoaded.current = true;
            console.log(`Initial content loaded: ${newContent.length} items`);
          }, 100);
        } else {
          setCombinedContent(prevContent => {
            const existingIds = new Set(prevContent.map(item => item.uniqueId));
            const uniqueNewContent = newContent.filter(item => !existingIds.has(item.uniqueId));
            const updatedContent = [...prevContent, ...uniqueNewContent];
            setToStorage('contentCache', updatedContent);
            localStorage.setItem('contentCacheTimestamp', Date.now().toString());
            return updatedContent;
          });
        }
        
        const totalNewItems = videos.length + articles.length;
        const nextHasMore = totalNewItems >= ITEMS_PER_PAGE * 2;
        setHasMore(nextHasMore);
        setToStorage('hasMoreCache', nextHasMore);
        
        const nextPage = pageNum + 1;
        setPage(nextPage);
        setToStorage('pageCache', nextPage);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initialize content on component mount
  useEffect(() => {
    recordNavigation();
    
    // Reset content loaded flag
    contentLoaded.current = false;
    setPage(1);
    
    // Fetch content with a slight delay to avoid race conditions
    const fetchTimer = setTimeout(() => {
      fetchContent(1);
    }, 100);
    
    didMount.current = true;
    
    return () => {
      clearTimeout(fetchTimer);
      if (didMount.current) {
        // Cleanup if needed
      }
    };
  }, [pathname]);

  // Handle clicks on content items
  const handleItemClick = (itemId) => {
    console.log(`Thumbnail clicked: ${itemId}`);
    setLastClickedItem(itemId);
  };
  
  // Record navigation event on click
  const handleContentClick = () => {
    recordNavigation();
  };

  // Custom infinite scroll handler with less aggressive loading
  const loadMoreContent = () => {
    if (!isLoading && hasMore && contentLoaded.current) {
      fetchContent();
    }
  };

  return (
    <div onClick={handleContentClick}>
      <InfiniteScroll
        dataLength={combinedContent.length}
        next={loadMoreContent}
        hasMore={hasMore && !isLoading}
        loader={
          <div className="flex justify-center py-4">
            <div className="text-gray-500">Loading more content...</div>
          </div>
        }
        scrollableTarget="beyondNewsContent"
        scrollThreshold={0.8} // Load more when 80% scrolled
      >
        <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-4">
          {isLoading && combinedContent.length === 0 ? (
            [...Array(6)].map((_, index) => (
              <ThumbnailSkeletonLoader key={index} type={index % 2 === 0 ? 'video' : 'article'} />
            ))
          ) : (
            combinedContent.map(content => (
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
            ))
          )}
        </div>
      </InfiniteScroll>
    </div>
  );
};

export default BeyondContent;