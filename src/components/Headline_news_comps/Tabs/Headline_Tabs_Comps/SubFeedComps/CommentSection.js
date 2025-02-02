import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { IoMdClose } from 'react-icons/io';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useAuth } from '@/app/(auth)/AuthContext';
import { auth } from '@/app/(auth)/firebase/ClientApp';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
import { formatDate } from '@/components/Utils/DateFormat';

const CommentItem = ({ comment, onReply, onLike, currentUser, level = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const hasReplies = comment.replies && comment.replies.length > 0;
  const sortedReplies = hasReplies 
    ? [...comment.replies].sort((a, b) => b.likes.length - a.likes.length)
    : [];

  // Get the appropriate avatar URL
  const getAvatarUrl = () => {
    // Check for photoURL in the comment
    if (comment.photoURL) {
      return comment.photoURL;
    }
    // Check if it's a Google profile picture (starts with https://lh3.googleusercontent.com)
    if (comment.picture && comment.picture.startsWith('https://lh3.googleusercontent.com')) {
      return comment.picture;
    }
    // Fallback to default avatar
    return '/NopicAvatar.png';
  };

  const indentationClass = level === 1 
    ? 'ml-6' 
    : level === 2 
      ? 'ml-8'
      : '';

  return (
    <div className={`mb-4 ${indentationClass} ${level > 0 ? 'border-l-2 border-gray-300 dark:border-gray-500 pl-3' : ''}`}>
      <div className="flex items-center mb-2">
        <Image 
          src={getAvatarUrl()} 
          alt="User" 
          width={32} 
          height={32} 
          className="rounded-full mr-2" 
        />
        <p className="font-bold">
          {comment.username || comment.displayName || 'Anonymous'}
        </p>
        <span className="text-sm ml-3 text-gray-500 dark:text-gray-400">
              {formatDate(comment.createdAt)}
            </span>
      </div>
  <p>{comment.text}</p>
  <div className="flex items-center mt-1">
    {comment.userId !== currentUser.uid && level < 2 && (
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
        comment.likes.includes(currentUser.uid) 
          ? 'text-blue-500' 
          : 'text-gray-500 dark:text-gray-200'
      }`}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-5 w-5 mr-1" 
        viewBox="0 0 20 20" 
        fill="currentColor"
      >
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

const CommentSection = ({ isOpen, onClose, contentId, onCommentAdded }) => {
  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const { user } = useAuth();
  const modalRef = useRef(null);
  
  useEffect(() => {
    if (isOpen) {
      fetchComments();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, contentId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const getIdToken = async () => {
    if (!user) return null;
    try {
      const token = await auth.currentUser.getIdToken();
      return token;
    } catch (error) {
      console.error('Error getting ID token:', error);
      return null;
    }
  };

  const fetchComments = async () => {
    try {
      const token = await getIdToken();
      if (!token) {
        console.error('No authentication token available');
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/HeadlineNews/Comment/${contentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch comments');
      const data = await response.json();
      
      // Sort top-level comments by likes before setting state
      const sortedComments = data.comments.sort((a, b) => b.likes.length - a.likes.length);
      setComments(sortedComments);
      setCommentCount(data.commentCount);
      onCommentAdded(data.commentCount);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };
  
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('You must be logged in to comment.');
      return;
    }
    try {
      const token = await getIdToken();
      if (!token) {
        alert('Unable to authenticate. Please try logging in again.');
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/HeadlineNews/Comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          contentId,
          text: newComment,
          replyTo,
          username: user.username,
          photoURL: user.photoURL || null, // Include the user's photoURL
          picture: user.photoURL || null    // Include as picture for compatibility
        }),
      });
      if (!response.ok) throw new Error('Failed to post comment');
      setNewComment('');
      setReplyTo(null);
      await fetchComments();
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment. Please try again.');
    }
  };
  
  const handleReply = (commentId) => {
    if (!user) {
      alert('You must be logged in to reply.');
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
      alert('You cannot reply to your own comment.');
      return;
    }
    setReplyTo(commentId);
  };

  const handleLike = async (commentId) => {
    if (!user) {
      alert('You must be logged in to like a comment.');
      return;
    }
    try {
      const token = await getIdToken();
      if (!token) {
        alert('Unable to authenticate. Please try logging in again.');
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/HeadlineNews/Comment/${commentId}/like`, {
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
      alert('Failed to like comment. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 z-50 flex justify-center items-center tablet:items-center desktop:items-center transition-opacity duration-300 ease-in-out">
      <div 
        ref={modalRef}
        className="bg-white dark:bg-gray-700 w-full h-3/4 tablet:w-2/3 desktop:w-full tablet:h-4/5 desktop:h-4/5 tablet:rounded-2xl desktop:rounded-2xl rounded-t-3xl overflow-hidden flex flex-col "
      >
        <div className="sticky top-0 bg-white z-10 p-4 rounded-t-3xl tablet:rounded-t-2xl desktop:rounded-t-2xl border-b dark:bg-gray-700 ">
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
          <form onSubmit={handleSubmitComment} className="sticky bottom-0 bg-white p-4 border-t dark:bg-gray-700">
            <div className="flex flex-col tablet:flex-row desktop:flex-row gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={replyTo ? "Write a reply..." : "Write a comment..."}
                className="flex-grow p-2 border rounded dark:bg-gray-700"
                
              />
              <div className="flex gap-2">
                <button 
                  type="submit" 
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  {replyTo ? "Reply" : "Comment"}
                </button>
                {replyTo && (
                  <button 
                    onClick={() => setReplyTo(null)} 
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </form>
        ) : (
          <div className="sticky bottom-0 bg-white p-4 text-center border-t dark:text-gray-200 dark:bg-gray-700 ">
            Please log in to comment.
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;