import React from 'react';

const HistorySkeleton = () => {
  return (
    <div className="container mx-auto px-4 tablet:px-6 desktop:px-8 animate-pulse space-y-6">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="flex flex-col tablet:flex-row gap-4 items-start tablet:items-center bg-white p-4 rounded-lg shadow-sm">
          <div className="relative w-full tablet:w-3/12 desktop:w-2/12 aspect-video bg-gray-300 rounded-md"></div>
          <div className="flex-grow w-full tablet:w-auto">
            <div className="h-4 tablet:h-5 desktop:h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-3 tablet:h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
            <div className="h-3 tablet:h-4 bg-gray-300 rounded w-1/4"></div>
          </div>
          <div className="w-6 h-6 bg-gray-300 rounded-full mt-2 tablet:mt-0"></div>
        </div>
      ))}
    </div>
  );
};

export default HistorySkeleton;