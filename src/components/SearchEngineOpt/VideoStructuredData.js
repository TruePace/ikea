import React from 'react';

export default function VideoStructuredData({ video }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.title,
    description: video.description || `Watch ${video.title} on TruePace News`,
    thumbnailUrl: video.thumbnailUrl || video.previewImage,
    uploadDate: video.createdAt,
    duration: `PT${Math.floor(video.duration / 60)}M${Math.round(video.duration % 60)}S`,
    contentUrl: video.videoUrl,
    embedUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/video/${video._id}`,
    interactionStatistic: [
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/WatchAction',
        userInteractionCount: video.viewsCount || 0,
      },
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/LikeAction',
        userInteractionCount: video.likeCount || 0,
      }
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}