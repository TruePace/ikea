'use client'
import { useState, useEffect } from 'react';
import BeThumbVideo from './BeThumbVideo';
import BeThumbArticle from './BeThumbArticle';
import InfiniteScroll from 'react-infinite-scroll-component';
import ThumbnailSkeletonLoader from '../beyond-header/ThumbnailSkeletonLoader';
import { useScrollToItem } from './useScrollToItem';

// Function to safely interact with localStorage
const getFromStorage = (key, defaultValue) => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  } catch (e) {
    console.error('Error getting from localStorage:', e);
    return defaultValue;
  }
};

const setToStorage = (key, value) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Error setting to localStorage:', e);
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
  const ITEMS_PER_PAGE = 10;
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  
  const fetchContent = async () => {
    try {
      console.log(`Fetching content for page ${page}...`);
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
        } else {
          // For subsequent pages, check for duplicates before adding
          setCombinedContent(prevContent => {
            const existingIds = new Set(prevContent.map(item => item.uniqueId));
            const uniqueNewContent = newContent.filter(item => !existingIds.has(item.uniqueId));
            const updatedContent = [...prevContent, ...uniqueNewContent];
            setToStorage('contentCache', updatedContent);
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

        console.log(`Fetched ${totalNewItems} items, updating page to ${nextPage}`);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    const initializeContent = async () => {
      console.log('BeyondContent mounted, initializing content...');
      console.log('Initial cache state:', { 
        contentLength: initialContentCache.length, 
        page: initialPageCache,
        hasMore: initialHasMoreCache
      });
      
      // If we have cached content, use it but still fetch in the background
      if (initialContentCache.length > 0) {
        console.log('Using cached content while fetching fresh data');
        setCombinedContent(initialContentCache);
        setIsLoading(false);
        
        // Optional: Refresh data in background after a delay
        // setTimeout(fetchContent, 2000);
      } else {
        // No cached content, show loading state and fetch
        console.log('No cached content, fetching fresh data');
        setIsLoading(true);
        await fetchContent();
      }
    };
    
    initializeContent();
    
    // Cleanup function
    return () => {
      console.log('BeyondContent unmounting, preserving state');
      // We don't need to do anything here as state is already being saved to localStorage
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
    <InfiniteScroll
      dataLength={combinedContent.length}
      next={fetchContent}
      hasMore={hasMore}
      loader={<h4>Loading...</h4>}
      // Add a unique key to force remount when needed
      key="beyond-content-infinite-scroll"
    >
      <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-4">
        {combinedContent.map(content => (
          <div 
            key={content.uniqueId} 
            id={content.uniqueId} 
            className="w-full"
            data-content-id={content._id}
            data-content-type={content.type}
          >
            {content.type === 'video'
              ? <BeThumbVideo video={content} />
              : <BeThumbArticle article={content} />
            }
          </div>
        ))}
      </div>
    </InfiniteScroll>
  );
};

export default BeyondContent;