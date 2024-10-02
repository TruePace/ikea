import React from 'react';

const ThumbnailSkeletonLoader = ({ type }) => {
  return (
    <div className="w-full py-3">
      {type === 'video' ? (
        <>
          <div className="bg-gray-300 h-56 w-full animate-pulse"></div>
          <div className="border border-gray-300 pt-2 pr-8 pl-2.5 pb-1 flex justify-between mt-2">
            <div className="w-10 h-10 bg-gray-300 rounded-full animate-pulse"></div>
            <div className="w-4/5">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2 mb-2 animate-pulse"></div>
              <div className="flex justify-between mt-2">
                <div className="h-4 bg-gray-300 rounded w-1/4 animate-pulse"></div>
                <div className="h-4 bg-gray-300 rounded w-1/4 animate-pulse"></div>
                <div className="h-4 bg-gray-300 rounded w-1/4 animate-pulse"></div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center mb-2">
            <div className="w-11 h-11 bg-gray-300 rounded-full animate-pulse mr-3"></div>
            <div className="h-4 bg-gray-300 rounded w-1/4 animate-pulse"></div>
          </div>
          <div className="h-6 bg-gray-300 rounded w-3/4 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-300 rounded w-full mb-2 animate-pulse"></div>
          <div className="bg-gray-300 h-60 w-full animate-pulse mb-2"></div>
          <div className="flex justify-between mt-2">
            <div className="h-4 bg-gray-300 rounded w-1/4 animate-pulse"></div>
            <div className="h-4 bg-gray-300 rounded w-1/4 animate-pulse"></div>
            <div className="h-4 bg-gray-300 rounded w-1/4 animate-pulse"></div>
          </div>
        </>
      )}
    </div>
  );
};

export default ThumbnailSkeletonLoader;