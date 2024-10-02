'use client'
import { useState, useEffect } from 'react';
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaRegComment, FaPlay } from "react-icons/fa";
import { BiLike } from "react-icons/bi";
import { IoEyeOutline } from "react-icons/io5";
import { LuDot } from "react-icons/lu";
import { useAuth } from "@/app/(auth)/AuthContext";
import { useSelector ,useDispatch} from 'react-redux';
import { setCommentCount } from '@/Redux/Slices/CommentCountSlice';
import { setLikes } from '@/Redux/Slices/VideoSlice/LikesSlice';
import { setViews } from '@/Redux/Slices/VideoSlice/ViewsSlice';
import socket from '@/components/Socket io/SocketClient';
import { formatDate } from '@/components/Utils/DateFormat';
import TruncateText from './TruncateText';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const BeThumbVideo = () => {
    const { user ,firebaseUser} = useAuth();
    const router = useRouter();
    const [videos, setVideos] = useState([]);
    const [clickedId, setClickedId] = useState(null);
    const dispatch = useDispatch();
    const commentCounts = useSelector(state => state.commentCount);
    const likes = useSelector(state => state.likes);
    const views = useSelector(state => state.views);

     useEffect(() => {
        socket.on('videoUpdated', (data) => {
            if (data.commentCount) dispatch(setCommentCount({ contentId: data.videoId, count: data.commentCount }));
            if (data.likeCount) dispatch(setLikes({ videoId: data.videoId, likeCount: data.likeCount, engagementScore: data.engagementScore, viralScore: data.viralScore }));
            if (data.viewCount) dispatch(setViews({ videoId: data.videoId, viewCount: data.viewCount, avgWatchTime: data.avgWatchTime, engagementScore: data.engagementScore, viralScore: data.viralScore }));
        });

        return () => {
            socket.off('videoUpdated');
        };
    }, [dispatch]);

    
    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/BeyondVideo`);
                if (response.ok) {
                    const data = await response.json();
                    setVideos(data);
                    // Fetch initial comment count for each video
                    data.forEach(video => fetchInitialCommentCount(video._id));
                } else {
                    console.error('Failed to fetch videos');
                }
            } catch (error) {
                console.error('Error fetching videos:', error);
            }
        };

        const fetchInitialCommentCount = async (videoId) => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/BeyondVideo/${videoId}/count`);
                if (response.ok) {
                    const data = await response.json();
                    dispatch(setCommentCount({ contentId: videoId, count: data.commentCount }));
                }
            } catch (error) {
                console.error('Error fetching initial comment count:', error);
            }
        };



        fetchVideos();
    }, [dispatch]);

    const handleClick = async (videoId) => {
        setClickedId(videoId);
        if (firebaseUser) {
          try {
            const token = await firebaseUser.getIdToken();
            await fetch(`${API_BASE_URL}/api/history/add`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                contentType: 'video',
                contentId: videoId,
                duration: 0 // This will be updated later when the user actually watches the video
              })
            });
          } catch (error) {
            console.error('Error adding video to history:', error);
          }
        }
        setTimeout(() => {
          if (!user) {
            router.push('/login');
          } else {
            router.push(`/beyond_news/nestedvideo/${videoId}`);
          }
        }, 100);
      };

    return (
        <>
                 {videos.map((video) => (
                <div
                    key={video._id}
                    onClick={() => handleClick(video._id)}
                    className={`w-full py-3 cursor-pointer transition-all duration-150 ${
                        clickedId === video._id ? 'scale-95 opacity-80' : ''
                    }`}
                >
                    <div className='relative h-56'>
                        <Image src={video.thumbnailUrl} fill alt={video.title} className="object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                            <FaPlay className="text-white text-4xl" />
                        </div>
                    </div>
                    <div className='border border-gray-300-100 pt-2 pr-8 pl-2.5 pb-1 flex justify-between'>
                        <div className="avatar">
                            <div className="w-full h-10 rounded-full">
                                <Image 
                                    src={video.channelId?.picture || '/NopicAvatar.png'} 
                                    alt={video.channelId?.name || 'Channel'} 
                                    width={40} 
                                    height={40} 
                                    className="rounded-full" 
                                />
                            </div>
                        </div>
                        <div className='w-4/5 font-sans'>

                            <p className='font-semibold text-lg'>
                            <TruncateText text={video.title} maxLength={25} /></p>

                            <div className="flex justify-between text-sm mt-2 text-gray-400">
                                <p className='flex'><LuDot size='1.2em'/>{video.channelId?.name || 'not show'}</p>
                                <p className='flex'><LuDot size='1.2em'/>{formatDate(video.createdAt)}</p>
                            </div>
                         <div className="flex justify-between text-sm mt-2 text-gray-400">
                        <p className='flex gap-0.5'>
                            <FaRegComment size="1.2em"/>
                            {commentCounts[video._id] || video.commentCount}
                        </p>
                        <p className='flex gap-0.5'>
                            <BiLike size="1.2em"/>
                            {likes[video._id]?.likeCount || video.likeCount}
                        </p>
                        <p className='flex gap-0.5'>
                            <IoEyeOutline size='1.4em'/>
                            {views[video._id]?.viewCount || video.viewCount}
                        </p>
                    </div>
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
}

export default BeThumbVideo;