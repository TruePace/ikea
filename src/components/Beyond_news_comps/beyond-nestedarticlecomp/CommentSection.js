import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { IoMdClose } from 'react-icons/io';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { auth } from '@/app/(auth)/firebase/ClientApp';
import { useAuth } from '@/app/(auth)/AuthContext';
import { useSelector, useDispatch } from 'react-redux';
import { setCommentCount } from '@/Redux/Slices/ArticleSlice/CommentCountSlice';
import { formatDate } from '@/components/Utils/DateFormat';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const CommentItem = ({ comment, onReply, onLike, currentUser, level = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const hasReplies = comment.replies && comment.replies.length > 0;

   // Sort replies by likes count if they exist
   const sortedReplies = hasReplies 
   ? [...comment.replies].sort((a, b) => b.likes.length - a.likes.length)
   : [];

 // Calculate margin and border styling based on nesting level
 const getCommentStyles = () => {
   const baseStyles = "mb-4";
   if (level === 0) return baseStyles;
   
   return `${baseStyles} pl-4 ml-4 border-l-2 border-gray-300 dark:border-gray-500`;
 };

 return (
   <div className={getCommentStyles()}>
     <div className="flex items-center mb-2">
       <Image 
         src={comment.picture || '/NopicAvatar.png'} 
         alt="User" 
         width={32} 
         height={32} 
         className="rounded-full mr-2" 
       />
       <p className="font-bold">{comment.username || 'Anonymous'}</p>
       <span className="text-sm ml-3 text-gray-500 dark:text-gray-400">
              {formatDate(comment.createdAt)}
            </span>
     </div>
     <p>{comment.text}</p>
     <div className="flex items-center mt-1">
       {comment.userId !== currentUser?.uid && level < 2 && (
         <button 
           onClick={() => onReply(comment._id)} 
           className="text-blue-600 text-sm mr-4"
         >
           Reply
         </button>
       )}
       <button 
         onClick={() => onLike(comment._id)} 
         className={`text-sm flex items-center ${
           comment.likes.includes(currentUser?.uid) 
             ? 'text-blue-500' 
             : 'text-gray-500 dark:text-gray-200'
         }`}
       >
         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
           <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
         </svg>
         {comment.likes.length}
       </button>
       {hasReplies && (
         <button 
           onClick={() => setIsExpanded(!isExpanded)} 
           className="ml-4 text-gray-500 text-sm flex items-center dark:text-gray-200"
         >
           {isExpanded ? <FaChevronUp className="mr-1" /> : <FaChevronDown className="mr-1" />}
           {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
         </button>
       )}
     </div>
     {hasReplies && isExpanded && (
       <div className="mt-2">
         {sortedReplies.map(reply => (
           <CommentItem 
             key={reply._id} 
             comment={reply} 
             onReply={onReply} 
             onLike={onLike} 
             currentUser={currentUser}
             level={level + 1}
           />
         ))}
       </div>
     )}
   </div>
 );
};

const CommentSection = ({ isOpen, onClose, articleId, onCommentAdded }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, firebaseUser } = useAuth();
  const dispatch = useDispatch();
  const commentCount = useSelector(state => state.commentCountArticle[articleId] || 0);
  const [userLocation, setUserLocation] = useState(null);

  
  useEffect(() => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
            },
            (error) => {
                console.error("Error getting location:", error);
            }
        );
    }
}, []);


  useEffect(() => {
    if (isOpen && articleId && firebaseUser) {
      fetchComments();
    }
  }, [isOpen, articleId, firebaseUser]);

  const fetchComments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/api/BeyondArticle/${articleId}/comments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch comments');
      const data = await response.json();
      
      // Sort top-level comments by likes count
      const sortedComments = data.comments.sort((a, b) => b.likes.length - a.likes.length);
      
      setComments(sortedComments);
      dispatch(setCommentCount({ contentId: articleId, count: data.commentCount }));
    } catch (error) {
      console.error('Error fetching comments:', error);
      setError('Failed to load comments. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!firebaseUser && userLocation) {
      setError('You must be logged in to comment.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/api/BeyondArticle/${articleId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          text: newComment,
          replyTo: replyTo , // Include the replyTo parameter
          location: userLocation
        })
      });
      if (!response.ok) throw new Error('Failed to post comment');
      const data = await response.json();
      
      // Update local state
      setComments(prevComments => {
        if (replyTo) {
          // If it's a reply, find the parent comment and add the reply
          return prevComments.map(comment => {
            if (comment._id === replyTo) {
              return {
                ...comment,
                replies: [...(comment.replies || []), data]
              };
            }
            return comment;
          });
        } else {
          // If it's a new top-level comment, add it to the beginning
          return [data, ...prevComments];
        }
      });
      
      setNewComment('');
      setReplyTo(null);
      
      // Update comment count
      const newCommentCount = commentCount + 1;
      dispatch(setCommentCount({ contentId: articleId, count: newCommentCount }));
      onCommentAdded(newCommentCount);
    } catch (error) {
      console.error('Error posting comment:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReply = (commentId) => {
    if (!user) {
      setError('You must be logged in to reply.');
      return;
    }
    const findComment = (comments, id) => {
      for (let comment of comments) {
        if (comment._id === id) return comment;
        if (comment.replies) {
          const found = findComment(comment.replies, id);
          if (found) return found;
        }
      }
      return null;
    };
    const parentComment = findComment(comments, commentId);
    if (parentComment && parentComment.userId === user.uid) {
      setError('You cannot reply to your own comment.');
      return;
    }
    setReplyTo(commentId);
  };

  const handleLike = async (commentId) => {
    if (!user) {
      setError('You must be logged in to like a comment.');
      return;
    }
    try {
      const token = await firebaseUser.getIdToken();
      if (!token) {
        throw new Error('Unable to authenticate. Please try logging in again.');
      }
      const response = await fetch(`${API_BASE_URL}/api/BeyondArticle/${commentId}/likecomment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      if (!response.ok) throw new Error('Failed to like comment');
      await fetchComments();
    } catch (error) {
      console.error('Error liking comment:', error);
      setError('Failed to like comment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-gray-800 bg-opacity-75 z-50 flex justify-center items-end transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="bg-white w-full h-3/4 sm:h-5/6 desktop:h-90vh desktop:max-w-3xl rounded-t-3xl overflow-hidden flex flex-col dark:bg-gray-700">
            <div className="sticky top-0 bg-white z-10 p-4 rounded-t-3xl border-b dark:bg-gray-700">
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 dark:text-gray-200"
                >
                    <IoMdClose size="1.5em" />
                </button>
                <h2 className="text-xl font-bold">Comments ({commentCount})</h2>
            </div>

            <div className="flex-grow overflow-y-auto p-4">
                <div className="mb-4">
                    {comments.map(comment => (
                        <CommentItem 
                            key={comment._id} 
                            comment={comment} 
                            onReply={handleReply} 
                            onLike={handleLike} 
                            currentUser={user} 
                        />
                    ))}
                </div>
            </div>

            {user ? (
                <form onSubmit={handleSubmitComment} className="sticky bottom-0 bg-white p-2 dark:bg-gray-700">
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={replyTo ? "Write a reply..." : "Write a comment..."}
                        className="w-full p-2 border rounded dark:bg-gray-700"
                        disabled={isLoading}
                    />
                    <button type="submit" className="mt-2 bg-blue-500 text-white p-2 rounded" disabled={isLoading}>
                        {replyTo ? "Reply" : "Comment"}
                    </button>
                    {replyTo && (
                        <button 
                            onClick={() => setReplyTo(null)} 
                            className="mt-2 ml-2 bg-gray-300 text-gray-700 p-2 rounded"
                            disabled={isLoading}
                        >
                            Cancel Reply
                        </button>
                    )}
                </form>
            ) : (
                <div className="sticky bottom-0 bg-white p-2 text-center dark:bg-gray-700">
                    Please log in to comment.
                </div>
            )}
        </div>
    </div>
);
};

export default CommentSection;