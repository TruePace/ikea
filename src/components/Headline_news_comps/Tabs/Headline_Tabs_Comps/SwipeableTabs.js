import React, { useState, useRef, useEffect } from 'react';
import { FaBell } from 'react-icons/fa';

const SwipeableTabs = ({ 
  selectedTab, 
  setSelectedTab, 
  unviewedCount, 
  children 
}) => {
  const containerRef = useRef(null);
  const [startX, setStartX] = useState(null);
  const [currentX, setCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleMouseDown = (e) => {
    setStartX(e.clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || startX === null) return;
    const currentPoint = e.touches[0].clientX;
    const diff = currentPoint - startX;
    setCurrentX(diff);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || startX === null) return;
    const currentPoint = e.clientX;
    const diff = currentPoint - startX;
    setCurrentX(diff);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;

    const threshold = window.innerWidth * 0.2; // 20% of screen width
    const direction = currentX > 0 ? -1 : 1;
    const shouldSwitch = Math.abs(currentX) > threshold;

    if (shouldSwitch) {
      const newTab = selectedTab + direction;
      if (newTab >= 0 && newTab <= 1) {
        setSelectedTab(newTab);
      }
    }

    setStartX(null);
    setCurrentX(0);
    setIsDragging(false);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove);
    container.addEventListener('touchend', handleDragEnd);
    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseup', handleDragEnd);
    container.addEventListener('mouseleave', handleDragEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleDragEnd);
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseup', handleDragEnd);
      container.removeEventListener('mouseleave', handleDragEnd);
    };
  }, [isDragging, startX, selectedTab]);

  const translateX = isDragging ? currentX : 0;
  const transition = isDragging ? 'none' : 'transform 0.3s ease-out';

  return (
    <div className="flex flex-col h-full">
      <div className="bg-red-600 p-1 rounded-lg flex justify-between items-center gap-x-2 font-semibold text-white mb-2">
        {['Headline News', 'Just In'].map((title, index) => (
          <button
            key={index}
            onClick={() => setSelectedTab(index)}
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
        className="flex-grow relative overflow-hidden touch-pan-x"
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      >
        <div
          className="flex h-full w-full"
          style={{
            transform: `translateX(${-selectedTab * 100 + (translateX / window.innerWidth) * 100}%)`,
            transition,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default SwipeableTabs;