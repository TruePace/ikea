'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Constants for localStorage keys
const ITEM_KEY = 'lastClickedItemId';
const PATH_KEY = 'lastVisitedPath';

export function useScrollToItem() {
  const pathname = usePathname();
  
  // Track path changes to know when we're returning to the beyond_news page
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Store the current path for navigation tracking
    console.log(`Path changed to: ${pathname}, previous: ${localStorage.getItem(PATH_KEY)}`);
    localStorage.setItem(PATH_KEY, pathname);
  }, [pathname]);
  
  // Handle scrolling when returning to the main page
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Only run on the main beyond_news page
    if (pathname === '/beyond_news') {
      const storedItemId = localStorage.getItem(ITEM_KEY);
      console.log('On beyond_news page, checking for stored item ID:', storedItemId);
      
      if (storedItemId) {
        // Use multiple attempts with increasing delays to handle different loading scenarios
        // This is crucial as content might load at different times
        const scrollAttempts = [100, 300, 600, 1000, 1500, 2000];
        
        let successfulScroll = false;
        
        scrollAttempts.forEach((delay) => {
          setTimeout(() => {
            // Don't try again if we've already successfully scrolled
            if (successfulScroll) return;
            
            const element = document.getElementById(storedItemId);
            if (element) {
              console.log(`Found element at ${delay}ms, scrolling to ${storedItemId}`);
              
              // Use smooth scrolling for better UX
              element.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
              });
              
              // Add a visual indicator to help debugging (optional)
              element.style.transition = 'all 0.5s';
              element.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.5)';
              setTimeout(() => {
                element.style.boxShadow = '';
              }, 2000);
              
              successfulScroll = true;
            } else {
              console.log(`Element not found at ${delay}ms, will try again`);
            }
          }, delay);
        });
      }
    }
  }, [pathname]);
  
  // Return the function to set the last clicked item
  return {
    setLastClickedItem: (id) => {
      if (id && typeof window !== 'undefined') {
        console.log('Setting last clicked item:', id);
        localStorage.setItem(ITEM_KEY, id);
      }
    }
  };
}