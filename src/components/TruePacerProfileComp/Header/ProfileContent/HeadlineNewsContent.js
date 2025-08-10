import React, { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import ContentFeed from "@/components/Headline_news_comps/Tabs/Headline_Tabs_Comps/ContentFeed";
import EngagementFeed from "@/components/Headline_news_comps/Tabs/Headline_Tabs_Comps/EngagementFeed";

const HeadlineNewsContent = ({ initialContents,channel }) => {
  const [contents, setContents] = useState(initialContents);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const fetchMoreData = async () => {
    const res = await fetch(`/api/HeadlineNews/Content?page=${page + 1}&limit=10`);
    const newContents = await res.json();
    if (newContents.length === 0) {
      setHasMore(false);
    } else {
      setContents([...contents, ...newContents]);
      setPage(page + 1);
    }
  };

  const handleView = (contentId) => {
    console.log(`Content ${contentId} viewed`);
  };
  

  return (
    <InfiniteScroll
      dataLength={contents.length}
      next={fetchMoreData}
      hasMore={hasMore}
    
    >
       <div className="space-y-4 ">
      {contents.map((content) => (
        <div key={content._id} className="bg-white p-4 rounded-lg shadow dark:bg-gray-800 dark:text-gray-200">
         <ContentFeed 
              content={content} 
              onView={() => handleView(content._id)}
              isViewed={false} // You might want to implement a way to track viewed content
            />
<EngagementFeed content={content} isViewed={false}  channel={channel}/>
        </div>
      ))}
    </div>
    </InfiniteScroll>
  );
};

export default HeadlineNewsContent;
