'use client'
import { useState, useEffect } from 'react';
import Image from "next/image";
import Link from 'next/link';
import { LuDot } from "react-icons/lu";
import { IoEyeOutline } from "react-icons/io5";
import { FaTrash } from "react-icons/fa";
import { useAuth } from "@/app/(auth)/AuthContext";
import OverlayVideoThumbnail from './OverlayVideoThumbnail';
import HistorySkeleton from './HistorySkeleton';
import InfiniteScroll from 'react-infinite-scroll-component';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const HistoryContent = () => {
    const [history, setHistory] = useState([]);
    const { user, firebaseUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
  
    useEffect(() => {
      if (firebaseUser) {
        fetchHistory();
      }
    }, [firebaseUser]);
  
    const fetchHistory = async () => {
      if (firebaseUser) {
        try {
          setLoading(true);
          const token = await firebaseUser.getIdToken();
          
          const response = await fetch(`${API_BASE_URL}/api/history?page=${page}&limit=10`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setHistory(prevHistory => [...prevHistory, ...data.history]);
            setHasMore(data.hasMore);
            setPage(prevPage => prevPage + 1);
          } else {
            const errorText = await response.text();
            setError(`Failed to fetch history: ${response.status} ${errorText}`);
          }
        } catch (error) {
          setError(`Error fetching history: ${error.message}`);
        } finally {
          setLoading(false);
        }
      } else {
        setError('No user logged in');
        setLoading(false);
      }
    };

    const clearHistory = async () => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          const response = await fetch(`${API_BASE_URL}/api/history/clear`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            setHistory([]);
            setPage(1);
            setHasMore(true);
          } else {
            console.error('Failed to clear history');
          }
        } catch (error) {
          console.error('Error clearing history:', error);
        }
      }
    };

    const removeFromHistory = async (historyId) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          const response = await fetch(`${API_BASE_URL}/api/history/${historyId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            setHistory(history.filter(item => item._id !== historyId));
          } else {
            console.error('Failed to remove item from history');
          }
        } catch (error) {
          console.error('Error removing item from history:', error);
        }
      }
    };

    // Helper function to get the correct link path based on content type
    const getContentLink = (item) => {
      if (item.contentType === 'video' && item.video) {
        return `/beyond_news/nestedvideo/${item.video._id}`;
      } else if (item.contentType === 'article' && item.article) {
        return `/beyond_news/nestedarticle/${item.article._id}`;
      }
      return '#';
    };

    return (
      <div className="container mx-auto px-4 tablet:px-6 desktop:px-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl tablet:text-2xl desktop:text-3xl font-bold">Watch/Read History</h2>
          <button onClick={clearHistory} className="bg-red-500 text-white px-3 py-1 tablet:px-4 tablet:py-2 rounded text-sm tablet:text-base">Clear History</button>
        </div>
        {loading && history.length === 0 ? (
          <HistorySkeleton />
        ) : error ? (
          <div className="text-center">
            <p className="text-red-500 mb-4">Error: {error}</p>
            <button onClick={fetchHistory} className="bg-blue-500 text-white px-4 py-2 rounded text-sm tablet:text-base">
              Retry
            </button>
          </div>
        ) : (
          <InfiniteScroll
            dataLength={history.length}
            next={fetchHistory}
            hasMore={hasMore}
            loader={<HistorySkeleton />}
            endMessage={
              <p className="text-center py-4">
                <b>You have seen it all!</b>
              </p>
            }
          >
            <div className="space-y-6">
              {history.map((item) => (
                <div key={item._id} className="flex flex-col tablet:flex-row gap-4 items-start tablet:items-center bg-white p-4 rounded-lg shadow-sm">
                  <Link href={getContentLink(item)} className="w-full tablet:w-3/12 desktop:w-2/12 aspect-video">
                    <div className="relative w-full h-full">
                      {item.contentType === 'video' && item.video ? (
                        <OverlayVideoThumbnail
                          src={item.video.thumbnailUrl}
                          alt={item.video.title}
                        />
                      ) : item.contentType === 'article' && item.article ? (
                        <Image
                          src={item.article.previewImage}
                          alt={item.article.title}
                          layout="fill"
                          objectFit="cover"
                          className="rounded-md"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
                          <span className="text-gray-400">No image</span>
                        </div>
                      )}
                    </div>
                  </Link>
                  <Link href={getContentLink(item)} className="font-sans flex-grow">
                    <p className="text-sm tablet:text-base desktop:text-lg font-bold line-clamp-2 hover:text-blue-600">
                      {item.contentType === 'video' && item.video ? item.video.title :
                       item.contentType === 'article' && item.article ? item.article.title :
                       'Unknown Content'}
                    </p>
                    <div className="text-xs tablet:text-sm text-gray-500 mt-2 space-y-1">
                      <p className='flex items-center'>
                        <LuDot className="mr-1" />
                        <span className="line-clamp-1">
                          {item.contentType === 'video' && item.video && item.video.channelId ? item.video.channelId.name :
                           item.contentType === 'article' && item.article && item.article.channelId ? item.article.channelId.name :
                           'Unknown Channel'}
                        </span>
                      </p>
                      <p className='flex items-center'>
                        <IoEyeOutline className="mr-1" />
                        <span>
                          {item.contentType === 'video' ? 'Watched' : 'Read'} on {new Date(item.viewedAt).toLocaleDateString()}
                        </span>
                      </p>
                    </div>
                  </Link>
                  <button 
                    onClick={() => removeFromHistory(item._id)} 
                    className="text-red-500 hover:text-red-700 transition-colors mt-2 tablet:mt-0"
                    aria-label="Remove from history"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          </InfiniteScroll>
        )}
      </div>
    );
  }
  
  export default HistoryContent;