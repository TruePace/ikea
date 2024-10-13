'use client'
import React, { useState, useEffect,useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FaRegComment } from "react-icons/fa";
import { BiLike,BiSolidLike } from "react-icons/bi";
import { IoEyeOutline } from "react-icons/io5";
import { useAuth } from '@/app/(auth)/AuthContext';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { setSubscription } from "@/Redux/Slices/SubscriptionSlice";
import socket from '@/components/Socket io/SocketClient';
import { setCommentCount } from '@/Redux/Slices/CommentCountSlice';
import BeyondCommentSection from './BeyondNestedCommentSection';
import { setLikes } from '@/Redux/Slices/VideoSlice/LikesSlice';
import { setViews } from '@/Redux/Slices/VideoSlice/ViewsSlice';
import NestedSkeletonLoader from '../beyond-header/NestedSkeletonLoader';
import ShareVideoComp from './ShareVideoComp';



const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const NestedVidComps = () => {
    const { id } = useParams();
    const router = useRouter();
    const [video, setVideo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const dispatch = useDispatch();
    const { user, firebaseUser } = useAuth();
    const [isCommentOpen, setIsCommentOpen] = useState(false);
    const isSubscribed = useSelector(state => 
        state.subscriptions[user?.uid]?.[video?.channelId?._id] || false
    );
   

    const commentCounts = useSelector(state => state.commentCount);
    const likes = useSelector(state => state.likes);
    const views = useSelector(state => state.views);
    const [watchStartTime, setWatchStartTime] = useState(null);
    const [location, setLocation] = useState(null);
    const [viewCounted, setViewCounted] = useState(false);
     const [totalWatchDuration, setTotalWatchDuration] = useState(0);
     const [viewTimer, setViewTimer] = useState(null);




     useEffect(() => {
        const fetchInitialData = async () => {
          try {
            const response = await fetch(`${API_BASE_URL}/api/BeyondVideo/${id}`);
            if (response.ok) {
              const data = await response.json();
              dispatch(setCommentCount({ contentId: id, count: data.commentCount }));
              dispatch(setViews({ 
                videoId: id, 
                viewCount: data.viewCount, 
                avgWatchTime: data.avgWatchTime,
                engagementScore: data.engagementScore,
                viralScore: data.viralScore
              }));
              dispatch(setLikes({ 
                videoId: id, 
                likeCount: data.likeCount,
                engagementScore: data.engagementScore,
                viralScore: data.viralScore,
                isLiked: data.likes.includes(user?.uid)
              }));
            }
          } catch (error) {
            console.error('Error fetching initial data:', error);
          }
        };
      
        if (id) {
          fetchInitialData();
        }
      }, [id, dispatch, user]);



  useEffect(() => {
    socket.on('videoUpdated', (data) => {
        console.log(data)
      if (data.commentCount) dispatch(setCommentCount({ contentId: data.videoId, count: data.commentCount }));
      if (data.likesCount) dispatch(setLikes({ videoId: data.videoId, likes: data.likesCount }));
      if (data.viewsCount) dispatch(setViews({ videoId: data.videoId, views: data.viewsCount }));
    });
  
    return () => {
      socket.off('videoUpdated');
    };
  }, [dispatch]);
  


  useEffect(() => {
    const fetchInitialCommentCount = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/BeyondVideo/${id}/count`);
        if (response.ok) {
          const data = await response.json();
          dispatch(setCommentCount({ contentId: id, count: data.commentCount }));
        }
      } catch (error) {
        console.error('Error fetching initial comment count:', error);
      }
    };
  
    fetchInitialCommentCount();
  }, [id, dispatch]);
  

  

  useEffect(() => {
    // Get approximate location when component mounts
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation(`${position.coords.latitude},${position.coords.longitude}`);
            },
            (error) => {
                console.error("Error getting location:", error);
                setLocation("Unknown");
            }
        );
    } else {
        setLocation("Geolocation not supported");
    }
}, []);

const handleVideoPlay = () => {
    console.log('Video started playing');
    setWatchStartTime(Date.now());
    if (!viewCounted) {
        const timer = setTimeout(() => {
            const currentWatchDuration = (Date.now() - watchStartTime) / 1000;
            handleView(currentWatchDuration);
            setViewCounted(true);
        }, 10000); // 10 seconds
        setViewTimer(timer);
    }
};

const handleVideoPause = () => {
    console.log('Video paused');
    if (viewTimer) {
        clearTimeout(viewTimer);
        setViewTimer(null);
    }
    if (watchStartTime) {
        const currentWatchDuration = (Date.now() - watchStartTime) / 1000;
        setTotalWatchDuration(prevDuration => prevDuration + currentWatchDuration);
        setWatchStartTime(null);
        if (viewCounted) {
            handleView(currentWatchDuration);
        }
    }
};

const handleVideoEnded = () => {
    console.log('Video ended');
    handleVideoPause();
};

const handleView = async (watchDuration) => {
    if (firebaseUser) {
        try {
            const token = await firebaseUser.getIdToken();
            const response = await fetch(`${API_BASE_URL}/api/BeyondVideo/${id}/view`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    watchDuration,
                    deviceInfo: navigator.userAgent,
                    location
                })
            });

            if (response.ok) {
                const data = await response.json();
                dispatch(setViews({ 
                    videoId: id, 
                    viewCount: data.viewCount, 
                    avgWatchTime: data.avgWatchTime,
                    engagementScore: data.engagementScore,
                    viralScore: data.viralScore
                }));
            } else {
                console.error('Server responded with an error:', await response.text());
            }
        } catch (error) {
            console.error('Error updating view count:', error);
        }
    }
};


const handleLike = async () => {
    if (firebaseUser) {
        try {
            const token = await firebaseUser.getIdToken();
            const response = await fetch(`${API_BASE_URL}/api/BeyondVideo/${id}/likevideo`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    deviceInfo: navigator.userAgent,
                    location: location
                })
            });

            if (response.ok) {
                const data = await response.json();
                dispatch(setLikes({ 
                    videoId: id, 
                    likeCount: data.likeCount,
                    engagementScore: data.engagementScore,
                    viralScore: data.viralScore,
                    isLiked: data.isLiked
                }));
            }
        } catch (error) {
            console.error('Error updating like count:', error);
        }
    } else {
        router.push('/login');
    }
};


   useEffect(() => {
        const fetchVideo = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_BASE_URL}/api/BeyondVideo/${id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch video');
                }
                const data = await response.json();
                setVideo(data);
                
                // Fetch channel data
                const channelResponse = await fetch(`${API_BASE_URL}/api/HeadlineNews/Channel/${data.channelId._id}`);
                if (!channelResponse.ok) {
                    throw new Error('Failed to fetch channel data');
                }
                const channelData = await channelResponse.json();
                setVideo(prevVideo => ({
                    ...prevVideo,
                    channelId: {
                        ...prevVideo.channelId,
                        ...channelData
                    }
                }));
                
                if (user) {
                    dispatch(setSubscription({ 
                        userId: user.uid, 
                        channelId: data.channelId._id, 
                        isSubscribed: user.subscriptions?.includes(data.channelId._id) || false
                    }));
                }
            } catch (error) {
                console.error('Error fetching video:', error);
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchVideo();
        }
    }, [id, dispatch, user]);
    if (isLoading) {
        return <NestedSkeletonLoader  type="video"/>
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!video) {
        return <div>No video found</div>;
    }




    const handleSubscribe = async () => {
        if (!user) {
            router.push('/login');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/HeadlineNews/Channel/${video.channelId._id}/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: user.uid }),
            });

            if (response.ok) {
                const data = await response.json();
                dispatch(setSubscription({ userId: user.uid, channelId: video.channelId._id, isSubscribed: true }));
                setVideo(prevVideo => ({
                    ...prevVideo,
                    channelId: {
                        ...prevVideo.channelId,
                        subscriberCount: data.subscriberCount
                    }
                }));
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
            const response = await fetch(`${API_BASE_URL}/api/HeadlineNews/Channel/${video.channelId._id}/unsubscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: user.uid }),
            });

            if (response.ok) {
                const data = await response.json();
                dispatch(setSubscription({ userId: user.uid, channelId: video.channelId._id, isSubscribed: false }));
                setVideo(prevVideo => ({
                    ...prevVideo,
                    channelId: {
                        ...prevVideo.channelId,
                        subscriberCount: data.subscriberCount
                    }
                }));
            }
        } catch (error) {
            console.error('Error unsubscribing:', error);
        }
    };

    const handleShare = async (platform) => {
        if (firebaseUser) {
            try {
                const token = await firebaseUser.getIdToken();
                const response = await fetch(`${API_BASE_URL}/api/BeyondVideo/${id}/share`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        platform,
                        deviceInfo: navigator.userAgent,
                        location: location
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    setVideo(prevVideo => ({
                        ...prevVideo,
                        shareCount: data.shareCount
                    }));
                }
            } catch (error) {
                console.error('Error updating share count:', error);
            }
        } else {
            router.push('/login');
        }
    };

    const handleCommentClick = () => {
        setIsCommentOpen(true);
    };

    const handleCommentClose = () => {
        setIsCommentOpen(false);
    };

    const handleCommentAdded = async (newCommentCount) => {
        setVideo(prevVideo => ({
          ...prevVideo,
          commentsCount: newCommentCount
        }));
    
        dispatch(setCommentCount({ contentId: video._id, count: newCommentCount }));
    };


    if (!video) {
        return <NestedSkeletonLoader  type="video"/>
    }

    return (
        <div className="w-full">
        <div className="">
       <video 
    className="w-full" 
    controls
    autoPlay
    onPlay={handleVideoPlay}
    onPause={handleVideoPause}
    onEnded={handleVideoEnded}
>
    <source src={video.videoUrl} type="video/mp4" />
    Your browser does not support the video tag.
</video>
        </div>
        <div className='py-4 pl-4 pr-6'>
            <h1 className="text-2xl font-bold mb-4">{video.title}</h1>
             {/* Add this section to display tags */}
             <div className="mb-4">
                    {video.tags && video.tags.map((tag, index) => (
                        <span key={index} className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                            #{tag}
                        </span>
                    ))}
                </div>
            <div className="flex items-center mb-4">
                <div className="avatar mr-4">
                    <div className="w-10 h-10 rounded-full">
                        <img src={video.channelId?.picture} alt={video.channelId?.name} />
                    </div>
                </div>
                <div className="flex-1">
                    <Link href={`/truepacer_profile/${video.channelId?._id}`}>
                        <span className="font-semibold">{video.channelId?.name}</span>
                    </Link>
                    <p className="text-sm text-gray-500">{video.channelId?.subscriberCount} subscribers</p>
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
            <div className="flex justify-between text-sm text-gray-500 mb-4">
                <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                <div className="flex space-x-4">
                    <span className="flex items-center cursor-pointer" onClick={handleCommentClick}>
                        <FaRegComment className="mr-1" />
                       
                        {/* {commentCounts[video._id] || video.commentsCount} */}
                        {commentCounts[video._id] ?? video.commentsCount ?? 0}
                    </span>
                    <div key={likes}>
                    <span 
    className={`flex items-center cursor-pointer ${likes[video._id]?.isLiked ? 'text-blue-500' : ''}`} 
    onClick={handleLike}
>
    {likes[video._id]?.isLiked ? <BiSolidLike className="mr-1" /> : <BiLike className="mr-1" />}
    {/* {likes[video._id]?.likeCount || video.likeCount} */}
    {likes[video._id]?.likeCount ?? video.likeCount ?? 0}
</span>
                    </div>
                    <span className="flex items-center">
    <IoEyeOutline className="mr-1" /> 
    {/* {views[video._id]?.viewCount || video.viewsCount} */}
    {views[video._id]?.viewCount ?? video.viewsCount ?? 0}
</span>
<ShareVideoComp video={video} onShare={handleShare}/>
                </div>
            </div>
        </div>
        <BeyondCommentSection
            isOpen={isCommentOpen} 
            onClose={handleCommentClose} 
            videoId={video._id}
            onCommentAdded={handleCommentAdded}
        />
    </div>
);
}

export default NestedVidComps;