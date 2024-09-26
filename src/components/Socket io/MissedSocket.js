import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { incrementMissedContentCount } from '@/Redux/Slices/NotificationSlice';
import socket from './SocketClient';

const MissedSocket = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    socket.on('newContent', (content) => {
      dispatch(incrementMissedContentCount());
    });

    return () => {
      socket.off('newContent');
    };
  }, [dispatch]);

  return null;
};

export default MissedSocket;