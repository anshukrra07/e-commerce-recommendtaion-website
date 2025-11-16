import { io } from 'socket.io-client';
import getBackendURL from '../utils/environment.js';

// Use the same backend URL resolver as the rest of the frontend
const BACKEND_URL = getBackendURL();

export const socket = io(BACKEND_URL, {
  autoConnect: true,
  withCredentials: true,
});

export function joinUserRoom(userId) {
  try {
    socket.emit('auth', { userId });
  } catch {}
}
