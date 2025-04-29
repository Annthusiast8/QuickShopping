import { writable } from 'svelte/store';
import { api } from '$lib/services/api';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'seller' | 'customer';
  created_at: string;
  shop?: {
    id: number;
    name: string;
  };
}

function createUsersStore() {
  const { subscribe, set, update } = writable<{
    users: User[];
    loading: boolean;
    error: string | null;
  }>({
    users: [],
    loading: false,
    error: null
  });

  return {
    subscribe,
    
    // Fetch all users
    fetchUsers: async () => {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        const users = await api.getUsers();
        update(state => ({ ...state, users, loading: false }));
      } catch (error: any) {
        console.error('Error fetching users:', error);
        update(state => ({ 
          ...state, 
          loading: false, 
          error: error.message || 'Failed to load users' 
        }));
      }
    },
    
    // Delete a user
    deleteUser: async (userId: number) => {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        await api.deleteUser(userId);
        update(state => ({
          ...state,
          users: state.users.filter(user => user.id !== userId),
          loading: false
        }));
      } catch (error: any) {
        console.error('Error deleting user:', error);
        update(state => ({ 
          ...state, 
          loading: false, 
          error: error.message || 'Failed to delete user' 
        }));
      }
    },
    
    // Update user role
    updateUserRole: async (userId: number, role: 'admin' | 'seller' | 'customer') => {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        await api.updateUserRole(userId, role);
        update(state => ({
          ...state,
          users: state.users.map(user => 
            user.id === userId ? { ...user, role } : user
          ),
          loading: false
        }));
      } catch (error: any) {
        console.error('Error updating user role:', error);
        update(state => ({ 
          ...state, 
          loading: false, 
          error: error.message || 'Failed to update user role' 
        }));
      }
    },
    
    // Reset error state
    clearError: () => {
      update(state => ({ ...state, error: null }));
    }
  };
}

export const usersStore = createUsersStore(); 