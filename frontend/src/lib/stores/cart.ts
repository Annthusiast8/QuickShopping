import { writable } from 'svelte/store';
import { api } from '../services/api';
import type { CartItemData } from '../services/api';

interface CartState {
    items: any[];
    loading: boolean;
    error: string | null;
}

function createCartStore() {
    const { subscribe, set, update } = writable<CartState>({
        items: [],
        loading: false,
        error: null
    });

    return {
        subscribe,
        loadCart: async () => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const cart = await api.getCart();
                update(state => ({
                    ...state,
                    items: cart.items || [],
                    loading: false
                }));
                return cart;
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to load cart'
                }));
                throw error;
            }
        },
        addToCart: async (item: CartItemData) => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const response = await api.addToCart(item);
                const cart = await api.getCart();
                update(state => ({
                    ...state,
                    items: cart.items || [],
                    loading: false
                }));
                return response;
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to add item to cart'
                }));
                throw error;
            }
        },
        updateCartItem: async (itemId: number, updateData: Partial<CartItemData>) => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const response = await api.updateCartItem(itemId, updateData);
                const cart = await api.getCart();
                update(state => ({
                    ...state,
                    items: cart.items || [],
                    loading: false
                }));
                return response;
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to update cart item'
                }));
                throw error;
            }
        },
        removeFromCart: async (itemId: number, variation?: { color?: string; size?: string }) => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const response = await api.removeFromCart(itemId, variation);
                const cart = await api.getCart();
                update(state => ({
                    ...state,
                    items: cart.items || [],
                    loading: false
                }));
                return response;
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to remove item from cart'
                }));
                throw error;
            }
        },
        checkout: async (shippingAddress: string, paymentMethod: string) => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const response = await api.checkout({
                    shipping_address: shippingAddress,
                    payment_method: paymentMethod
                });
                update(state => ({
                    ...state,
                    items: [],
                    loading: false
                }));
                return response;
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to checkout'
                }));
                throw error;
            }
        }
    };
}

export const cart = createCartStore();
