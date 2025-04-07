// hooks/useRememberPosition.js
'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function useRememberPosition() {
  const pathname = usePathname();
  
  // Save position when leaving the page
  useEffect(() => {
    // Only run on the main page
    if (pathname !== '/beyond_news') return;
    
    // Save position when user leaves
    const handleBeforeUnload = () => {
      sessionStorage.setItem('beyond_news_scroll', window.scrollY.toString());
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      // Save position when component unmounts (navigation within the site)
      sessionStorage.setItem('beyond_news_scroll', window.scrollY.toString());
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [pathname]);
  
  // Restore position when returning
  useEffect(() => {
    // Only run on the main page
    if (pathname !== '/beyond_news') return;
    
    const savedPosition = sessionStorage.getItem('beyond_news_scroll');
    if (savedPosition) {
      // Use a timeout to ensure the page has rendered
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedPosition, 10));
      }, 200);
    }
  }, [pathname]);
}