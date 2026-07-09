import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  PaperAirplaneIcon,
  UserCircleIcon,
  MagnifyingGlassIcon,
  VideoCameraIcon,
  PhoneIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import { useSocket } from '../hooks/useSocket';
import api from '../services/api';
import toast from 'react-hot-toast';
import { getChats, getMessages, sendMessage } from '../redux/slices/chatSlice';

const Chat = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { chats = [], messages = {}, onlineUsers = [], typingUsers = [] } = useSelector((state) => state.chat);
  const { socket, isConnected, emit } = useSocket();

  const [chatUsers, setChatUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [currentMessages, setCurrentMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sending, setSending] = useState(false);
  const [showMobileUsers, setShowMobileUsers] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const fetchChatUsers = async () => {
    try {
      const res = await api.get('/users/chat-users');
      const raw = res.data.data || [];
      const filtered = raw.filter(u => u._id !== user?._id && u.email !== user?.email);
      const unique = Array.from(new Map(filtered.map(u => [u._id, u])).values());
      setChatUsers(unique);
    } catch (err) {
      toast.error('Failed to load users');
    }
  };

  useEffect(() => {
    fetchChatUsers();
    dispatch(getChats());
  }, [dispatch, user]);

  useEffect(() => {
    if (!selectedUser) {
      setCurrentChatId(null);
      setCurrentMessages([]);
      return;
    }
    if (selectedUser._id === user?._id || selectedUser.email === user?.email) {
      toast.error("You can't chat with yourself");
      setSelectedUser(null);
      return;
    }
    const loadChat = async () => {
      try {
        const res = await api.get(`/chats/private/${selectedUser._id}`);
        const chat = res.data.data;
        setCurrentChatId(chat._id);
        dispatch(getMessages(chat._id));
        if (socket && isConnected) {
          socket.emit('joinChat', chat._id);
        }
        // Close mobile user list when chat opens
        setShowMobileUsers(false);
      } catch (err) {
        toast.error('Could not start chat');
      }
    };
    loadChat();
  }, [selectedUser, socket, isConnected, dispatch, user]);

  useEffect(() => {
    if (currentChatId && messages[currentChatId]) {
      const unique = Array.from(new Map(messages[currentChatId].map(m => [m._id, m])).values());
      setCurrentMessages(unique);
    } else {
      setCurrentMessages([]);
    }
  }, [messages, currentChatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedUser || !currentChatId) return;
    setSending(true);
    try {
      const result = await dispatch(sendMessage({ chatId: currentChatId, content: inputMessage }));
      if (sendMessage.fulfilled.match(result)) {
        setInputMessage('');
      }
    } catch (err) {
      toast.error('Failed to send');
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (e) => {
    setInputMessage(e.target.value);
    if (!e.target.value) {
      emit('typing', { chatId: currentChatId, receiverId: selectedUser?._id, isTyping: false });
      return;
    }
    if (!typingTimeoutRef.current) {
      emit('typing', { chatId: currentChatId, receiverId: selectedUser?._id, isTyping: true });
    }
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      emit('typing', { chatId: currentChatId, receiverId: selectedUser?._id, isTyping: false });
      typingTimeoutRef.current = null;
    }, 1500);
  };

  const handleVideoCall = async () => {
    if (!selectedUser) {
      toast.error('Please select a user first');
      return;
    }
    if (!currentChatId) {
      toast.error('Chat not ready');
      return;
    }
    try {
      const res = await api.post('/meetings', {
        title: `Call with ${selectedUser.name}`,
        description: 'Video call',
        date: new Date(),
        time: 'Now',
        participants: [selectedUser._id],
      });
      const meeting = res.data.data;
      const link = meeting.meetingLink;
      await dispatch(sendMessage({
        chatId: currentChatId,
        content: `📹 Join video call: ${link}`,
      })).unwrap();
      toast.success('Video call created!');
      const roomId = link.split('/').pop();
      navigate(`/meeting/${roomId}`);
    } catch (err) {
      console.error('Video call error:', err);
      toast.error('Failed to create video call');
    }
  };

  const isOnline = (userId) => onlineUsers.includes(userId);

  const filteredUsers = chatUsers.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (!socket) return;
    const handleNewMessage = (message) => {
      if (message.chat === currentChatId) {
        setCurrentMessages((prev) => {
          const exists = prev.some((msg) => msg._id === message._id);
          if (exists) return prev;
          return [...prev, message];
        });
      }
    };
    socket.on('newMessage', handleNewMessage);
    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [socket, currentChatId]);

  return (
    <div className="flex min-h-screen bg-darkBg">
      <Sidebar />
      <div className="flex-1 ml-0 lg:ml-64">
        <Navbar />
        <div className="flex h-[calc(100vh-73px)] flex-col sm:flex-row">
          
          {/* ─── USERS SIDEBAR ─── */}
          <div className={`
            sm:w-72 md:w-80 glass-sidebar border-r border-white/5 flex flex-col
            ${showMobileUsers ? 'fixed inset-0 z-50 w-72' : 'hidden sm:flex'}
            sm:relative sm:inset-auto sm:z-auto
          `}>
            {/* Mobile Close Button */}
            <div className="sm:hidden flex justify-between items-center p-4 border-b border-white/5">
              <h2 className="text-lg font-bold text-white">Chats</h2>
              <button 
                onClick={() => setShowMobileUsers(false)}
                className="text-gray-400 hover:text-white"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-3 sm:p-4 border-b border-white/5">
              <h2 className="text-base sm:text-lg font-bold text-white hidden sm:block">Chats</h2>
              <div className="relative mt-2 sm:mt-3">
                <MagnifyingGlassIcon className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search people..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 sm:py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-6 text-gray-400 text-xs sm:text-sm">No one to chat with</div>
              ) : (
                filteredUsers.map((u) => (
                  <button
                    key={u._id}
                    onClick={() => {
                      if (u._id === user?._id || u.email === user?.email) {
                        toast.error("You can't chat with yourself");
                        return;
                      }
                      setSelectedUser(u);
                    }}
                    className={`w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl transition-all duration-200 ${
                      selectedUser?._id === u._id ? 'bg-primary/20 border border-primary/30' : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      {isOnline(u._id) && (
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-darkBg"></div>
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-white font-medium text-xs sm:text-sm truncate">{u.name}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                        {isOnline(u._id) ? 'Online' : 'Offline'}
                        {typingUsers.includes(u._id) && <span className="text-primary ml-1">typing...</span>}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* ─── CHAT PANEL ─── */}
          <div className="flex-1 flex flex-col min-w-0">
            {selectedUser ? (
              <>
                {/* ─── CHAT HEADER ─── */}
                <div className="glass-navbar px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    {/* Mobile: Show users button */}
                    <button 
                      onClick={() => setShowMobileUsers(true)}
                      className="sm:hidden text-gray-400 hover:text-white"
                    >
                      <Bars3Icon className="w-5 h-5" />
                    </button>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-medium text-sm sm:text-base truncate">{selectedUser.name}</p>
                      <p className="text-[10px] sm:text-xs text-gray-400 truncate">
                        {isOnline(selectedUser._id) ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <button
                      onClick={handleVideoCall}
                      className="p-1.5 sm:p-2 rounded-xl bg-primary/20 text-primary hover:bg-primary/30 transition-all"
                      title="Video Call"
                    >
                      <VideoCameraIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button 
                      className="p-1.5 sm:p-2 rounded-xl bg-primary/20 text-primary hover:bg-primary/30 transition-all" 
                      title="Voice Call"
                    >
                      <PhoneIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>

                {/* ─── MESSAGES ─── */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 sm:space-y-3">
                  {currentMessages.length === 0 ? (
                    <div className="text-center text-gray-400 text-xs sm:text-sm mt-10">No messages yet. Say hello!</div>
                  ) : (
                    currentMessages.map((msg) => {
                      const isSent = msg.sender?._id === user?._id;
                      return (
                        <div 
                          key={msg._id} 
                          className={`flex ${isSent ? 'justify-end' : 'justify-start'} max-w-full`}
                        >
                          <div className={`
                            ${isSent ? 'chat-bubble-sent' : 'chat-bubble-received'} 
                            max-w-[85%] sm:max-w-[75%] px-3 py-2 sm:px-4 sm:py-2
                          `}>
                            <p className="text-xs sm:text-sm break-words">{msg.content}</p>
                            <p className="text-[8px] sm:text-[10px] opacity-60 mt-0.5 text-right">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  {typingUsers.includes(selectedUser._id) && (
                    <div className="flex justify-start">
                      <div className="bg-white/10 rounded-2xl rounded-tl-sm px-3 py-2 sm:px-4 sm:py-2">
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* ─── INPUT ─── */}
                <form 
                  onSubmit={handleSendMessage} 
                  className="glass-navbar p-2 sm:p-4 flex items-center gap-2 sm:gap-3 flex-shrink-0"
                >
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={handleTyping}
                    placeholder="Type a message..."
                    className="flex-1 input-glass py-1.5 sm:py-2 px-3 sm:px-4 text-xs sm:text-sm min-w-0"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || sending}
                    className="p-1.5 sm:p-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-primary/30 flex-shrink-0"
                  >
                    <PaperAirplaneIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="text-center">
                  <UserCircleIcon className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-gray-600 mb-3" />
                  <h3 className="text-base sm:text-xl font-semibold text-white mb-1">Select a conversation</h3>
                  <p className="text-gray-400 text-xs sm:text-sm">Choose someone from the sidebar</p>
                  {/* Mobile: Show users button when no chat selected */}
                  <button 
                    onClick={() => setShowMobileUsers(true)}
                    className="sm:hidden mt-4 btn-primary-sm text-xs py-1.5 px-4"
                  >
                    Open Chats
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;