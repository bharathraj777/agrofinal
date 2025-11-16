import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/services/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'farmer' | 'admin';
  phone?: string;
  state?: string;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  profileImage?: string;
  lastLogin?: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  updateProfile: (userData: any) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      // Actions
      login: async (email: string, password: string) => {
        try {
          set({ loading: true, error: null });

          const response = await api.post('/auth/login', {
            email,
            password
          });

          const { user, accessToken, refreshToken } = response.data.data;

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            loading: false,
            error: null
          });

          // Set default authorization header
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

          // Store tokens in localStorage for persistence
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || 'Login failed';
          set({
            loading: false,
            error: errorMessage,
            isAuthenticated: false,
            user: null,
            accessToken: null,
            refreshToken: null
          });
          throw error;
        }
      },

      register: async (userData: any) => {
        try {
          set({ loading: true, error: null });

          const response = await api.post('/auth/register', userData);

          const { user, accessToken, refreshToken } = response.data.data;

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            loading: false,
            error: null
          });

          // Set default authorization header
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

          // Store tokens in localStorage
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || 'Registration failed';
          set({
            loading: false,
            error: errorMessage,
            isAuthenticated: false,
            user: null,
            accessToken: null,
            refreshToken: null
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          const accessToken = get().accessToken;
          if (accessToken) {
            await api.post('/auth/logout');
          }
        } catch (error) {
          // Continue with logout even if API call fails
          console.error('Logout API call failed:', error);
        } finally {
          // Clear state and local storage
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            loading: false,
            error: null
          });

          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');

          // Clear authorization header
          delete api.defaults.headers.common['Authorization'];
        }
      },

      refreshAccessToken: async () => {
        try {
          const refreshToken = get().refreshToken || localStorage.getItem('refreshToken');

          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          const response = await api.post('/auth/refresh', {
            refreshToken
          });

          const { accessToken: newAccessToken } = response.data.data;

          set({
            accessToken: newAccessToken
          });

          // Update authorization header
          api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

          // Store new access token
          localStorage.setItem('accessToken', newAccessToken);
        } catch (error) {
          // Refresh token is invalid, logout user
          get().logout();
          throw error;
        }
      },

      updateProfile: async (userData: any) => {
        try {
          set({ loading: true, error: null });

          const response = await api.patch('/users/profile', userData);
          const updatedUser = response.data.data.user;

          set({
            user: updatedUser,
            loading: false,
            error: null
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || 'Profile update failed';
          set({
            loading: false,
            error: errorMessage
          });
          throw error;
        }
      },

      changePassword: async (currentPassword: string, newPassword: string) => {
        try {
          set({ loading: true, error: null });

          await api.post('/auth/change-password', {
            currentPassword,
            newPassword
          });

          set({
            loading: false,
            error: null
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || 'Password change failed';
          set({
            loading: false,
            error: errorMessage
          });
          throw error;
        }
      },

      forgotPassword: async (email: string) => {
        try {
          set({ loading: true, error: null });

          await api.post('/auth/forgot-password', { email });

          set({
            loading: false,
            error: null
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || 'Password reset request failed';
          set({
            loading: false,
            error: errorMessage
          });
          throw error;
        }
      },

      resetPassword: async (token: string, password: string) => {
        try {
          set({ loading: true, error: null });

          await api.post('/auth/reset-password', {
            token,
            password
          });

          set({
            loading: false,
            error: null
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || 'Password reset failed';
          set({
            loading: false,
            error: errorMessage
          });
          throw error;
        }
      },

      setLoading: (loading: boolean) => set({ loading }),
      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

// Initialize auth state from localStorage on app load
const initializeAuth = () => {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');

  if (accessToken && refreshToken) {
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

    // Validate token by fetching current user
    api.get('/auth/me')
      .then(response => {
        useAuthStore.setState({
          user: response.data.data.user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          loading: false
        });
      })
      .catch(() => {
        // Token is invalid, clear stored data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        delete api.defaults.headers.common['Authorization'];
      });
  }
};

// Initialize auth when module is imported
initializeAuth();