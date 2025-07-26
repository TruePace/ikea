// FrontendDirectNewsService.js - Complete frontend-only solution
import { useState, useEffect, useCallback } from 'react';

// Configuration
const PARTNER_API_URL = process.env.NEXT_PUBLIC_PARTNER_API_URL; // Move to public env var
const CACHE_KEY = 'truepace_external_news';
const CACHE_TIMESTAMP_KEY = 'truepace_news_timestamp';
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes cache
const NEWS_EXPIRY_DURATION = 48 * 60 * 60 * 1000; // 48 hours
const JUST_IN_DURATION = 15 * 60 * 1000; // 15 minutes

// Enhanced localStorage wrapper with error handling
const storage = {
  get: (key) => {
    try {
      if (typeof window === 'undefined') return null;
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.warn(`Error reading from localStorage: ${key}`, error);
      return null;
    }
  },
  
  set: (key, value) => {
    try {
      if (typeof window === 'undefined') return false;
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`Error writing to localStorage: ${key}`, error);
      return false;
    }
  },
  
  remove: (key) => {
    try {
      if (typeof window === 'undefined') return;
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Error removing from localStorage: ${key}`, error);
    }
  }
};

// Create unique ID for articles (same logic as backend)
const createUniqueId = (url, title) => {
  const normalizeUrl = (url) => {
    try {
      const urlObj = new URL(url);
      const paramsToRemove = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid'];
      paramsToRemove.forEach(param => urlObj.searchParams.delete(param));
      urlObj.hash = '';
      return urlObj.toString();
    } catch {
      return url.replace(/#.*$/, '');
    }
  };

  const normalizedUrl = normalizeUrl(url);
  const titleSlug = title ? title.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 50) : '';
  const combinedString = `${normalizedUrl}::${titleSlug}`;
  
  let hash = 0;
  for (let i = 0; i < combinedString.length; i++) {
    const char = combinedString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return `ext-${Math.abs(hash).toString(36)}`;
};

// Transform external article to your app format
const transformArticleToContent = (article, channelId = null) => {
  const now = new Date();
  const publishedAt = new Date(article.publishedAt || now);
  const timeSincePublished = now - publishedAt;
  
  // Check if article is within 48 hour window
  if (timeSincePublished > NEWS_EXPIRY_DURATION) {
    return null; // Skip expired articles
  }
  
  const isJustIn = timeSincePublished < JUST_IN_DURATION;
  const uniqueId = createUniqueId(article.url, article.title);
  
  let message = article.title;
  if (article.description && article.description.trim()) {
    message += `\n\n${article.description.trim()}`;
  }
  
  return {
    _id: uniqueId,
    externalId: uniqueId,
    message: message,
    picture: article.urlToImage || null,
    channelId: channelId,
    isJustIn: isJustIn,
    justInExpiresAt: isJustIn ? new Date(publishedAt.getTime() + JUST_IN_DURATION) : null,
    headlineExpiresAt: new Date(publishedAt.getTime() + NEWS_EXPIRY_DURATION),
    uploadedAt: publishedAt,
    createdAt: publishedAt,
    likeCount: 0,
    dislikeCount: 0,
    commentCount: 0,
    shareCount: 0,
    tags: article.category ? [article.category] : ['external'],
    source: 'external',
    originalSource: article.source?.name || 'External News',
    originalUrl: article.url,
    fetchedAt: now,
    engagementScore: 0,
    viralScore: 0,
    showInAllChannels: !isJustIn
  };
};

// Create virtual channel for external source
const createVirtualChannel = (sourceName) => {
  const channelId = `channel-${sourceName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
  
  return {
    _id: channelId,
    name: sourceName,
    picture: '/NopicAvatar.png',
    description: `Latest news from ${sourceName}`,
    tags: ['external'],
    isExternal: true,
    contentCount: 0,
    totalViews: 0,
    avgEngagementRate: 0,
    subscriberCount: 0
  };
};

// Fetch fresh news from partner API
const fetchFreshNews = async () => {
  try {
    console.log('🔄 Fetching fresh news from partner API...');
    
    if (!PARTNER_API_URL) {
      throw new Error('Partner API URL not configured. Please set NEXT_PUBLIC_PARTNER_API_URL in your environment.');
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(PARTNER_API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'TruePaceNewsApp/1.0',
        'Accept': 'application/json',
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log('📰 API Response:', {
      hasArticles: !!data.articles,
      articlesCount: data.articles?.length || 0,
    });
    
    if (!data.articles || !Array.isArray(data.articles)) {
      console.warn('No articles in API response');
      return { articles: [], channels: [] };
    }
    
    // Group articles by source and transform them
    const sourceGroups = {};
    const processedArticles = [];
    
    data.articles.forEach((article, index) => {
      try {
        if (!article.title || !article.url) {
          console.warn(`Skipping article ${index}: Missing title or URL`);
          return;
        }
        
        const sourceName = article.source?.name || 'External News';
        
        if (!sourceGroups[sourceName]) {
          sourceGroups[sourceName] = createVirtualChannel(sourceName);
        }
        
        const transformedArticle = transformArticleToContent(article, sourceGroups[sourceName]._id);
        
        if (transformedArticle) {
          processedArticles.push(transformedArticle);
          sourceGroups[sourceName].contentCount += 1;
        }
      } catch (error) {
        console.error(`Error processing article ${index}:`, error);
      }
    });
    
    const channels = Object.values(sourceGroups);
    
    console.log(`✅ Processed ${processedArticles.length} articles from ${channels.length} sources`);
    
    // Cache the results
    const cacheData = {
      articles: processedArticles,
      channels: channels,
      fetchedAt: Date.now()
    };
    
    storage.set(CACHE_KEY, cacheData);
    storage.set(CACHE_TIMESTAMP_KEY, Date.now());
    
    return {
      articles: processedArticles,
      channels: channels
    };
    
  } catch (error) {
    console.error('❌ Error fetching fresh news:', error);
    throw error;
  }
};

// Filter expired content
const filterExpiredContent = (articles) => {
  const now = new Date();
  
  return articles.filter(article => {
    // Check if headline has expired (48 hours)
    const headlineExpired = article.headlineExpiresAt && new Date(article.headlineExpiresAt) <= now;
    
    if (headlineExpired) {
      console.log(`Filtering expired article: ${article.message?.substring(0, 50)}...`);
      return false;
    }
    
    // Update Just In status if expired
    if (article.isJustIn && article.justInExpiresAt && new Date(article.justInExpiresAt) <= now) {
      article.isJustIn = false;
      article.showInAllChannels = true;
    }
    
    return true;
  });
};

// Check if cache is still valid
const isCacheValid = () => {
  const lastFetch = storage.get(CACHE_TIMESTAMP_KEY);
  if (!lastFetch) return false;
  
  const now = Date.now();
  return (now - lastFetch) < CACHE_DURATION;
};

// Get cached news with expiration filtering
const getCachedNews = () => {
  try {
    const cached = storage.get(CACHE_KEY);
    if (!cached || !cached.articles) return null;
    
    // Filter expired articles
    const validArticles = filterExpiredContent(cached.articles);
    
    return {
      articles: validArticles,
      channels: cached.channels || []
    };
  } catch (error) {
    console.error('Error reading cached news:', error);
    return null;
  }
};

// Main news service hook
export const useDirectNewsService = () => {
  const [news, setNews] = useState({ articles: [], channels: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  
  const fetchNews = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Check cache first if not forcing refresh
      if (!forceRefresh && isCacheValid()) {
        const cached = getCachedNews();
        if (cached && cached.articles.length > 0) {
          console.log(`📋 Using cached news: ${cached.articles.length} articles`);
          setNews(cached);
          setLastFetch(storage.get(CACHE_TIMESTAMP_KEY));
          setLoading(false);
          return cached;
        }
      }
      
      // Fetch fresh news
      const freshNews = await fetchFreshNews();
      setNews(freshNews);
      setLastFetch(Date.now());
      
      return freshNews;
    } catch (err) {
      console.error('Error in fetchNews:', err);
      setError(err.message);
      
      // Try to use cached data as fallback
      const cached = getCachedNews();
      if (cached) {
        console.log('📋 Using cached data as fallback');
        setNews(cached);
        setLastFetch(storage.get(CACHE_TIMESTAMP_KEY));
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Auto-fetch on mount
  useEffect(() => {
    fetchNews();
  }, [fetchNews]);
  
  // Separate content by type
  const headlineContent = news.articles.filter(article => !article.isJustIn);
  const justInContent = news.articles.filter(article => article.isJustIn);
  
  return {
    // Data
    channels: news.channels,
    headlineContent,
    justInContent,
    allArticles: news.articles,
    
    // State
    loading,
    error,
    lastFetch,
    
    // Actions
    refreshNews: () => fetchNews(true),
    fetchNews,
    
    // Utilities
    clearCache: () => {
      storage.remove(CACHE_KEY);
      storage.remove(CACHE_TIMESTAMP_KEY);
    }
  };
};

// Utility function for manual integration
export const getDirectNewsData = async () => {
  try {
    // Check cache first
    if (isCacheValid()) {
      const cached = getCachedNews();
      if (cached && cached.articles.length > 0) {
        return cached;
      }
    }
    
    // Fetch fresh if cache invalid/empty
    return await fetchFreshNews();
  } catch (error) {
    // Fallback to cache even if invalid
    const cached = getCachedNews();
    if (cached) {
      return cached;
    }
    throw error;
  }
};

export default useDirectNewsService;