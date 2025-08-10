// // Enhanced SearchBar component with news API integration
// import React, { useState, useEffect, useRef } from 'react';
// import { FaArrowLeft, FaTimes, FaSearch, FaClock, FaNewspaper } from "react-icons/fa";
// import Link from 'next/link';

// const SearchBar = ({ onClose, channels }) => {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [isOpen, setIsOpen] = useState(true);
//   const [filteredChannels, setFilteredChannels] = useState([]);
//   const [newsResults, setNewsResults] = useState([]);
//   const [searchHistory, setSearchHistory] = useState([]);
//   const [isSearching, setIsSearching] = useState(false);
//   const [activeTab, setActiveTab] = useState('all'); // 'all', 'channels', 'news'
//   const searchContainerRef = useRef(null);
//   const searchTimeoutRef = useRef(null);

//   // Load search history on mount
//   useEffect(() => {
//     const savedHistory = JSON.parse(localStorage.getItem('newsSearchHistory') || '[]');
//     setSearchHistory(savedHistory.slice(0, 5)); // Keep only recent 5
//   }, []);

//   useEffect(() => {
//     if (!isOpen) {
//       const timer = setTimeout(() => {
//         onClose();
//       }, 300);
//       return () => clearTimeout(timer);
//     }
//   }, [isOpen, onClose]);

//   // Debounced search effect
//   useEffect(() => {
//     if (searchTimeoutRef.current) {
//       clearTimeout(searchTimeoutRef.current);
//     }

//     if (searchQuery.trim()) {
//       // Filter channels immediately
//       const filtered = channels.filter(channel =>
//         channel.name.toLowerCase().includes(searchQuery.toLowerCase())
//       );
//       setFilteredChannels(filtered);

//       // Debounce news search
//       searchTimeoutRef.current = setTimeout(() => {
//         searchNews(searchQuery.trim());
//       }, 500); // 500ms delay
//     } else {
//       setFilteredChannels([]);
//       setNewsResults([]);
//       setIsSearching(false);
//     }

//     return () => {
//       if (searchTimeoutRef.current) {
//         clearTimeout(searchTimeoutRef.current);
//       }
//     };
//   }, [searchQuery, channels]);

//   // Search news function with better error handling
//   const searchNews = async (query) => {
//     if (!query.trim()) return;

//     setIsSearching(true);
//     try {
//       const response = await fetch(`https://truepace.onrender.com/api/news/search?q=${encodeURIComponent(query)}&limit=10`, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         signal: AbortSignal.timeout(10000) // 10 second timeout
//       });

//       if (!response.ok) {
//         throw new Error(`Search failed: ${response.status}`);
//       }

//       const data = await response.json();
//       console.log('Raw API response:', data);
      
//       // Normalize the data to ensure we have an array of articles
//       let articles = [];
      
//       if (Array.isArray(data)) {
//         articles = data;
//       } else if (data.articles && Array.isArray(data.articles)) {
//         articles = data.articles;
//       } else if (data.results && Array.isArray(data.results)) {
//         articles = data.results;
//       } else if (data.data && Array.isArray(data.data)) {
//         articles = data.data;
//       } else if (data.news && Array.isArray(data.news)) {
//         articles = data.news;
//       } else if (typeof data === 'object' && data !== null) {
//         // If it's a single object, wrap it in an array
//         articles = [data];
//       }

//       // Normalize each article to ensure consistent structure
//       const normalizedArticles = articles.map((article, index) => {
//         // Handle case where article might be null or undefined
//         if (!article || typeof article !== 'object') {
//           return null;
//         }

//         return {
//           id: article.id || article._id || `article-${index}`,
//           title: typeof article.title === 'string' ? article.title : 
//                  typeof article.headline === 'string' ? article.headline :
//                  typeof article.name === 'string' ? article.name : 'Untitled Article',
//           description: typeof article.description === 'string' ? article.description :
//                       typeof article.summary === 'string' ? article.summary :
//                       typeof article.excerpt === 'string' ? article.excerpt : '',
//           url: typeof article.url === 'string' ? article.url :
//                typeof article.link === 'string' ? article.link :
//                typeof article.source_url === 'string' ? article.source_url : '#',
//           source: article.source?.name || 
//                  (typeof article.source === 'string' ? article.source : null) ||
//                  article.publisher || 
//                  'Unknown Source',
//           publishedAt: article.publishedAt || 
//                       article.published_at || 
//                       article.date || 
//                       article.createdAt ||
//                       new Date().toISOString(),
//           imageUrl: article.urlToImage || 
//                    article.image || 
//                    article.thumbnail ||
//                    article.imageUrl || null,
//           category: typeof article.category === 'string' ? article.category : 'general',
//           author: typeof article.author === 'string' ? article.author : null
//         };
//       }).filter(Boolean); // Remove null entries

//       console.log('Normalized articles:', normalizedArticles);
//       setNewsResults(normalizedArticles);
      
//     } catch (error) {
//       console.error('News search error:', error);
//       setNewsResults([]);
//     } finally {
//       setIsSearching(false);
//     }
//   };

//   // Save search to history
//   const saveToHistory = (query) => {
//     const trimmedQuery = query.trim();
//     if (!trimmedQuery) return;

//     const newHistory = [
//       trimmedQuery,
//       ...searchHistory.filter(item => item !== trimmedQuery)
//     ].slice(0, 5);

//     setSearchHistory(newHistory);
//     localStorage.setItem('newsSearchHistory', JSON.stringify(newHistory));
//   };

//   // Handle search submission
//   const handleSearch = (query = searchQuery) => {
//     const finalQuery = query.trim();
//     if (!finalQuery) return;

//     saveToHistory(finalQuery);
//     setSearchQuery(finalQuery);
//     searchNews(finalQuery);
//   };

//   // Disable body scroll and scroll snapping when search is open
//   useEffect(() => {
//     if (isOpen) {
//       const originalBodyStyle = document.body.style.cssText;
//       const originalHtmlStyle = document.documentElement.style.cssText;
      
//       document.body.style.overflow = 'hidden';
//       document.body.style.scrollSnapType = 'none';
//       document.body.style.height = '100vh';
//       document.body.style.position = 'fixed';
//       document.body.style.width = '100%';
//       document.body.style.top = '0';
//       document.body.style.left = '0';
//       document.documentElement.style.scrollSnapType = 'none';
//       document.documentElement.style.height = '100vh';
//       document.documentElement.style.overflow = 'hidden';
      
//       return () => {
//         document.body.style.cssText = originalBodyStyle;
//         document.documentElement.style.cssText = originalHtmlStyle;
//       };
//     }
//   }, [isOpen]);

//   const handleClose = () => {
//     setIsOpen(false);
//   };

//   const handleClear = () => {
//     setSearchQuery('');
//     setNewsResults([]);
//     setFilteredChannels([]);
//   };

//   const clearHistory = () => {
//     setSearchHistory([]);
//     localStorage.removeItem('newsSearchHistory');
//   };

//   // Prevent event bubbling
//   const handleSearchContainerInteraction = (e) => {
//     e.stopPropagation();
//   };

//   // Get total results count
//   const totalResults = filteredChannels.length + newsResults.length;

//   // Filter results based on active tab
//   const getFilteredResults = () => {
//     switch (activeTab) {
//       case 'channels':
//         return { channels: filteredChannels, news: [] };
//       case 'news':
//         return { channels: [], news: newsResults };
//       default:
//         return { channels: filteredChannels, news: newsResults };
//     }
//   };

//   const { channels: displayChannels, news: displayNews } = getFilteredResults();

//   return (
//     <div 
//       className={`fixed top-0 right-0 dark:text-gray-200 dark:bg-gray-900 bg-white z-50 transition-transform duration-300 ease-in-out transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
//       ref={searchContainerRef}
//       onTouchStart={handleSearchContainerInteraction}
//       onTouchMove={handleSearchContainerInteraction}
//       onWheel={handleSearchContainerInteraction}
//       style={{
//         height: '100vh',
//         width: '100vw',
//         minHeight: '100vh',
//         maxHeight: '100vh',
//         left: 0,
//         right: 0,
//         top: 0,
//         bottom: 0
//       }}
//     >
//       {/* Header with search input */}
//       <div 
//         className="p-4 flex items-center border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sticky top-0 z-10"
//         style={{ height: '80px', minHeight: '80px', flexShrink: 0 }}
//       >
//         <button onClick={handleClose} className="mr-4">
//           <FaArrowLeft size="1.6em"/>
//         </button>
//         <div className="flex-grow relative">
//           <input
//             type="text"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
//             placeholder="Search news and channels..."
//             className="w-full p-2 pl-10 border border-gray-300 dark:bg-gray-900 dark:border-gray-600 rounded pr-10 focus:outline-none focus:border-blue-500"
//           />
//           <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size="1em" />
//           {searchQuery && (
//             <button 
//               type="button" 
//               onClick={handleClear} 
//               className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
//             >
//               <FaTimes size="1.2em" />
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Tab Navigation */}
//       {(searchQuery || totalResults > 0) && (
//         <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sticky top-[80px] z-10">
//           <button
//             onClick={() => setActiveTab('all')}
//             className={`flex-1 py-3 px-4 text-sm font-medium ${
//               activeTab === 'all'
//                 ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
//                 : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
//             }`}
//           >
//             All ({totalResults})
//           </button>
//           <button
//             onClick={() => setActiveTab('channels')}
//             className={`flex-1 py-3 px-4 text-sm font-medium ${
//               activeTab === 'channels'
//                 ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
//                 : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
//             }`}
//           >
//             Channels ({filteredChannels.length})
//           </button>
//           <button
//             onClick={() => setActiveTab('news')}
//             className={`flex-1 py-3 px-4 text-sm font-medium ${
//               activeTab === 'news'
//                 ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
//                 : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
//             }`}
//           >
//             News ({newsResults.length})
//           </button>
//         </div>
//       )}

//       {/* Scrollable content */}
//       <div 
//         className="flex-1 overflow-y-auto overscroll-contain"
//         style={{
//           height: searchQuery || totalResults > 0 ? 'calc(100vh - 140px)' : 'calc(100vh - 80px)',
//           minHeight: searchQuery || totalResults > 0 ? 'calc(100vh - 140px)' : 'calc(100vh - 80px)',
//           maxHeight: searchQuery || totalResults > 0 ? 'calc(100vh - 140px)' : 'calc(100vh - 80px)',
//           scrollSnapType: 'none',
//           WebkitOverflowScrolling: 'touch',
//           position: 'relative'
//         }}
//         onTouchStart={handleSearchContainerInteraction}
//         onTouchMove={handleSearchContainerInteraction}
//       >
//         <div className="p-4">
//           {/* Search History - shown when no search query */}
//           {!searchQuery && searchHistory.length > 0 && (
//             <div className="mb-6">
//               <div className="flex items-center justify-between mb-3">
//                 <h3 className="text-lg font-medium flex items-center">
//                   <FaClock className="mr-2" size="0.9em" />
//                   Recent Searches
//                 </h3>
//                 <button 
//                   onClick={clearHistory}
//                   className="text-sm text-blue-500 hover:text-blue-600"
//                 >
//                   Clear
//                 </button>
//               </div>
//               {searchHistory.map((query, index) => (
//                 <button
//                   key={index}
//                   onClick={() => handleSearch(query)}
//                   className="block w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-700 transition-colors duration-150"
//                 >
//                   <div className="flex items-center">
//                     <FaClock className="mr-3 text-gray-400" size="0.8em" />
//                     <span>{query}</span>
//                   </div>
//                 </button>
//               ))}
//             </div>
//           )}

//           {/* Loading indicator */}
//           {isSearching && (
//             <div className="flex items-center justify-center py-8">
//               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
//               <span>Searching news...</span>
//             </div>
//           )}

//           {/* No results message */}
//           {searchQuery && !isSearching && totalResults === 0 && (
//             <div className="text-gray-500 text-center py-8">
//               <FaSearch size="2em" className="mx-auto mb-4 opacity-50" />
//               <p>No results found for "{searchQuery}"</p>
//               <p className="text-sm mt-2">Try different keywords or check spelling</p>
//             </div>
//           )}

//           {/* Channel Results */}
//           {displayChannels.length > 0 && (
//             <div className="mb-6">
//               <h3 className="text-lg font-medium mb-3 flex items-center">
//                 <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
//                 Channels ({displayChannels.length})
//               </h3>
//               {displayChannels.map((channel) => (
//                 <Link
//                   key={channel._id}
//                   href={`/truepacer_profile/${channel._id}`}
//                   className="block p-3 hover:bg-gray-100 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-700 transition-colors duration-150"
//                   onClick={handleClose}
//                 >
//                   <div className="font-medium">{channel.name}</div>
//                   <div className="text-sm text-gray-500">Channel</div>
//                 </Link>
//               ))}
//             </div>
//           )}

//           {/* News Results */}
//           {displayNews.length > 0 && (
//             <div className="mb-6">
//               <h3 className="text-lg font-medium mb-3 flex items-center">
//                 <FaNewspaper className="mr-2 text-green-500" size="0.9em" />
//                 Latest News ({displayNews.length})
//               </h3>
//               {displayNews.map((article, index) => {
//                 // Additional safety check
//                 if (!article || typeof article !== 'object') {
//                   return null;
//                 }

//                 return (
//                   <div
//                     key={article.id || `news-${index}`}
//                     className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-700 transition-colors duration-150 cursor-pointer"
//                     onClick={() => {
//                       // Open article in new tab or navigate
//                       if (article.url && article.url !== '#') {
//                         window.open(article.url, '_blank');
//                       }
//                       saveToHistory(searchQuery);
//                     }}
//                   >
//                     <div className="flex gap-3">
//                       {article.imageUrl && (
//                         <div className="flex-shrink-0 w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
//                           <img
//                             src={article.imageUrl}
//                             alt=""
//                             className="w-full h-full object-cover"
//                             onError={(e) => {
//                               e.target.parentElement.style.display = 'none';
//                             }}
//                           />
//                         </div>
//                       )}
//                       <div className="flex-1 min-w-0">
//                         <div className="font-medium mb-1 line-clamp-2 text-sm">
//                           {String(article.title || 'Untitled Article')}
//                         </div>
//                         {article.description && (
//                           <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
//                             {String(article.description)}
//                           </div>
//                         )}
//                         <div className="flex items-center text-xs text-gray-500">
//                           <span>{String(article.source || 'Unknown Source')}</span>
//                           {article.publishedAt && (
//                             <>
//                               <span className="mx-2">•</span>
//                               <span>
//                                 {new Date(article.publishedAt).toLocaleDateString()}
//                               </span>
//                             </>
//                           )}
//                           {article.category && (
//                             <>
//                               <span className="mx-2">•</span>
//                               <span className="capitalize">{String(article.category)}</span>
//                             </>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               }).filter(Boolean)}
//             </div>
//           )}

//           {/* Bottom padding */}
//           <div className="h-4"></div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SearchBar;

// Premium SearchBar with advanced news search integration
import React, { useState, useEffect, useRef } from 'react';
import { FaArrowLeft, FaTimes, FaSearch, FaClock, FaNewspaper, FaFire,FaChartLine, FaFilter } from "react-icons/fa";
import Link from 'next/link';
import { useNewsSearch } from './NewsSearchService'; // Import the service


const PremiumSearchBar = ({ onClose, channels }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const [filteredChannels, setFilteredChannels] = useState([]);
  const [newsResults, setNewsResults] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    category: 'all',
    sortBy: 'publishedAt',
    dateRange: 'all' // all, today, week, month
  });
  
  const searchContainerRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const suggestionTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  // Use the custom hook
  const { 
    searchNews, 
    getSuggestions, 
    isSearching, 
    searchError,
    clearCache,
    getCacheStats 
  } = useNewsSearch();

  // Load search history on mount
  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('newsSearchHistory') || '[]');
    setSearchHistory(savedHistory.slice(0, 8)); // Keep recent 8
  }, []);

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  // Handle search input changes with suggestions
  useEffect(() => {
    // Clear existing timeouts
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (suggestionTimeoutRef.current) clearTimeout(suggestionTimeoutRef.current);

    if (searchQuery.trim()) {
      // Filter channels immediately
      const filtered = channels.filter(channel =>
        channel.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredChannels(filtered);

      // Get search suggestions (faster response)
      if (searchQuery.length >= 2) {
        suggestionTimeoutRef.current = setTimeout(() => {
          getSuggestions(searchQuery).then(suggestions => {
            setSearchSuggestions(suggestions);
            setShowSuggestions(true);
          });
        }, 200); // Fast suggestions
      }

      // Debounce news search (slower, more comprehensive)
      searchTimeoutRef.current = setTimeout(() => {
        performNewsSearch(searchQuery.trim());
      }, 800); // Longer delay for full search
    } else {
      setFilteredChannels([]);
      setNewsResults([]);
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      if (suggestionTimeoutRef.current) clearTimeout(suggestionTimeoutRef.current);
    };
  }, [searchQuery, channels, searchFilters]);

  // Perform news search with filters
  const performNewsSearch = async (query) => {
    if (!query.trim()) return;

    try {
      const options = {
        limit: 15,
        sortBy: searchFilters.sortBy,
        ...(searchFilters.category !== 'all' && { category: searchFilters.category })
      };

      // Add date range filter
      if (searchFilters.dateRange !== 'all') {
        const now = new Date();
        let fromDate;
        
        switch (searchFilters.dateRange) {
          case 'today':
            fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case 'week':
            fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        }
        
        if (fromDate) {
          options.dateRange = { from: fromDate, to: now };
        }
      }

      const results = await searchNews(query, options);
      setNewsResults(results);
      setShowSuggestions(false);
      
    } catch (error) {
      console.error('News search failed:', error);
      setNewsResults([]);
    }
  };

  // Handle search submission
  const handleSearch = async (query = searchQuery) => {
    const finalQuery = query.trim();
    if (!finalQuery) return;

    saveToHistory(finalQuery);
    setSearchQuery(finalQuery);
    setShowSuggestions(false);
    
    // Focus on results
    setActiveTab('news');
    await performNewsSearch(finalQuery);
  };

  // Save search to history
  const saveToHistory = (query) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    const newHistory = [
      { query: trimmedQuery, timestamp: Date.now() },
      ...searchHistory.filter(item => item.query !== trimmedQuery)
    ].slice(0, 8);

    setSearchHistory(newHistory);
    localStorage.setItem('newsSearchHistory', JSON.stringify(newHistory));
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    handleSearch(suggestion);
  };

  // Disable body scroll when search is open
  useEffect(() => {
    if (isOpen) {
      const originalBodyStyle = document.body.style.cssText;
      const originalHtmlStyle = document.documentElement.style.cssText;
      
      document.body.style.overflow = 'hidden';
      document.body.style.scrollSnapType = 'none';
      document.body.style.height = '100vh';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = '0';
      document.body.style.left = '0';
      document.documentElement.style.scrollSnapType = 'none';
      document.documentElement.style.height = '100vh';
      document.documentElement.style.overflow = 'hidden';
      
      return () => {
        document.body.style.cssText = originalBodyStyle;
        document.documentElement.style.cssText = originalHtmlStyle;
      };
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleClear = () => {
    setSearchQuery('');
    setNewsResults([]);
    setFilteredChannels([]);
    setSearchSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('newsSearchHistory');
  };

  const handleSearchContainerInteraction = (e) => {
    e.stopPropagation();
  };

  // Get total results count
  const totalResults = filteredChannels.length + newsResults.length;

  // Filter results based on active tab
  const getFilteredResults = () => {
    switch (activeTab) {
      case 'channels':
        return { channels: filteredChannels, news: [] };
      case 'news':
        return { channels: [], news: newsResults };
      default:
        return { channels: filteredChannels, news: newsResults };
    }
  };

  const { channels: displayChannels, news: displayNews } = getFilteredResults();

  // News categories for filter
  const newsCategories = [
    { value: 'all', label: 'All Categories' },
    { value: 'general', label: 'General' },
    { value: 'business', label: 'Business' },
    { value: 'technology', label: 'Technology' },
    { value: 'sports', label: 'Sports' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'health', label: 'Health' },
    { value: 'science', label: 'Science' },
    { value: 'politics', label: 'Politics' }
  ];

  return (
    <div 
      className={`fixed top-0 right-0 dark:text-gray-200 dark:bg-gray-900 bg-white z-50 transition-transform duration-300 ease-in-out transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      ref={searchContainerRef}
      onTouchStart={handleSearchContainerInteraction}
      onTouchMove={handleSearchContainerInteraction}
      onWheel={handleSearchContainerInteraction}
      style={{
        height: '100vh',
        width: '100vw',
        minHeight: '100vh',
        maxHeight: '100vh',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
      }}
    >
      {/* Header with search input */}
      <div 
        className="p-4 flex items-center border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sticky top-0 z-10"
        style={{ minHeight: '80px', flexShrink: 0 }}
      >
        <button onClick={handleClose} className="mr-4">
          <FaArrowLeft size="1.6em"/>
        </button>
        <div className="flex-grow relative">
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            onFocus={() => setShowSuggestions(searchSuggestions.length > 0)}
            placeholder="Search breaking news, channels..."
            className="w-full p-3 pl-10 pr-20 border border-gray-300 dark:bg-gray-900 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
            autoComplete="off"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size="1em" />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center">
            {searchQuery && (
              <button 
                type="button" 
                onClick={handleClear} 
                className="p-1 text-gray-500 hover:text-gray-700 mr-1"
              >
                <FaTimes size="1.2em" />
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded transition-colors ${showFilters ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <FaFilter size="1em" />
            </button>
          </div>
        </div>
      </div>

      {/* Search Suggestions Dropdown */}
      {showSuggestions && searchSuggestions.length > 0 && (
        <div className="absolute top-20 left-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
          {searchSuggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0 flex items-center"
            >
              <FaSearch className="mr-3 text-gray-400" size="0.8em" />
              <span>{suggestion}</span>
            </button>
          ))}
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={searchFilters.category}
                onChange={(e) => setSearchFilters({...searchFilters, category: e.target.value})}
                className="w-full p-2 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 rounded focus:outline-none focus:border-blue-500"
              >
                {newsCategories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Sort By</label>
                <select
                  value={searchFilters.sortBy}
                  onChange={(e) => setSearchFilters({...searchFilters, sortBy: e.target.value})}
                  className="w-full p-2 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 rounded focus:outline-none focus:border-blue-500"
                >
                  <option value="publishedAt">Latest</option>
                  <option value="relevancy">Most Relevant</option>
                  <option value="popularity">Most Popular</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Time Range</label>
                <select
                  value={searchFilters.dateRange}
                  onChange={(e) => setSearchFilters({...searchFilters, dateRange: e.target.value})}
                  className="w-full p-2 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 rounded focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Past Week</option>
                  <option value="month">Past Month</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      {(searchQuery || totalResults > 0) && (
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sticky top-[80px] z-10">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              activeTab === 'all'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            All ({totalResults})
          </button>
          <button
            onClick={() => setActiveTab('channels')}
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              activeTab === 'channels'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Channels ({filteredChannels.length})
          </button>
          <button
            onClick={() => setActiveTab('news')}
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              activeTab === 'news'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <div className="flex items-center justify-center">
              News ({newsResults.length})
              {isSearching && (
                <div className="ml-2 animate-spin rounded-full h-3 w-3 border-b border-current"></div>
              )}
            </div>
          </button>
        </div>
      )}

      {/* Scrollable content */}
      <div 
        className="flex-1 overflow-y-auto overscroll-contain"
        style={{
          height: `calc(100vh - ${80 + (showFilters ? 140 : 0) + (searchQuery || totalResults > 0 ? 60 : 0)}px)`,
          scrollSnapType: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
        onTouchStart={handleSearchContainerInteraction}
        onTouchMove={handleSearchContainerInteraction}
      >
        <div className="p-4">
          {/* Search History & Trending */}
          {!searchQuery && (
            <div className="space-y-6">
              {/* Recent Searches */}
              {searchHistory.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold flex items-center">
                      <FaClock className="mr-2 text-blue-500" size="0.9em" />
                      Recent Searches
                    </h3>
                    <button 
                      onClick={clearHistory}
                      className="text-sm text-blue-500 hover:text-blue-600"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="space-y-2">
                    {searchHistory.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearch(item.query)}
                        className="flex items-center w-full p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-150"
                      >
                        <FaClock className="mr-3 text-gray-400" size="0.8em" />
                        <div className="flex-1">
                          <div className="font-medium">{item.query}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(item.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Topics */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <FaChartLine className="mr-2 text-red-500" size="0.9em" />
                  Trending Topics
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Breaking News', 'Technology', 'Sports', 'Politics',
                    'Business', 'Health', 'Entertainment', 'Science'
                  ].map((topic, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(topic)}
                      className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-150 text-left"
                    >
                      <div className="flex items-center">
                        <FaFire className="mr-2 text-orange-500" size="0.8em" />
                        <span className="text-sm font-medium">{topic}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isSearching && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Searching latest news...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {searchError && (
            <div className="text-center py-8">
              <div className="text-red-500 mb-2">Search Error</div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{searchError}</p>
              <button
                onClick={() => handleSearch()}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* No Results */}
          {searchQuery && !isSearching && totalResults === 0 && !searchError && (
            <div className="text-center py-12">
              <FaSearch size="3em" className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No results found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No results for "<strong>{searchQuery}</strong>"
              </p>
              <div className="text-sm text-gray-500">
                <p>Try:</p>
                <ul className="mt-2 space-y-1">
                  <li>• Different keywords</li>
                  <li>• Checking spelling</li>
                  <li>• Using broader terms</li>
                  <li>• Adjusting filters</li>
                </ul>
              </div>
            </div>
          )}

          {/* Channel Results */}
          {displayChannels.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                Channels ({displayChannels.length})
              </h3>
              <div className="space-y-2">
                {displayChannels.map((channel) => (
                  <Link
                    key={channel._id}
                    href={`/truepacer_profile/${channel._id}`}
                    className="block p-4 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-150"
                    onClick={handleClose}
                  >
                    <div className="font-semibold text-lg">{channel.name}</div>
                    <div className="text-sm text-gray-500 mt-1">News Channel</div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* News Results */}
          {displayNews.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <FaNewspaper className="mr-2 text-green-500" size="0.9em" />
                Latest News ({displayNews.length})
              </h3>
              <div className="space-y-4">
                {displayNews.map((article, index) => (
                  <article
                    key={article.id || index}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-150 cursor-pointer"
                    onClick={() => {
                      if (article.url && article.url !== '#') {
                        window.open(article.url, '_blank');
                      }
                      saveToHistory(searchQuery);
                    }}
                  >
                    <div className="flex gap-4">
                      {article.imageUrl && (
                        <div className="flex-shrink-0 w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                          <img
                            src={article.imageUrl}
                            alt={article.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-lg leading-tight mb-2 line-clamp-2">
                          {article.title}
                        </h4>
                        {article.description && (
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                            {article.description}
                          </p>
                        )}
                        <div className="flex items-center text-xs text-gray-500 space-x-2">
                          <span className="font-medium">{article.source}</span>
                          <span>•</span>
                          <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                          {article.category && (
                            <>
                              <span>•</span>
                              <span className="capitalize">{article.category}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* Bottom padding */}
          <div className="h-6"></div>
        </div>
      </div>
    </div>
  );
};

export default PremiumSearchBar;