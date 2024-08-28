import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ToggleSearchBar from '../../../SearchBar/ToggleSearchBar';
import { useAuth } from '@/app/(auth)/AuthContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const SubscribeFeed = ({ channel }) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(channel.subscriberCount || 0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();
  const { user } = useAuth();

  const handleSubscribe = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (isSubscribed) {
      setShowDropdown(!showDropdown);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/HeadlineNews/Channel/${channel._id}/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.uid }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsSubscribed(true);
        setSubscriberCount(data.subscriberCount);
      } else {
        console.error('Failed to subscribe');
      }
    } catch (error) {
      console.error('Error subscribing:', error);
    }
  };

  const handleUnsubscribe = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/HeadlineNews/Channel/${channel._id}/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.uid }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsSubscribed(false);
        setSubscriberCount(data.subscriberCount);
        setShowDropdown(false);
      } else {
        console.error('Failed to unsubscribe');
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <div className="border-gray-200 w-full flex items-center justify-between">
        <div className="avatar">
          <div className="w-11 h-11 relative rounded-full overflow-hidden">
            <Image src={channel.picture} alt={channel.name} fill className="object-cover" />
          </div>
        </div>
        <Link href={`/truepacer_profile/${channel._id}`}>
          <p className="font-semibold text-sm whitespace-nowrap">{channel.name}</p>
        </Link>
        <div className="relative" ref={dropdownRef}>
          <button
            className={`btn btn-sm font-bold ${isSubscribed ? 'bg-gray-300' : 'bg-neutral-content'} flex items-center`}
            onClick={handleSubscribe}
          >
            {isSubscribed ? 'Subscribed' : 'Subscribe'}
            {isSubscribed && (
              <svg
                className="w-4 h-4 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
              <button
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={handleUnsubscribe}
              >
                Unsubscribe
              </button>
            </div>
          )}
        </div>
        <ToggleSearchBar />
      </div>
    </>
  );
};

export default SubscribeFeed;