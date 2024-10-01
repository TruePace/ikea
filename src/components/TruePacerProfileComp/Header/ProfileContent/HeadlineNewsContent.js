import Link from "next/link";
import React from "react";
import ContentFeed from "@/components/Headline_news_comps/Tabs/Headline_Tabs_Comps/ContentFeed";
import EngagementFeed from "@/components/Headline_news_comps/Tabs/Headline_Tabs_Comps/EngagementFeed";

const HeadlineNewsContent = ({ contents }) => {
  const handleView = (contentId) => {
    // Implement your view logic here
    console.log(`Content ${contentId} viewed`);
  };

  return (
    <div className="space-y-4">
      {contents.map((content) => (
        <div key={content._id} className="bg-white p-4 rounded-lg shadow">
          {/* <Link href={`/headline_news/${content._id}`}> */}
            <ContentFeed 
              content={content} 
              onView={() => handleView(content._id)}
              isViewed={false} // You might want to implement a way to track viewed content
            />
            <EngagementFeed content={content} />
          {/* </Link> */}
        </div>
      ))}
    </div>
  );
};

export default HeadlineNewsContent;