import Header from "@/components/Beyond_news_comps/beyond-header/Header";
// import NestedVidComps from "@/components/Beyond_news_comps/beyond-nestedvideocomp/NestedVidComps";
import React, { lazy, Suspense } from 'react';
const NestedVidComps = lazy(() => import('@/components/Beyond_news_comps/beyond-nestedvideocomp/NestedVidComps'));


const page = () => {
    return (
        <div>
        <Header/>
        <Suspense fallback={<div>Loading...</div>}>
  <NestedVidComps />
</Suspense>
        </div>
    );
}

export default page;