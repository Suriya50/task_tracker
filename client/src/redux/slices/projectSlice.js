import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const getProjects = createAsyncThunk(
  'projects/getProjects',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/projects');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch projects');
    }
  }
);

export const createProject = createAsyncThunk(
  'projects/createProject',
  async (projectData, { rejectWithValue }) => {
    try {
      const response = await api.post('/projects', projectData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create project');
    }
  }
);

export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async ({ id, projectData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/projects/${id}`, projectData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update project');
    }
  }
);

export const deleteProject = createAsyncThunk(
  'projects/deleteProject',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/projects/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete project');
    }
  }
);

const initialState = {
  projects: [],
  loading: false,
  error: null,
};

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearProjectError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = Array.isArray(action.payload) ? action.payload : [];
        state.error = null;
      })
      .addCase(getProjects.rejected, (state, action) => {
        state.loading = false;
        state.projects = [];
        state.error = action.payload;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.projects.push(action.payload);
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        const index = state.projects.findIndex(p => p._id === action.payload._id);
        if (index !== -1) state.projects[index] = action.payload;
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.projects = state.projects.filter(p => p._id !== action.payload);
        state.error = null;
      });
  },
});

export const { clearProjectError } = projectSlice.actions;
export default projectSlice.reducer;