'use client'
import { useState, useEffect } from 'react';
import Image from "next/image";
import { LuDot } from "react-icons/lu";
import { IoEyeOutline } from "react-icons/io5";
import { FaTrash } from "react-icons/fa";
import { useAuth } from "@/app/(auth)/AuthContext";
import OverlayVideoThumbnail from './OverlayVideoThumbnail';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const HistoryContent = () => {
    const [history, setHistory] = useState([]);
    const { user, firebaseUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  
    useEffect(() => {
      fetchHistory();
    }, [firebaseUser]);
  
    const fetchHistory = async () => {
      if (firebaseUser) {
        try {
          setLoading(true);
          const token = await firebaseUser.getIdToken();
          
          const response = await fetch(`${API_BASE_URL}/api/history`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('Fetched history:', data); // Debug log
            setHistory(data);
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

  return (
    <div className="container mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Watch/Read History</h2>
          <button onClick={clearHistory} className="bg-red-500 text-white px-4 py-2 rounded">Clear History</button>
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <div>
            <p>Error: {error}</p>
            <button onClick={fetchHistory} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">
              Retry
            </button>
          </div>
        ) : history.length > 0 ? (
          history.map((item) => (
            <div key={item._id} className="w-full border-gray-200 py-2 mb-4 flex gap-4 items-center">
              <div className="relative w-4/12 h-24">
                {item.contentType === 'video' && item.video ? (
                  <OverlayVideoThumbnail
                    src={item.video.thumbnailUrl}
                    alt={item.video.title}
                    width={192}
                    height={96}
                  />
                ) : item.contentType === 'article' && item.article ? (
                  <Image
                    src={item.article.previewImage}
                    alt={item.article.title}
                    width={192}
                    height={96}
                    className="object-cover rounded-md"
                  />
                ) : (
                  <div>No image available</div>
                )}
              </div>
              <div className="font-sans w-7/12">
                <p className="text-sm font-extrabold capitalize">
                  {item.contentType === 'video' && item.video ? item.video.title :
                   item.contentType === 'article' && item.article ? item.article.title :
                   'Unknown Content'}
                </p>
                <div className="text-sm mt-2 text-gray-400">
                  <p className='flex gap-1'>
                    <LuDot size='1.2em'/>
                    {item.contentType === 'video' && item.video && item.video.channelId ? item.video.channelId.name :
                     item.contentType === 'article' && item.article && item.article.channelId ? item.article.channelId.name :
                     'Unknown Channel'}
                  </p>
                  <p className='flex gap-1'>
                    <IoEyeOutline size='1.4em'/> 
                    {item.contentType === 'video' ? 'Watched' : 'Read'} on {new Date(item.viewedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="w-1/12">
                <button onClick={() => removeFromHistory(item._id)} className="text-red-500">
                  <FaTrash />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No history available.</p>
        )}
      </div>
  );
}

export default HistoryContent;