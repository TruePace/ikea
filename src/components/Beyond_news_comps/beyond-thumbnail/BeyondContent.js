'use client'
import { useState, useEffect } from 'react';
import BeThumbVideo from './BeThumbVideo';
import BeThumbArticle from './BeThumbArticle';
import InfiniteScroll from 'react-infinite-scroll-component';
import ThumbnailSkeletonLoader from '../beyond-header/ThumbnailSkeletonLoader';
import { useScrollToItem } from './useScrollToItem';


// Create a cache to store content between navigations
let contentCache = [];
let pageCache = 1;
let hasMoreCache = true;

const BeyondContent = () => {
  const [combinedContent, setCombinedContent] = useState(contentCache);
  const [isLoading, setIsLoading] = useState(contentCache.length === 0);
  const [hasMore, setHasMore] = useState(hasMoreCache);
  const [page, setPage] = useState(pageCache);
  const ITEMS_PER_PAGE = 10;
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  
  const fetchContent = async () => {
    try {
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
          contentCache = newContent;
        } else {
          // For subsequent pages, check for duplicates before adding
          setCombinedContent(prevContent => {
            const existingIds = new Set(prevContent.map(item => item.uniqueId));
            const uniqueNewContent = newContent.filter(item => !existingIds.has(item.uniqueId));
            const updatedContent = [...prevContent, ...uniqueNewContent];
            contentCache = updatedContent;
            return updatedContent;
          });
        }
        
        // Update hasMore based on whether we received the full number of items
        const totalNewItems = videos.length + articles.length;
        setHasMore(totalNewItems >= ITEMS_PER_PAGE * 2);
        hasMoreCache = totalNewItems >= ITEMS_PER_PAGE * 2;
        
        const nextPage = page + 1;
        setPage(nextPage);
        pageCache = nextPage;
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    // Only fetch if cache is empty
    if (contentCache.length === 0) {
      fetchContent();
    }
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
  >
    <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-4">
      {combinedContent.map(content => (
        <div 
          key={content.uniqueId} 
          id={content.uniqueId} // Add ID to each item container
          className="w-full"
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