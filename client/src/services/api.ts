import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    // Return successful response
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(
            `${api.defaults.baseURL}/auth/refresh`,
            { refreshToken }
          );

          const { accessToken } = response.data.data;

          // Update stored token
          localStorage.setItem('accessToken', accessToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        // Redirect to login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      }
    }

    // Handle network errors
    if (error.code === 'NETWORK_ERROR') {
      toast.error('Network error. Please check your internet connection.');
      return Promise.reject(error);
    }

    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout. Please try again.');
      return Promise.reject(error);
    }

    // Handle server errors
    if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
      return Promise.reject(error);
    }

    // Show error message from response if available
    if (error.response?.data?.error) {
      toast.error(error.response.data.error);
    }

    return Promise.reject(error);
  }
);

// API service methods
export const authService = {
  login: (credentials: any) => api.post('/auth/login', credentials),
  register: (userData: any) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  refreshToken: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
};

export const cropService = {
  getCrops: (params?: any) => api.get('/crops', { params }),
  getCropById: (id: string) => api.get(`/crops/${id}`),
  searchCrops: (query: string) => api.get(`/crops/search/${query}`),
  getCropFilters: () => api.get('/crops/filters'),
  createCrop: (cropData: any) => api.post('/crops', cropData),
  updateCrop: (id: string, cropData: any) => api.put(`/crops/${id}`, cropData),
  deleteCrop: (id: string) => api.delete(`/crops/${id}`),
};

export const recommendationService = {
  generateRecommendations: (features: any) => api.post('/recommendations', features),
  getRecommendationHistory: (params?: any) => api.get('/recommendations/history', { params }),
  submitFeedback: (feedback: any) => api.post('/recommendations/feedback', feedback),
  getPopularCrops: () => api.get('/recommendations/popular'),
  compareCrops: (features: any) => api.post('/recommendations/compare', features),
};

export const userService = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData: any) => api.patch('/users/profile', userData),
  uploadAvatar: (formData: FormData) => api.post('/users/upload-avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

// Error handling utility
export const handleApiError = (error: any, defaultMessage: string = 'An error occurred') => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message) {
    return error.message;
  }
  return defaultMessage;
};

export default api;