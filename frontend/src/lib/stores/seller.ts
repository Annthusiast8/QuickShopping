import { writable } from 'svelte/store';
import { api } from '../services/api';
import type { BusinessProfileData, ProductData, VariationData } from '../services/api';

// Define Product interface for proper typing
export interface Product {
    id: number;
    name: string;
    price: number;
    description: string | null;
    stock: number;
    category: string | null;
    image_url: string | null;
    seller_id: number;
    created_at: string;
    updated_at: string | null;
    variations?: Variation[];
    average_rating?: number;
    review_count?: number;
}

// Define Variation interface
export interface Variation {
    id: number;
    product_id: number;
    size: string | null;
    color: string | null;
    stock: number;
    price_adjustment: number | null;
    sku: string | null;
    created_at: string;
    updated_at: string | null;
}

// Define Order interface
export interface Order {
    id: number;
    user_id: number;
    seller_id: number;
    product_id: number;
    variation_id: number | null;
    quantity: number;
    total_price: number;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    shipping_address: string;
    payment_method: string;
    created_at: string;
    updated_at: string | null;
    product?: Product;
    user?: {
        id: number;
        name: string;
        email: string;
        avatar_url: string | null;
    };
}

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

    // Helper function to get the current state
    const get = () => {
        let currentState: SellerState;
        subscribe(state => {
            currentState = state;
        })();
        return currentState!;
    };

    return {
        subscribe,
        loadProfile: async (forceRefresh = false) => {
            // If we already have a profile and not forcing refresh, return it
            const currentState = get();
            if (!forceRefresh && currentState.profile && !currentState.loading) {
                console.log('Using cached seller profile:', currentState.profile);
                return currentState.profile;
            }
            
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const response = await api.getSellerProfile();
                console.log('API response for seller profile:', response);
                
                if (!response || !response.shop) {
                    throw new Error('Invalid response format from API');
                }
                
                // Extract the shop data from the response and map it to our BusinessProfile structure
                const profile = {
                    seller_id: response.shop.id,
                    business_name: response.shop.name,
                    description: response.shop.description,
                    logo_url: response.shop.logo_url,
                    contact_email: response.shop.contact_email,
                    contact_phone: response.shop.contact_phone,
                    address: response.shop.address,
                    is_approved: response.shop.is_approved === 1 || response.shop.is_approved === true,
                    approval_date: response.shop.approval_date,
                    created_at: response.shop.created_at,
                    updated_at: response.shop.updated_at
                };
                
                console.log('Processed seller profile:', profile);
                update(state => ({ ...state, profile, loading: false }));
                return profile;
            } catch (error) {
                console.error('Error loading seller profile:', error);
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
                const profileResponse = await api.getSellerProfile();
                
                // Extract the shop data from the response and map it to our BusinessProfile structure
                const profile = {
                    seller_id: profileResponse.shop.id,
                    business_name: profileResponse.shop.name,
                    description: profileResponse.shop.description,
                    logo_url: profileResponse.shop.logo_url,
                    contact_email: profileResponse.shop.contact_email,
                    contact_phone: profileResponse.shop.contact_phone,
                    address: profileResponse.shop.address,
                    is_approved: profileResponse.shop.is_approved,
                    approval_date: profileResponse.shop.approval_date,
                    created_at: profileResponse.shop.created_at,
                    updated_at: profileResponse.shop.updated_at
                };
                
                console.log('Updated seller profile:', profile);
                update(state => ({ ...state, profile, loading: false }));
                return response;
            } catch (error) {
                console.error('Error updating seller profile:', error);
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
                const response = await api.getSellerProducts();
                console.log('API response:', response);
                
                // Handle both array and object with data property formats
                let products: any[] = [];
                if (Array.isArray(response)) {
                    products = response;
                } else if (response && typeof response === 'object' && 'data' in response) {
                    products = (response as {data: any[]}).data;
                } else {
                    console.error('Unexpected API response format:', response);
                }
                
                // Map API response to match Product interface
                const mappedProducts = products.map((product: any) => ({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    description: product.description,
                    stock: product.stock,
                    category: product.category,
                    image_url: product.image ? `http://localhost/QuickShopping/backend/public/storage/${product.image}` : null,
                    seller_id: product.seller_id,
                    created_at: product.created_at,
                    updated_at: product.updated_at,
                    variations: product.variations || [],
                    average_rating: product.average_rating || product.reviews_avg_rating || 0,
                    review_count: product.orders_count || 0
                }));
                
                console.log('Mapped products:', mappedProducts);
                update(state => ({ ...state, products: mappedProducts, loading: false }));
                return mappedProducts;
            } catch (error) {
                console.error('Error loading products:', error);
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
                console.log('Product added response:', response);
                
                // Reload products with the same mapping logic as loadProducts
                const productsResponse = await api.getSellerProducts();
                
                // Handle both array and object with data property formats
                let products: any[] = [];
                if (Array.isArray(productsResponse)) {
                    products = productsResponse;
                } else if (productsResponse && typeof productsResponse === 'object' && 'data' in productsResponse) {
                    products = (productsResponse as {data: any[]}).data;
                } else {
                    console.error('Unexpected API response format:', productsResponse);
                }
                
                // Map API response to match Product interface
                const mappedProducts = products.map((product: any) => ({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    description: product.description,
                    stock: product.stock,
                    category: product.category,
                    image_url: product.image ? `http://localhost/QuickShopping/backend/public/storage/${product.image}` : null,
                    seller_id: product.seller_id,
                    created_at: product.created_at,
                    updated_at: product.updated_at,
                    variations: product.variations || [],
                    average_rating: product.average_rating || product.reviews_avg_rating || 0,
                    review_count: product.orders_count || 0
                }));
                
                update(state => ({ ...state, products: mappedProducts, loading: false }));
                return response;
            } catch (error) {
                console.error('Error adding product:', error);
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
                console.log('Product updated response:', response);
                
                // Reload products with the same mapping logic as loadProducts
                const productsResponse = await api.getSellerProducts();
                
                // Handle both array and object with data property formats
                let products: any[] = [];
                if (Array.isArray(productsResponse)) {
                    products = productsResponse;
                } else if (productsResponse && typeof productsResponse === 'object' && 'data' in productsResponse) {
                    products = (productsResponse as {data: any[]}).data;
                } else {
                    console.error('Unexpected API response format:', productsResponse);
                }
                
                // Map API response to match Product interface
                const mappedProducts = products.map((product: any) => ({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    description: product.description,
                    stock: product.stock,
                    category: product.category,
                    image_url: product.image ? `http://localhost/QuickShopping/backend/public/storage/${product.image}` : null,
                    seller_id: product.seller_id,
                    created_at: product.created_at,
                    updated_at: product.updated_at,
                    variations: product.variations || [],
                    average_rating: product.average_rating || product.reviews_avg_rating || 0,
                    review_count: product.orders_count || 0
                }));
                
                update(state => ({ ...state, products: mappedProducts, loading: false }));
                return response;
            } catch (error) {
                console.error('Error updating product:', error);
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
                console.log('Product deleted response:', response);
                
                // Reload products with the same mapping logic as loadProducts
                const productsResponse = await api.getSellerProducts();
                
                // Handle both array and object with data property formats
                let products: any[] = [];
                if (Array.isArray(productsResponse)) {
                    products = productsResponse;
                } else if (productsResponse && typeof productsResponse === 'object' && 'data' in productsResponse) {
                    products = (productsResponse as {data: any[]}).data;
                } else {
                    console.error('Unexpected API response format:', productsResponse);
                }
                
                // Map API response to match Product interface
                const mappedProducts = products.map((product: any) => ({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    description: product.description,
                    stock: product.stock,
                    category: product.category,
                    image_url: product.image ? `http://localhost/QuickShopping/backend/public/storage/${product.image}` : null,
                    seller_id: product.seller_id,
                    created_at: product.created_at,
                    updated_at: product.updated_at,
                    variations: product.variations || [],
                    average_rating: product.average_rating || product.reviews_avg_rating || 0,
                    review_count: product.orders_count || 0
                }));
                
                update(state => ({ ...state, products: mappedProducts, loading: false }));
                return response;
            } catch (error) {
                console.error('Error deleting product:', error);
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
        clearError: () => {
            update(state => ({ ...state, error: null }));
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