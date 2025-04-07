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
import { useScrollToItem } from './useScrollToItem';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

const BeThumbArticle = ({article}) => {
    const { user,firebaseUser } = useAuth();
    const router = useRouter();
    const { setLastClickedItem } = useScrollToItem();
    const [clickedId, setClickedId] = useState(null);

  
    const handleClick = async (articleId) => {
        setClickedId(articleId);
          // Track which item was clicked for later scroll restoration
    setLastClickedItem(`article-${articleId}`);
    
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
// Navigate to article page based on auth status 
      //   setTimeout(() => {
      //     if (!user) {
      //       router.push('/login');
      //     } else {
      //       router.push(`/beyond_news/nestedarticle/${articleId}`);
      //     }
      //   }, 100);
      // };

       // Navigate to article page regardless of auth status
      setTimeout(() => {
        router.push(`/beyond_news/nestedarticle/${articleId}`);
    }, 100);
    };

  
      return (
        <div 
            key={article._id} 
            onClick={() => handleClick(article._id)} 
            className={`w-full cursor-pointer transition-all duration-150 
                border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md
                ${clickedId === article._id ? 'scale-95 opacity-80' : ''}
            `}
        >
            <div className="p-4 capitalize">
                <div className="border-gray-200 dark:border-gray-700  gap-3 flex items-center mb-2 ">
                    <div className="avatar">
                        <div className="w-11 rounded-full">
                            <Image src={article.channelId?.picture || '/NopicAvatar.png'} alt={article.channelId?.name || 'Channel'} width={40} height={40} className="rounded-full" />
                        </div>
                    </div>
                    <p className="font-semibold text-sm dark:text-gray-200">@{article.channelId?.name || 'Unknown Channel'}</p>
                </div>
                <p className="text-xs text-gray-400 flex items-center"><LuDot size='1.2em'/>{formatDate(article.createdAt)}</p>

                <p className='font-semibold text-base tablet:text-lg mb-2 dark:text-gray-200'>
                    <TruncateText text={article.title} maxLength={28} />
                </p>
                <p className="text-sm tablet:text-md text-gray-600 mb-3 dark:text-gray-200">
                    <TruncateText text={article.previewContent} maxLength={100} />
                </p>
                {article.previewImage && (
                    <div className="relative h-40 tablet:h-48 desktop:h-56 mb-3">
                        <Image src={article.previewImage} fill alt={article.title} className="rounded-md object-cover"/>
                    </div>
                )}
                <div className="flex justify-between text-sm text-gray-400">
                    <p className='flex items-center gap-0.5'><FaRegComment size="1.2em"/>{article.commentsCount}</p>
                    <p className='flex items-center gap-0.5'><BiLike size="1.2em"/>{article.likesCount}</p>
                    <p className='flex items-center gap-0.5'><IoEyeOutline size='1.4em'/>{article.viewsCount}</p>
                </div>
            </div>
        </div>
    );
}

export default BeThumbArticle;