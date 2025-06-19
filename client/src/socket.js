import { io } from 'socket.io-client';

const socket = io('https://live-polling-system-backend-ssya.onrender.com', {
  transports: ['websocket'],
});

export default socket;