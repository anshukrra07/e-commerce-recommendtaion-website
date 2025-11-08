import { io } from 'socket.io-client';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5050';

export const socket = io(BACKEND_URL, {
  autoConnect: true,
  withCredentials: true,
});

export function joinUserRoom(userId) {
  try {
    socket.emit('auth', { userId });
  } catch {}
}
