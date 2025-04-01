import React from 'react';

export default function ArticleStructuredData({ article }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    image: [article.previewImage],
    datePublished: article.createdAt,
    dateModified: article.updatedAt || article.createdAt,
    author: {
      '@type': 'Person',
      name: article.author?.name || 'TruePace News',
    },
    publisher: {
      '@type': 'Organization',
      name: 'TruePace News',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/TruePace.svg`,
      }
    },
    description: article.fullContent.replace(/<[^>]*>?/gm, '').substring(0, 155) + '...',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${process.env.NEXT_PUBLIC_SITE_URL}/article/${article._id}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}