import React from 'react';

const ProfileSkeletonLoader = () => {
  return (
    <div className="animate-pulse">
      {/* Profile Header Skeleton */}
      <div className="w-full py-3">
        <div className='border-gray-300-100 pt-2 pr-8 pl-2.5 pb-1 flex gap-4'>
          <div className="w-28 h-28 bg-gray-300 rounded-full"></div>
          <div className='flex-1'>
            <div className='h-6 bg-gray-300 rounded w-1/4 mt-2'></div>
            <div className='h-4 bg-gray-300 rounded w-1/5 mt-2'></div>
            <div className='h-4 bg-gray-300 rounded w-2/5 mt-2'></div>
            <div className='h-10 bg-gray-300 rounded w-40 mt-4'></div>
          </div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="flex mt-4 bg-gray-300 p-1 rounded-lg">
        <div className="flex-1 h-10 bg-white rounded-md"></div>
        <div className="flex-1 h-10 bg-gray-400 rounded-md ml-1"></div>
      </div>

      {/* Content Skeleton */}
      <div className="mt-4 bg-base-200 rounded-lg mb-16 p-4">
        <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
        
        {/* Videos Section */}
        <div className="h-8 bg-gray-300 rounded w-20 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="mb-3 py-3 border-b-4 border-b-gray-200">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="w-80 h-36 bg-gray-300 rounded-md"></div>
            </div>
          ))}
        </div>

        {/* Articles Section */}
        <div className="h-8 bg-gray-300 rounded w-20 my-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="mb-3 py-3 border-b-4 border-b-gray-200">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="w-80 h-36 bg-gray-300 rounded-md"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeletonLoader;