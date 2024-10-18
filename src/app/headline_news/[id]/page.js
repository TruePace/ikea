'use client'

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fetchContent } from "@/components/Utils/HeadlineNewsFetch";
import ContentFeed from '@/components/Headline_news_comps/Tabs/Headline_Tabs_Comps/ContentFeed';
import EngagementFeed from '@/components/Headline_news_comps/Tabs/Headline_Tabs_Comps/EngagementFeed';

const Page = () => {
  const params = useParams();
  const id = params.id;
  const [content, setContent] = useState(null);

  useEffect(() => {
    if (id) {
      fetchContent(id).then(setContent);
    }
  }, [id]);

  if (!content) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto mt-8 p-4">
      <ContentFeed content={content} />
      <EngagementFeed content={content} channel={channel} />
    </div>
  );
};

export default Page;