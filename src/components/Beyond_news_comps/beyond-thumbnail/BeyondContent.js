'use client'
import { useState, useEffect } from 'react';
import BeThumbVideo from './BeThumbVideo';
import BeThumbArticle from './BeThumbArticle';
import InfiniteScroll from 'react-infinite-scroll-component';
import ThumbnailSkeletonLoader from '../beyond-header/ThumbnailSkeletonLoader';

const BeyondContent = () => {
  const [combinedContent, setCombinedContent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
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

        const newContent = [
          ...videos.map(v => ({ ...v, type: 'video' })),
          ...articles.map(a => ({ ...a, type: 'article' }))
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setCombinedContent(prevContent => [...prevContent, ...newContent]);
        setHasMore(newContent.length === ITEMS_PER_PAGE * 2);
        setPage(prevPage => prevPage + 1);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
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
          <div key={content._id} className="w-full ">
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