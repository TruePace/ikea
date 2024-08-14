'use client'
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BiLike, BiDislike } from "react-icons/bi";
import { setLikeDislike } from '../../../../../Redux/Slices/LikeDislikeSlice';

const LikeDislikeButton = ({ contentId, initialLikeCount, initialDislikeCount }) => {
    const dispatch = useDispatch();
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
    }, [stateFromRedux,contentId]);

    const handleLikeDislike = async (action) => {
        try {
            const response = await fetch(`http://localhost:4000/api/HeadlineNews/Content/${action}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ contentId }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`Network response was not ok: ${errorText}`);
            }

            const data = await response.json();
            // console.log('Response data:', data);

            // Update local state immediately
            setLikeCount(data.likeCount);
            setDislikeCount(data.dislikeCount);
            setActiveButton(action); // Set the active button

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
        <div className="flex justify-between  border-red-500 w-1/4">{/*border-2*/}
            <button onClick={handleLike} className={`h-12 ${activeButton === 'like' ? 'text-blue-500' : 'text-gray-400'}`}>
                <BiLike size='1.6em' className="m-auto" />
                <p className="text-xs">{likeCount || 0 }</p>
            </button>
            <button onClick={handleDislike} className={`h-12 ${activeButton === 'dislike' ? 'text-red-500' : 'text-gray-400'}`}>
                <BiDislike size='1.6em' className="m-auto" />
                <p className="text-xs">{dislikeCount || 0}</p>
            </button>
        </div>
    );
}

export default LikeDislikeButton;