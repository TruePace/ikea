import React from 'react';

const ContentFeedSkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="mb-4 h-10 bg-gray-200 rounded"></div>
      <div className="space-y-2 mb-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded w-3/4"></div>
        ))}
      </div>
      <div className="aspect-w-16 aspect-h-9 mb-4">
        <div className="w-full h-full bg-gray-200 rounded"></div>
      </div>
      <div className="flex justify-between items-center">
        <div className="h-8 bg-gray-200 rounded w-20"></div>
        <div className="h-8 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
  );
};

export default ContentFeedSkeleton;