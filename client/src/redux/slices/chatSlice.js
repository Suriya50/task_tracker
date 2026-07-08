import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const getChats = createAsyncThunk(
  'chat/getChats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/chats');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch chats');
    }
  }
);

export const getMessages = createAsyncThunk(
  'chat/getMessages',
  async (chatId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/messages/${chatId}`);
      return { chatId, messages: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch messages');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ chatId, content }, { rejectWithValue }) => {
    try {
      const response = await api.post('/messages', { chatId, content });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send message');
    }
  }
);

const initialState = {
  chats: [],
  messages: {},
  onlineUsers: [],
  typingUsers: [],
  loading: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      const { chatId, message } = action.payload;
      if (state.messages[chatId]) {
        const exists = state.messages[chatId].some(m => m._id === message._id);
        if (!exists) state.messages[chatId].push(message);
      } else {
        state.messages[chatId] = [message];
      }
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    setTyping: (state, action) => {
      const { userId, isTyping } = action.payload;
      if (isTyping) {
        if (!state.typingUsers.includes(userId)) state.typingUsers.push(userId);
      } else {
        state.typingUsers = state.typingUsers.filter(id => id !== userId);
      }
    },
    clearChatError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getChats.pending, (state) => {
        state.loading = true;
      })
      .addCase(getChats.fulfilled, (state, action) => {
        state.loading = false;
        state.chats = action.payload;
      })
      .addCase(getChats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getMessages.fulfilled, (state, action) => {
        state.messages[action.payload.chatId] = action.payload.messages;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const msg = action.payload;
        if (state.messages[msg.chat]) {
          state.messages[msg.chat].push(msg);
        }
      });
  },
});

export const { addMessage, setOnlineUsers, setTyping, clearChatError } = chatSlice.actions;
export default chatSlice.reducer;