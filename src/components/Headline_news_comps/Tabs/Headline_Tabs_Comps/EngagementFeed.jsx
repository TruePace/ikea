import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { FaRegComment } from "react-icons/fa";
import { IoEyeOutline } from "react-icons/io5";
import CommentSection from "./SubFeedComps/CommentSection";
import { useAuth } from "@/app/(auth)/AuthContext";
import { setCommentCount } from '../../../../Redux/Slices/CommentCountSlice';
import { auth } from "@/app/(auth)/firebase/ClientApp";
import socket from "@/components/Socket io/SocketClient";
import { setContentInteractions } from "@/Redux/Slices/ContentInteractions";
import ShareComponent from "@/components/Headline_news_comps/Tabs/Headline_Tabs_Comps/SubFeedComps/ShareComponent";
import ScreenshotButton from "./ScreenshotButton";
import LikeDislikeButtons from "./SubFeedComps/LikeDislikeButtons";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const EngagementFeed = ({ content, channel }) => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  
  // Get Redux state with proper error handling
  const reduxInteractions = useSelector(state => {
    try {
      return state.contentInteractions?.[content._id] || null;
    } catch (error) {
      console.error('Error accessing Redux state:', error);
      return null;
    }
  });

  // Always show initial values immediately, update when Redux state changes
  const interactions = {
    likeCount: reduxInteractions?.likeCount ?? content.likeCount ?? 0,
    dislikeCount: reduxInteractions?.dislikeCount ?? content.dislikeCount ?? 0,
    shareCount: reduxInteractions?.shareCount ?? content.shareCount ?? 0,
    screenshotCount: reduxInteractions?.screenshotCount ?? content.screenshotCount ?? 0,
    viewCount: reduxInteractions?.viewCount ?? content.viewCount ?? 0,
    userInteractions: reduxInteractions?.userInteractions ?? {}
  };
  
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const commentCount = useSelector(state => state.commentCount[content._id] || content.commentCount || 0);
  const [userLocation, setUserLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef(null);
  const observerRef = useRef(null);
  const viewedRef = useRef(false);
  
  const userInteraction = user && interactions.userInteractions ? interactions.userInteractions[user.uid] || {} : {};
  const activeButton = userInteraction.activeButton;

  // Initialize Redux state on mount - only once per content
  useEffect(() => {
    if (!reduxInteractions) {
      dispatch(setContentInteractions({
        contentId: content._id,
        likeCount: content.likeCount,
        dislikeCount: content.dislikeCount,
        shareCount: content.shareCount,
        screenshotCount: content.screenshotCount,
        viewCount: content.viewCount,
        userInteractions: {}
      }));
    }
  }, [content._id, reduxInteractions, dispatch]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation(`${latitude},${longitude}`);
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    }
  }, []);

  useEffect(() => {
    socket.on('updateContentInteractions', (data) => {
      if (user) {
        dispatch(setContentInteractions({
          ...data,
          userId: user.uid
        }));
      }
    });

    return () => {
      socket.off('updateContentInteractions');
    };
  }, [dispatch, user]);

  const handleView = useCallback(() => {
    if (user && !viewedRef.current) {
      recordAction('view');
      viewedRef.current = true;
    }
  }, [user]);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.5 }
    );

    const currentElement = observerRef.current;
    const elementToObserve = document.getElementById(`engagement-feed-${content._id}`);

    if (currentElement && elementToObserve) {
      currentElement.observe(elementToObserve);
    }

    return () => {
      if (currentElement) {
        currentElement.disconnect();
      }
    };
  }, [content._id]);

  useEffect(() => {
    if (isVisible && !viewedRef.current) {
      // Keep the 20 seconds as requested
      timerRef.current = setTimeout(() => {
        handleView();
      }, 20000);
    } else {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isVisible, handleView]);

  useEffect(() => {
    if (user && content._id) {
      fetchUserInteraction();
    }
  }, [user, content._id]);

  const fetchUserInteraction = async () => {
    if (!user) return;

    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/api/HeadlineNews/Content/${content._id}/userInteraction`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user interaction');
      }

      const data = await response.json();
      dispatch(setContentInteractions({
        contentId: content._id,
        userId: user.uid,
        userInteractions: { [user.uid]: data }
      }));
    } catch (error) {
      console.error('Error fetching user interaction:', error);
    }
  };

  const recordAction = async (action) => {
    if (!user) {
      setError("You must be logged in to perform this action.");
      return;
    }

    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/api/HeadlineNews/Content/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          contentId: content._id,
          userId: user.uid,
          action,
          location: userLocation
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to record action');
      }

      const data = await response.json();
      dispatch(setContentInteractions({
        contentId: content._id,
        userId: user.uid,
        ...data
      }));
    } catch (error) {
      console.error('Error recording action:', error);
      setError(`Failed to record ${action}. Please try again later.`);
    }
  };

  const handleShare = async (platform) => {
    if (user) {
      try {
        await recordAction('share', { platform });
      } catch (error) {
        console.error('Error recording share action:', error);
      }
    }
  };

  const fetchCommentCount = useCallback(async () => {
    try {
      let token = null;
      let headers = {};
      
      if (user) {
        token = await auth.currentUser.getIdToken();
        headers = { 'Authorization': `Bearer ${token}` };
      }
      
      const response = await fetch(`${API_BASE_URL}/api/HeadlineNews/Comment/${content._id}/count`, {
        headers
      });
      
      if (!response.ok) {
        // If auth fails but we have a fallback count, use it
        if (content.commentCount !== undefined) {
          dispatch(setCommentCount({ contentId: content._id, count: content.commentCount }));
          return;
        }
        throw new Error('Failed to fetch comment count');
      }
      
      const data = await response.json();
      dispatch(setCommentCount({ contentId: content._id, count: data.commentCount }));
    } catch (error) {
      console.error("Error fetching comment count:", error);
      // Use fallback from content props if available
      if (content.commentCount !== undefined) {
        dispatch(setCommentCount({ contentId: content._id, count: content.commentCount }));
      }
    }
  }, [content._id, content.commentCount, dispatch, user]);

  useEffect(() => {
    fetchCommentCount();
  }, [fetchCommentCount]);

  const handleCommentClick = (e) => {
    e.preventDefault();
    setIsCommentOpen(true);
  };

  const handleCommentAdded = (newCount) => {
    dispatch(setCommentCount({ contentId: content._id, count: newCount }));
  };

  return (
    <>
      <div id={`engagement-feed-${content._id}`}>
        <div className="w-full flex mt-7 justify-between text-gray-500 text-sm text-center dark:text-gray-200">
          <div className="flex justify-between w-1/4">
            <LikeDislikeButtons 
              contentId={content._id}
              initialLikes={interactions.likeCount}
              initialDislikes={interactions.dislikeCount}
              initialUserInteraction={activeButton}
              onInteraction={async (action) => {
                await recordAction(action);
              }}
            />
          </div>
          
          <button onClick={handleCommentClick} className="h-12">
            <FaRegComment size='1.6em' className="m-auto" />
            <p className="text-xs">({commentCount})</p>
          </button>
          
          <ShareComponent 
            contentId={content._id} 
            onShare={handleShare} 
            shareCount={interactions.shareCount}
          />

          <ScreenshotButton content={content} channel={channel} />

          <button className="h-12">
            <IoEyeOutline size='1.6em' className="m-auto" />
            <p className="text-xs">({interactions.viewCount})</p>
          </button>
        </div>
        
        <CommentSection
          isOpen={isCommentOpen}
          onClose={() => setIsCommentOpen(false)}
          contentId={content._id}
          onCommentAdded={handleCommentAdded}
        />
      </div>
    </>
  );
}

export default EngagementFeed;