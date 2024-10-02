import React from 'react';

const HistorySkeleton = () => {
  return (
    <div className="container mx-auto animate-pulse">
      {/* <div className="flex justify-between items-center mb-4">
        <div className="h-8 bg-gray-300 rounded w-48"></div>
        <div className="h-10 bg-gray-300 rounded w-32"></div>
      </div> */}
      {[...Array(5)].map((_, index) => (
        <div key={index} className="w-full border-gray-200 py-2 mb-4 flex gap-4 items-center">
          <div className="relative w-4/12 h-24 bg-gray-300 rounded-md"></div>
          <div className="w-7/12">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
          </div>
          <div className="w-1/12">
            <div className="h-6 w-6 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HistorySkeleton;