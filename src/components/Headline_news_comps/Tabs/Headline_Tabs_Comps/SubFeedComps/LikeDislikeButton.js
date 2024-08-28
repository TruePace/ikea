'use client'
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { BiLike, BiDislike } from "react-icons/bi";
import { setLikeDislike } from '../../../../../Redux/Slices/LikeDislikeSlice';
import { useAuth } from '@/app/(auth)/AuthContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const LikeDislikeButton = ({ contentId, initialLikeCount, initialDislikeCount }) => {
    const dispatch = useDispatch();
    const router = useRouter();
    const { user } = useAuth();
    const stateFromRedux = useSelector(state => state.likeDislike[contentId]);

    const [likeCount, setLikeCount] = useState(initialLikeCount || 0);
    const [dislikeCount, setDislikeCount] = useState(initialDislikeCount || 0);
    const [activeButton, setActiveButton] = useState(null);

    useEffect(() => {
        if (stateFromRedux) {
            setLikeCount(stateFromRedux.likeCount);
            setDislikeCount(stateFromRedux.dislikeCount);
            setActiveButton(stateFromRedux.activeButton);
        }
    }, [stateFromRedux, contentId]);

    const handleLikeDislike = async (action) => {
        if (!user) {
            router.push('/login');
            return;
        }

        if (activeButton === action) {
            // User is trying to click the same button again, so ignore
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/HeadlineNews/Content/${action}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ contentId, userId: user.uid }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`Network response was not ok: ${errorText}`);
            }

            const data = await response.json();

            // Update local state
            setLikeCount(data.likeCount);
            setDislikeCount(data.dislikeCount);
            setActiveButton(action);

            // Update Redux state
            dispatch(setLikeDislike({
                contentId,
                likeCount: data.likeCount,
                dislikeCount: data.dislikeCount,
                activeButton: action,
            }));
        } catch (error) {
            console.error(`Error ${action}ing content:`, error);
        }
    };

    const handleLike = () => handleLikeDislike('like');
    const handleDislike = () => handleLikeDislike('dislike');

    return (
        <div className="flex justify-between w-1/4">
            <button onClick={handleLike} className={`h-12 ${activeButton === 'like' ? 'text-blue-500' : 'text-gray-500'}`}>
                <BiLike size='1.6em' className="m-auto" />
                <p className="text-xs">{likeCount || 0}</p>
            </button>
            <button onClick={handleDislike} className={`h-12 ${activeButton === 'dislike' ? 'text-red-500' : 'text-gray-500'}`}>
                <BiDislike size='1.6em' className="m-auto" />
                <p className="text-xs">{dislikeCount || 0}</p>
            </button>
        </div>
    );
}

export default LikeDislikeButton;