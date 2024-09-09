'use client'
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FaRegComment } from "react-icons/fa";
import { BiLike } from "react-icons/bi";
import { IoEyeOutline } from "react-icons/io5";
import { useAuth } from '@/app/(auth)/AuthContext';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { setSubscription } from "@/Redux/Slices/SubscriptionSlice";
import { setCommentCount } from '@/Redux/Slices/CommentCountSlice';
import BeyondCommentSection from '../BeyondCommentSection';
import { setLikes } from '@/Redux/Slices/LikesSlice';
import { setViews } from '@/Redux/Slices/ViewsSlice';


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
    const commentCount = useSelector(state => state.commentCount[id] || 0);
    const likes = useSelector(state => state.likes[id] || 0);
    const views = useSelector(state => state.views[id] || 0);




    useEffect(() => {
        const handleView = async () => {
          console.log("Handling view for video:", id);
          if (firebaseUser) {
            try {
              console.log("Fetching token for view count update...");
              const token = await firebaseUser.getIdToken();
              console.log("Token fetched for view:", token.substring(0, 10) + "...");
      
              console.log("Sending view request...");
              const response = await fetch(`${API_BASE_URL}/api/BeyondVideo/${id}/view`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
              });
      
              console.log("View request response status:", response.status);
      
              if (response.ok) {
                const data = await response.json();
                console.log("View response data:", data);
      
                dispatch(setViews({ videoId: id, views: data.viewsCount }));
                // Update local state
                setVideo(prevVideo => ({
                  ...prevVideo,
                  views: data.views,
                  viewsCount: data.viewsCount
                }));
                console.log("View state updated");
              } else {
                const errorData = await response.json();
                console.error("Error response for view:", errorData);
              }
            } catch (error) {
              console.error('Error updating view count:', error);
            }
          } else {
            console.log("User not authenticated, view not recorded");
          }
        };
      
        handleView();
      }, [id, firebaseUser, dispatch]);
    
      const handleLike = async () => {
        console.log("Like button clicked");
        if (firebaseUser) {
          try {
            console.log("Fetching token...");
            const token = await firebaseUser.getIdToken();
            console.log("Token fetched:", token.substring(0, 10) + "...");
            
            console.log("Sending like request...");
            const response = await fetch(`${API_BASE_URL}/api/BeyondVideo/${id}/like`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
            });
            
            console.log("Response status:", response.status);
            
            if (response.ok) {
              const data = await response.json();
              console.log("Like response data:", data);
              
              dispatch(setLikes({ videoId: id, likes: data.likesCount }));
              setVideo(prevVideo => ({
                ...prevVideo,
                likes: data.likes,
                likesCount: data.likesCount
              }));
              console.log("State updated");
            } else {
              const errorData = await response.json();
              console.error("Error response:", errorData);
            }
          } catch (error) {
            console.error('Error updating like count:', error);
          }
        } else {
        //   console.log("User not authenticated, redirecting to login");
        //   router.push('/login');
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
        return <div>Loading...</div>;
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
    
        try {
          const token = await user.getIdToken();
          await fetch(`${API_BASE_URL}/api/BeyondVideo/${video._id}/commentCount`, {
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


    if (!video) {
        return <div>Loading...</div>;
    }

    return (
        <div className="w-full">
        <div className="">
            <video className="w-full" controls>
                <source src={video.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        </div>
        <div className='py-4 pl-4 pr-6'>
            <h1 className="text-2xl font-bold mb-4">{video.title}</h1>
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
                        <FaRegComment className="mr-1" /> {video.commentsCount}
                    </span>
                    <span 
                        className={`flex items-center cursor-pointer ${video.likes?.includes(user?.uid) ? 'text-blue-500' : ''}`} 
                        onClick={handleLike}
                    >
                        <BiLike className="mr-1" /> {likes}
                    </span>
                    <span className="flex items-center">
                        <IoEyeOutline className="mr-1" /> {views}
                    </span>
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