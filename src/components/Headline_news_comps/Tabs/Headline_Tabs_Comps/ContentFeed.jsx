// import Image from "next/image";
// import { useEffect, useRef } from 'react';

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

//   return (
//     <div ref={contentRef} id={`content-${content._id}`} className="w-full flex flex-col mt-1 ">
//     {content.picture ? (
//       <>
//         <div className="xs:pb-5 sm:pb-5 md:pb-5 text-sm sm:text-[17px] sm:mt-2 xs:leading-5 leading-6 tablet:text-base desktop:text-lg dark:text-white text-gray-700 capitalize rounded-md mb-2 desktop:mb-4 flex-grow overflow-y-auto">
//           {content.message}
//         </div>
//         <div className="relative border-red-500 h-60 tablet:h-72 desktop:h-80 flex-shrink-0">
//           <Image src={content.picture} fill alt="Content image" className="rounded-md object-cover" />
//         </div>
//         {content.tags && content.tags.length > 0 && (
//           <div className="mt-2 text-right">
//             {renderTags(content.tags)}
//           </div>
//         )}
//       </>
//     ) : (
//       <>
//        <div className="h-96 tablet:h-108 desktop:h-120 text-gray-700  w-full flex flex-col items-center justify-center capitalize dark:text-gray-200">
//   <p className="text-sm  text-center sm:text-[17px] xs:leading-5 leading-6 tablet:text-base desktop:text-lg">
//     {content.message}
//   </p>
//   {content.tags && content.tags.length > 0 && (
//     <div className="mt-4">
//       {renderTags(content.tags)}
//     </div>
//   )}
// </div>

//       </>
//     )}
//   </div>
// );
// };

// export default ContentFeed;


import Image from "next/image";
import { useEffect, useRef } from 'react';

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
            {content.message}
          </div>
          <div className="relative border-red-500 h-60 tablet:h-72 desktop:h-80 flex-shrink-0">
            <Image 
              src={content.picture} 
              fill 
              alt="Content image" 
              className="rounded-md object-cover"
              onError={(e) => {
                // Use a fallback image if the original fails to load
                e.target.src = '/default-news-image.png';
              }}
            />
          </div>
          {content.tags && content.tags.length > 0 && (
            <div className="mt-2 text-right">
              {renderTags(content.tags)}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="h-96 tablet:h-108 desktop:h-120 text-gray-700 w-full flex flex-col items-center justify-center capitalize dark:text-gray-200">
            <p className="text-sm text-center sm:text-[17px] xs:leading-5 leading-6 tablet:text-base desktop:text-lg">
              {content.message}
            </p>
            {content.tags && content.tags.length > 0 && (
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