import Image from "next/image";
import { useAuth } from "@/app/(auth)/AuthContext";
import { useSelector, useDispatch } from 'react-redux';
import { setSubscription } from '@/Redux/Slices/SubscriptionSlice';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const SubscribeMissed = ({ channelId, channelName, channelPicture, subscriberCount }) => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const isSubscribed = useSelector(state => 
    state.subscriptions[user?.uid]?.[channelId] || false
  );

  const handleSubscribe = async () => {
    if (!user) {
      // Handle not logged in state
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/HeadlineNews/Channel/${channelId}/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.uid }),
      });

      if (response.ok) {
        const data = await response.json();
        dispatch(setSubscription({ userId: user.uid, channelId, isSubscribed: true }));
        // Update subscriber count if needed
      } else {
        console.error('Failed to subscribe');
      }
    } catch (error) {
      console.error('Error subscribing:', error);
    }
  };

  const handleUnsubscribe = async () => {
    if (!user) {
      // Handle not logged in state
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/HeadlineNews/Channel/${channelId}/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.uid }),
      });

      if (response.ok) {
        const data = await response.json();
        dispatch(setSubscription({ userId: user.uid, channelId, isSubscribed: false }));
        // Update unsubscriber count if needed
      } else {
        console.error('Failed to unsubscribe');
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
    }
  };

  const handleSubscriptionAction = () => {
    if (isSubscribed) {
      handleUnsubscribe();
    } else {
      handleSubscribe();
    }
  };

  return (
    <div className="border-gray-200 w-full flex items-center gap-4">
      <div className="avatar">
        <div className="w-9 h-9 relative rounded-full overflow-hidden">
          <Image src={channelPicture} alt={channelName} fill className="object-cover"/>
        </div>
      </div>
      <p className="font-semibold text-sm capitalize text-gray-600">{channelName}</p>
      <button 
        className={`btn btn-sm font-bold ${isSubscribed ? 'bg-gray-200 text-gray-700' : 'bg-neutral-content'}`}
        onClick={handleSubscriptionAction}
      >
        {isSubscribed ? 'Subscribed' : 'Subscribe'}
      </button>
    </div>
  );
}

export default SubscribeMissed;