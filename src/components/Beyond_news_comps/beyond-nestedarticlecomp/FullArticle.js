'use client'
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from "next/image";
import { formatDate } from '@/components/Utils/DateFormat';
import ArticleInteractions from './ArticleInteractions';
import { useAuth } from '@/app/(auth)/AuthContext';
import NestedSkeletonLoader from '../beyond-header/NestedSkeletonLoader';
import ShareArticleComp from './ShareArticleComp';
import SEO from '@/components/SEO/Seo'; // Import SEO component

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const FullArticle = () => {
    const [article, setArticle] = useState(null);
    const { id } = useParams();
    
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
    }, [id]);
    
    if (!article) {
        return <NestedSkeletonLoader />
    }
    
    // Create SEO-friendly description from the article content
    const seoDescription = article.previewContent 
        ? article.previewContent.substring(0, 160) 
        : `Read "${article.title}" and more in-depth news on TruePace News`;
        
    return (
        <>
            {/* SEO Component with dynamic content */}
            <SEO
                title={`${article.title} | TruePace News`}
                description={seoDescription}
                ogImage={article.previewImage}
                canonical={`/beyond_news/nestedarticle/${id}`}
                article={true}
                tags={article.tags || []}
            />
            
            <div className="max-w-3xl mx-auto p-4 pt-8 sm:pt-12 md:pt-20 desktop:max-w-4xl">
                <h1 className="text-2xl sm:text-3xl desktop:text-4xl font-bold mb-4 dark:text-gray-200">{article.title}</h1>
                <div className="mb-4 relative w-full" style={{ height: '0', paddingBottom: '56.25%' }}>
                    <Image
                        src={article.previewImage}
                        alt={article.title}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-lg"
                    />
                </div>
                <ArticleInteractions article={article} />
                <ShareArticleComp article={article} />
                <div className="flex justify-between text-sm mb-4 text-gray-600 dark:text-gray-200">
                    <p>{formatDate(article.createdAt)}</p>
                </div>
                <div className="mb-4">
                    {article.tags && article.tags.map((tag, index) => (
                        <span key={index} className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                            #{tag}
                        </span>
                    ))}
                </div>
                <div className="prose max-w-none dark:text-gray-200" dangerouslySetInnerHTML={{ __html: article.fullContent }} />
            </div>
        </>
    );
};

export default FullArticle;