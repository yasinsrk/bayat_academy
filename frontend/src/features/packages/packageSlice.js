// src/features/packages/packageSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// const API_URL = '/api';
/////لوکاللللللللللللللل
const API_URL = '/api';
// ===== Get Auth Token =====
const getAuthToken = () => {
  return localStorage.getItem('access_token') || null;
};

// ===== Fetch All Packages =====
export const fetchPackages = createAsyncThunk(
  'packages/fetchPackages',
  async (_, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      console.log('🔵 fetchPackages - token:', token ? '✅ موجود' : '❌ وجود ندارد');

      const config = {
        headers: {}
      };

      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await axios.get(`${API_URL}/packages/packages/`, config);
      console.log('✅ fetchPackages raw response:', response.data);

      if (response.data && response.data.results) {
        return response.data.results;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('❌ fetchPackages error:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ===== Fetch Package Detail =====
export const fetchPackageDetail = createAsyncThunk(
  'packages/fetchPackageDetail',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/packages/packages/${id}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ===== Fetch My Packages =====
export const fetchMyPackages = createAsyncThunk(
  'packages/fetchMyPackages',
  async (_, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return [];
      }
      const response = await axios.get(`${API_URL}/packages/my-packages/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ fetchMyPackages response:', response.data);

      if (response.data && response.data.results) {
        return response.data.results;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('❌ fetchMyPackages error:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        return [];
      }
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ===== Check Package Access =====
export const checkPackageAccess = createAsyncThunk(
  'packages/checkPackageAccess',
  async (id, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return { has_access: false };
      }
      const response = await axios.get(`${API_URL}/packages/packages/${id}/check-access/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return { has_access: false };
    }
  }
);

// ===== Add Free Package =====
export const addFreePackage = createAsyncThunk(
  'packages/addFreePackage',
  async (id, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return rejectWithValue('لطفاً وارد شوید');
      }
      const response = await axios.post(`${API_URL}/packages/add-free/${id}/`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ===== Create Package =====
export const createPackage = createAsyncThunk(
  'packages/createPackage',
  async (data, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const response = await axios.post(`${API_URL}/packages/packages/`, data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ===== Update Package =====
export const updatePackage = createAsyncThunk(
  'packages/updatePackage',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const response = await axios.put(`${API_URL}/packages/packages/${id}/`, data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ===== DELETE PACKAGE =====
export const deletePackage = createAsyncThunk(
  'packages/deletePackage',
  async (id, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      console.log('🔵 deletePackage called with id:', id);

      await axios.delete(`${API_URL}/packages/packages/${id}/`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });
      console.log('✅ deletePackage success:', id);
      return id;
    } catch (error) {
      console.log('❌ deletePackage error:', error.response?.data);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ===== Get Video Play =====
export const getVideoPlay = createAsyncThunk(
  'packages/getVideoPlay',
  async (videoId, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${API_URL}/videos/${videoId}/play/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ===== Initial State =====
const initialState = {
  list: [],
  currentPackage: null,
  myPackages: [],
  access: null,
  videoPlay: null,
  loading: false,
  error: null,
};

// ===== Slice =====
const packageSlice = createSlice({
  name: 'packages',
  initialState,
  reducers: {
    clearCurrentPackage: (state) => {
      state.currentPackage = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearVideoPlay: (state) => {
      state.videoPlay = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ===== Fetch Packages =====
      .addCase(fetchPackages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPackages.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload) ? action.payload : [];
        console.log('✅ packages list updated:', state.list.length);
      })
      .addCase(fetchPackages.rejected, (state, action) => {
        state.loading = false;
        state.list = [];
        state.error = action.payload;
        console.error('❌ fetchPackages rejected:', action.payload);
      })

      // ===== Fetch Package Detail =====
      .addCase(fetchPackageDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPackageDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPackage = action.payload;
      })
      .addCase(fetchPackageDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ===== Fetch My Packages =====
      .addCase(fetchMyPackages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyPackages.fulfilled, (state, action) => {
        state.loading = false;
        state.myPackages = Array.isArray(action.payload) ? action.payload : [];
        console.log('✅ myPackages updated:', state.myPackages.length);
      })
      .addCase(fetchMyPackages.rejected, (state, action) => {
        state.loading = false;
        state.myPackages = [];
        state.error = action.payload;
        console.error('❌ fetchMyPackages rejected:', action.payload);
      })

      // ===== Check Access =====
      .addCase(checkPackageAccess.fulfilled, (state, action) => {
        state.access = action.payload;
      })

      // ===== Add Free Package =====
      .addCase(addFreePackage.fulfilled, (state, action) => {
        console.log('✅ free package added:', action.payload);
      })

      // ===== Create Package =====
      .addCase(createPackage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPackage.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(state.list)) {
          state.list.push(action.payload);
        }
        state.currentPackage = action.payload;
      })
      .addCase(createPackage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error('❌ createPackage rejected:', action.payload);
      })

      // ===== Update Package =====
      .addCase(updatePackage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePackage.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPackage = action.payload;
        if (Array.isArray(state.list)) {
          const index = state.list.findIndex(p => p.id === action.payload.id);
          if (index !== -1) {
            state.list[index] = action.payload;
          }
        }
      })
      .addCase(updatePackage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error('❌ updatePackage rejected:', action.payload);
      })

      // ===== Delete Package =====
      .addCase(deletePackage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePackage.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter(pkg => pkg.id !== action.payload);
        console.log('✅ package deleted:', action.payload);
      })
      .addCase(deletePackage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error('❌ deletePackage rejected:', action.payload);
      })

      // ===== Get Video Play =====
      .addCase(getVideoPlay.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getVideoPlay.fulfilled, (state, action) => {
        state.loading = false;
        state.videoPlay = action.payload;
      })
      .addCase(getVideoPlay.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentPackage, clearError, clearVideoPlay } = packageSlice.actions;
export default packageSlice.reducer;