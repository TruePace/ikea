'use client'
import { useState, useEffect,useRef } from 'react';
import { useParams } from 'next/navigation';
import Image from "next/image";
import { formatDate } from '@/components/Utils/DateFormat';
import ArticleInteractions from './ArticleInteractions';
import { useAuth } from '@/app/(auth)/AuthContext';
import NestedSkeletonLoader from '../beyond-header/NestedSkeletonLoader';
import ShareArticleComp from './ShareArticleComp';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const FullArticle = () => {
    const [article, setArticle] = useState(null);
    const { id } = useParams();
    const { user, firebaseUser } = useAuth();
    const [hasViewed, setHasViewed] = useState(false);
    const articleRef = useRef(null);
    const viewTimerRef = useRef(null);
   
    


    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/BeyondArticle/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setArticle(data);
                } else {
                    console.error('Failed to fetch article');
                }
            } catch (error) {
                console.error('Error fetching article:', error);
            }
        };

        fetchArticle();

       
        // Set up scroll and mouse movement listeners
        let lastActivityTime = Date.now();
        const activityThreshold = 5000; // 5 seconds

        const handleActivity = () => {
            lastActivityTime = Date.now();
        };

        window.addEventListener('scroll', handleActivity);
        window.addEventListener('mousemove', handleActivity);

        // Check for view after 20 seconds
        viewTimerRef.current = setTimeout(() => {
            if (Date.now() - lastActivityTime < activityThreshold) {
                handleView();
            }
        }, 20000);

        return () => {
            clearTimeout(viewTimerRef.current);
            window.removeEventListener('scroll', handleActivity);
            window.removeEventListener('mousemove', handleActivity);
        };
    }, [id]);

    const handleView = async () => {
        if (firebaseUser && !hasViewed) {
            try {
                const token = await firebaseUser.getIdToken();
                const response = await fetch(`${API_BASE_URL}/api/BeyondArticle/${id}/view`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                  
                });

                if (response.ok) {
                    const data = await response.json();
                    setArticle(prevArticle => ({
                        ...prevArticle,
                        viewsCount: data.viewsCount
                    }));
                    setHasViewed(true);
                }
            } catch (error) {
                console.error('Error updating view count:', error);
            }
        }
    };

    if (!article) {
        return <NestedSkeletonLoader/>
    }

    return (
        <div className="max-w-3xl mx-auto p-4" ref={articleRef}>
            <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
            <div className="mb-4">
                <Image src={article.previewImage} alt={article.title} width={800} height={400} className="rounded-lg" />
            </div>
            <ArticleInteractions article={article} />
            <ShareArticleComp article={article}/>
            <div className="flex justify-between text-sm mb-4 text-gray-600">
                <p>{formatDate(article.createdAt)}</p>
            </div>
             {/* Display tags */}
             <div className="mb-4">
                {article.tags && article.tags.map((tag, index) => (
                    <span key={index} className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                        #{tag}
                    </span>
                ))}
            </div>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: article.fullContent }} />
        </div>
    );
};

export default FullArticle;