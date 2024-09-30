import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaPlay, FaNewspaper } from 'react-icons/fa';
import Image from "next/image";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const BeyondHeadlineContent = ({ channelId }) => {
  const [videos, setVideos] = useState([]);
  const [articles, setArticles] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const videosResponse = await fetch(`${API_BASE_URL}/api/BeyondVideo?channelId=${channelId}`);
        const articlesResponse = await fetch(`${API_BASE_URL}/api/BeyondArticle?channelId=${channelId}`);

        if (videosResponse.ok && articlesResponse.ok) {
          const videosData = await videosResponse.json();
          const articlesData = await articlesResponse.json();
          setVideos(videosData);
          setArticles(articlesData);
        } else {
          console.error('Failed to fetch content');
        }
      } catch (error) {
        console.error('Error fetching content:', error);
      }
    };

    if (channelId) {
      fetchContent();
    }
  }, [channelId]);

  const handleVideoClick = (videoId) => {
    router.push(`/beyond_news/nestedvideo/${videoId}`);
  };

  const handleArticleClick = (articleId) => {
    router.push(`/beyond_news/nestedarticle/${articleId}`);
  };

  const truncateTitle = (title, maxLength = 50) => {
    return title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
  };

  const renderContent = (items, type) => {
    if (items.length === 0) {
      return <p className="py-3">No {type} available for this channel.</p>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div 
            key={item._id} 
            className="cursor-pointer relative group mb-3 py-3 border-b-4 border-b-gray-200" 
            onClick={() => type === 'videos' ? handleVideoClick(item._id) : handleArticleClick(item._id)}
          >
            <p className="  mb-2 font-semibold">{truncateTitle(item.title)}</p>
            <div className="relative w-80  h-36">
              <Image 
                src={type === 'videos' ? item.thumbnailUrl : item.previewImage} 
                alt={item.title} 
                layout="fill"
                objectFit="cover"
                className="rounded-md"
              />
              {type === 'videos' && (
                <div className="absolute inset-0 flex items-center justify-center opacity-100 ">
                  <div className="bg-black bg-opacity-50 rounded-full p-3">
                    <FaPlay className="text-white text-2xl" />
                  </div>
                </div>
              )}
              {type === 'articles' && (
                <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                  <FaNewspaper className="text-gray-600 text-lg" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-bold mb-2">Beyond Headline</h3>

      <span className="text-md font-semibold   px-3 py-2 bg-red-800 text-white rounded-md ">Videos</span>
      {renderContent(videos, 'videos')}

      <span className="text-md font-semibold  px-3 py-2 bg-red-800 text-white rounded-md ">Articles</span>
      {renderContent(articles, 'articles')}
    </div>
  );
};

export default BeyondHeadlineContent;