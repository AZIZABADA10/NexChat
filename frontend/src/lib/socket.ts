import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = () => {
  if (!socket) {
    const token = localStorage.getItem('token');
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
      autoConnect: false
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
