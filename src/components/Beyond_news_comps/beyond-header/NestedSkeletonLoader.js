import React from 'react';

const NestedSkeletonLoader = ({ type }) => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
      {type === 'video' ? (
        <>
          <div className="aspect-w-16 aspect-h-9 mb-4">
            <div className="w-full h-full bg-gray-300 rounded-lg flex items-center justify-center">
              <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
          <div className="py-4">
            <div className="h-6 sm:h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
            <div className="flex flex-wrap mb-4">
              {[1, 2, 3].map((_, index) => (
                <div key={index} className="h-6 bg-gray-300 rounded-full px-3 py-1 mr-2 mb-2"></div>
              ))}
            </div>
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gray-300 rounded-full mr-4"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-32 mb-1"></div>
                <div className="h-3 bg-gray-300 rounded w-24"></div>
              </div>
              <div className="h-8 bg-gray-300 rounded w-24"></div>
            </div>
            <div className="flex justify-between text-sm mb-4">
              <div className="h-4 bg-gray-300 rounded w-32"></div>
              <div className="flex space-x-4">
                {[1, 2, 3, 4].map((_, index) => (
                  <div key={index} className="h-4 bg-gray-300 rounded w-16"></div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) :  (
        <div className="max-w-3xl mx-auto p-4 pt-8 sm:pt-12 md:pt-20 desktop:max-w-4xl">
          <div className="h-8 sm:h-10 desktop:h-12 bg-gray-300 rounded w-3/4 mb-4"></div>
          <div className="mb-4 relative w-full" style={{ height: '0', paddingBottom: '56.25%' }}>
            <div className="absolute inset-0 bg-gray-300 rounded-lg"></div>
          </div>
          <div className="flex justify-between mb-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-300 rounded-full mr-2"></div>
              <div>
                <div className="h-4 bg-gray-300 rounded w-32 mb-1"></div>
                <div className="h-3 bg-gray-300 rounded w-24"></div>
              </div>
            </div>
            <div className="h-8 bg-gray-300 rounded w-24"></div>
          </div>
          <div className="flex justify-between text-sm mb-4">
            <div className="h-4 bg-gray-300 rounded w-32"></div>
            <div className="flex space-x-4">
              {[1, 2, 3].map((_, index) => (
                <div key={index} className="h-4 bg-gray-300 rounded w-16"></div>
              ))}
            </div>
          </div>
          <div className="mb-4">
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="inline-block bg-gray-300 rounded-full h-6 w-16 mr-2 mb-2"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="h-4 bg-gray-300 rounded w-full"></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NestedSkeletonLoader;