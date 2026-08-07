import { create } from 'zustand';
import apiClient from '../api/client';

const getInitialUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

const getInitialToken = () => {
  return localStorage.getItem('token') || localStorage.getItem('access_token') || null;
};

export const useAuthStore = create((set) => ({
  user: getInitialUser(),
  token: getInitialToken(),
  isAuthenticated: !!getInitialToken(),
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { access_token, user } = response.data;

      localStorage.setItem('token', access_token);
      localStorage.setItem('access_token', access_token);
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }

      set({
        token: access_token,
        user: user || null,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { success: true };
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail || err.message || 'Login failed. Please check credentials.';
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/auth/register', { name, email, password });
      set({ isLoading: false, error: null });
      return { success: true, user: response.data };
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail || err.message || 'Registration failed. Please try again.';
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      error: null,
    });
  },
}));
