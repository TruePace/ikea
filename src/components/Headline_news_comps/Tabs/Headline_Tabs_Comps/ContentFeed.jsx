import Image from "next/image";
import { useEffect, useRef } from 'react';
import { FaExternalLinkAlt, FaGlobe } from 'react-icons/fa';

const ContentFeed = ({ content, onView, isViewed }) => {
  const contentRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isViewed && typeof onView === 'function') {
          onView();
        }
      },
      { threshold: 0.5 }
    );

    if (contentRef.current) {
      observer.observe(contentRef.current);
    }

    return () => {
      if (contentRef.current) {
        observer.unobserve(contentRef.current);
      }
    };
  }, [onView, isViewed]);

  const renderTags = (tags) => {
    return tags.map((tag, index) => (
      <span
        key={index}
        className="inline-block bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full mr-2 mb-2"
      >
        #{tag}
      </span>
    ));
  };

  // If this is external content, add a small label
  const isExternalContent = content.source === 'external';

  // Handle external link click
  const handleExternalLinkClick = (url) => {
    if (!url) return;
    
    // Analytics tracking (optional)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'external_link_click', {
        event_category: 'engagement',
        event_label: content.originalSource || 'external_news',
        value: 1
      });
    }

    // Open in new tab/window
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Get domain from URL for display
  const getDisplayDomain = (url) => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return content.originalSource || 'External Source';
    }
  };

  // Render truncated message with inline link for external content
  const renderMessage = (message) => {
    if (!isExternalContent) {
      return <span>{message}</span>;
    }

    const shouldTruncate = message && message.length > 180;
    const truncatedMessage = shouldTruncate ? message.substring(0, 180) : message;

    if (!content.originalUrl) {
      return <span>{truncatedMessage}{shouldTruncate ? '...' : ''}</span>;
    }

    return (
      <span>
        <span 
          className="cursor-pointer hover:text-blue-600 transition-colors"
          onClick={() => handleExternalLinkClick(content.originalUrl)}
          title="Click to read full article"
        >
          {truncatedMessage}
        </span>
        {shouldTruncate && (
          <>
            <span>... </span>
            <button
              onClick={() => handleExternalLinkClick(content.originalUrl)}
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
            >
              {/* <FaExternalLinkAlt className="mr-1 text-xs" /> */}
              Read More
            </button>
          </>
        )}
      </span>
    );
  };

  return (
    <div
      ref={contentRef}
      id={`content-${content._id}`}
      className="w-full flex flex-col mt-1"
    >
      {/* External Content Header */}
      {isExternalContent && (
        <div className="mb-2 flex items-center justify-between">
          <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-xs font-medium text-gray-600 border border-gray-200">
            <FaGlobe className="mr-1 text-xs" />
            From {content.originalSource}
          </span>
          
          {/* Source domain display */}
          {content.originalUrl && (
            <span className="text-xs text-gray-500 truncate max-w-32">
              {getDisplayDomain(content.originalUrl)}
            </span>
          )}
        </div>
      )}

      {content.picture ? (
        <>
          {/* Content with image */}
          <div className="xs:pb-5 sm:pb-5 md:pb-5 text-sm sm:text-[17px] sm:mt-2 xs:leading-5 leading-6 tablet:text-base desktop:text-lg dark:text-white text-gray-700 capitalize rounded-md mb-2 desktop:mb-4 flex-grow overflow-y-auto">
            {renderMessage(content.message)}
          </div>
          
          <div className="relative border-red-500 h-60 tablet:h-72 desktop:h-80 flex-shrink-0">
            <img
              src={content.picture || '/NopicAvatar.png'}
              alt="News image"
              className="rounded-md object-cover w-full h-full"
              onError={(e) => {
                e.target.src = '/NopicAvatar.png';
              }}
            />
          </div>

          {/* Tags for non-external content */}
          {!isExternalContent && content.tags && content.tags.length > 0 && (
            <div className="mt-2 text-right">
              {renderTags(content.tags)}
            </div>
          )}

          
        </>
      ) : (
        <>
          {/* Content without image */}
          <div className="h-96 tablet:h-108 desktop:h-120 text-gray-700 w-full flex flex-col items-center justify-center capitalize dark:text-gray-200 relative px-4">
            <p className="text-sm text-center sm:text-[17px] xs:leading-5 leading-6 tablet:text-base desktop:text-lg mb-4">
              {renderMessage(content.message)}
            </p>

            {/* External link button for text-only content - more prominent */}
            {isExternalContent && content.originalUrl && (
              <button
                onClick={() => handleExternalLinkClick(content.originalUrl)}
                className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-lg mb-4"
              >
                <FaExternalLinkAlt className="mr-2" />
                Read Full Article on {getDisplayDomain(content.originalUrl)}
              </button>
            )}

            {/* Tags for non-external content */}
            {!isExternalContent && content.tags && content.tags.length > 0 && (
              <div className="mt-4">
                {renderTags(content.tags)}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ContentFeed;