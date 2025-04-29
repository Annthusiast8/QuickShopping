import { writable } from 'svelte/store';
import { api } from '$lib/services/api';

export interface Address {
  id?: number;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default?: boolean;
}

export interface Profile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  profile_image?: string;
  addresses: Address[];
}

function createProfileStore() {
  const { subscribe, set, update } = writable<{
    profile: Profile | null;
    loading: boolean;
    error: string | null;
  }>({
    profile: null,
    loading: false,
    error: null
  });

  return {
    subscribe,
    
    // Fetch user profile
    fetchProfile: async () => {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        const profile = await api.getCustomerProfile();
        update(state => ({ ...state, profile, loading: false }));
      } catch (error: any) {
        console.error('Error fetching profile:', error);
        update(state => ({ 
          ...state, 
          loading: false, 
          error: error.message || 'Failed to load profile' 
        }));
      }
    },
    
    // Update profile information
    updateProfile: async (profileData: Partial<Profile>) => {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        const updatedProfile = await api.updateCustomerProfile(profileData);
        update(state => ({
          ...state,
          profile: updatedProfile,
          loading: false
        }));
        return true;
      } catch (error: any) {
        console.error('Error updating profile:', error);
        update(state => ({ 
          ...state, 
          loading: false, 
          error: error.message || 'Failed to update profile' 
        }));
        return false;
      }
    },
    
    // Add a new address
    addAddress: async (address: Address) => {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        const updatedProfile = await api.addCustomerAddress(address);
        update(state => ({
          ...state,
          profile: updatedProfile,
          loading: false
        }));
        return true;
      } catch (error: any) {
        console.error('Error adding address:', error);
        update(state => ({ 
          ...state, 
          loading: false, 
          error: error.message || 'Failed to add address' 
        }));
        return false;
      }
    },
    
    // Update an existing address
    updateAddress: async (addressId: number, address: Address) => {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        const updatedProfile = await api.updateCustomerAddress(addressId, address);
        update(state => ({
          ...state,
          profile: updatedProfile,
          loading: false
        }));
        return true;
      } catch (error: any) {
        console.error('Error updating address:', error);
        update(state => ({ 
          ...state, 
          loading: false, 
          error: error.message || 'Failed to update address' 
        }));
        return false;
      }
    },
    
    // Delete an address
    deleteAddress: async (addressId: number) => {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        const updatedProfile = await api.deleteCustomerAddress(addressId);
        update(state => ({
          ...state,
          profile: updatedProfile,
          loading: false
        }));
        return true;
      } catch (error: any) {
        console.error('Error deleting address:', error);
        update(state => ({ 
          ...state, 
          loading: false, 
          error: error.message || 'Failed to delete address' 
        }));
        return false;
      }
    },
    
    // Clear error state
    clearError: () => {
      update(state => ({ ...state, error: null }));
    }
  };
}

export const profileStore = createProfileStore(); 