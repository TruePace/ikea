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
    return <ThumbnailSkeletonLoader />;
  }

  return (
    <InfiniteScroll
      dataLength={combinedContent.length}
      next={fetchContent}
      hasMore={hasMore}
      loader={<ThumbnailSkeletonLoader />}
    >
      {combinedContent.map(content => (
        content.type === 'video' 
          ? <BeThumbVideo key={content._id} video={content} />
          : <BeThumbArticle key={content._id} article={content} />
      ))}
    </InfiniteScroll>
  );
};

export default BeyondContent;