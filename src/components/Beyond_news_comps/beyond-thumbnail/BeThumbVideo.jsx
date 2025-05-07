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

const BeThumbVideo = ({video}) => {
    const { user ,firebaseUser} = useAuth();
    const router = useRouter();
   
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

         // Navigate to video page based on auth status 
    //     setTimeout(() => {
    //       if (!user) {
    //         router.push('/login');
    //       } else {
    //         router.push(`/beyond_news/nestedvideo/${videoId}`);
    //       }
    //     }, 100);
    //   };


  // Navigate to video page regardless of auth status
  setTimeout(() => {
    router.push(`/beyond_news/nestedvideo/${videoId}`);
}, 100);
};
 

      return (
        <div
            key={video._id}
            onClick={() => handleClick(video._id)}
            className={`w-full cursor-pointer transition-all duration-150 
                border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md
                ${clickedId === video._id ? 'scale-95 opacity-80' : ''}
            `}
        >
            <div className='relative h-40 tablet:h-48 desktop:h-56'>
                <Image src={video.thumbnailUrl} fill alt={video.title} className="object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <FaPlay className="text-white text-4xl" />
                </div>
            </div>
            <div className='p-4'>
                <div className="flex items-start">
                    <div className="avatar mr-2">
                        <div className="w-10 h-10 rounded-full">
                            <Image 
                                src={video.channelId?.picture || '/NopicAvatar.png'} 
                                alt={video.channelId?.name || 'Channel'} 
                                width={40} 
                                height={40} 
                                className="rounded-full" 
                            />
                        </div>
                    </div>
                    <div className='flex-grow'>
                        <p className='font-semibold text-base tablet:text-lg mb-1 dark:text-gray-200'>
                            <TruncateText text={video.title} maxLength={25} />
                        </p>
                        <div className="flex flex-wrap text-sm mb-2 text-gray-400 ">
                            <p className='flex items-center mr-2 '><LuDot size='1.2em'/>{video.channelId?.name || 'not show'}</p>
                            <p className='flex items-center'><LuDot size='1.2em'/>{formatDate(video.createdAt)}</p>
                        </div>
                        <div className="flex justify-between text-sm text-gray-400">
                            <p className='flex items-center gap-0.5'>
                                <FaRegComment size="1.2em"/>
                                {commentCounts[video._id] || video.commentCount}
                            </p>
                            <p className='flex items-center gap-0.5'>
                                <BiLike size="1.2em"/>
                                {likes[video._id]?.likeCount || video.likeCount}
                            </p>
                            <p className='flex items-center gap-0.5'>
                                <IoEyeOutline size='1.4em'/>
                                {views[video._id]?.viewCount || video.viewCount}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BeThumbVideo;