import { writable } from 'svelte/store';
import { api } from '../services/api';
import type { OrderData } from '../services/api';

interface OrdersState {
    orders: any[];
    selectedOrder: any | null;
    loading: boolean;
    error: string | null;
}

function createOrdersStore() {
    const { subscribe, set, update } = writable<OrdersState>({
        orders: [],
        selectedOrder: null,
        loading: false,
        error: null
    });

    return {
        subscribe,
        loadOrders: async () => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const orders = await api.getOrders();
                update(state => ({
                    ...state,
                    orders,
                    loading: false
                }));
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
        loadOrder: async (orderId: number) => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const order = await api.getOrder(orderId);
                update(state => ({
                    ...state,
                    selectedOrder: order,
                    loading: false
                }));
                return order;
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to load order'
                }));
                throw error;
            }
        },
        placeOrder: async (itemId: number, orderData: OrderData) => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const response = await api.placeDirectOrder(itemId, orderData);
                const orders = await api.getOrders();
                update(state => ({
                    ...state,
                    orders,
                    loading: false
                }));
                return response;
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to place order'
                }));
                throw error;
            }
        },
        clearSelected: () => {
            update(state => ({ ...state, selectedOrder: null }));
        }
    };
}

export const orders = createOrdersStore(); 