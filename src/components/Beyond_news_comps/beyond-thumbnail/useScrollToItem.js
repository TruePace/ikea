// hooks/useScrollToItem.js
'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Create a simple module-level variable to store the last clicked item ID
let lastClickedItem = null;

export function useScrollToItem() {
  const pathname = usePathname();
  
  // This function will be called when navigating back to the main page
  const scrollToLastItem = () => {
    if (!lastClickedItem) return;
    
    setTimeout(() => {
      const element = document.getElementById(lastClickedItem);
      if (element) {
        // Scroll the element into view with a small offset from the top
        element.scrollIntoView({ behavior: 'instant', block: 'center' });
        // Clear the reference after scrolling
        lastClickedItem = null;
      }
    }, 100); // Small delay to ensure the page is fully rendered
  };
  
  // Set up effect to scroll to last item when we return to the main page
  useEffect(() => {
    // Only run on main page
    if (pathname === '/beyond_news') {
      scrollToLastItem();
    }
  }, [pathname]);
  
  // Return a function that components can call to set the last clicked item
  return {
    setLastClickedItem: (id) => { 
      lastClickedItem = id;
    }
  };
}