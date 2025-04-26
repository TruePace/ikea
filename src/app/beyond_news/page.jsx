'use client' 
import { useEffect } from 'react';
import Header from "@/components/Beyond_news_comps/beyond-header/Header";
import BeyondContent from "@/components/Beyond_news_comps/beyond-thumbnail/BeyondContent";
import SecondSocketHandler from "@/components/Socket io/SecondSocketHandler";
import SocketHandler from "@/components/Socket io/SocketHandler";
import { useScrollPosition } from '@/components/Beyond_news_comps/beyond-thumbnail/useScrollPosition';

const Page = () => {
    // Use the updated scroll position hook
    const { scrollContainerRef } = useScrollPosition();
    
    return (
        <div className="flex flex-col h-screen pb-16">
            <Header />
            <div
                id="beyondNewsContent"
                className="flex-grow overflow-y-auto pt-4"
                ref={scrollContainerRef}
            >
                <SocketHandler />
                <SecondSocketHandler />
                <BeyondContent />
            </div>
        </div>
    );
}

export default Page;