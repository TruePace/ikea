'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';

// Keys for localStorage
const SCROLL_POSITION_KEY = 'beyondNewsScrollPosition';
const SCROLL_TIMESTAMP_KEY = 'beyondNewsScrollTimestamp';
const LAST_CLICKED_ITEM_KEY = 'lastClickedItemId';
const NAVIGATION_TYPE_KEY = 'beyondNewsNavigationType';
const USER_SESSION_KEY = 'beyondNewsUserSession';

export function useScrollPosition() {
  const pathname = usePathname();
  const scrollContainerRef = useRef(null);
  const scrollRestored = useRef(false);
  const isRestoringScroll = useRef(false);
  const saveScrollTimeout = useRef(null);
  const restorationTimeout = useRef(null);
  const contentObserver = useRef(null);
  const lastScrollTop = useRef(0);
  const restorationAttempts = useRef(0);
  
  // Get the scrollable container safely
  const getScrollContainer = useCallback(() => {
    if (scrollContainerRef.current) return scrollContainerRef.current;
    
    const container = document.getElementById('beyondNewsContent');
    if (container) {
      scrollContainerRef.current = container;
    }
    return container;
  }, []);

  // Store scroll position with better debouncing
  const saveScrollPosition = useCallback(() => {
    if (typeof window === 'undefined' || pathname !== '/beyond_news') return;
    if (isRestoringScroll.current) return;
    
    const contentContainer = getScrollContainer();
    if (!contentContainer) return;
    
    const position = contentContainer.scrollTop;
    
    // Only save if position has changed significantly (avoid excessive saves)
    if (Math.abs(position - lastScrollTop.current) < 10) return;
    
    lastScrollTop.current = position;
    
    // Clear existing timeout
    if (saveScrollTimeout.current) {
      clearTimeout(saveScrollTimeout.current);
    }
    
    // Debounce the save operation
    saveScrollTimeout.current = setTimeout(() => {
      if (!isRestoringScroll.current) {
        localStorage.setItem(SCROLL_POSITION_KEY, position.toString());
        localStorage.setItem(SCROLL_TIMESTAMP_KEY, Date.now().toString());
        console.log(`Saved scroll position: ${position}px`);
      }
    }, 200);
  }, [pathname, getScrollContainer]);

  // Record navigation type
  const recordNavigation = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (pathname === '/beyond_news') {
      // Only set internal navigation if this is not a reload
      const performanceEntries = performance.getEntriesByType('navigation');
      const navType = performanceEntries.length > 0 ? performanceEntries[0].type : null;
      
      if (navType !== 'reload') {
        localStorage.setItem(NAVIGATION_TYPE_KEY, 'internal-navigation');
        console.log('Setting navigation type to internal-navigation');
      }
    }
  }, [pathname]);

  // Check if this is a fresh load
  const isFreshLoad = useCallback(() => {
    if (typeof window === 'undefined') return true;
    
    // Check session first
    const currentSessionId = window.sessionStorage.getItem('appSessionId');
    const storedSessionId = localStorage.getItem(USER_SESSION_KEY);
    
    if (!currentSessionId || currentSessionId !== storedSessionId) {
      const newSessionId = currentSessionId || Date.now().toString();
      window.sessionStorage.setItem('appSessionId', newSessionId);
      localStorage.setItem(USER_SESSION_KEY, newSessionId);
      console.log('New session detected, treating as fresh load');
      return true;
    }
    
    // Check our stored navigation type FIRST (more reliable in Next.js)
    const storedNavType = localStorage.getItem(NAVIGATION_TYPE_KEY);
    console.log('Stored navigation type:', storedNavType);
    
    // If we have internal navigation marked, trust it over Performance API
    if (storedNavType === 'internal-navigation') {
      console.log('Internal navigation detected from stored type, should restore scroll position');
      // Clear the navigation type now that we've used it
      localStorage.removeItem(NAVIGATION_TYPE_KEY);
      return false;
    }
    
    // Check Performance API 
    const performanceEntries = performance.getEntriesByType('navigation');
    const navType = performanceEntries.length > 0 ? performanceEntries[0].type : null;
    console.log('Performance API navigation type:', navType);
    
    // Only trust Performance API for reload if we don't have internal navigation
    if (navType === 'reload' && storedNavType !== 'internal-navigation') {
      console.log('Page reload detected via Performance API');
      localStorage.removeItem(NAVIGATION_TYPE_KEY);
      return true;
    }
    
    // If stored type is explicitly set to reload
    if (storedNavType === 'reload') {
      console.log('Reload navigation type detected from storage');
      localStorage.removeItem(NAVIGATION_TYPE_KEY);
      return true;
    }
    
    // Default case - if no clear indicators, treat as fresh load
    console.log('No clear navigation indicators, treating as fresh load');
    return true;
  }, []);

  // Wait for content to be loaded before restoring
  const waitForContent = useCallback((callback, maxWait = 5000) => {
    const startTime = Date.now();
    const container = getScrollContainer();
    
    if (!container) {
      setTimeout(() => waitForContent(callback, maxWait - 100), 100);
      return;
    }
    
    const checkContent = () => {
      const contentElements = container.querySelectorAll('[data-content-id]');
      const hasEnoughContent = contentElements.length >= 6; // Wait for at least 6 items
      const timeElapsed = Date.now() - startTime;
      
      if (hasEnoughContent || timeElapsed >= maxWait) {
        console.log(`Content ready: ${contentElements.length} items loaded in ${timeElapsed}ms`);
        callback();
      } else {
        setTimeout(checkContent, 100);
      }
    };
    
    checkContent();
  }, [getScrollContainer]);

  // Restore scroll position with content waiting
  const restoreScrollPosition = useCallback(() => {
    if (typeof window === 'undefined' || pathname !== '/beyond_news') return;
    if (scrollRestored.current) return;
    
    console.log('Starting scroll restoration process...');
    
    const freshLoad = isFreshLoad();
    
    if (freshLoad) {
      console.log('Fresh load/reload detected, scrolling to top');
      
      // Always clear scroll data on fresh loads/reloads
      localStorage.removeItem(SCROLL_POSITION_KEY);
      localStorage.removeItem(SCROLL_TIMESTAMP_KEY);
      localStorage.removeItem(LAST_CLICKED_ITEM_KEY);
      localStorage.removeItem(NAVIGATION_TYPE_KEY);
      
      const contentContainer = getScrollContainer();
      if (contentContainer) {
        contentContainer.scrollTop = 0;
      }
      scrollRestored.current = true;
      
      return;
    }
    
    // Get saved position
    const savedPosition = localStorage.getItem(SCROLL_POSITION_KEY);
    const timestamp = localStorage.getItem(SCROLL_TIMESTAMP_KEY);
    
    if (!savedPosition || !timestamp) {
      console.log('No saved scroll position found');
      scrollRestored.current = true;
      return;
    }
    
    const now = Date.now();
    const saved = parseInt(timestamp, 10);
    const expiration = 30 * 60 * 1000; // 30 minutes
    
    if (now - saved >= expiration) {
      console.log('Scroll position expired');
      clearScrollData();
      scrollRestored.current = true;
      return;
    }
    
    const targetPosition = parseInt(savedPosition, 10);
    console.log(`Waiting for content before restoring to: ${targetPosition}px`);
    
    // Wait for content to load, then restore
    waitForContent(() => {
      const contentContainer = getScrollContainer();
      if (!contentContainer) {
        console.log('Container not found after content wait');
        scrollRestored.current = true;
        return;
      }
      
      console.log(`Attempting to restore scroll position: ${targetPosition}px`);
      isRestoringScroll.current = true;
      restorationAttempts.current = 0;
      
      const attemptRestore = () => {
        restorationAttempts.current++;
        const maxHeight = contentContainer.scrollHeight - contentContainer.clientHeight;
        const actualTarget = Math.min(targetPosition, maxHeight);
        
        console.log(`Restoration attempt ${restorationAttempts.current}: scrollHeight=${contentContainer.scrollHeight}, target=${actualTarget}px`);
        
        contentContainer.scrollTop = actualTarget;
        
        // Verify after a delay
        setTimeout(() => {
          const currentPosition = contentContainer.scrollTop;
          const difference = Math.abs(currentPosition - actualTarget);
          
          console.log(`Verification: target=${actualTarget}px, actual=${currentPosition}px, diff=${difference}px`);
          
          if (difference > 50 && restorationAttempts.current < 3) {
            console.log(`Position off by ${difference}px, retrying...`);
            setTimeout(attemptRestore, 300);
          } else {
            console.log(`Scroll restoration completed at: ${currentPosition}px`);
            isRestoringScroll.current = false;
            scrollRestored.current = true;
            lastScrollTop.current = currentPosition;
          }
        }, 150);
      };
      
      // Start first attempt
      attemptRestore();
    });
  }, [pathname, isFreshLoad, getScrollContainer, waitForContent]);

  // Setup effects
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    let scrollTimeout;
    
    const handleScroll = (e) => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(saveScrollPosition, 100);
    };
    
    const handleBeforeUnload = (event) => {
      const storedNavType = localStorage.getItem(NAVIGATION_TYPE_KEY);
      
      console.log('beforeunload triggered, current stored type:', storedNavType);
      
      // Don't override internal navigation type
      if (storedNavType !== 'internal-navigation') {
        // Use a flag to indicate this might be a reload
        localStorage.setItem(NAVIGATION_TYPE_KEY, 'potential-reload');
        console.log('Setting navigation type to potential-reload');
      } else {
        console.log('Preserving internal navigation type');
      }
    };
    
    const handleLinkClick = (event) => {
      if (event.target.tagName === 'A' || event.target.closest('a')) {
        localStorage.setItem(NAVIGATION_TYPE_KEY, 'internal-navigation');
        console.log('Setting navigation type to internal-navigation from link click');
      }
    };
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        recordNavigation();
      }
    };

    // Add global handlers
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('click', handleLinkClick, true);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    if (pathname === '/beyond_news') {
      recordNavigation();
      
      // Reset restoration state
      scrollRestored.current = false;
      isRestoringScroll.current = false;
      restorationAttempts.current = 0;
      
      const contentContainer = getScrollContainer();
      if (contentContainer) {
        contentContainer.addEventListener('scroll', handleScroll, { passive: true });
        
        // Clear any existing timeout
        if (restorationTimeout.current) {
          clearTimeout(restorationTimeout.current);
        }
        
        // Start restoration process
        restorationTimeout.current = setTimeout(() => {
          restoreScrollPosition();
        }, 800); // Give more time for initial content loading
      }
    }
    
    return () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      if (saveScrollTimeout.current) clearTimeout(saveScrollTimeout.current);
      if (restorationTimeout.current) clearTimeout(restorationTimeout.current);
      
      const container = getScrollContainer();
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
      
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleLinkClick, true);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pathname, saveScrollPosition, recordNavigation, getScrollContainer, restoreScrollPosition]);

  // Clear scroll data
  const clearScrollData = useCallback(() => {
    localStorage.removeItem(SCROLL_POSITION_KEY);
    localStorage.removeItem(SCROLL_TIMESTAMP_KEY);
    localStorage.removeItem(LAST_CLICKED_ITEM_KEY);
    scrollRestored.current = false;
    isRestoringScroll.current = false;
    restorationAttempts.current = 0;
  }, []);
  
  const clearStoredPositions = useCallback(() => {
    clearScrollData();
    localStorage.removeItem(NAVIGATION_TYPE_KEY);
  }, [clearScrollData]);
  
  const setLastClickedItem = useCallback((id) => {
    if (id && typeof window !== 'undefined') {
      console.log('Setting last clicked item:', id);
      localStorage.setItem(LAST_CLICKED_ITEM_KEY, id);
      localStorage.setItem(NAVIGATION_TYPE_KEY, 'internal-navigation');
    }
  }, []);

  return {
    saveScrollPosition,
    clearScrollData,
    clearStoredPositions,
    setLastClickedItem,
    recordNavigation,
    scrollContainerRef
  };
}