import React from 'react';

const NestedSkeletonLoader = ({ type }) => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
      {type === 'video' ? (
        <>
          <div className="aspect-w-16 aspect-h-9 bg-gray-300 mb-4"></div>
          <div className="py-4">
            <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
            <div className="flex flex-wrap mb-4">
              {[1, 2, 3].map((_, index) => (
                <div key={index} className="h-6 bg-gray-300 rounded-full w-20 mr-2 mb-2"></div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center mb-4">
              <div className="flex items-center mb-2 sm:mb-0 sm:mr-4">
                <div className="rounded-full bg-gray-300 h-10 w-10 mr-4"></div>
                <div>
                  <div className="h-4 bg-gray-300 rounded w-32 mb-1"></div>
                  <div className="h-3 bg-gray-300 rounded w-24"></div>
                </div>
              </div>
              <div className="mt-2 sm:mt-0">
                <div className="h-8 bg-gray-300 rounded w-24"></div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between mb-4">
              <div className="h-4 bg-gray-300 rounded w-32 mb-2 sm:mb-0"></div>
              <div className="flex space-x-4">
                {[1, 2, 3, 4].map((_, index) => (
                  <div key={index} className="h-4 bg-gray-300 rounded w-16"></div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) :  (
        <>
          <div className="h-10 bg-gray-300 rounded w-3/4 mb-4 animate-pulse"></div>
          <div className="bg-gray-300 h-64 w-full animate-pulse mb-4"></div>
          <div className="flex justify-between mb-4">
            <div className="h-4 bg-gray-300 rounded w-1/4 animate-pulse"></div>
            <div className="flex space-x-4">
              <div className="h-4 bg-gray-300 rounded w-12 animate-pulse"></div>
              <div className="h-4 bg-gray-300 rounded w-12 animate-pulse"></div>
              <div className="h-4 bg-gray-300 rounded w-12 animate-pulse"></div>
            </div>
          </div>
          <div className="space-y-2">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="h-4 bg-gray-300 rounded w-full animate-pulse"></div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default NestedSkeletonLoader;