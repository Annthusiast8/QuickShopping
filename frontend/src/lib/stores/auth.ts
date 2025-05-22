import { writable } from "svelte/store";
import { browser } from '$app/environment';
import { api } from '../services/api';
import type { User } from '$lib/services/api';

interface AuthState {
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
    success: string | null;
}

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>({
    user: null,
    token: null,
    loading: false,
    error: null,
    success: null
  });

  // Initialize from localStorage only in browser environment
  if (browser) {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      set({
        user: JSON.parse(user),
        token,
        loading: false,
        error: null,
        success: null
      });
    }
  }

  return {
    subscribe,
    
    login: async (email: string, password: string) => {
      update(state => ({ ...state, loading: true, error: null, success: null }));
      try {
        const response = await api.login({ email, password });
        if (response.token) {
          if (browser) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
          }
          set({
            user: response.user,
            token: response.token,
            loading: false,
            error: null,
            success: response.message
          });
          return response;
        } else {
          throw new Error(response.message || 'Login failed');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'An error occurred during login';
        update(state => ({ ...state, loading: false, error: errorMessage, success: null }));
        throw error;
      }
    },
    register: async (role: 'customer' | 'seller' | 'admin', data: any) => {
      update(state => ({ ...state, loading: true, error: null, success: null }));
      try {
        const response = await api.register(role, data);
        if (response.token) {
          if (browser) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
          }
          set({
            user: response.user,
            token: response.token,
            loading: false,
            error: null,
            success: response.message
          });
          return response;
        } else {
          throw new Error(response.message || 'Registration failed');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'An error occurred during registration';
        update(state => ({ ...state, loading: false, error: errorMessage, success: null }));
        throw error;
      }
    },
    logout: async () => {
      update(state => ({ ...state, loading: true, error: null, success: null }));
      
      // Always clear local storage regardless of API call success
      const clearLocalStorage = () => {
        if (browser) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Clear any other auth-related items
          localStorage.removeItem('seller');
        }
      };
      
      try {
        // Only attempt API call if we have a token
        if (browser && localStorage.getItem('token')) {
          try {
            await api.logout();
            console.log('Logout API call successful');
          } catch (error) {
            console.error('Logout API call failed, but continuing with local logout:', error);
            // Continue with logout process even if API call fails
          }
        }
      } finally {
        // Always clear storage and reset state
        clearLocalStorage();
        
        set({
          user: null,
          token: null,
          loading: false,
          error: null,
          success: 'Logged out successfully'
        });
      }
    },
    deleteAccount: async (password: string) => {
      update(state => ({ ...state, loading: true, error: null, success: null }));
      try {
        await api.deleteAccount(password);
        if (browser) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
        set({
          user: null,
          token: null,
          loading: false,
          error: null,
          success: 'Account deleted successfully'
        });
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'An error occurred while deleting account';
        update(state => ({ ...state, loading: false, error: errorMessage, success: null }));
        throw error;
      }
    },
    clearError: () => {
      update(state => ({ ...state, error: null }));
    },
    clearSuccess: () => {
      update(state => ({ ...state, success: null }));
    },
    reset: () => {
      set({
        user: null,
        token: null,
        loading: false,
        error: null,
        success: null
      });
    }
  };
}

export const auth = createAuthStore();