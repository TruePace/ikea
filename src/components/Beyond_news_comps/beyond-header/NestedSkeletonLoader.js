import React from 'react';

const NestedSkeletonLoader = ({ type }) => {
  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      {type === 'video' ? (
        <>
          <div className="bg-gray-300 h-64 w-full animate-pulse mb-4"></div>
          <div className="h-8 bg-gray-300 rounded w-3/4 mb-4 animate-pulse"></div>
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-gray-300 rounded-full animate-pulse mr-4"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-300 rounded w-1/4 mb-2 animate-pulse"></div>
              <div className="h-3 bg-gray-300 rounded w-1/5 animate-pulse"></div>
            </div>
            <div className="w-24 h-8 bg-gray-300 rounded animate-pulse"></div>
          </div>
          <div className="flex justify-between mb-4">
            <div className="h-4 bg-gray-300 rounded w-1/4 animate-pulse"></div>
            <div className="flex space-x-4">
              <div className="h-4 bg-gray-300 rounded w-12 animate-pulse"></div>
              <div className="h-4 bg-gray-300 rounded w-12 animate-pulse"></div>
              <div className="h-4 bg-gray-300 rounded w-12 animate-pulse"></div>
            </div>
          </div>
        </>
      ) : (
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