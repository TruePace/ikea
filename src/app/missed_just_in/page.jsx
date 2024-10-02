'use client'

import React, { useState, useEffect } from 'react';
import Header from "@/components/Beyond_news_comps/beyond-header/Header";
import MissedJustInContainer from "@/components/Missed_just_in_comps/MissedJustInContainer";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";
import { useAuth } from "../(auth)/AuthContext";
import { useDispatch } from 'react-redux';
import { setHasMissedContent, setMissedContentCount } from '@/Redux/Slices/MissedNotificationSlice';
import MissedJustInSkeleton from '@/components/Missed_just_in_comps/MissedJustInSkeleton';


const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const Page = () => {
  const [missedContent, setMissedContent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const dispatch = useDispatch()

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      fetch(`${API_BASE_URL}/api/HeadlineNews/MissedJustIn/${user.uid}`)
        .then(response => response.json())
        .then(data => {
          setMissedContent(data);
          setIsLoading(false);
          dispatch(setHasMissedContent(data.length > 0));
          dispatch(setMissedContentCount(data.length));
        })
        .catch(error => {
          console.error('Error fetching missed content:', error);
          setIsLoading(false);
        });
    }
  }, [user, dispatch]);

  return (
    <ProtectedRoute>
      <Header/>
      <div className="py-8 w-full">
        {isLoading ? (
        <MissedJustInSkeleton/>
        ) : missedContent.length > 0 ? (
          missedContent.map(content => (
            <MissedJustInContainer
              key={content._id}
              channelId={content.channelId}
              channelName={content.channelName}
              channelPicture={content.channelPicture}
              message={content.message}
              picture={content.picture}
              createdAt={content.createdAt}
              subscriberCount={content.subscriberCount}
            />
          ))
        ) : (
          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded" role="alert">
            <p className="font-bold">Good news!</p>
            <p>You haven't missed any Just In content. You're all caught up!</p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

export default Page;