import Image from "next/image";
import { useEffect, useRef } from 'react';
// ADD THESE NEW IMPORTS
import { useRouter } from 'next/navigation';
import { FaExternalLinkAlt } from 'react-icons/fa';

const ContentFeed = ({ content, onView, isViewed }) => {
  const contentRef = useRef(null);
  // ADD THIS NEW HOOK
  const router = useRouter();
  
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
  
  // Truncate external content to 180 characters
  const getDisplayMessage = (message) => {
    if (isExternalContent && message && message.length > 180) {
      return message.substring(0, 180) + '...';
    }
    return message;
  };

  // ADD THESE NEW FUNCTIONS
  const handleExternalContentClick = () => {
    if (isExternalContent) {
      router.push(`/external-news-detail?id=${content._id}`);
    }
  };

  const handleReadMoreClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isExternalContent) {
      router.push(`/external-news-detail?id=${content._id}`);
    }
  };
  
  return (
    <div ref={contentRef} id={`content-${content._id}`} className="w-full flex flex-col mt-1">
      {isExternalContent && (
        <div className="mb-2">
          <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-xs font-medium text-gray-600 border border-gray-200">
            From {content.originalSource}
          </span>
        </div>
      )}
      
      {content.picture ? (
        <>
          <div className="xs:pb-5 sm:pb-5 md:pb-5 text-sm sm:text-[17px] sm:mt-2 xs:leading-5 leading-6 tablet:text-base desktop:text-lg dark:text-white text-gray-700 capitalize rounded-md mb-2 desktop:mb-4 flex-grow overflow-y-auto">
            {getDisplayMessage(content.message)}
            
            {/* ADD THIS: Read More button for external content */}
            {isExternalContent && content.message && content.message.length > 180 && (
              <button
                onClick={handleReadMoreClick}
                className="inline-flex items-center ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition-colors"
              >
                <FaExternalLinkAlt className="mr-1 text-xs" />
                Read More
              </button>
            )}
          </div>
          
          {/* MODIFY THIS: Make image clickable for external content */}
          <div 
            className={`relative border-red-500 h-60 tablet:h-72 desktop:h-80 flex-shrink-0 ${
              isExternalContent ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''
            }`}
            onClick={isExternalContent ? handleExternalContentClick : undefined}
          >
            <img
              src={content.picture || '/NopicAvatar.png'}
              alt="News image"
              className="rounded-md object-cover w-full h-full"
              onError={(e) => {
                e.target.src = '/NopicAvatar.png';
              }}
            />
            
            {/* ADD THIS: Overlay for external content */}
            {isExternalContent && (
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 rounded-md flex items-center justify-center">
                <div className="opacity-0 hover:opacity-100 transition-opacity duration-200 bg-white dark:bg-gray-800 px-3 py-2 rounded-full shadow-lg">
                  <FaExternalLinkAlt className="text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            )}
          </div>
          
          {/* Only show tags for non-external content */}
          {!isExternalContent && content.tags && content.tags.length > 0 && (
            <div className="mt-2 text-right">
              {renderTags(content.tags)}
            </div>
          )}
        </>
      ) : (
        <>
          {/* MODIFY THIS: For content without images, make the whole section clickable */}
          <div 
            className={`h-96 tablet:h-108 desktop:h-120 text-gray-700 w-full flex flex-col items-center justify-center capitalize dark:text-gray-200 ${
              isExternalContent ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-md p-4' : ''
            }`}
            onClick={isExternalContent ? handleExternalContentClick : undefined}
          >
            <p className="text-sm text-center sm:text-[17px] xs:leading-5 leading-6 tablet:text-base desktop:text-lg">
              {getDisplayMessage(content.message)}
            </p>
            
            {/* ADD THIS: Read More button for external content without images */}
            {isExternalContent && content.message && content.message.length > 180 && (
              <button
                onClick={handleReadMoreClick}
                className="inline-flex items-center mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <FaExternalLinkAlt className="mr-2" />
                Read Full Story
              </button>
            )}
            
            {/* Only show tags for non-external content */}
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




// import Image from "next/image";
// import { useEffect, useRef } from 'react';
// import { FaExternalLinkAlt, FaGlobe } from 'react-icons/fa';

// const ContentFeed = ({ content, onView, isViewed }) => {
//   const contentRef = useRef(null);

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       ([entry]) => {
//         if (entry.isIntersecting && !isViewed && typeof onView === 'function') {
//           onView();
//         }
//       },
//       { threshold: 0.5 }
//     );

//     if (contentRef.current) {
//       observer.observe(contentRef.current);
//     }

//     return () => {
//       if (contentRef.current) {
//         observer.unobserve(contentRef.current);
//       }
//     };
//   }, [onView, isViewed]);

//   const renderTags = (tags) => {
//     return tags.map((tag, index) => (
//       <span
//         key={index}
//         className="inline-block bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full mr-2 mb-2"
//       >
//         #{tag}
//       </span>
//     ));
//   };

//   // If this is external content, add a small label
//   const isExternalContent = content.source === 'external';

//   // Handle external link click
//   const handleExternalLinkClick = (url) => {
//     if (!url) return;
    
//     // Analytics tracking (optional)
//     if (typeof window !== 'undefined' && window.gtag) {
//       window.gtag('event', 'external_link_click', {
//         event_category: 'engagement',
//         event_label: content.originalSource || 'external_news',
//         value: 1
//       });
//     }

//     // Open in new tab/window
//     window.open(url, '_blank', 'noopener,noreferrer');
//   };

//   // Get domain from URL for display
//   const getDisplayDomain = (url) => {
//     try {
//       const domain = new URL(url).hostname;
//       return domain.replace('www.', '');
//     } catch {
//       return content.originalSource || 'External Source';
//     }
//   };

//   // Render truncated message with inline link for external content
//   const renderMessage = (message) => {
//     if (!isExternalContent) {
//       return <span>{message}</span>;
//     }

//     const shouldTruncate = message && message.length > 180;
//     const truncatedMessage = shouldTruncate ? message.substring(0, 180) : message;

//     if (!content.originalUrl) {
//       return <span>{truncatedMessage}{shouldTruncate ? '...' : ''}</span>;
//     }

//     return (
//       <span>
//         <span 
//           className="cursor-pointer hover:text-blue-600 transition-colors"
//           onClick={() => handleExternalLinkClick(content.originalUrl)}
//           title="Click to read full article"
//         >
//           {truncatedMessage}
//         </span>
//         {shouldTruncate && (
//           <>
//             <span>... </span>
//             <button
//               onClick={() => handleExternalLinkClick(content.originalUrl)}
//               className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
//             >
//               {/* <FaExternalLinkAlt className="mr-1 text-xs" /> */}
//               Read More
//             </button>
//           </>
//         )}
//       </span>
//     );
//   };

//   return (
//     <div
//       ref={contentRef}
//       id={`content-${content._id}`}
//       className="w-full flex flex-col mt-1"
//     >
//       {/* External Content Header */}
//       {isExternalContent && (
//         <div className="mb-2 flex items-center justify-between">
//           <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-xs font-medium text-gray-600 border border-gray-200">
//             <FaGlobe className="mr-1 text-xs" />
//             From {content.originalSource}
//           </span>
          
//           {/* Source domain display */}
//           {content.originalUrl && (
//             <span className="text-xs text-gray-500 truncate max-w-32">
//               {getDisplayDomain(content.originalUrl)}
//             </span>
//           )}
//         </div>
//       )}

//       {content.picture ? (
//         <>
//           {/* Content with image */}
//           <div className="xs:pb-5 sm:pb-5 md:pb-5 text-sm sm:text-[17px] sm:mt-2 xs:leading-5 leading-6 tablet:text-base desktop:text-lg dark:text-white text-gray-700 capitalize rounded-md mb-2 desktop:mb-4 flex-grow overflow-y-auto">
//             {renderMessage(content.message)}
//           </div>
          
//           <div className="relative border-red-500 h-60 tablet:h-72 desktop:h-80 flex-shrink-0">
//             <img
//               src={content.picture || '/NopicAvatar.png'}
//               alt="News image"
//               className="rounded-md object-cover w-full h-full"
//               onError={(e) => {
//                 e.target.src = '/NopicAvatar.png';
//               }}
//             />
//           </div>

//           {/* Tags for non-external content */}
//           {!isExternalContent && content.tags && content.tags.length > 0 && (
//             <div className="mt-2 text-right">
//               {renderTags(content.tags)}
//             </div>
//           )}

          
//         </>
//       ) : (
//         <>
//           {/* Content without image */}
//           <div className="h-96 tablet:h-108 desktop:h-120 text-gray-700 w-full flex flex-col items-center justify-center capitalize dark:text-gray-200 relative px-4">
//             <p className="text-sm text-center sm:text-[17px] xs:leading-5 leading-6 tablet:text-base desktop:text-lg mb-4">
//               {renderMessage(content.message)}
//             </p>

//             {/* External link button for text-only content - more prominent */}
//             {isExternalContent && content.originalUrl && (
//               <button
//                 onClick={() => handleExternalLinkClick(content.originalUrl)}
//                 className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-lg mb-4"
//               >
//                 <FaExternalLinkAlt className="mr-2" />
//                 Read Full Article on {getDisplayDomain(content.originalUrl)}
//               </button>
//             )}

//             {/* Tags for non-external content */}
//             {!isExternalContent && content.tags && content.tags.length > 0 && (
//               <div className="mt-4">
//                 {renderTags(content.tags)}
//               </div>
//             )}
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default ContentFeed;