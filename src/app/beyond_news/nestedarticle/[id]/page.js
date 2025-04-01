

import Header from "@/components/Beyond_news_comps/beyond-header/Header";
import React, { lazy, Suspense } from 'react';

const FullArticle = lazy(() => import("@/components/Beyond_news_comps/beyond-nestedarticlecomp/FullArticle"));


// Your component
const Page = () => {
  return (
    <>
      <div className="flex flex-col h-screen pb-11">
        <Header/>
        <Suspense fallback={<div>Loading...</div>}>
          <div className="flex-grow overflow-y-auto pt-4">
            <FullArticle/>
          </div>
        </Suspense>
      </div>
    </>
  );
}

export default Page;