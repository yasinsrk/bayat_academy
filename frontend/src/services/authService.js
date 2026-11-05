import api from '../api/config';

export const authService = {
  // Register
  register: async (userData) => {
    try {
      const response = await api.post('/accounts/register/', userData);
      return response.data;
    } catch (error) {
      console.error('Error registering:', error);
      throw error;
    }
  },

  // Login - پشتیبانی از یوزرنیم و شماره موبایل
  login: async (credentials) => {
    try {
      const response = await api.post('/accounts/login/', credentials);
      return response.data;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  },

  // Logout
  logout: async (refreshToken) => {
    try {
      await api.post('/accounts/logout/', { refresh: refreshToken });
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  },

  // Get Profile
  getProfile: async () => {
    try {
      const response = await api.get('/accounts/profile/');
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  // Update Profile
  updateProfile: async (data) => {
    try {
      const response = await api.put('/accounts/profile/', data);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },
};