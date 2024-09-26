import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import socket from './SocketClient'
import { addNewContent, updateContent, markAsViewed } from '@/Redux/Slices/ViewContentSlice';


const JustInSocket = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    socket.on('newContent', (content) => {
      dispatch(addNewContent(content));
    });

    socket.on('contentUpdated', (content) => {
      dispatch(updateContent(content));
    });

    socket.on('contentViewed', ({ contentId, userId }) => {
      dispatch(markAsViewed({ contentId, userId }));
    });

    return () => {
      socket.off('newContent');
      socket.off('contentUpdated');
      socket.off('contentViewed');
    };
  }, [dispatch]);

  return null;
};

export default JustInSocket;