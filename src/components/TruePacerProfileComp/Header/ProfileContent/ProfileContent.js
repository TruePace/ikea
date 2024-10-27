'use client'
import Image from "next/image";
import { LuDot, LuChevronDown } from "react-icons/lu";
import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { setSubscription } from "@/Redux/Slices/SubscriptionSlice";
import BeyondHeadlineContent from "./BeyondHeadlineContent";
import HeadlineNewsContent from "./HeadlineNewsContent";
import { fetchContents } from "@/components/Utils/HeadlineNewsFetch";
import { useAuth } from "@/app/(auth)/AuthContext";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const ProfileContent = ({profile}) => {
    const [activeTab, setActiveTab] = useState("Beyond Headline");
    const [subscriberCount, setSubscriberCount] = useState(profile.subscriberCount);
    const [isSticky, setIsSticky] = useState(false);
    const dispatch = useDispatch();
    const router = useRouter()
    const { user } = useAuth();
    const isSubscribed = useSelector(state => 
        state.subscriptions[user?.uid]?.[profile._id] || false
    );
    const [headlineContents, setHeadlineContents] = useState([]);
    const tabsRef = useRef(null);
    const tabsContainerRef = useRef(null);
    const [tabsHeight, setTabsHeight] = useState(0);

    useEffect(() => {
        const fetchCreatorContent = async () => {
            const contents = await fetchContents(profile._id);
            setHeadlineContents(contents);
        };
        fetchCreatorContent();
    }, [profile._id]);

    useEffect(() => {
        setSubscriberCount(profile.subscriberCount);
    }, [profile.subscriberCount]);

    useEffect(() => {
        if (tabsRef.current) {
            setTabsHeight(tabsRef.current.offsetHeight);
        }

        const handleScroll = () => {
            if (tabsRef.current && tabsContainerRef.current) {
                const containerRect = tabsContainerRef.current.getBoundingClientRect();
                
                if (containerRect.top <= 0) {
                    if (!isSticky) {
                        setIsSticky(true);
                        tabsRef.current.classList.add('fixed', 'top-0', 'left-0', 'tablet:left-16', 'desktop:left-64', 'right-0', 'z-50');
                        tabsContainerRef.current.style.paddingTop = `${tabsHeight}px`;
                    }
                } else {
                    if (isSticky) {
                        setIsSticky(false);
                        tabsRef.current.classList.remove('fixed', 'top-0', 'left-0', 'tablet:left-16', 'desktop:left-64', 'right-0', 'z-50');
                        tabsContainerRef.current.style.paddingTop = '0';
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [tabsHeight, isSticky]);

    const handleSubscribe = async () => {
        if (!user) {
            router.push('/login');
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/api/HeadlineNews/Channel/${profile._id}/subscribe`, {
                method: 'POST',
            });
            const data = await response.json();
            if (response.ok) {
                dispatch(setSubscription({ userId: user.uid, channelId: profile._id, isSubscribed: true }));
                setSubscriberCount(data.subscriberCount);
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
            const response = await fetch(`${API_BASE_URL}/api/HeadlineNews/Channel/${profile._id}/unsubscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: user.uid }),
            });
            const data = await response.json();
            if (response.ok) {
                dispatch(setSubscription({ userId: user.uid, channelId: profile._id, isSubscribed: false }));
                setSubscriberCount(data.subscriberCount);
            }
        } catch (error) {
            console.error('Error unsubscribing:', error);
        }
    };

    return (
        <>
            <div className="w-full py-3">
                <div className="border-gray-300-100 pt-2 pr-8 pl-2.5 pb-1 flex gap-4">
                <div className="avatar w-28 h-28 relative">
                        <div className="w-full h-full rounded-full overflow-hidden">
                            <Image 
                                src={profile.picture} 
                                alt="Avatar" 
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="rounded-full object-cover"
                                quality={100}
                            />
                        </div>
                    </div>

                    <div className="flex-1 font-sans">
                        <p className="font-bold text-xl mt-2">{profile.name}</p>
                        <p className="text-sm mt-2 text-gray-400">@Coolchannel</p>
                        <div className="flex gap-2 text-sm mt-2 text-gray-400">
                            <p className="flex">{subscriberCount} Subscriber{subscriberCount !== 1 ? 's' : ''} </p>
                            <p className="flex">< LuDot size="1.2em"/>12 videos</p>
                        </div>
                        {!isSubscribed ? (
                            <button 
                                className="btn w-40 mt-4 bg-black text-white hover:bg-gray-800 transition-colors duration-300"
                                onClick={handleSubscribe}
                            >
                                Subscribe
                            </button>
                        ) : (
                            <div className="dropdown dropdown-bottom">
                                <label 
                                    tabIndex={0}
                                    className="btn w-40 mt-4 bg-gray-200 text-black hover:bg-gray-300 transition-colors duration-300 flex items-center justify-between"
                                >
                                    <span>Subscribed</span>
                                    <LuChevronDown size="1.2em" />
                                </label>
                                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                                    <li><a onClick={handleUnsubscribe}>Unsubscribe</a></li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
<div ref={tabsContainerRef} className="w-full overflow-x-hidden">
    <div 
        ref={tabsRef} 
        className={`w-full flex bg-red-600 p-1 ${
            isSticky 
                ? 'fixed top-0 left-0 tablet:left-16 desktop:left-64 right-0 z-50 rounded-none' 
                : 'rounded-lg mx-0 tablet:mx-4 desktop:mx-4 mt-4'
        }`}
        style={{
            width: isSticky ? '100%' : 'auto'
        }}
    >
        <a 
            className={`flex-1 text-center py-2 px-4 rounded-md cursor-pointer whitespace-nowrap transition-colors duration-300 ${
                activeTab === "Beyond Headline" ? "bg-white text-black" : "text-white hover:bg-red-400"
            }`}
            onClick={() => setActiveTab("Beyond Headline")}
        >
            Beyond Headline
        </a>
        <a 
            className={`flex-1 text-center py-2 px-4 rounded-md cursor-pointer whitespace-nowrap transition-colors duration-300 ${
                activeTab === "Headline News" ? "bg-white text-black" : "text-white hover:bg-red-400"
            }`}
            onClick={() => setActiveTab("Headline News")}
        >
            Headline News
        </a>
    </div>

    {/* This div maintains spacing when tabs become fixed */}
    {isSticky && <div style={{ height: `${tabsHeight}px` }} />}

    <div className="mt-4 bg-base-200 rounded-lg mb-16 mx-4">
        {activeTab === "Beyond Headline" ? (
            <BeyondHeadlineContent channelId={profile._id}/>
        ) : (
            <HeadlineNewsContent initialContents={headlineContents} channel={profile} />
        )}
    </div>
</div>
        </>
    );
}

export default ProfileContent;