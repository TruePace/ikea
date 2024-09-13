import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import socket from './SocketClient';
import { setCommentCount } from '@/Redux/Slices/ArticleSlice/CommentCountSlice';
import { setViews } from '@/Redux/Slices/ArticleSlice/ViewsSlice';
import { setLikes } from '@/Redux/Slices/ArticleSlice/LikesSlice';

export default function SocketHandler() {
  const dispatch = useDispatch();

  useEffect(() => {
    const handleContentUpdated = (data) => {
      console.log('Received contentUpdated event:', data);
      if (data.commentCount !== undefined) {
        dispatch(setCommentCount({ contentId: data.contentId, count: data.commentCount }));
      }
      if (data.viewsCount !== undefined) {
        dispatch(setViews({ contentId: data.contentId, views: data.viewsCount }));
      }
      if (data.likesCount !== undefined) {
        dispatch(setLikes({ contentId: data.contentId, likes: data.likesCount }));
      }
    };

    socket.on('contentUpdated', handleContentUpdated);

    return () => {
      socket.off('contentUpdated', handleContentUpdated);
    };
  }, [dispatch]);

  return null;
}