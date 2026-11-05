// src/features/categories/categorySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

// ===== Get Auth Token =====
const getAuthToken = () => {
  return localStorage.getItem('access_token') || null;
};

// ===== Fetch Categories =====
export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const config = {};
      if (token) {
        config.headers = { Authorization: `Bearer ${token}` };
      }
      const response = await axios.get(`${API_URL}/packages/categories/`, config);
      console.log('✅ fetchCategories response:', response.data);

      if (response.data && response.data.results) {
        return response.data.results;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('❌ fetchCategories error:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ===== Create Category =====
export const createCategory = createAsyncThunk(
  'categories/createCategory',
  async (data, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const response = await axios.post(`${API_URL}/packages/categories/`, data, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ===== Delete Category =====
export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async (id, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      await axios.delete(`${API_URL}/packages/categories/${id}/`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ===== Initial State =====
const initialState = {
  categories: [],
  loading: false,
  error: null,
};

// ===== Slice =====
const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = Array.isArray(action.payload) ? action.payload : [];
        console.log('✅ categories updated:', state.categories.length);
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.categories = [];
        state.error = action.payload;
        console.error('❌ fetchCategories rejected:', action.payload);
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
        console.log('✅ category created:', action.payload);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.error = action.payload;
        console.error('❌ createCategory rejected:', action.payload);
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter(c => c.id !== action.payload);
        console.log('✅ category deleted:', action.payload);
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.error = action.payload;
        console.error('❌ deleteCategory rejected:', action.payload);
      });
  },
});

export const { clearError } = categorySlice.actions;
export default categorySlice.reducer;