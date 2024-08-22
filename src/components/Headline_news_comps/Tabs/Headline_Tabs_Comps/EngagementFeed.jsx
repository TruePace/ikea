import { useState, useEffect } from "react";
import Link from "next/link";
import LikeDislikeButton from "./SubFeedComps/LikeDislikeButton";
import { FaRegComment } from "react-icons/fa";
import { IoIosShareAlt } from "react-icons/io";
import { RiScreenshot2Line } from "react-icons/ri";
import CommentSection from "./SubFeedComps/CommentSection";

const EngagementFeed = ({content}) => {
    const [isCommentOpen, setIsCommentOpen] = useState(false);
    const [commentCount, setCommentCount] = useState(0);
  
    useEffect(() => {
      fetchCommentCount();
    }, []);

    const fetchCommentCount = async () => {
        try {
          const response = await fetch(`http://localhost:4000/api/HeadlineNews/Comment/${content._id}`);
          const data = await response.json();
          setCommentCount(data.commentCount);
        } catch (error) {
          console.error("Error fetching comment count:", error);
        }
      };

    const handleCommentClick = (e) => {
      e.preventDefault();
      setIsCommentOpen(true);
    };
  
    return (
      <>
        <div className="w-full flex mt-7 justify-between text-gray-500 text-sm text-center  border-blue-500">{/*border-2 */}
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
          onCommentAdded={fetchCommentCount} // Refetch count when a comment is added
          commentCount={commentCount}
        />
      </>
    );
  }
  
  export default EngagementFeed;