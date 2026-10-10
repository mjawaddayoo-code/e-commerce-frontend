import { io } from 'socket.io-client';

let socket;
// Same origin as the API; auth uses the httpOnly cookie
export const getSocket = () => {
  if (!socket) {
    const origin = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
    socket = io(origin, { withCredentials: true, reconnectionDelayMax: 10000 });
  }
  return socket;
};
export const closeSocket = () => { socket?.disconnect(); socket = null; };
