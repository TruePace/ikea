import React, { useState, useRef, useEffect } from 'react';
import { FaBell } from 'react-icons/fa';

const SwipeableTabs = ({ items, selectedTab, setSelectedTab, unviewedCount }) => {
  const containerRef = useRef(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Minimum swipe distance for tab change (in pixels)
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
      if (isLeftSwipe && selectedTab < items.length - 1) {
        handleTabChange(selectedTab + 1);
      }
      if (isRightSwipe && selectedTab > 0) {
        handleTabChange(selectedTab - 1);
      }
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  const handleTabChange = (index) => {
    setIsTransitioning(true);
    setSelectedTab(index);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const getTransformStyle = () => {
    if (touchStart && touchEnd) {
      const distance = touchEnd - touchStart;
      const maxDistance = containerRef.current?.offsetWidth || 0;
      const clampedDistance = Math.max(
        Math.min(distance, maxDistance),
        -maxDistance
      );
      return `translateX(${-selectedTab * 100}%) translateX(${clampedDistance}px)`;
    }
    return `translateX(${-selectedTab * 100}%)`;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-red-600 p-1 rounded-lg flex justify-between items-center gap-x-2 font-semibold text-white mb-2">
        {items.map((item, index) => (
          <button
            key={index}
            onClick={() => handleTabChange(index)}
            className={`outline-none w-full p-1 rounded-lg text-center transition-colors duration-300 ${
              selectedTab === index ? 'bg-white text-neutral-800' : ''
            } relative`}
          >
            {item.title}
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
        className="flex-grow overflow-hidden touch-pan-x"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div 
          className="flex h-full transition-transform duration-300 ease-out"
          style={{ transform: getTransformStyle() }}
        >
          {items.map((item, index) => (
            <div key={index} className="w-full flex-shrink-0">
              {item.renderContent()}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SwipeableTabs;