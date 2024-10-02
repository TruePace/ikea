import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import socket from './SocketClient';
import { setCommentCount } from '@/Redux/Slices/CommentCountSlice';


const HeadlineSocket = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    socket.on('updateCommentCount', (data) => {
      dispatch(setCommentCount(data));
    });

    return () => {
      socket.off('updateCommentCount');
    };
  }, [dispatch]);

  return null;
};

export default HeadlineSocket;