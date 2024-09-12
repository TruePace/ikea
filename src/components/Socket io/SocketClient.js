import io from 'socket.io-client';

const socket = io('http://localhost:4000', {
    transports: ['websocket', 'polling']
  }); //Don't forget to Replace with your server URL for production

export default socket;