import Header from "@/components/Beyond_news_comps/beyond-header/Header";
import React, { lazy, Suspense } from 'react';
const FullArticle = lazy(() => import("@/components/Beyond_news_comps/beyond-nestedarticlecomp/FullArticle"))
import NestedSkeletonLoader from "@/components/Beyond_news_comps/beyond-header/NestedSkeletonLoader";

const page = () => {
    return (
        <div>
          <Header/>
          <Suspense fallback={<div>Loading...</div>}>
  <FullArticle/>
</Suspense>
        </div>
    );
}

export default page;