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
    <div ref={contentRef} id={`content-${content._id}`}>
      {content.picture ? (
        <div className="flex flex-col gap-2">
          <div className="xss:text-sm xs:p-2 xs:leading-7 sm:py-2 sm:px-2 sm:leading-8 sm:text-lg text-md text-gray-700 capitalize rounded-md h-40">
            {content.message}
          </div>
          <div className="relative border-red-400 mt-1 xs:h-56 sm:h-60 xss:py-16 xss:mt-0 xss:text-xs h-60">
            <Image src={content.picture} fill alt="Picture of the author" className="rounded-md object-cover" />
          </div>
        </div>
      ) : (
        <div className="xss:text-xs xss:py-3 xss:leading-5 xs:py-14 xs:text-md sm:py-16 sm:text-lg sm:leading-8 h-96 font-semibold text-gray-700 mt-2 w-full flex items-center capitalize ">
          <p className="ml-1">{content.message}</p>
        </div>
      )}
    </div>
  );
};

export default ContentFeed;