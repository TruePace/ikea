import { useState } from "react";
// Advanced Search Service with suggestions and caching
class NewsSearchService {
  constructor() {
    this.baseUrl = 'https://truepace.onrender.com/api/news/search';
    this.cache = new Map();
    this.suggestionCache = new Map();
    this.popularSearches = [];
    this.trendingTopics = [];
    this.lastTrendingFetch = 0;
  }

  // Search with caching and debouncing
  async searchNews(query, options = {}) {
    const {
      limit = 20,
      page = 1,
      category = null,
      sortBy = 'publishedAt',
      language = 'en'
    } = options;

    const cacheKey = `${query}-${JSON.stringify(options)}`;
    
    // Check cache first (5 minutes TTL)
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
      console.log('📋 Returning cached results for:', query);
      return cached.data;
    }

    try {
      const params = new URLSearchParams({
        q: query,
        limit: limit.toString(),
        page: page.toString(),
        ...(category && { category }),
        ...(sortBy && { sortBy }),
        ...(language && { language })
      });

      const response = await fetch(`${this.baseUrl}?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(15000)
      });

      if (!response.ok) {
        throw new Error(`Search API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Normalize the response structure
      const articles = this.normalizeArticles(data);
      
      // Cache the results
      this.cache.set(cacheKey, {
        data: articles,
        timestamp: Date.now()
      });

      // Update popular searches
      this.updatePopularSearches(query);

      console.log('🔍 Search results for:', query, '- Found:', articles.length, 'articles');
      return articles;

    } catch (error) {
      console.error('❌ News search error:', error);
      throw error;
    }
  }

  // Generate search suggestions
  async getSearchSuggestions(query) {
    if (!query || query.length < 2) return [];

    const cacheKey = `suggestions-${query.toLowerCase()}`;
    const cached = this.suggestionCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < 10 * 60 * 1000) {
      return cached.data;
    }

    try {
      // Generate suggestions from multiple sources
      const suggestions = [
        ...this.generateLocalSuggestions(query),
        ...this.getPopularSearchSuggestions(query),
        ...this.getTrendingTopicSuggestions(query)
      ];

      // Remove duplicates and limit
      const uniqueSuggestions = [...new Set(suggestions)].slice(0, 8);

      // Cache suggestions
      this.suggestionCache.set(cacheKey, {
        data: uniqueSuggestions,
        timestamp: Date.now()
      });

      return uniqueSuggestions;

    } catch (error) {
      console.error('❌ Error generating suggestions:', error);
      return this.generateLocalSuggestions(query);
    }
  }

  // Generate local suggestions based on common news terms
  generateLocalSuggestions(query) {
    const newsKeywords = [
      'breaking news', 'latest news', 'today news', 'world news',
      'politics', 'business', 'technology', 'sports', 'entertainment',
      'health', 'science', 'economy', 'weather', 'local news',
      'international', 'government', 'election', 'covid', 'climate',
      'stock market', 'cryptocurrency', 'innovation', 'research'
    ];

    const lowerQuery = query.toLowerCase();
    return newsKeywords
      .filter(keyword => keyword.includes(lowerQuery) || lowerQuery.includes(keyword.split(' ')[0]))
      .slice(0, 4);
  }

  // Get suggestions from popular searches
  getPopularSearchSuggestions(query) {
    const lowerQuery = query.toLowerCase();
    return this.popularSearches
      .filter(search => search.toLowerCase().includes(lowerQuery))
      .slice(0, 3);
  }

  // Get suggestions from trending topics
  getTrendingTopicSuggestions(query) {
    const lowerQuery = query.toLowerCase();
    return this.trendingTopics
      .filter(topic => topic.toLowerCase().includes(lowerQuery))
      .slice(0, 3);
  }

  // Update popular searches tracking
  updatePopularSearches(query) {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 3) return;

    // Add to popular searches or increment count
    const existing = this.popularSearches.find(item => 
      typeof item === 'object' ? item.query === trimmedQuery : item === trimmedQuery
    );

    if (existing) {
      if (typeof existing === 'object') {
        existing.count++;
      }
    } else {
      this.popularSearches.push({
        query: trimmedQuery,
        count: 1,
        timestamp: Date.now()
      });
    }

    // Keep only top 20 and sort by count
    this.popularSearches = this.popularSearches
      .sort((a, b) => {
        const countA = typeof a === 'object' ? a.count : 1;
        const countB = typeof b === 'object' ? b.count : 1;
        return countB - countA;
      })
      .slice(0, 20);
  }

  // Fetch trending topics (simulated - replace with real trending API if available)
  async fetchTrendingTopics() {
    const now = Date.now();
    // Refresh trending topics every 30 minutes
    if (now - this.lastTrendingFetch < 30 * 60 * 1000) {
      return this.trendingTopics;
    }

    try {
      // This is simulated - replace with actual trending topics API
      const simulatedTrending = [
        'artificial intelligence', 'climate change', 'space exploration',
        'renewable energy', 'global economy', 'tech innovation',
        'social media trends', 'healthcare breakthrough', 'sports championships',
        'movie releases', 'music charts', 'travel destinations'
      ];

      this.trendingTopics = simulatedTrending;
      this.lastTrendingFetch = now;
      
      return this.trendingTopics;
    } catch (error) {
      console.error('❌ Error fetching trending topics:', error);
      return this.trendingTopics;
    }
  }

  // Normalize different API response formats
  normalizeArticles(data) {
    let articles = [];

    // Handle different response formats
    if (Array.isArray(data)) {
      articles = data;
    } else if (data.articles) {
      articles = data.articles;
    } else if (data.results) {
      articles = data.results;
    } else if (data.data) {
      articles = Array.isArray(data.data) ? data.data : [data.data];
    } else {
      articles = [data];
    }

    // Normalize article structure
    return articles.map(article => ({
      id: article.id || article._id || Math.random().toString(36),
      title: article.title || article.headline || article.name || 'Untitled',
      description: article.description || article.summary || article.excerpt || '',
      url: article.url || article.link || article.source_url || '#',
      source: article.source?.name || article.source || article.publisher || 'Unknown Source',
      publishedAt: article.publishedAt || article.published_at || article.date || new Date().toISOString(),
      imageUrl: article.urlToImage || article.image || article.thumbnail || null,
      category: article.category || 'general',
      author: article.author || null,
      content: article.content || null
    }));
  }

  // Advanced search with filters
  async advancedSearch(query, filters = {}) {
    const {
      category,
      dateRange, // { from: Date, to: Date }
      source,
      language = 'en',
      sortBy = 'relevancy', // relevancy, publishedAt, popularity
      limit = 20
    } = filters;

    try {
      const params = new URLSearchParams({
        q: query,
        limit: limit.toString(),
        sortBy,
        language
      });

      if (category) params.append('category', category);
      if (source) params.append('source', source);
      if (dateRange?.from) params.append('from', dateRange.from.toISOString());
      if (dateRange?.to) params.append('to', dateRange.to.toISOString());

      const response = await fetch(`${this.baseUrl}?${params}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(20000)
      });

      if (!response.ok) {
        throw new Error(`Advanced search failed: ${response.status}`);
      }

      const data = await response.json();
      return this.normalizeArticles(data);

    } catch (error) {
      console.error('❌ Advanced search error:', error);
      throw error;
    }
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
    this.suggestionCache.clear();
    console.log('🧹 Search cache cleared');
  }

  // Get cache stats
  getCacheStats() {
    return {
      searchCacheSize: this.cache.size,
      suggestionCacheSize: this.suggestionCache.size,
      popularSearchesCount: this.popularSearches.length,
      trendingTopicsCount: this.trendingTopics.length
    };
  }
}

// Create singleton instance
const newsSearchService = new NewsSearchService();

// React hook for using the search service
export const useNewsSearch = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  const searchNews = async (query, options = {}) => {
    setIsSearching(true);
    setSearchError(null);
    
    try {
      const results = await newsSearchService.searchNews(query, options);
      return results;
    } catch (error) {
      setSearchError(error.message);
      throw error;
    } finally {
      setIsSearching(false);
    }
  };

  const getSuggestions = async (query) => {
    try {
      const results = await newsSearchService.getSearchSuggestions(query);
      setSuggestions(results);
      return results;
    } catch (error) {
      console.error('Suggestions error:', error);
      return [];
    }
  };

  const clearCache = () => {
    newsSearchService.clearCache();
  };

  const getCacheStats = () => {
    return newsSearchService.getCacheStats();
  };

  return {
    searchNews,
    getSuggestions,
    suggestions,
    isSearching,
    searchError,
    clearCache,
    getCacheStats
  };
};

export default newsSearchService;