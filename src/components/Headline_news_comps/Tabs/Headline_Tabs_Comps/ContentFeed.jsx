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

  return (
    <div ref={contentRef} id={`content-${content._id}`} className="w-full flex flex-col mt-1 gap-8  ">
      {content.picture ? (
        <>
          <div className="text-sm tablet:text-base desktop:text-lg text-gray-700 capitalize rounded-md mb-2 desktop:mb-4 flex-grow overflow-y-auto ">
            {content.message}
          </div>
          <div className="relative border-red-400 h-60 tablet:h-72 desktop:h-80 flex-shrink-0">
            <Image src={content.picture} fill alt="Content image" className="rounded-md object-cover" />
          </div>
        </>
      ) : (
        <div className="h-96 tablet:h-108 desktop:h-120 font-semibold text-gray-700 w-full flex items-center capitalize">
          <p className="text-sm tablet:text-base desktop:text-lg">{content.message}</p>
        </div>
      )}
    </div>
  );
};

export default ContentFeed;