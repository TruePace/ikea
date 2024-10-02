import React from 'react';

const MissedJustInSkeleton = () => {
  return (
    <div className="py-8 w-full animate-pulse">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="w-11/12 border-b-2 border-gray-200 py-4 m-auto">
          <div className="w-full flex items-center gap-4 mb-4">
            <div className="w-9 h-9 bg-gray-300 rounded-full"></div>
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
            <div className="h-8 bg-gray-300 rounded w-24 ml-auto"></div>
          </div>
          <div className="flex justify-between mb-4">
            <div className="w-7/12">
              <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </div>
            <div className="w-2/5 h-24 bg-gray-300 rounded-md"></div>
          </div>
          <div className="h-4 bg-gray-300 rounded w-1/3"></div>
        </div>
      ))}
    </div>
  );
};

export default MissedJustInSkeleton;