'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export default function SEO({
  title = 'TruePace News',
  description = 'Get the latest breaking news and in-depth stories',
  keywords = 'news, headlines, breaking news',
  ogImage = '/TruePace.svg',
  ogType = 'website',
  canonicalUrl,
  article = false,
  tags = [],
  publishedTime,
  modifiedTime,
  author,
  videoUrl
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://truepace.com';
  const fullUrl = canonicalUrl ? `${siteUrl}${canonicalUrl}` : siteUrl;

  useEffect(() => {
    // Update document title
    document.title = title;
    
    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = description;
    
    // Update keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.name = 'keywords';
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.content = keywords;
    
    // Update OG tags
    updateMetaTag('property', 'og:type', ogType);
    updateMetaTag('property', 'og:url', fullUrl);
    updateMetaTag('property', 'og:title', title);
    updateMetaTag('property', 'og:description', description);
    updateMetaTag('property', 'og:image', `${siteUrl}${ogImage}`);
    
    // Update Twitter tags
    updateMetaTag('property', 'twitter:card', 'summary_large_image');
    updateMetaTag('property', 'twitter:url', fullUrl);
    updateMetaTag('property', 'twitter:title', title);
    updateMetaTag('property', 'twitter:description', description);
    updateMetaTag('property', 'twitter:image', `${siteUrl}${ogImage}`);
    
    // Canonical URL
    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (canonicalUrl) {
      if (!canonicalTag) {
        canonicalTag = document.createElement('link');
        canonicalTag.rel = 'canonical';
        document.head.appendChild(canonicalTag);
      }
      canonicalTag.href = fullUrl;
    } else if (canonicalTag) {
      canonicalTag.remove();
    }
    
    // Article specific meta tags
    if (article) {
      updateMetaTag('property', 'og:type', 'article');
      
      if (publishedTime) {
        updateMetaTag('property', 'article:published_time', new Date(publishedTime).toISOString());
      }
      
      if (modifiedTime) {
        updateMetaTag('property', 'article:modified_time', new Date(modifiedTime).toISOString());
      }
      
      if (author) {
        updateMetaTag('property', 'article:author', author);
      }
      
      // Tags
      if (tags && tags.length > 0) {
        // Remove any existing article:tag meta tags
        document.querySelectorAll('meta[property="article:tag"]').forEach(tag => tag.remove());
        
        // Add new tags
        tags.forEach(tag => {
          const metaTag = document.createElement('meta');
          metaTag.setAttribute('property', 'article:tag');
          metaTag.content = tag;
          document.head.appendChild(metaTag);
        });
      }
    }
    
    // Video meta tags
    if (videoUrl) {
      updateMetaTag('property', 'og:video', videoUrl);
      updateMetaTag('property', 'og:video:secure_url', videoUrl);
      updateMetaTag('property', 'og:video:type', 'video/mp4');
    }
    
  }, [title, description, keywords, ogImage, ogType, fullUrl, canonicalUrl, article, tags, publishedTime, modifiedTime, author, videoUrl]);
  
  function updateMetaTag(attributeName, attributeValue, content) {
    let metaTag = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute(attributeName, attributeValue);
      document.head.appendChild(metaTag);
    }
    metaTag.content = content;
  }
  
  return null;
}