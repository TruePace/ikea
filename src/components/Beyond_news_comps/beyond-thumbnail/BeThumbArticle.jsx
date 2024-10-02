'use client'
import { useState, useEffect } from 'react';
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaRegComment } from "react-icons/fa";
import { BiLike } from "react-icons/bi";
import { IoEyeOutline } from "react-icons/io5";
import { LuDot } from "react-icons/lu";
import { useAuth } from "@/app/(auth)/AuthContext";
import { formatDate } from '@/components/Utils/DateFormat';
import TruncateText from './TruncateText';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

const BeThumbArticle = () => {
    const { user,firebaseUser } = useAuth();
    const router = useRouter();
    const [articles, setArticles] = useState([]);
    const [clickedId, setClickedId] = useState(null);

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/BeyondArticle`);
                if (response.ok) {
                    const data = await response.json();
                    setArticles(data);
                } else {
                    console.error('Failed to fetch articles');
                }
            } catch (error) {
                console.error('Error fetching articles:', error);
            }
        };

        fetchArticles();
    }, []);

    const handleClick = async (articleId) => {
        setClickedId(articleId);
        if (firebaseUser) {
          try {
            const token = await firebaseUser.getIdToken();
            await fetch(`${API_BASE_URL}/api/history/add`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                contentType: 'article',
                contentId: articleId,
                duration: 0 // You can update this later if you track reading time
              })
            });
          } catch (error) {
            console.error('Error adding article to history:', error);
          }
        }
        setTimeout(() => {
          if (!user) {
            router.push('/login');
          } else {
            router.push(`/beyond_news/nestedarticle/${articleId}`);
          }
        }, 100);
      };

    return (
        <>
            {articles.map((article) => (
                <div 
                    key={article._id} 
                    onClick={() => handleClick(article._id)} 
                    className={`w-full px-3 mb-20 cursor-pointer transition-all duration-150 ${
                        clickedId === article._id ? 'scale-95 opacity-80' : ''
                    }`}
                >
                    <div className="border-gray-200 gap-3 flex items-center">
                        <div className="avatar">
                            <div className="w-11 rounded-full">
                                <Image src={article.channelId?.picture || '/NopicAvatar.png'} alt={article.channelId?.name || 'Channel'} width={40} height={40} className="rounded-full" />
                            </div>
                        </div>
                        <p className="font-semibold text-sm">@{article.channelId?.name || 'Unknown Channel'}</p>
                        <p className="text-sm text-gray-400 flex"><LuDot size='1.2em'/>{formatDate(article.createdAt)}</p>
                    </div>
                    <p className='font-semibold text-lg mt-2'>
     <TruncateText text={article.title} maxLength={40} />
</p>
<p className="text-md text-gray-600 mt-2">
  <TruncateText text={article.previewContent} maxLength={100} />
</p>
                    <div className="relative h-60 mt-2">
                        <Image src={article.previewImage} fill alt={article.title} className="rounded-md object-cover"/>
                    </div>

                    <div className="flex justify-between text-sm mt-2 text-gray-400">
                        <p className='flex gap-0.5'><FaRegComment size="1.2em"/>{article.commentsCount}</p>
                        <p className='flex gap-0.5'><BiLike size="1.2em"/>{article.likesCount}</p>
                        <p className='flex gap-0.5'><IoEyeOutline size='1.4em'/>{article.viewsCount}</p>
                        {/* <p className='flex gap-0.5'>Read time: {article.avgReadTime} min</p> */}
                    </div>
                </div>
            ))}
        </>
    );
}

export default BeThumbArticle;