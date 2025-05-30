'use client';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

// Keys for localStorage
const SCROLL_POSITION_KEY = 'beyondNewsScrollPosition';
const SCROLL_TIMESTAMP_KEY = 'beyondNewsScrollTimestamp';
const LAST_CLICKED_ITEM_KEY = 'lastClickedItemId';
const NAVIGATION_TYPE_KEY = 'beyondNewsNavigationType';
const SESSION_ID_KEY = 'beyondNewsSessionId';
const RELOAD_FLAG_KEY = 'beyondNewsReloadFlag';
const FIRST_LOAD_PROCESSED_KEY = 'beyondNewsFirstLoadProcessed';
const USER_SESSION_KEY = 'beyondNewsUserSession';

export function useScrollPosition() {
  const pathname = usePathname();
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollContainerRef = useRef(null);
  const scrollRestored = useRef(false);
  const isInitialMount = useRef(true);
  
  // Get the scrollable container safely
  const getScrollContainer = () => {
    if (scrollContainerRef.current) return scrollContainerRef.current;
    
    // Find it in DOM if not already referenced
    const container = document.getElementById('beyondNewsContent');
    if (container) {
      scrollContainerRef.current = container;
    }
    return container;
  };

  // Store scroll position with a timestamp
  const saveScrollPosition = () => {
    if (typeof window === 'undefined' || pathname !== '/beyond_news') return;
    
    const contentContainer = getScrollContainer();
    if (contentContainer) {
      const position = contentContainer.scrollTop;
      localStorage.setItem(SCROLL_POSITION_KEY, position.toString());
      localStorage.setItem(SCROLL_TIMESTAMP_KEY, Date.now().toString());
      
      // Also mark that we've scrolled on this page
      localStorage.setItem(FIRST_LOAD_PROCESSED_KEY, 'true');
      
      // console.log(`Saved scroll position: ${position}px`);
    }
  };

  // Record that we're navigating away (not reloading)
  const recordNavigation = () => {
    if (typeof window === 'undefined') return;
    if (pathname === '/beyond_news') {
      // We're on the beyond_news page, set navigation type to "internal-navigation"
      localStorage.setItem(NAVIGATION_TYPE_KEY, 'internal-navigation');
      // console.log('Setting navigation type to internal-navigation');
    }
  };

  // Check if this is a fresh load (first visit or reload)
  const isFreshLoad = () => {
    if (typeof window === 'undefined') return true;
    
    // Check if this is a new browser session
    const currentSessionId = window.sessionStorage.getItem('appSessionId');
    const storedSessionId = localStorage.getItem(USER_SESSION_KEY);
    
    // If no session ID exists yet or they don't match, this is a fresh session
    if (!currentSessionId || currentSessionId !== storedSessionId) {
      // Generate new session ID if needed
      const newSessionId = currentSessionId || Date.now().toString();
      window.sessionStorage.setItem('appSessionId', newSessionId);
      localStorage.setItem(USER_SESSION_KEY, newSessionId);
      return true;
    }
    
    // Get navigation type from performance API
    const performanceEntries = performance.getEntriesByType('navigation');
    const navType = performanceEntries.length > 0 ? performanceEntries[0].type : null;
    
    // Check if this is a reload
    if (navType === 'reload') {
      // Check if first load after reload has been processed
      const firstLoadProcessed = localStorage.getItem(FIRST_LOAD_PROCESSED_KEY);
      
      // If first load hasn't been processed yet, mark it as a fresh load
      if (firstLoadProcessed !== 'true') {
        return true;
      }
    }
    
    // Check stored navigation type
    const storedNavType = localStorage.getItem(NAVIGATION_TYPE_KEY);
    
    // If we're navigating internally, it's not a fresh load
    if (storedNavType === 'internal-navigation') {
      return false;
    }
    
    // If we have no navigation record, treat as fresh load
    if (!storedNavType) {
      return true;
    }
    
    return false; // Default to not a fresh load
  };

  const restoreScrollPosition = () => {
    if (typeof window === 'undefined' || pathname !== '/beyond_news') return;
    if (scrollRestored.current) return; // Prevent multiple restoration attempts
    
    // Check if this is a fresh load or reload
    const freshLoad = isFreshLoad();
    
    if (freshLoad) {
      // Clear scroll position data but keep navigation type
      localStorage.removeItem(SCROLL_POSITION_KEY);
      localStorage.removeItem(SCROLL_TIMESTAMP_KEY);
      localStorage.removeItem(LAST_CLICKED_ITEM_KEY);
      localStorage.removeItem(FIRST_LOAD_PROCESSED_KEY);
      
      // Scroll to top
      const contentContainer = getScrollContainer();
      if (contentContainer) {
        contentContainer.scrollTop = 0;
      }
      
      scrollRestored.current = true;
      return;
    }
    
    // Skip clicked item logic and directly use position-based scrolling
    fallbackToPositionScroll();
  };
  
  // Fall back to position-based scrolling
  const fallbackToPositionScroll = () => {
    if (scrollRestored.current) return;
    
    const savedPosition = localStorage.getItem(SCROLL_POSITION_KEY);
    const timestamp = localStorage.getItem(SCROLL_TIMESTAMP_KEY);
    const contentContainer = getScrollContainer();
    
    if (savedPosition && timestamp && contentContainer) {
      // Check if saved position is still valid (within 30 minutes)
      const now = Date.now();
      const saved = parseInt(timestamp, 10);
      const expiration = 30 * 60 * 1000; // 30 minutes
      
      if (now - saved < expiration) {
        // console.log(`Restoring scroll position: ${savedPosition}px`);
        setTimeout(() => {
          contentContainer.scrollTop = parseInt(savedPosition, 10);
          scrollRestored.current = true;
        }, 200);
      } else {
        // console.log('Scroll position expired, not restoring');
        clearScrollData();
      }
    }
  };

  // Setup scroll event listener
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleScroll = () => {
      // Debounce the scroll event to avoid excessive writes
      if (window.scrollTimeout) {
        clearTimeout(window.scrollTimeout);
      }
      window.scrollTimeout = setTimeout(() => {
        saveScrollPosition();
      }, 200);
    };
    
    // Setup navigation tracking
    const handleBeforeUnload = (event) => {
      // This is a page reload, not navigation to another page
      localStorage.setItem(NAVIGATION_TYPE_KEY, 'reload');
      // console.log('Setting navigation type to reload');
      
      // Reset the first load processed flag
      localStorage.removeItem(FIRST_LOAD_PROCESSED_KEY);
    };
    
    // Setup click handler for links to track internal navigation
    const handleLinkClick = (event) => {
      // Check if this is a link click to another page
      if (event.target.tagName === 'A' || event.target.closest('a')) {
        localStorage.setItem(NAVIGATION_TYPE_KEY, 'internal-navigation');
        // console.log('Setting navigation type to internal-navigation from link click');
      }
    };
    
    // Setup page visibility change to detect tab/window switches
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // User is navigating away or switching tabs
        recordNavigation();
      }
    };

    // Add global handlers
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('click', handleLinkClick, true);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Handle page-specific setup
    if (pathname === '/beyond_news') {
      // Record that we're on the beyond_news page
      recordNavigation();
      
      // Reset scroll restored flag when navigating to the page
      scrollRestored.current = false;
      
      // Add scroll event listener to container
      const contentContainer = getScrollContainer();
      if (contentContainer) {
        contentContainer.addEventListener('scroll', handleScroll);
        
        // Restore position when component mounts, but only once
        if (!scrollRestored.current) {
          // Small delay to ensure initial content is loaded
          setTimeout(() => {
            restoreScrollPosition();
          }, 300);
        }
      }
    }
    
    return () => {
      const container = getScrollContainer();
      if (container && pathname === '/beyond_news') {
        container.removeEventListener('scroll', handleScroll);
      }
      if (window.scrollTimeout) {
        clearTimeout(window.scrollTimeout);
      }
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleLinkClick, true);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pathname]);

  // Define public methods
  const clearScrollData = () => {
    localStorage.removeItem(SCROLL_POSITION_KEY);
    localStorage.removeItem(SCROLL_TIMESTAMP_KEY);
    localStorage.removeItem(LAST_CLICKED_ITEM_KEY);
    localStorage.removeItem(FIRST_LOAD_PROCESSED_KEY);
    scrollRestored.current = false;
  };
  
  // Clear all scroll-related data including navigation type
  const clearStoredPositions = () => {
    clearScrollData();
    localStorage.removeItem(NAVIGATION_TYPE_KEY);
  };
  
  // Set last clicked item
  const setLastClickedItem = (id) => {
    if (id && typeof window !== 'undefined') {
      // console.log('Setting last clicked item:', id);
      localStorage.setItem(LAST_CLICKED_ITEM_KEY, id);
      // Also mark that we're doing internal navigation
      localStorage.setItem(NAVIGATION_TYPE_KEY, 'internal-navigation');
    }
  };

  return {
    scrollPosition,
    saveScrollPosition,
    clearScrollData,
    clearStoredPositions,
    setLastClickedItem,
    recordNavigation,
    scrollContainerRef
  };
}