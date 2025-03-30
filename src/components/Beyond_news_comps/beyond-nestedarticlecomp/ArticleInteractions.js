'use client'
import React, { useState, useEffect ,useCallback,useRef} from 'react';
import Image from 'next/image';
import { useAuth } from "@/app/(auth)/AuthContext";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { FaRegComment } from "react-icons/fa";
import { BiLike } from "react-icons/bi";
import { IoEyeOutline } from "react-icons/io5";
import { useSelector, useDispatch } from 'react-redux';
import { setSubscription } from "@/Redux/Slices/SubscriptionSlice";
import { setCommentCount } from '@/Redux/Slices/ArticleSlice/CommentCountSlice';
import { setLikes } from '@/Redux/Slices/ArticleSlice/LikesSlice';
import { setViews } from '@/Redux/Slices/ArticleSlice/ViewsSlice';
import CommentSection from './CommentSection';
import { setChannelData } from '@/Redux/Slices/ArticleSlice/ChannelSlice';


const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const SIGNIFICANT_ENGAGEMENT_TIME = 60000; // 1 minutes
const ACTIVITY_TIMEOUT = 30000; // 30 seconds without activity is considered inactive


const ArticleInteractions = ({ article }) => {
    const { user, firebaseUser } = useAuth();
    const router = useRouter();
    const dispatch = useDispatch();
    const [isCommentOpen, setIsCommentOpen] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [readStartTime, setReadStartTime] = useState(null);
    const [hasRecordedView, setHasRecordedView] = useState(false);
    const lastActivityRef = useRef(Date.now());
    const activeTimeRef = useRef(0);
    const activityCheckInterval = useRef(null);

    const isSubscribed = useSelector(state => 
        state.subscriptions[user?.uid]?.[article.channelId._id] || false
    );
    const channelData = useSelector(state => state.channels[article.channelId._id] || {});
    const subscriberCount = channelData.subscriberCount ?? article.channelId.subscriberCount;
    const likes = useSelector(state => state.likesArticle[article._id] ?? article.likesCount);
    const views = useSelector(state => state.viewsArticle[article._id] ?? article.viewsCount);
    const commentCount = useSelector(state => state.commentCountArticle[article._id] ?? article.commentsCount);
    const [imgError, setImgError] = useState(false);


    const handleImageError = () => {
        setImgError(true);
    };

    // Get user's location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                (error) => {
                    console.error("Error getting location:", error);
                }
            );
        }
    }, []);

  useEffect(() => {
    const fetchSubscriberCount = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/HeadlineNews/Channel/${article.channelId._id}`);
            if (response.ok) {
                const data = await response.json();
                dispatch(setChannelData({ channelId: article.channelId._id, data: { subscriberCount: data.subscriberCount } }));
            }
        } catch (error) {
            console.error('Error fetching subscriber count:', error);
        }
    };

    fetchSubscriberCount();
}, [article.channelId._id, dispatch]);


 /// Track user activity and engagement
 useEffect(() => {
    setReadStartTime(Date.now());
    lastActivityRef.current = Date.now();
    let startTime = Date.now();

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    
    const handleActivity = () => {
        const now = Date.now();
        const timeSinceLastActivity = now - lastActivityRef.current;
        
        // If user was inactive and is now active again, update the start time
        if (timeSinceLastActivity > ACTIVITY_TIMEOUT) {
            startTime = now;
        }
        
        lastActivityRef.current = now;
    };

    // Add activity event listeners
    activityEvents.forEach(event => {
        document.addEventListener(event, handleActivity);
    });

    // Check for significant engagement every second
    activityCheckInterval.current = setInterval(() => {
        const now = Date.now();
        const timeSinceLastActivity = now - lastActivityRef.current;

        // Only count time if user is active
        if (timeSinceLastActivity < ACTIVITY_TIMEOUT) {
            activeTimeRef.current = now - startTime;

            // If we've reached significant engagement time and haven't recorded the view
            if (activeTimeRef.current >= SIGNIFICANT_ENGAGEMENT_TIME && !hasRecordedView) {
                handleSignificantEngagement();
            }
        } else {
            // User is inactive, update start time for when they return
            startTime = now;
        }
    }, 1000);

    return () => {
        clearInterval(activityCheckInterval.current);
        activityEvents.forEach(event => {
            document.removeEventListener(event, handleActivity);
        });
    };
}, [article._id]);

const handleSignificantEngagement = useCallback(async () => {
    if (!firebaseUser || !article._id || hasRecordedView) return;

    try {
        const token = await firebaseUser.getIdToken();
        const response = await fetch(`${API_BASE_URL}/api/BeyondArticle/${article._id}/view`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
                location: userLocation,
                duration: Math.floor(activeTimeRef.current / 1000) // Convert to seconds
            })
        });

        if (response.ok) {
            const data = await response.json();
            dispatch(setViews({ contentId: article._id, views: data.viewsCount }));
            setHasRecordedView(true);
        }
    } catch (error) {
        console.error('Error recording significant engagement:', error);
    }
}, [firebaseUser, article._id, userLocation, dispatch, hasRecordedView]);



 

  const handleLike = async () => {
    if (firebaseUser) {
        try {
            const token = await firebaseUser.getIdToken();
            const response = await fetch(`${API_BASE_URL}/api/BeyondArticle/${article._id}/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ location: userLocation })
            });

            if (response.ok) {
                const data = await response.json();
                dispatch(setLikes({ contentId: article._id, likes: data.likesCount }));
            }
        } catch (error) {
            console.error('Error updating like count:', error);
        }
    } else {
        router.push('/login');
    }
};


  const handleSubscribe = async () => {
    if (!user) {
        router.push('/login');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/HeadlineNews/Channel/${article.channelId._id}/subscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: user.uid }),
        });

        if (response.ok) {
            const data = await response.json();
            dispatch(setSubscription({ userId: user.uid, channelId: article.channelId._id, isSubscribed: true }));
            dispatch(setChannelData({ channelId: article.channelId._id, data: { subscriberCount: data.subscriberCount } }));
        }
    } catch (error) {
        console.error('Error subscribing:', error);
    }
};

const handleUnsubscribe = async () => {
    if (!user) {
        router.push('/login');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/HeadlineNews/Channel/${article.channelId._id}/unsubscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: user.uid }),
        });

        if (response.ok) {
            const data = await response.json();
            dispatch(setSubscription({ userId: user.uid, channelId: article.channelId._id, isSubscribed: false }));
            dispatch(setChannelData({ channelId: article.channelId._id, data: { subscriberCount: data.subscriberCount } }));
        }
    } catch (error) {
        console.error('Error subscribing:', error);
    }
};

    const handleCommentClick = () => {
        setIsCommentOpen(true);
    };

    const handleCommentClose = () => {
        setIsCommentOpen(false);
    };

    const handleCommentAdded = async (newCommentCount) => {
        dispatch(setCommentCount({ contentId: article._id, count: newCommentCount }));

        try {
            const token = await user.getIdToken();
            await fetch(`${API_BASE_URL}/api/BeyondArticle/${article._id}/commentCount`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ commentCount: newCommentCount })
            });
        } catch (error) {
            console.error('Error updating comment count:', error);
        }
    };

    return (
        <div >
        <div className="flex justify-between items-center mb-4 dark:text-gray-200">
            <div className="relative w-10 h-10 mr-2">
                <div className="w-full h-full rounded-full overflow-hidden relative">
                    <Image
                        src={imgError ? '/fallback-avatar.png' : article.channelId.picture}
                        alt={article.channelId.name}
                        fill
                        sizes="40px"
                        className="object-cover rounded-full"
                        onError={handleImageError}
                        priority
                    />
                </div>
            </div>
            <div className="flex-1">
                <Link href={`/truepacer_profile/${article.channelId?._id}`}>
                    <span className="font-semibold">{article.channelId?.name}</span>
                </Link>
                <p className="text-sm text-gray-500 dark:text-gray-200">{subscriberCount} subscribers</p>
            </div>
            {!isSubscribed ? (
                <button 
                    className="btn btn-sm bg-red-600 text-white hover:bg-red-700"
                    onClick={handleSubscribe}
                >
                    Subscribe
                </button>
            ) : (
                <button 
                    className="btn btn-sm bg-gray-200 text-black hover:bg-gray-300"
                    onClick={handleUnsubscribe}
                >
                    Subscribed
                </button>
            )}
        </div>
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-200 mb-4">
            <div className="flex space-x-4">
                    <span className="flex items-center cursor-pointer" onClick={handleCommentClick}>
                        <FaRegComment className="mr-1" />
                      {/* {article.commentsCount} */}
                      {commentCount}
                    </span>
                    <div key={likes}>
                    <span 
                        className={`flex items-center cursor-pointer ${article.likes?.includes(user?.uid) ? 'text-blue-500' : ''}`} 
                        onClick={handleLike}
                    >
                        <BiLike className="mr-1" /> 
                        {/* {likes[article._id] || article.likesCount} */}
                        {likes}
                    </span>
                    </div>
                    <span className="flex items-center">
                        <IoEyeOutline className="mr-1" /> 
                        {views}
                        {/* {views[article._id] || article.viewsCount} */}
                    </span>
                </div>
            </div>
            <CommentSection
                isOpen={isCommentOpen}
                onClose={handleCommentClose}
                articleId={article._id}
                onCommentAdded={handleCommentAdded}
            />
        </div>
    );
};

export default ArticleInteractions; 