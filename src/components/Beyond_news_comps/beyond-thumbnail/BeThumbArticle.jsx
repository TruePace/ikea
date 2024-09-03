'use client'
import { useState, useEffect } from 'react';
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaRegComment } from "react-icons/fa";
import { BiLike } from "react-icons/bi";
import { IoEyeOutline } from "react-icons/io5";
import { LuDot } from "react-icons/lu";
import { useAuth } from "@/app/(auth)/AuthContext";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

const BeThumbArticle = () => {
    const { user } = useAuth();
    const router = useRouter();
    const [articles, setArticles] = useState([]);

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

    const handleClick = (articleId) => {
        if (!user) {
            router.push('/login');
        } else {
            router.push(`/beyond_news/nestedarticle/${articleId}`);
        }
    };

    return (
        <>
            {articles.map((article) => (
                <div key={article._id} onClick={() => handleClick(article._id)} className="w-full px-3 mb-20 cursor-pointer">
                    <div className="border-gray-200 gap-3 flex items-center">
                        <div className="avatar">
                            <div className="w-11 rounded-full">
                                <Image src={article.truepacerUrl} alt="Avatar" width={40} height={40} className="rounded-full" />
                            </div>
                        </div>
                        <p className="font-semibold text-sm">@{article.author}</p>
                        <p className="text-sm text-gray-400 flex"><LuDot size='1.2em'/>{new Date(article.createdAt).toLocaleString()}</p>
                    </div>

                    <p className="text-md text-gray-600 mt-2">{article.content.substring(0, 200)}...</p>

                    <div className="relative h-64 mt-2">
                        <Image src={article.imageUrl} fill alt={article.title} className="rounded-md object-cover"/>
                    </div>

                    <div className="flex justify-between text-sm mt-2 text-gray-400">
                        <p className='flex gap-0.5'><FaRegComment size="1.2em"/>{article.commentsCount}</p>
                        <p className='flex gap-0.5'><BiLike size="1.2em"/>{article.likesCount}</p>
                        <p className='flex gap-0.5'><IoEyeOutline size='1.4em'/>{article.viewsCount}</p>
                    </div>
                </div>
            ))}
        </>
    );
}

export default BeThumbArticle;