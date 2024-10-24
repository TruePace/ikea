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
    e.preventDefault();
    setStartX(e.clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || startX === null) return;
    e.preventDefault();
    const currentPoint = e.touches[0].clientX;
    const diff = currentPoint - startX;
    
    // Limit the swipe to one screen width in either direction
    const maxSwipe = window.innerWidth;
    const boundedDiff = Math.max(Math.min(diff, maxSwipe), -maxSwipe);
    setCurrentX(boundedDiff);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || startX === null) return;
    e.preventDefault();
    const currentPoint = e.clientX;
    const diff = currentPoint - startX;
    
    // Limit the swipe to one screen width in either direction
    const maxSwipe = window.innerWidth;
    const boundedDiff = Math.max(Math.min(diff, maxSwipe), -maxSwipe);
    setCurrentX(boundedDiff);
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

    const touchStart = (e) => handleTouchStart(e);
    const touchMove = (e) => handleTouchMove(e);
    const touchEnd = () => handleDragEnd();
    const mouseDown = (e) => handleMouseDown(e);
    const mouseMove = (e) => handleMouseMove(e);
    const mouseUp = () => handleDragEnd();

    container.addEventListener('touchstart', touchStart, { passive: false });
    container.addEventListener('touchmove', touchMove, { passive: false });
    container.addEventListener('touchend', touchEnd);
    container.addEventListener('mousedown', mouseDown);
    container.addEventListener('mousemove', mouseMove);
    container.addEventListener('mouseup', mouseUp);
    container.addEventListener('mouseleave', mouseUp);

    return () => {
      container.removeEventListener('touchstart', touchStart);
      container.removeEventListener('touchmove', touchMove);
      container.removeEventListener('touchend', touchEnd);
      container.removeEventListener('mousedown', mouseDown);
      container.removeEventListener('mousemove', mouseMove);
      container.removeEventListener('mouseup', mouseUp);
      container.removeEventListener('mouseleave', mouseUp);
    };
  }, [isDragging, startX, selectedTab]);

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
        style={{ userSelect: 'none' }}
      >
        <div
          className="flex h-full transition-transform duration-300 ease-out"
          style={{
            transform: `translateX(calc(${-selectedTab * 100}% + ${currentX}px))`,
            width: '200%', // Make room for both tabs
          }}
        >
          {React.Children.map(children, (child, index) => (
            <div 
              key={index} 
              className="w-1/2 h-full flex-shrink-0"
              style={{ overflow: 'hidden auto' }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SwipeableTabs;