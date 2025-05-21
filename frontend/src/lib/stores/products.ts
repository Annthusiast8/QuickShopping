import { writable } from 'svelte/store';
import { api } from '../services/api';
import type { ProductData, FilterParams } from '../services/api';

interface ProductsState {
    items: any[];
    selectedItem: any | null;
    loading: boolean;
    error: string | null;
    filters: FilterParams;
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    } | null;
}

function createProductsStore() {
    const { subscribe, set, update } = writable<ProductsState>({
        items: [],
        selectedItem: null,
        loading: false,
        error: null,
        filters: {},
        pagination: null
    });

    return {
        subscribe,
        loadProducts: async (filters?: FilterParams) => {
            update(state => ({ ...state, loading: true, error: null, filters: filters || {} }));
            try {
                const response = await api.getProducts(filters);
                update(state => ({
                    ...state,
                    items: response.data,
                    pagination: response.meta,
                    loading: false
                }));
                return response;
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to load products'
                }));
                throw error;
            }
        },
        loadProduct: async (productId: number) => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const product = await api.getProduct(productId);
                update(state => ({
                    ...state,
                    selectedItem: product,
                    loading: false
                }));
                return product;
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to load product'
                }));
                throw error;
            }
        },
        reportProduct: async (itemId: number, reason: string, description: string) => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const response = await api.reportProduct(itemId, { reason, description });
                update(state => ({ ...state, loading: false }));
                return response;
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to report product'
                }));
                throw error;
            }
        },
        clearSelected: () => {
            update(state => ({ ...state, selectedItem: null }));
        },
        updateFilters: (filters: Partial<FilterParams>) => {
            update(state => ({
                ...state,
                filters: { ...state.filters, ...filters }
            }));
        }
    };
}

export const products = createProductsStore(); 