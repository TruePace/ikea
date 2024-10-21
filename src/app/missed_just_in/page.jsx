'use client'

import React, { useState, useEffect } from 'react';
import Header from "@/components/Beyond_news_comps/beyond-header/Header";
import MissedJustInContainer from "@/components/Missed_just_in_comps/MissedJustInContainer";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";
import { useAuth } from "../(auth)/AuthContext";
import { useDispatch } from 'react-redux';
import { setHasMissedContent, setMissedContentCount } from '@/Redux/Slices/MissedNotificationSlice';
import MissedJustInSkeleton from '@/components/Missed_just_in_comps/MissedJustInSkeleton';
import InfiniteScroll from 'react-infinite-scroll-component';


const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const Page = () => {
  const [missedContent, setMissedContent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useAuth();
  const dispatch = useDispatch()

  const fetchMissedContent = async () => {
    if (user) {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/HeadlineNews/MissedJustIn/${user.uid}?page=${page}&limit=10`);
        const data = await response.json();
        setMissedContent(prevContent => [...prevContent, ...data.content]);
        setHasMore(data.hasMore);
        setPage(prevPage => prevPage + 1);
        dispatch(setHasMissedContent(data.content.length > 0));
        dispatch(setMissedContentCount(prevCount => prevCount + data.content.length));
      } catch (error) {
        console.error('Error fetching missed content:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchMissedContent();
  }, [user]);

  return (
    <ProtectedRoute>
      <Header/>
      <div className="py-8 w-full">
        {isLoading && missedContent.length === 0 ? (
          <MissedJustInSkeleton/>
        ) : missedContent.length > 0 ? (
          <InfiniteScroll
            dataLength={missedContent.length}
            next={fetchMissedContent}
            hasMore={hasMore}
            loader={<MissedJustInSkeleton />}
            endMessage={
              <p style={{ textAlign: 'center' }}>
                <b>You&apos;re all caught up!</b>
              </p>
            }
          >
            {missedContent.map(content => (
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
            ))}
          </InfiniteScroll>
        ) : (
          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded" role="alert">
            <p className="font-bold">Good news!</p>
            <p>You haven&apos;t missed any Just In content. You're all caught up!</p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

export default Page;