'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaArrowLeft, FaExternalLinkAlt, FaClock, FaNewspaper, FaShare, FaBookmark } from 'react-icons/fa';
import { BiGlobe } from 'react-icons/bi';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const ExternalNewsDetail = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const contentId = searchParams.get('id');
  
  const [newsContent, setNewsContent] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (contentId) {
      fetchNewsDetail();
    }
  }, [contentId]);

  const fetchNewsDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch the specific content with view tracking
      const contentResponse = await fetch(`${API_BASE_URL}/api/HeadlineNews/Content/${contentId}?trackView=true`);
      if (!contentResponse.ok) {
        throw new Error('Content not found');
      }
      const contentData = await contentResponse.json();
      
      // Only proceed if this is external content
      if (contentData.source !== 'external') {
        throw new Error('This content is not from an external source');
      }
      
      setNewsContent(contentData);

      // Fetch the channel information
      if (contentData.channelId) {
        const channelResponse = await fetch(`${API_BASE_URL}/api/HeadlineNews/Channel/${contentData.channelId}`);
        if (channelResponse.ok) {
          const channelData = await channelResponse.json();
          setChannel(channelData);
        }
      }

      // Check if bookmarked (from localStorage for now)
      const bookmarks = JSON.parse(localStorage.getItem('bookmarkedNews') || '[]');
      setIsBookmarked(bookmarks.includes(contentId));

    } catch (error) {
      console.error('Error fetching news detail:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleExternalLink = () => {
    if (newsContent?.originalUrl) {
      window.open(newsContent.originalUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: newsContent.message.split('\n')[0],
          text: newsContent.message,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
        fallbackShare();
      }
    } else {
      fallbackShare();
    }
  };

  const fallbackShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const toggleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarkedNews') || '[]');
    
    if (isBookmarked) {
      const updatedBookmarks = bookmarks.filter(id => id !== contentId);
      localStorage.setItem('bookmarkedNews', JSON.stringify(updatedBookmarks));
      setIsBookmarked(false);
    } else {
      bookmarks.push(contentId);
      localStorage.setItem('bookmarkedNews', JSON.stringify(bookmarks));
      setIsBookmarked(true);
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  const handleImageError = (e) => {
    e.target.src = '/NopicAvatar.png';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-64 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !newsContent) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center p-8">
          <FaNewspaper className="text-6xl text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            {error || 'Content Not Found'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The news article you're looking for is not available or may have expired.
          </p>
          <button
            onClick={handleBack}
            className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const title = newsContent.message.split('\n')[0];
  const content = newsContent.message.split('\n').slice(2).join('\n');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              <FaArrowLeft className="mr-2" />
              Back
            </button>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleBookmark}
                className={`p-2 rounded-full transition-colors ${
                  isBookmarked 
                    ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' 
                    : 'text-gray-500 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                }`}
              >
                <FaBookmark />
              </button>
              
              <button
                onClick={handleShare}
                className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
              >
                <FaShare />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Source Badge */}
        <div className="mb-6">
          <div className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-medium rounded-full border border-blue-200 dark:border-blue-800">
            <BiGlobe className="mr-2" />
            External Source: {newsContent.originalSource}
          </div>
        </div>

        {/* Article Header */}
        <article className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Featured Image */}
          {newsContent.picture && (
            <div className="relative h-64 md:h-80 lg:h-96">
              <img
                src={newsContent.picture}
                alt={title}
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
            </div>
          )}

          <div className="p-6 md:p-8">
            {/* Channel Info */}
            {channel && (
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mr-3">
                  <img
                    src={channel.picture || '/NopicAvatar.png'}
                    alt={channel.name}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {channel.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    External News Source
                  </p>
                </div>
              </div>
            )}

            {/* Title */}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">
              {title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 mb-6 space-x-4">
              <div className="flex items-center">
                <FaClock className="mr-1" />
                <span>Published {formatTimeAgo(newsContent.uploadedAt)}</span>
              </div>
              
              <div className="flex items-center">
                <span className="w-1 h-1 bg-gray-400 rounded-full mx-2"></span>
                <span>Available for {newsContent.source === 'external' ? '48 hours' : '24 hours'}</span>
              </div>
            </div>

            {/* Content */}
            <div className="prose prose-lg dark:prose-invert max-w-none">
              {content ? (
                <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {content}
                </div>
              ) : (
                <div className="text-gray-600 dark:text-gray-400 italic">
                  This article contains only a headline. Click "Read Full Article" below to view the complete story on the original source.
                </div>
              )}
            </div>

            {/* External Link Button */}
            {newsContent.originalUrl && (
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleExternalLink}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  <FaExternalLinkAlt className="mr-2" />
                  Read Full Article on {newsContent.originalSource}
                </button>
                
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  This will open the original article in a new tab
                </p>
              </div>
            )}

            {/* Tags */}
            {newsContent.tags && newsContent.tags.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap gap-2">
                  {newsContent.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm px-3 py-1 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>

        {/* Expiration Notice */}
        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-start">
            <FaClock className="text-yellow-600 dark:text-yellow-400 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                Limited Time Availability
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                This external news content will be automatically removed after 48 hours from its original publication date to respect copyright and source policies.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExternalNewsDetail;