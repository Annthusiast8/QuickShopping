import { writable } from 'svelte/store';
import { api } from '../services/api';

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

interface AdminState {
    users: User[];
    pendingBusinesses: any[];
    reports: any[];
    loading: boolean;
    error: string | null;
}

function createAdminStore() {
    const { subscribe, set, update } = writable<AdminState>({
        users: [],
        pendingBusinesses: [],
        reports: [],
        loading: false,
        error: null
    });

    return {
        subscribe,
        loadUsers: async () => {
            console.log('Loading users...');
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const users = await api.getUsers();
                console.log('Users loaded from API:', users);
                update(state => ({ ...state, users, loading: false }));
                return users;
            } catch (error) {
                console.error('Error loading users:', error);
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to load users'
                }));
                throw error;
            }
        },
        updateUserRole: async (userId: number, role: 'admin' | 'seller' | 'customer') => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const response = await api.updateUserRole(userId, role);
                update(state => ({
                    ...state,
                    users: state.users.map(user => 
                        user.id === userId ? { ...user, role } : user
                    ),
                    loading: false
                }));
                return response;
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to update user role'
                }));
                throw error;
            }
        },
        deleteUser: async (userId: number) => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const response = await api.deleteUser(userId);
                update(state => ({
                    ...state,
                    users: state.users.filter(user => user.id !== userId),
                    loading: false
                }));
                return response;
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to delete user'
                }));
                throw error;
            }
        },
        loadPendingBusinesses: async () => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const businesses = await api.getPendingBusinesses();
                update(state => ({ ...state, pendingBusinesses: businesses, loading: false }));
                return businesses;
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to load pending businesses'
                }));
                throw error;
            }
        },
        approveBusiness: async (shopId: number) => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const response = await api.approveBusiness(shopId);
                const businesses = await api.getPendingBusinesses();
                update(state => ({ ...state, pendingBusinesses: businesses, loading: false }));
                return response;
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to approve business'
                }));
                throw error;
            }
        },
        rejectBusiness: async (shopId: number, rejectionReason: string) => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const response = await api.rejectBusiness(shopId, rejectionReason);
                const businesses = await api.getPendingBusinesses();
                update(state => ({ ...state, pendingBusinesses: businesses, loading: false }));
                return response;
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to reject business'
                }));
                throw error;
            }
        },
        loadReports: async (status?: 'pending' | 'reviewed' | 'resolved' | 'all') => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const reports = await api.getReports(status);
                update(state => ({ ...state, reports, loading: false }));
                return reports;
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to load reports'
                }));
                throw error;
            }
        },
        reviewReport: async (reportId: number, reviewData: { status: 'reviewed' | 'resolved', admin_notes?: string, remove_item?: boolean }) => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const response = await api.reviewReport(reportId, reviewData);
                const reports = await api.getReports();
                update(state => ({ ...state, reports, loading: false }));
                return response;
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to review report'
                }));
                throw error;
            }
        },
        clearError: () => {
            update(state => ({ ...state, error: null }));
        },
        reset: () => {
            set({
                users: [],
                pendingBusinesses: [],
                reports: [],
                loading: false,
                error: null
            });
        }
    };
}

export const admin = createAdminStore(); 