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
import CommentSection from '../CommentSection';
import { setCommentCount } from '@/Redux/Slices/CommentCountSlice';


const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const NestedVidComps = () => {
    const { id } = useParams();
    const router= useRouter()
    const [video, setVideo] = useState(null);
    const dispatch = useDispatch();
    const { user } = useAuth();
    const [isCommentOpen, setIsCommentOpen] = useState(false);
    const isSubscribed = useSelector(state => 
        state.subscriptions[user?.uid]?.[video?.channelId._id] || false
    );
    const commentCount = useSelector(state => state.commentCount[id] || 0);


     useEffect(() => {
        const fetchVideo = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/BeyondVideo/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setVideo(data);
                    // Fetch channel data
                    const channelResponse = await fetch(`${API_BASE_URL}/api/HeadlineNews/Channel/${data.channelId._id}`);
                    if (channelResponse.ok) {
                        const channelData = await channelResponse.json();
                        setVideo(prevVideo => ({
                            ...prevVideo,
                            channelId: {
                                ...prevVideo.channelId,
                                ...channelData
                            }
                        }));
                    }
                    
                    // Fetch the current comment count
                    const commentCountResponse = await fetch(`${API_BASE_URL}/api/HeadlineNews/Comment/${id}/count`);
                    if (commentCountResponse.ok) {
                        const { commentCount: currentCommentCount } = await commentCountResponse.json();
                        dispatch(setCommentCount({ contentId: id, count: currentCommentCount }));
                    }
                } else {
                    console.error('Failed to fetch video');
                }
                if (user) {
                    dispatch(setSubscription({ 
                        userId: user.uid, 
                        channelId: channelData._id, 
                        isSubscribed: user.subscriptions.includes(channelData._id)
                    }));
                }
            } catch (error) {
                console.error('Error fetching video:', error);
            }
        };
    
        if (id) {
            fetchVideo();
        }
    }, [id, dispatch, user]);

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
          const token = await getIdToken();
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
        <div className=" w-full ">{/* bg-red-400*/}
            <div className="">
                <video className="w-full" controls>
                    <source src={video.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div >
            <div className='  py-4 pl-4 pr-6'>{/*bg-green-300 */}
            <h1 className="text-2xl font-bold mb-4">{video.title}</h1>
            <div className="flex items-center mb-4">
    <div className="avatar mr-4">
        <div className="w-10 h-10 rounded-full">
            <img src={video.channelId.picture} alt={video.channelId.name} />
        </div>
    </div>
    <div className="flex-1">
    <Link href={`/truepacer_profile/${video.channelId._id}`}>
        <span className="font-semibold">{video.channelId.name}</span>
        </Link>
        <p className="text-sm text-gray-500">{video.channelId.subscriberCount} subscribers</p>
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
                <FaRegComment className="mr-1" /> {commentCount}
                        </span>
                    <span className="flex items-center"><BiLike className="mr-1" /> {video.likesCount}</span>
                    <span className="flex items-center"><IoEyeOutline className="mr-1" /> {video.viewsCount}</span>
                </div>
            </div>
            </div>
            <CommentSection 
                isOpen={isCommentOpen} 
                onClose={handleCommentClose} 
                contentId={video._id}
                onCommentAdded={handleCommentAdded}
            />
        </div>
        //   {/* Add more components here for comments, related videos, etc. */}
    );
}

export default NestedVidComps;