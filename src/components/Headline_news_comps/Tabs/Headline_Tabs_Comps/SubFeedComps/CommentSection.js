import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { IoMdClose } from 'react-icons/io';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useAuth } from '@/app/(auth)/AuthContext';
import { auth } from '@/app/(auth)/firebase/ClientApp';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

const CommentItem = ({ comment, onReply, onLike, currentUser, level = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const hasReplies = comment.replies && comment.replies.length > 0;

  return (
    <div className="mb-4">
      <div className="flex items-center mb-2">
        <Image src={comment.picture || '/NopicAvatar.png'} alt="User" width={32} height={32} className="rounded-full mr-2" />
        <p className="font-bold">{comment.username || comment.displayName || 'Anonymous'}</p>
      </div>
      <p>{comment.text}</p>
      <div className="flex items-center mt-1">
        {comment.userId !== currentUser.uid && (
          <button onClick={() => onReply(comment._id)} className="text-blue-500 text-sm mr-4">Reply</button>
        )}
        <button 
          onClick={() => onLike(comment._id)} 
          className={`text-sm flex items-center ${comment.likes.includes(currentUser.uid) ? 'text-blue-500' : 'text-gray-500'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
          </svg>
          {comment.likes.length}
        </button>
        {hasReplies && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)} 
            className="ml-4 text-gray-500 text-sm flex items-center"
          >
            {isExpanded ? <FaChevronUp className="mr-1" /> : <FaChevronDown className="mr-1" />}
            {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
          </button>
        )}
      </div>
      {hasReplies && isExpanded && (
        <div className={`ml-${Math.min(level + 1, 4) * 4} mt-2`}>
          {comment.replies.map(reply => (
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
  
  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen, contentId]);

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
      setComments(data.comments);
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
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 z-50 flex justify-center items-end transition-opacity duration-300 ease-in-out">
      <div className="bg-white w-full h-3/4 rounded-t-3xl overflow-hidden flex flex-col">
        <div className="sticky top-0 bg-white z-10 p-4 rounded-t-3xl border-b">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
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
          <form onSubmit={handleSubmitComment} className="sticky bottom-0 bg-white p-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={replyTo ? "Write a reply..." : "Write a comment..."}
              className="w-full p-2 border rounded"
            />
            <button type="submit" className="mt-2 bg-blue-500 text-white p-2 rounded">
              {replyTo ? "Reply" : "Comment"}
            </button>
            {replyTo && (
              <button 
                onClick={() => setReplyTo(null)} 
                className="mt-2 ml-2 bg-gray-300 text-gray-700 p-2 rounded"
              >
                Cancel Reply
              </button>
            )}
          </form>
        ) : (
          <div className="sticky bottom-0 bg-white p-2 text-center">
            Please log in to comment.
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;