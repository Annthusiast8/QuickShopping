import { writable } from 'svelte/store';
import { api } from '../services/api';
import type { ProfileData, AddressData } from '../services/api';

interface ProfileState {
    profile: any | null;
    addresses: any[];
    loading: boolean;
    error: string | null;
}

function createProfileStore() {
    const { subscribe, set, update } = writable<ProfileState>({
        profile: null,
        addresses: [],
        loading: false,
        error: null
    });

    return {
        subscribe,
        loadProfile: async () => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const profile = await api.getProfile();
                update(state => ({ ...state, profile, loading: false }));
                return profile;
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to load profile'
                }));
                throw error;
            }
        },
        updateProfile: async (profileData: ProfileData) => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const response = await api.updateProfile(profileData);
                const profile = await api.getProfile();
                update(state => ({ ...state, profile, loading: false }));
                return response;
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to update profile'
                }));
                throw error;
            }
        },
        loadAddresses: async () => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const addresses = await api.getAddresses();
                update(state => ({ ...state, addresses, loading: false }));
                return addresses;
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to load addresses'
                }));
                throw error;
            }
        },
        addAddress: async (address: AddressData) => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const response = await api.addAddress(address);
                const addresses = await api.getAddresses();
                update(state => ({ ...state, addresses, loading: false }));
                return response;
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to add address'
                }));
                throw error;
            }
        },
        updateAddress: async (addressId: number, address: Partial<AddressData>) => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const response = await api.updateAddress(addressId, address);
                const addresses = await api.getAddresses();
                update(state => ({ ...state, addresses, loading: false }));
                return response;
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to update address'
                }));
                throw error;
            }
        },
        deleteAddress: async (addressId: number) => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const response = await api.deleteAddress(addressId);
                const addresses = await api.getAddresses();
                update(state => ({ ...state, addresses, loading: false }));
                return response;
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to delete address'
                }));
                throw error;
            }
        }
    };
}

export const profile = createProfileStore(); 