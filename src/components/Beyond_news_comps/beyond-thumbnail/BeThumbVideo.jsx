'use client'
import { useState, useEffect } from 'react';
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaRegComment } from "react-icons/fa";
import { BiLike } from "react-icons/bi";
import { IoEyeOutline } from "react-icons/io5";
import { LuDot } from "react-icons/lu";
import { useAuth } from "@/app/(auth)/AuthContext";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

const BeThumbVideo = () => {
    const { user } = useAuth();
    const router = useRouter();
    const [videos, setVideos] = useState([]);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/BeyondVideo`);
                if (response.ok) {
                    const data = await response.json();
                    setVideos(data);
                } else {
                    console.error('Failed to fetch videos');
                }
            } catch (error) {
                console.error('Error fetching videos:', error);
            }
        };

        fetchVideos();
    }, []);

    const handleClick = (videoId) => {
        if (!user) {
            router.push('/login');
        } else {
            router.push(`/beyond_news/nestedvideo/${videoId}`);
        }
    };

    return (
        <>
            {videos.map((video) => (
                <div key={video._id} onClick={() => handleClick(video._id)} className="w-full py-3 cursor-pointer">
                    <div className='relative h-56'>
                        <Image src={video.thumbnailUrl} fill alt={video.title} className="object-cover" />
                    </div>
                    <div className='border border-gray-300-100 pt-2 pr-8 pl-2.5 pb-1 flex justify-between'>
                        <div className="avatar">
                            <div className="w-full h-10 rounded-full">
                                <Image src={video.truepacerUrl} alt="Avatar" width={40} height={40} className="rounded-full" />
                            </div>
                        </div>
                        <div className='w-4/5 font-sans'>
                            <p className='font-semibold text-lg'>{video.title}</p>
                            <div className="flex justify-between text-sm mt-2 text-gray-400">
                                <p className='flex'><LuDot size='1.2em'/>{video.author}</p>
                                <p className='flex'><LuDot size='1.2em'/>{new Date(video.createdAt).toLocaleString()}</p>
                            </div>
                            <div className="flex justify-between text-sm mt-2 text-gray-400">
                                <p className='flex gap-0.5'><FaRegComment size="1.2em"/>{video.commentsCount}</p>
                                <p className='flex gap-0.5'><BiLike size="1.2em"/>{video.likesCount}</p>
                                <p className='flex gap-0.5'><IoEyeOutline size='1.4em'/>{video.viewsCount}</p>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
}

export default BeThumbVideo;