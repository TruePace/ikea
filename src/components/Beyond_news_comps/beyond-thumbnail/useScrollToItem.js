'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Constants for localStorage keys
const ITEM_KEY = 'lastClickedItemId';
const PATH_KEY = 'lastVisitedPath';

export function useScrollToItem() {
  const pathname = usePathname();
  
  // Set expiration time for storage items (e.g., 5 minutes)
  const EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

  // Enhanced localStorage functions with expiration
  const setWithExpiry = (key, value) => {
    if (typeof window === 'undefined') return;
    
    const item = {
      value,
      expiry: Date.now() + EXPIRATION_TIME
    };
    localStorage.setItem(key, JSON.stringify(item));
  };

  const getWithExpiry = (key) => {
    if (typeof window === 'undefined') return null;
    
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;
    
    try {
      const item = JSON.parse(itemStr);
      // Check if item has expired
      if (Date.now() > item.expiry) {
        localStorage.removeItem(key);
        return null;
      }
      return item.value;
    } catch (e) {
      // console.error('Error parsing stored item:', e);
      localStorage.removeItem(key);
      return null;
    }
  };

  // Track path changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Store the current path with expiry
    // console.log(`Path changed to: ${pathname}`);
    setWithExpiry(PATH_KEY, pathname);
  }, [pathname]);

  // Handle scrolling when returning to the main page
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Only run on the beyond_news page
    if (pathname === '/beyond_news') {
      const storedItemId = getWithExpiry(ITEM_KEY);
      // console.log('On beyond_news page, checking for stored item ID:', storedItemId);
      
      if (storedItemId) {
        const scrollAttempts = [100, 300, 600, 1000, 1500, 2000];
        let successfulScroll = false;
        
        scrollAttempts.forEach((delay) => {
          setTimeout(() => {
            if (successfulScroll) return;
            
            const element = document.getElementById(storedItemId);
            if (element) {
              // console.log(`Found element at ${delay}ms, scrolling to ${storedItemId}`);
              
              element.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
              });
              
              // Visual indicator
              element.style.transition = 'all 0.5s';
              element.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.5)';
              setTimeout(() => {
                element.style.boxShadow = '';
              }, 2000);
              
              successfulScroll = true;
            } else {
              // console.log(`Element not found at ${delay}ms, will try again`);
            }
          }, delay);
        });
      }
    }
  }, [pathname]);

  return {
    setLastClickedItem: (id) => {
      if (id && typeof window !== 'undefined') {
        // console.log('Setting last clicked item:', id);
        setWithExpiry(ITEM_KEY, id);
      }
    }
  };
}