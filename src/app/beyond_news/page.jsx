'use client'
import { useEffect } from 'react';
import Header from "@/components/Beyond_news_comps/beyond-header/Header";
import BeyondContent from "@/components/Beyond_news_comps/beyond-thumbnail/BeyondContent";
import SecondSocketHandler from "@/components/Socket io/SecondSocketHandler";
import SocketHandler from "@/components/Socket io/SocketHandler";

const Page = () => {
    // Generate a unique key when the page is loaded, forcing BeyondContent to remount
    // but only in the browser, not during server rendering
    const mountKey = typeof window !== 'undefined' ? `beyond-news-${Date.now()}` : 'server-render';
    
    useEffect(() => {
        console.log('Beyond News page mounted with key:', mountKey);
        
        // Log the current state of relevant localStorage values for debugging
        if (typeof window !== 'undefined') {
            console.log('localStorage state:', {
                lastClickedItemId: localStorage.getItem('lastClickedItemId'),
                lastVisitedPath: localStorage.getItem('lastVisitedPath'),
                contentCacheSize: JSON.parse(localStorage.getItem('contentCache') || '[]').length
            });
        }
    }, []);

    return (
        <div className="flex flex-col h-screen pb-16">
            <Header />
            <div className="flex-grow overflow-y-auto pt-4">
                <SocketHandler />
                <SecondSocketHandler />
                {/* Using the key prop forces the component to remount when navigating back */}
                <BeyondContent key={mountKey} />
            </div>
        </div>
    );
}

export default Page;