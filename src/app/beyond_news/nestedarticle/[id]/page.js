
// import { Metadata, ResolvingMetadata } from 'next'
import Header from "@/components/Beyond_news_comps/beyond-header/Header";
import React, { lazy, Suspense } from 'react';

const FullArticle = lazy(() => import("@/components/Beyond_news_comps/beyond-nestedarticlecomp/FullArticle"));

// Generate metadata for each article dynamically
export async function generateMetadata({ params }, parent) {
  const id = params.id
  
  // Fetch article data
  const article = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/BeyondArticle/${id}`).then(res => res.json())
  
  // Optional: Get parent metadata (from layout)
  const previousImages = (await parent).openGraph?.images || []
  
  return {
    title: article.title,
    description: article.fullContent.replace(/<[^>]*>?/gm, '').substring(0, 155) + '...',
    openGraph: {
      title: article.title,
      description: article.fullContent.replace(/<[^>]*>?/gm, '').substring(0, 155) + '...',
      images: [article.previewImage, ...previousImages],
      type: 'article',
      publishedTime: article.createdAt,
      tags: article.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.fullContent.replace(/<[^>]*>?/gm, '').substring(0, 155) + '...',
      images: [article.previewImage],
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/article/${id}`,
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
            <FullArticle/>
          </div>
        </Suspense>
      </div>
    </>
  );
}

export default Page;