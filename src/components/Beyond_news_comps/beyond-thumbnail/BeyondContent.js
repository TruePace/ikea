'use client'
import { useState, useEffect } from 'react';
import BeThumbVideo from './BeThumbVideo';
import BeThumbArticle from './BeThumbArticle';
import { useSelector } from 'react-redux';
import ThumbnailSkeletonLoader from '../beyond-header/ThumbnailSkeletonLoader';

const BeyondContent = () => {
  const [combinedContent, setCombinedContent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const fetchAllContent = async () => {
      setIsLoading(true);
      try {
        const [videosResponse, articlesResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/BeyondVideo`),
          fetch(`${API_BASE_URL}/api/BeyondArticle`)
        ]);

        if (videosResponse.ok && articlesResponse.ok) {
          const videos = await videosResponse.json();
          const articles = await articlesResponse.json();

          // Combine and sort content
          const combined = [
            ...videos.map(v => ({ ...v, type: 'video' })),
            ...articles.map(a => ({ ...a, type: 'article' }))
          ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

          setCombinedContent(combined);
        }
      } catch (error) {
        console.error('Error fetching content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllContent();
  }, []);

  if (isLoading) {
    return <>
<ThumbnailSkeletonLoader type='video' />
<ThumbnailSkeletonLoader type="article" />
    </>;
  }

  return (
    <div>
      {combinedContent.map(content => {
        if (content.type === 'video') {
          return <BeThumbVideo key={content._id} video={content} />;
        } else {
          return <BeThumbArticle key={content._id} article={content} />;
        }
      })}
    </div>
  );
};

export default BeyondContent;