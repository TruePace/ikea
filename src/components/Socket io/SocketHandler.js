// components/SocketHandler.js
'use client'
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import socket from './SocketClient';
import { setCommentCount } from '@/Redux/Slices/CommentCountSlice';
import { setViews } from '@/Redux/Slices/VideoSlice/ViewsSlice';
import { setLikes } from '@/Redux/Slices/VideoSlice/LikesSlice';

export default function SocketHandler() {
  const dispatch = useDispatch();

  useEffect(() => {
    const handleVideoUpdate = (data) => {
      // console.log('Received videoUpdated event:', data);
      if (data.commentCount !== undefined) {
        dispatch(setCommentCount({ contentId: data.videoId, count: data.commentCount ?? 0 }));
      }
      if (data.viewCount !== undefined) {
        dispatch(setViews({
          videoId: data.videoId,
          viewCount: data.viewCount ?? 0,
          avgWatchTime: data.avgWatchTime,
          engagementScore: data.engagementScore,
          viralScore: data.viralScore
        }));
      }
      if (data.likeCount !== undefined) {
        dispatch(setLikes({
          videoId: data.videoId,
          likeCount: data.likeCount ?? 0,
          engagementScore: data.engagementScore,
          viralScore: data.viralScore
        }));
      }
    };

    socket.on('videoUpdated', handleVideoUpdate);
      
    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    return () => {
      socket.off('videoUpdated', handleVideoUpdate);
      socket.off('connect_error');
    };
  }, [dispatch]);

  return null;
}