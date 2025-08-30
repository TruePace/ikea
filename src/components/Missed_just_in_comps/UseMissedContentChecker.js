// components/Missed_just_in_comps/UseMissedContentChecker.js
'use client'

import { useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/app/(auth)/AuthContext';
import { useDispatch, useSelector } from 'react-redux';
import { setHasMissedContent, setMissedContentCount, setIsChecking } from '@/Redux/Slices/MissedNotificationSlice';
import { usePathname } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const useMissedContentChecker = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const pathname = usePathname();
  const isChecking = useSelector(state => state.notification?.isChecking || false);
  const lastCheckRef = useRef(null);

  const checkForMissedContent = useCallback(async () => {
    // Prevent duplicate checks and skip if already checking
    if (!user || pathname === '/missed_just_in' || isChecking) {
      return;
    }

    // Prevent too frequent checks (minimum 30 seconds between checks)
    const now = Date.now();
    if (lastCheckRef.current && (now - lastCheckRef.current) < 30000) {
      console.log('Skipping missed content check - too recent');
      return;
    }

    try {
      dispatch(setIsChecking(true));
      lastCheckRef.current = now;

      console.log('🔍 Checking for missed content...');
      
      // Single API call to get all missed content
      const response = await fetch(`${API_BASE_URL}/api/HeadlineNews/MissedJustIn/${user.uid}?page=1&limit=100`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Count the actual missed content
      const missedCount = data.content ? data.content.length : 0;
      const hasMissed = missedCount > 0;
      
      // Update Redux state
      dispatch(setHasMissedContent(hasMissed));
      dispatch(setMissedContentCount(missedCount));
      
      console.log(`📊 Missed content check complete: ${missedCount} items found`);
      
    } catch (error) {
      console.error('Error checking for missed content:', error);
      // On error, don't change the current state - just log the error
    } finally {
      dispatch(setIsChecking(false));
    }
  }, [user, dispatch, pathname, isChecking]);

  useEffect(() => {
    if (user && pathname !== '/missed_just_in') {
      // Initial check when user logs in
      const timeoutId = setTimeout(() => {
        checkForMissedContent();
      }, 2000); // Small delay to ensure app is fully loaded

      // Set up periodic checking (every 5 minutes)
      const interval = setInterval(checkForMissedContent, 5 * 60 * 1000);

      return () => {
        clearTimeout(timeoutId);
        clearInterval(interval);
      };
    }
  }, [user, checkForMissedContent, pathname]);

  // Check when user returns to the app
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user && pathname !== '/missed_just_in' && !isChecking) {
        // Add a delay to ensure app is fully active
        setTimeout(() => {
          checkForMissedContent();
        }, 1500);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [checkForMissedContent, user, pathname, isChecking]);

  // Check when network comes back online
  useEffect(() => {
    const handleOnline = () => {
      if (user && pathname !== '/missed_just_in' && !isChecking) {
        setTimeout(() => {
          checkForMissedContent();
        }, 2000);
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [checkForMissedContent, user, pathname, isChecking]);

  return { checkForMissedContent };
};

// Component to be added to your main layout
export const MissedContentChecker = () => {
  useMissedContentChecker();
  return null; // This component doesn't render anything
};