'use client' 
import { useEffect } from 'react';
import Header from "@/components/Beyond_news_comps/beyond-header/Header";
import BeyondContent from "@/components/Beyond_news_comps/beyond-thumbnail/BeyondContent";
import SecondSocketHandler from "@/components/Socket io/SecondSocketHandler";
import SocketHandler from "@/components/Socket io/SocketHandler";
import { useScrollPosition } from '@/components/Beyond_news_comps/beyond-thumbnail/useScrollPosition';
import SEO from '@/components/SeoDir/Seo';




const Page = () => {
    // Use the updated scroll position hook
    const { scrollContainerRef } = useScrollPosition();
    
    return (
        <div className="flex flex-col h-screen pb-16">
              <SEO 
                title="Beyond Headlines - In-depth News | TruePace"
                description="Explore in-depth news, analysis, and extended stories behind the headlines at TruePace."
                canonical="/beyond_news"
                tags={["in-depth news", "analysis", "extended stories", "beyond headlines"]}
            />
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