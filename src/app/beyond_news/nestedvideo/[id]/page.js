
// import { Metadata, ResolvingMetadata } from 'next'
import Header from "@/components/Beyond_news_comps/beyond-header/Header";
import React, { lazy, Suspense } from 'react';

const NestedVidComps = lazy(() => import('@/components/Beyond_news_comps/beyond-nestedvideocomp/NestedVidComps'));

// Generate metadata for each video dynamically
export async function generateMetadata({ params }, parent) {
  const id = params.id
  const video = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/BeyondVideo/${id}`).then(res => res.json())
  
  return {
    title: video.title,
    description: video.description || `Watch ${video.title} on TruePace News`,
    openGraph: {
        title: video.title,
        description: video.description || `Watch ${video.title} on TruePace News`,
        images: [video.thumbnailUrl || video.previewImage],
        type: 'video.other',
        publishedTime: video.createdAt,
        tags: video.tags,
      },
    twitter: {
      card: 'summary_large_image',
      title: video.title,
      description: video.description || `Watch ${video.title} on TruePace News`,
      images: [video.thumbnailUrl || video.previewImage],
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/video/${id}`,
    }
  }
}

// Your component
const Page = () => {
  return (
    <>
      <div className="flex flex-col h-screen pb-11">
        <Header/>
        <Suspense fallback={<div>Loading...</div>}>
          <div className="flex-grow overflow-y-auto pt-4">
            <NestedVidComps />
          </div>
        </Suspense>
      </div>
    </>
  );
}

export default Page;