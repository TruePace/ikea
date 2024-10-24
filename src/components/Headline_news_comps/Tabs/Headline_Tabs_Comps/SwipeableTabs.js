import React, { useState, useRef, useEffect } from 'react';
import { FaBell } from 'react-icons/fa';

const SwipeableTabs = ({ 
  selectedTab, 
  setSelectedTab, 
  unviewedCount, 
  children 
}) => {
  const containerRef = useRef(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Minimum swipe distance required (in pixels)
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.touches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (!isTransitioning) {
      if (isLeftSwipe && selectedTab === 0) {
        setIsTransitioning(true);
        setSelectedTab(1);
        setTimeout(() => setIsTransitioning(false), 300);
      } else if (isRightSwipe && selectedTab === 1) {
        setIsTransitioning(true);
        setSelectedTab(0);
        setTimeout(() => setIsTransitioning(false), 300);
      }
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-red-600 p-1 rounded-lg flex justify-between items-center gap-x-2 font-semibold text-white mb-2">
        {['Headline News', 'Just In'].map((title, index) => (
          <button
            key={index}
            onClick={() => !isTransitioning && setSelectedTab(index)}
            className={`outline-none w-full p-1 rounded-lg text-center transition-colors duration-300 ${
              selectedTab === index ? 'bg-white text-neutral-800' : ''
            } relative`}
          >
            {title}
            {index === 1 && unviewedCount > 0 && (
              <span className="absolute top-0 right-0 bg-yellow-500 text-white rounded-full px-2 py-1 text-xs">
                <FaBell className="mr-1" />
                {unviewedCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div 
        ref={containerRef}
        className="flex-grow relative overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div 
          className="absolute inset-0 transition-transform duration-300 ease-in-out flex"
          style={{ 
            transform: `translateX(-${selectedTab * 100}%)`,
            width: '200%'
          }}
        >
          <div className="w-full h-full flex-shrink-0">
            {children[0]}
          </div>
          <div className="w-full h-full flex-shrink-0">
            {children[1]}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwipeableTabs;