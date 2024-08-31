import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from 'react-redux';
import Link from "next/link";
import LikeDislikeButton from "./SubFeedComps/LikeDislikeButton";
import { FaRegComment } from "react-icons/fa";
import { IoIosShareAlt } from "react-icons/io";
import { RiScreenshot2Line } from "react-icons/ri";
import CommentSection from "./SubFeedComps/CommentSection";
import { useAuth } from "@/app/(auth)/AuthContext";
import { setCommentCount } from '../../../../Redux/Slices/CommentCountSlice';
import { auth } from "@/app/(auth)/firebase/ClientApp";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const EngagementFeed = ({ content }) => {
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const { user } = useAuth();
  const dispatch = useDispatch();
  const commentCount = useSelector(state => state.commentCount[content._id] || 0);

  const fetchCommentCount = useCallback(async () => {
    try {
      let token = null;
      if (user) {
        token = await auth.currentUser.getIdToken();
      }
      const response = await fetch(`${API_BASE_URL}/api/HeadlineNews/Comment/${content._id}/count`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!response.ok) throw new Error('Failed to fetch comment count');
      const data = await response.json();
      dispatch(setCommentCount({ contentId: content._id, count: data.commentCount }));
    } catch (error) {
      console.error("Error fetching comment count:", error);
    }
  }, [content._id, dispatch, user]);

  useEffect(() => {
    fetchCommentCount();
  }, [fetchCommentCount, user]); // Add user to the dependency array

  const handleCommentClick = (e) => {
    e.preventDefault();
    setIsCommentOpen(true);
  };

  const handleCommentAdded = (newCount) => {
    dispatch(setCommentCount({ contentId: content._id, count: newCount }));
  };

  return (
    <>
      <div className="w-full flex mt-7 justify-between text-gray-500 text-sm text-center">
        <LikeDislikeButton
          contentId={content._id}
          initialLikeCount={content.likeCount}
          initialDislikeCount={content.dislikeCount}
        />
        <a href='' onClick={handleCommentClick} className="h-12">
          <FaRegComment size='1.6em' className="m-auto" />
          <p className="text-xs">{commentCount} Comments</p>
        </a>
        <Link href='' className="">
          <IoIosShareAlt size='1.9em' className="m-auto"/>
          <p className="text-xs">Share <br/> Link </p>
        </Link>
        <Link href='' className="">
          <RiScreenshot2Line size='1.9em' className="m-auto" />
          <p className="text-xs">Share <br/>ScreenShot</p>
        </Link>
      </div>
      <CommentSection
        isOpen={isCommentOpen}
        onClose={() => setIsCommentOpen(false)}
        contentId={content._id}
        onCommentAdded={handleCommentAdded}
      />
    </>
  );
}

export default EngagementFeed;