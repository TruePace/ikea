import React, { useState, useEffect } from 'react';
import { IoMdClose } from 'react-icons/io';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

const CommentItem = ({ comment, onReply, onLike, currentUsername }) => (
    <div className="mb-4">
      <div className="flex items-center mb-2">
        <img src={comment.picture || 'sponge.png'} alt="User" className="w-8 h-8 rounded-full mr-2" />
        <p className="font-bold">{comment.username || 'Anonymous'}</p>
      </div>
      <p>{comment.text}</p>
      <div className="flex items-center mt-1">
        <button onClick={() => onReply(comment._id)} className="text-blue-500 text-sm mr-4">Reply</button>
        <button 
          onClick={() => onLike(comment._id)} 
          className={`text-sm flex items-center ${comment.likes.includes(currentUsername) ? 'text-blue-500' : 'text-gray-500'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
          </svg>
          {comment.likes.length}
        </button>
      </div>
      {comment.replies && comment.replies.map(reply => (
        <div key={reply._id} className="ml-8 mt-2">
          <CommentItem comment={reply} onReply={() => {}} onLike={onLike} currentUsername={currentUsername} />
        </div>
      ))}
    </div>
  );

  const CommentSection = ({ isOpen, onClose, contentId , onCommentAdded ,commentCount}) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [username, setUsername] = useState('');
    const [replyTo, setReplyTo] = useState(null);
  
    useEffect(() => {
      if (isOpen) {
        fetchComments();
      }
    }, [isOpen, contentId]);
  
    const fetchComments = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/HeadlineNews/Comment/${contentId}`);
          if (!response.ok) throw new Error('Failed to fetch comments');
          const data = await response.json();
          setComments(data.comments);
          onCommentAdded(data.commentCount); // Call this to update the comment count in the parent component
        } catch (error) {
          console.error('Error fetching comments:', error);
        }
      };
  
      const handleSubmitComment = async (e) => {
        e.preventDefault();
        try {
          const response = await fetch(`${API_BASE_URL}/api/HeadlineNews/Comment`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contentId,
              text: newComment,
              replyTo,
              username,
            }),
          });
          if (!response.ok) throw new Error('Failed to post comment');
          setNewComment('');
          setReplyTo(null);
          await fetchComments(); // This will now update the comment count as well
        } catch (error) {
          console.error('Error posting comment:', error);
        }
      };
  
    const handleReply = (commentId) => {
      setReplyTo(commentId);
    };
  
    const handleLike = async (commentId) => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/HeadlineNews/Comment/${commentId}/like`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username }),
          });
          if (!response.ok) throw new Error('Failed to like comment');
          await fetchComments(); // This will now update the comment count as well
        } catch (error) {
          console.error('Error liking comment:', error);
        }
      };
  
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-gray-800 bg-opacity-75 z-50 flex justify-center items-end transition-opacity duration-300 ease-in-out">
        <div className="bg-white w-full h-3/4 rounded-t-3xl p-4 relative overflow-y-auto">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
          >
            <IoMdClose size="1.5em" />
          </button>
          <h2 className="text-xl font-bold mb-4">Comments ({commentCount})</h2>
          
          <div className="mb-4">
            {comments.map(comment => (
              <CommentItem key={comment._id} comment={comment} onReply={handleReply} onLike={handleLike} currentUsername={username} />
            ))}
          </div>
  
          <form onSubmit={handleSubmitComment} className="sticky bottom-0 bg-white p-2">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your username"
              className="w-full p-2 border rounded mb-2"
            />
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
        </div>
      </div>
    );
  };
export default CommentSection;