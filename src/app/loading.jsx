import React from "react";

const Loading = () => {
  return (
    <div className="animate-pulse">
      <div className="navbar bg-base-100">
        <div className="flex-1">
          <div className="btn btn-ghost text-lg">
            <div className="w-6 h-6 bg-gray-300 rounded-full mr-2"></div>
            <div className="w-24 h-6 bg-gray-300 rounded"></div>
          </div>
        </div>
        <div className="flex-none gap-7 w-2/6">
          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          <div className="w-20 h-8 bg-gray-300 rounded"></div>
        </div>
      </div>
      
      {/* Content skeleton */}
      <div className="container mx-auto mt-8">
        <div className="w-3/4 h-8 bg-gray-300 rounded mb-4"></div>
        <div className="w-full h-32 bg-gray-300 rounded mb-4"></div>
        <div className="grid grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="h-24 bg-gray-300 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
  }
  
  export default Loading