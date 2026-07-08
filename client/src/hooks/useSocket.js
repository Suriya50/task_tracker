import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import { addMessage, setOnlineUsers, setTyping } from '../redux/slices/chatSlice';
import { addNotification } from '../redux/slices/notificationSlice';

const SOCKET_URL = 'http://localhost:5000';

export const useSocket = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user || !user._id) return;
    if (socketRef.current?.connected) return;

    const timer = setTimeout(() => {
      socketRef.current = io(SOCKET_URL, {
        query: { userId: user._id },
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
      });

      socketRef.current.on('connect', () => {
        setIsConnected(true);
        console.log('✅ Socket connected');
      });

      socketRef.current.on('disconnect', () => {
        setIsConnected(false);
        console.log('❌ Socket disconnected');
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('⚠️ Socket connection error:', error);
      });

      socketRef.current.on('onlineUsers', (users) => {
        dispatch(setOnlineUsers(users));
      });

      socketRef.current.on('newMessage', (message) => {
        dispatch(addMessage({ chatId: message.chat, message }));
      });

      socketRef.current.on('typing', ({ userId, isTyping }) => {
        dispatch(setTyping({ userId, isTyping }));
      });

      socketRef.current.on('newNotification', (notification) => {
        dispatch(addNotification(notification));
      });
    }, 500);

    return () => {
      clearTimeout(timer);
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user, dispatch]);

  const emit = (event, data) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn(`⚠️ Cannot emit "${event}" – socket not connected`);
    }
  };

  return { socket: socketRef.current, isConnected, emit };
};