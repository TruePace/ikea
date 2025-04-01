

import Header from "@/components/Beyond_news_comps/beyond-header/Header";
import React, { lazy, Suspense } from 'react';

const NestedVidComps = lazy(() => import('@/components/Beyond_news_comps/beyond-nestedvideocomp/NestedVidComps'));


// Your component
const Page = () => {
  return (
    <>
      <div className="flex flex-col h-screen pb-11">
        <Header/>
        <Suspense fallback={<div>Loading...</div>}>
          <div className="flex-grow overflow-y-auto pt-4">
            <NestedVidComps />
          </div>
        </Suspense>
      </div>
    </>
  );
}

export default Page;