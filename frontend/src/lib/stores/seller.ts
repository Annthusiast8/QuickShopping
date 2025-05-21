import { writable } from 'svelte/store';
import { api } from '../services/api';
import type { BusinessProfileData, ProductData, VariationData } from '../services/api';

interface BusinessProfile {
    seller_id: number;
    business_name: string;
    description: string | null;
    logo_url: string | null;
    contact_email: string;
    contact_phone: string | null;
    address: string | null;
    is_approved: boolean;
    approval_date: string | null;
    created_at: string;
    updated_at: string | null;
}

interface SellerState {
    profile: BusinessProfile | null;
    products: any[];
    orders: any[];
    loading: boolean;
    error: string | null;
}

function createSellerStore() {
    const { subscribe, set, update } = writable<SellerState>({
        profile: null,
        products: [],
        orders: [],
        loading: false,
        error: null
    });

    return {
        subscribe,
        loadProfile: async () => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const profile = await api.getSellerProfile();
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
        updateProfile: async (profileData: BusinessProfileData) => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const response = await api.updateSellerProfile(profileData);
                const profile = await api.getSellerProfile();
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
        loadProducts: async () => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const products = await api.getSellerProducts();
                update(state => ({ ...state, products, loading: false }));
                return products;
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to load products'
                }));
                throw error;
            }
        },
        addProduct: async (productData: ProductData) => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const response = await api.addSellerProduct(productData);
                const products = await api.getSellerProducts();
                update(state => ({ ...state, products, loading: false }));
                return response;
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to add product'
                }));
                throw error;
            }
        },
        updateProduct: async (productId: number, productData: Partial<ProductData>) => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const response = await api.updateSellerProduct(productId, productData);
                const products = await api.getSellerProducts();
                update(state => ({ ...state, products, loading: false }));
                return response;
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to update product'
                }));
                throw error;
            }
        },
        deleteProduct: async (productId: number) => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const response = await api.deleteSellerProduct(productId);
                const products = await api.getSellerProducts();
                update(state => ({ ...state, products, loading: false }));
                return response;
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to delete product'
                }));
                throw error;
            }
        },
        addVariation: async (productId: number, variationData: VariationData) => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const response = await api.addProductVariation(productId, variationData);
                const products = await api.getSellerProducts();
                update(state => ({ ...state, products, loading: false }));
                return response;
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to add variation'
                }));
                throw error;
            }
        },
        updateVariation: async (productId: number, variationId: number, variationData: Partial<VariationData>) => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const response = await api.updateProductVariation(productId, variationId, variationData);
                const products = await api.getSellerProducts();
                update(state => ({ ...state, products, loading: false }));
                return response;
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to update variation'
                }));
                throw error;
            }
        },
        deleteVariation: async (productId: number, variationId: number) => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const response = await api.deleteProductVariation(productId, variationId);
                const products = await api.getSellerProducts();
                update(state => ({ ...state, products, loading: false }));
                return response;
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to delete variation'
                }));
                throw error;
            }
        },
        loadOrders: async () => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const orders = await api.getSellerOrders();
                update(state => ({ ...state, orders, loading: false }));
                return orders;
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to load orders'
                }));
                throw error;
            }
        },
        updateOrderStatus: async (orderId: number, status: 'approved' | 'rejected' | 'completed') => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const response = await api.updateOrderStatus(orderId, status);
                const orders = await api.getSellerOrders();
                update(state => ({ ...state, orders, loading: false }));
                return response;
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to update order status'
                }));
                throw error;
            }
        },
        reset: () => {
            set({
                profile: null,
                products: [],
                orders: [],
                loading: false,
                error: null
            });
        }
    };
}

export const seller = createSellerStore(); 