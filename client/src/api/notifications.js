// src/api/notifications.js
import { io } from 'socket.io-client';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
let socket;

export const connectSocket = (token) => {
  socket = io(API_URL, {
    auth: { token },
  });
  
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};

export const subscribeToNotifications = (callback) => {
  if (!socket) return;
  
  socket.on('notification', (notification) => {
    callback(notification);
  });
};

// In your component
useEffect(() => {
  const token = authService.getToken();
  const socket = connectSocket(token);
  
  subscribeToNotifications((notification) => {
    dispatch(addNotification(notification));
    dispatch(showToast({
      message: notification.message,
      type: 'info'
    }));
  });
  
  return () => {
    disconnectSocket();
  };
}, []);