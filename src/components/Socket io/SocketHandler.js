// components/SocketHandler.js
'use client'
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import socket from './SocketClient';
import { setCommentCount } from '@/Redux/Slices/CommentCountSlice';
import { setViews } from '@/Redux/Slices/ViewsSlice';
import { setLikes } from '@/Redux/Slices/LikesSlice';

export default function SocketHandler() {
  const dispatch = useDispatch();

  useEffect(() => {
    socket.on('videoUpdated', (data) => {
        console.log('Received videoUpdated event:', data);
      if (data.commentCount !== undefined) {
        dispatch(setCommentCount({ contentId: data.videoId, count: data.commentCount }));
      }
      if (data.viewsCount !== undefined) {
        dispatch(setViews({ videoId: data.videoId, views: data.viewsCount }));
      }
      if (data.likesCount !== undefined) {
        dispatch(setLikes({ videoId: data.videoId, likes: data.likesCount }));
        console.log('Dispatched setLikes action');
      }
    });

    // Cleanup function
    return () => {
      socket.off('videoUpdated');
    };
  }, [dispatch]);

  return null; // This component doesn't render anything
}