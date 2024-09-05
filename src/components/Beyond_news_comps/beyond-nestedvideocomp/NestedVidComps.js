'use client'
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FaRegComment } from "react-icons/fa";
import { BiLike } from "react-icons/bi";
import { IoEyeOutline } from "react-icons/io5";
import Image from "next/image";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const NestedVidComps = () => {
    const { id } = useParams();
    const [video, setVideo] = useState(null);

    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/BeyondVideo/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setVideo(data);
                } else {
                    console.error('Failed to fetch video');
                }
            } catch (error) {
                console.error('Error fetching video:', error);
            }
        };

        if (id) {
            fetchVideo();
        }
    }, [id]);

    if (!video) {
        return <div>Loading...</div>;
    }

    return (
        <div className=" w-full bg-red-400">
            <div className="">
                <video className="w-full" controls>
                    <source src={video.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div >
            <div className=' bg-green-300 py-4 px-4'>
            <h1 className="text-2xl font-bold mb-4">{video.title}</h1>
            <div className="flex items-center mb-4">
                <div className="avatar mr-4">
                    <div className="w-10 h-10 rounded-full">
                        <img src={video.truepacerUrl} alt={video.author} />
                    </div>
                </div>
                <span className="font-semibold">{video.author}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500 mb-4">
                <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                <div className="flex space-x-4">
                    <span className="flex items-center"><FaRegComment className="mr-1" /> {video.commentsCount}</span>
                    <span className="flex items-center"><BiLike className="mr-1" /> {video.likesCount}</span>
                    <span className="flex items-center"><IoEyeOutline className="mr-1" /> {video.viewsCount}</span>
                </div>
            </div>
            </div>
        </div>
        //   {/* Add more components here for comments, related videos, etc. */}
    );
}

export default NestedVidComps;