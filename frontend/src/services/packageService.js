import api from '../api/config';

export const packageService = {
  // دریافت همه دوره‌ها
  getAll: async () => {
    try {
      const response = await api.get('/packages/');
      console.log('Raw API Response:', response);

      if (response.data && response.data.results) {
        console.log('Using results from pagination:', response.data.results);
        return response.data.results;
      }

      if (Array.isArray(response.data)) {
        console.log('Data is array:', response.data);
        return response.data;
      }

      console.log('Data is object:', response.data);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching packages:', error);
      throw error;
    }
  },

  // دریافت یک دوره با ID
  getById: async (id) => {
    try {
      const response = await api.get(`/packages/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching package:', error);
      throw error;
    }
  },

  // بررسی دسترسی به دوره
  checkAccess: async (packageId) => {
    try {
      const response = await api.get(`/packages/${packageId}/check-access/`);
      return response.data;
    } catch (error) {
      console.error('Error checking access:', error);
      throw error;
    }
  },

  // دریافت ویدیوهای یک دوره
  getVideos: async (packageId) => {
    try {
      const response = await api.get(`/packages/${packageId}/videos/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching videos:', error);
      throw error;
    }
  },

  // دریافت دوره‌های خریداری شده کاربر
  getMyPackages: async () => {
    try {
      console.log('getMyPackages: Sending request...');
      const response = await api.get('/packages/my-packages/');
      console.log('getMyPackages: Response data:', response.data);

      // اگه response.data آرایه هست، برگردون
      if (Array.isArray(response.data)) {
        return response.data;
      }

      // اگه response.data.results وجود داره (Pagination)
      if (response.data && response.data.results) {
        return response.data.results;
      }

      return [];
    } catch (error) {
      console.error('getMyPackages: Error:', error);
      throw error;
    }
  },

  // دریافت لینک پخش ویدیو
  getVideoPlay: async (videoId) => {
    try {
      const response = await api.get(`/packages/videos/${videoId}/play/`);
      return response.data;
    } catch (error) {
      console.error('Error getting video play URL:', error);
      throw error;
    }
  },

  // دریافت دوره‌های رایگان
  getFree: async () => {
    try {
      const response = await api.get('/packages/free/');
      return response.data;
    } catch (error) {
      console.error('Error fetching free packages:', error);
      throw error;
    }
  },

  // ===== جدید: افزودن دوره رایگان =====
  addFreePackage: async (packageId) => {
    try {
      console.log('addFreePackage: Sending request for package:', packageId);
      const response = await api.post(`/packages/add-free/${packageId}/`);
      console.log('addFreePackage: Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('addFreePackage: Error:', error);
      throw error;
    }
  },
};