import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import { addMessage, setOnlineUsers, setTyping } from '../redux/slices/chatSlice';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const useSocket = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const heartbeatIntervalRef = useRef(null);

  useEffect(() => {
    if (!user || !user._id) return;
    if (socketRef.current?.connected) return;

    // Initialize socket connection
    socketRef.current = io(SOCKET_URL, {
      query: { userId: user._id },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    // ─── CONNECTION EVENTS ───
    socketRef.current.on('connect', () => {
      setIsConnected(true);
      console.log('✅ Socket connected');

      // ─── HEARTBEAT: Keep connection alive ───
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      heartbeatIntervalRef.current = setInterval(() => {
        if (socketRef.current && isConnected) {
          socketRef.current.emit('ping');
          // console.log('💓 Heartbeat sent');
        }
      }, 25000); // send ping every 25 seconds
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
      console.log('❌ Socket disconnected');
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('⚠️ Socket connection error:', error);
    });

    // ─── ONLINE USERS ───
    socketRef.current.on('onlineUsers', (users) => {
      dispatch(setOnlineUsers(users));
    });

    // ─── NEW MESSAGE ───
    socketRef.current.on('newMessage', (message) => {
      dispatch(addMessage({ chatId: message.chat, message }));
    });

    // ─── TYPING INDICATOR ───
    socketRef.current.on('typing', ({ userId, isTyping }) => {
      dispatch(setTyping({ userId, isTyping }));
    });

    // ─── PONG RESPONSE (optional) ───
    socketRef.current.on('pong', () => {
      // console.log('💓 Pong received');
    });

    // ─── CLEANUP ───
    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
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