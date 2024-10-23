'use client'

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fetchContent } from "@/components/Utils/HeadlineNewsFetch";
import ContentFeed from '@/components/Headline_news_comps/Tabs/Headline_Tabs_Comps/ContentFeed';
import EngagementFeed from '@/components/Headline_news_comps/Tabs/Headline_Tabs_Comps/EngagementFeed';
import SubscribeFeed from '@/components/Headline_news_comps/Tabs/Headline_Tabs_Comps/SubscribeFeed';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const Page = () => {
  const params = useParams();
  const id = params.id;
  const [content, setContent] = useState(null);
  const [channel, setChannel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        // Fetch content first
        const contentData = await fetchContent(id);
        if (!contentData) {
          throw new Error('Content not found');
        }
        setContent(contentData);

        // Then fetch the associated channel
        const channelResponse = await fetch(`${API_BASE_URL}/api/HeadlineNews/Channel/${contentData.channelId}`);
        if (!channelResponse.ok) {
          throw new Error('Failed to fetch channel');
        }
        const channelData = await channelResponse.json();
        setChannel(channelData);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-4">
        <div className="animate-pulse">
          {/* Added skeleton for SubscribeFeed */}
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 bg-gray-200 rounded-full"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="h-64 bg-gray-200 rounded-md mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-4">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!content || !channel) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-yellow-600">Content not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 p-4">
      <div className="mb-4 border-b pb-4">
        <SubscribeFeed channel={channel} />
      </div>
      <ContentFeed content={content} />
      <EngagementFeed content={content} channel={channel} />
    </div>
  );
};

export default Page;