import { io } from 'socket.io-client';

// Live updates need a backend that supports long connections (Render, Railway, VPS).
// On Vercel leave VITE_SOCKET_URL empty and the site falls back to refreshing every 30 seconds.
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');
const noop = { on() {}, off() {}, disconnect() {} };

let socket;
export const getSocket = () => {
  if (!SOCKET_URL) return noop;
  if (!socket) socket = io(SOCKET_URL, { withCredentials: true, reconnectionDelayMax: 10000 });
  return socket;
};
export const closeSocket = () => { socket?.disconnect(); socket = null; };
