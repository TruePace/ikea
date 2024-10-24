import React, { useState, useRef, useEffect } from 'react';
import { FaBell } from 'react-icons/fa';

const SwipeableTabs = ({ items, unviewedCount, selectedTab, onTabChange }) => {
  const touchStartRef = useRef(null);
  const touchEndRef = useRef(null);
  const contentRef = useRef(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    touchStartRef.current = e.touches[0].clientX;
    touchEndRef.current = e.touches[0].clientX;
  };

  const onTouchMove = (e) => {
    touchEndRef.current = e.touches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartRef.current || !touchEndRef.current) return;

    const distance = touchStartRef.current - touchEndRef.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && selectedTab === 0) {
      onTabChange(1);
    } else if (isRightSwipe && selectedTab === 1) {
      onTabChange(0);
    }

    touchStartRef.current = null;
    touchEndRef.current = null;
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-red-600 p-1 rounded-lg flex justify-between items-center gap-x-2 font-semibold text-white mb-2">
        {items.map((item, index) => (
          <button
            key={index}
            onClick={() => onTabChange(index)}
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
        ref={contentRef}
        className="flex-grow relative"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div 
          className="absolute inset-0 transition-transform duration-300 ease-in-out"
          style={{
            transform: `translateX(-${selectedTab * 100}%)`
          }}
        >
          <div className="flex h-full">
            <div className="w-full flex-shrink-0">
              {items[0].renderContent()}
            </div>
            <div className="w-full flex-shrink-0">
              {items[1].renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwipeableTabs;