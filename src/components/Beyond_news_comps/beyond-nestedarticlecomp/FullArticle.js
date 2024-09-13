'use client'
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from "next/image";
import { formatDate } from '@/components/Utils/DateFormat';
import ArticleInteractions from './ArticleInteractions';

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
        return <div>Loading...</div>;
    }

    return (
        <div className="max-w-3xl mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
            <div className="mb-4">
                <Image src={article.previewImage} alt={article.title} width={800} height={400} className="rounded-lg" />
            </div>
            <ArticleInteractions article={article} />
            <div className="flex justify-between text-sm mb-4 text-gray-600">
                <p>{formatDate(article.createdAt)}</p>
                <p>{article.readTime} min read</p>
            </div>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: article.fullContent }} />
        </div>
    );
};

export default FullArticle;