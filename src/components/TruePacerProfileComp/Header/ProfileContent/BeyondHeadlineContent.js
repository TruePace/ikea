import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaPlay, FaNewspaper } from 'react-icons/fa';
import Image from "next/image";
import InfiniteScroll from "react-infinite-scroll-component";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const BeyondHeadlineContent = ({ channelId }) => {
  const [combinedContent, setCombinedContent] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const router = useRouter();

  const fetchContent = async () => {
    try {
      const videosResponse = await fetch(`${API_BASE_URL}/api/BeyondVideo?channelId=${channelId}&page=${page}&limit=5`);
      const articlesResponse = await fetch(`${API_BASE_URL}/api/BeyondArticle?channelId=${channelId}&page=${page}&limit=5`);

      if (videosResponse.ok && articlesResponse.ok) {
        const videosData = await videosResponse.json();
        const articlesData = await articlesResponse.json();

        const newContent = [
          ...videosData.map(v => ({ ...v, type: 'video' })),
          ...articlesData.map(a => ({ ...a, type: 'article' }))
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        if (newContent.length === 0) {
          setHasMore(false);
        } else {
          setCombinedContent(prevContent => [...prevContent, ...newContent]);
          setPage(prevPage => prevPage + 1);
        }
      } else {
        console.error('Failed to fetch content');
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    }
  };

  useEffect(() => {
    if (channelId) {
      fetchContent();
    }
  }, [channelId]);

  const handleContentClick = (item) => {
    if (item.type === 'video') {
      router.push(`/beyond_news/nestedvideo/${item._id}`);
    } else {
      router.push(`/beyond_news/nestedarticle/${item._id}`);
    }
  };

  const truncateTitle = (title, maxLength = 50) => {
    return title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
  };

  const renderContent = () => {
    if (combinedContent.length === 0) {
      return <p className="py-3">No content available for this channel.</p>;
    }

    return (
       <InfiniteScroll
        dataLength={combinedContent.length}
        next={fetchContent}
        hasMore={hasMore}
        loader={<h4>Loading...</h4>}
      >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {combinedContent.map((item) => (
          <div
            key={item._id}
            className="cursor-pointer relative group mb-3 py-3 border-b-4 border-b-gray-200"
            onClick={() => handleContentClick(item)}
          >
            <p className="mb-2 font-semibold">{truncateTitle(item.title)}</p>
            <div className="relative w-80 h-36">
              <Image
                src={item.type === 'video' ? item.thumbnailUrl : item.previewImage}
                alt={item.title}
                layout="fill"
                objectFit="cover"
                className="rounded-md"
              />
              {item.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center opacity-100">
                  <div className="bg-black bg-opacity-50 rounded-full p-3">
                    <FaPlay className="text-white text-2xl" />
                  </div>
                </div>
              )}
              {item.type === 'article' && (
                <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                  <FaNewspaper className="text-gray-600 text-lg" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      </InfiniteScroll>
    );
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-bold mb-2">Beyond Headline</h3>
      {renderContent()}
    </div>
  );
};

export default BeyondHeadlineContent;