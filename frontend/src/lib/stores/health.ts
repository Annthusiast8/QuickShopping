import { writable } from 'svelte/store';
import { api } from '../services/api';

interface HealthState {
    admin: boolean;
    customer: boolean;
    seller: boolean;
    loading: boolean;
    error: string | null;
}

function createHealthStore() {
    const { subscribe, set, update } = writable<HealthState>({
        admin: false,
        customer: false,
        seller: false,
        loading: false,
        error: null
    });

    return {
        subscribe,
        checkAdminHealth: async () => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const response = await api.checkAdminHealth();
                update(state => ({
                    ...state,
                    admin: true,
                    loading: false
                }));
                return response;
            } catch (error) {
                update(state => ({
                    ...state,
                    admin: false,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Admin health check failed'
                }));
                throw error;
            }
        },
        checkCustomerHealth: async () => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const response = await api.checkCustomerHealth();
                update(state => ({
                    ...state,
                    customer: true,
                    loading: false
                }));
                return response;
            } catch (error) {
                update(state => ({
                    ...state,
                    customer: false,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Customer health check failed'
                }));
                throw error;
            }
        },
        checkSellerHealth: async () => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const response = await api.checkSellerHealth();
                update(state => ({
                    ...state,
                    seller: true,
                    loading: false
                }));
                return response;
            } catch (error) {
                update(state => ({
                    ...state,
                    seller: false,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Seller health check failed'
                }));
                throw error;
            }
        },
        checkAllHealth: async () => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const [adminResponse, customerResponse, sellerResponse] = await Promise.all([
                    api.checkAdminHealth(),
                    api.checkCustomerHealth(),
                    api.checkSellerHealth()
                ]);
                update(state => ({
                    ...state,
                    admin: true,
                    customer: true,
                    seller: true,
                    loading: false
                }));
                return { admin: adminResponse, customer: customerResponse, seller: sellerResponse };
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Health check failed'
                }));
                throw error;
            }
        },
        reset: () => {
            set({
                admin: false,
                customer: false,
                seller: false,
                loading: false,
                error: null
            });
        }
    };
}

export const health = createHealthStore(); 