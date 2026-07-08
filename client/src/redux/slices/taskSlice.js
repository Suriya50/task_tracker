import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const getTasks = createAsyncThunk(
  'tasks/getTasks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/tasks');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tasks');
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await api.post('/tasks', taskData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create task');
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, taskData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/tasks/${id}`, taskData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update task');
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/tasks/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete task');
    }
  }
);

const initialState = {
  tasks: [],
  loading: false,
  error: null,
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearTaskError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = Array.isArray(action.payload) ? action.payload : [];
        state.error = null;
      })
      .addCase(getTasks.rejected, (state, action) => {
        state.loading = false;
        state.tasks = [];
        state.error = action.payload;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.push(action.payload);
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(t => t._id === action.payload._id);
        if (index !== -1) state.tasks[index] = action.payload;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(t => t._id !== action.payload);
        state.error = null;
      });
  },
});

export const { clearTaskError } = taskSlice.actions;
export default taskSlice.reducer;