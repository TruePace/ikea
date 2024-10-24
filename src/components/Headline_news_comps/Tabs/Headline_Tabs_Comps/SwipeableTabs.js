// hooks/useSwipeNavigation.js
import { useState, useCallback } from 'react';

const useSwipeNavigation = ({ onSwipeLeft, onSwipeRight, minSwipeDistance = 50 }) => {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isSwiping, setIsSwiping] = useState(false);

  // Handle touch start
  const handleTouchStart = useCallback((e) => {
    setTouchEnd(null);
    setTouchStart(e.touches[0].clientX);
    setIsSwiping(true);
  }, []);

  // Handle touch move
  const handleTouchMove = useCallback((e) => {
    if (!isSwiping) return;
    setTouchEnd(e.touches[0].clientX);
  }, [isSwiping]);

  // Handle touch end
  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd || !isSwiping) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    } else if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    }

    setTouchStart(null);
    setTouchEnd(null);
    setIsSwiping(false);
  }, [touchStart, touchEnd, isSwiping, minSwipeDistance, onSwipeLeft, onSwipeRight]);

  // Handle touch cancel
  const handleTouchCancel = useCallback(() => {
    setTouchStart(null);
    setTouchEnd(null);
    setIsSwiping(false);
  }, []);

  return {
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchCancel
    },
    isSwiping
  };
};

export default useSwipeNavigation;