import { writable } from 'svelte/store';
import { api } from '../services/api';

// Interface for paginated response from API
interface PaginatedResponse<T> {
    current_page: number;
    data: T[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{ url: string | null; label: string; active: boolean }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

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

export interface Business {
    id: number;
    user_id: number;
    name: string;
    description: string | null;
    logo_url: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    address: string | null;
    is_active: number;
    is_approved: number;
    approval_date: string | null;
    approved_by: number | null;
    rejection_reason: string | null;
    created_at: string;
    updated_at: string | null;
    user?: User;
    status?: 'pending' | 'approved' | 'rejected';
}

// API response might return any type, so we need a more flexible interface for the API call
export interface ApiPendingBusinessesResponse {
    current_page: number;
    data: any[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{ url: string | null; label: string; active: boolean }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

interface AdminState {
    users: User[];
    pendingBusinesses: Business[];
    allBusinesses: Business[];
    reports: any[];
    loading: boolean;
    error: string | null;
}

function createAdminStore() {
    const { subscribe, set, update } = writable<AdminState>({
        users: [],
        pendingBusinesses: [],
        allBusinesses: [],
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
        loadAllBusinesses: async (params?: { status?: string; search?: string; sort_by?: string; sort_order?: string; per_page?: number; page?: number }) => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                // Get all businesses with optional filtering
                const response = await api.getAllBusinesses(params) as unknown as ApiPendingBusinessesResponse;
                // Handle paginated response - extract the data array
                const businesses = response.data || [];
                
                // Map the businesses to include status
                const mappedBusinesses = businesses.map((business: any) => {
                    const status = business.is_approved === 1 ? 'approved' : 
                                  business.rejection_reason ? 'rejected' : 'pending';
                    return {
                        ...business,
                        status: status as 'pending' | 'approved' | 'rejected'
                    } as Business;
                });
                
                console.log('Loaded all businesses:', mappedBusinesses);
                update(state => ({ ...state, allBusinesses: mappedBusinesses, loading: false }));
                return response; // Return full response with pagination info
            } catch (error) {
                console.error('Failed to load businesses:', error);
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to load businesses'
                }));
                throw error;
            }
        },
        loadPendingBusinesses: async () => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                // First cast to unknown then to our interface to avoid TypeScript errors
                const response = await api.getPendingBusinesses() as unknown as ApiPendingBusinessesResponse;
                // Handle paginated response - extract the data array
                const businesses = response.data || [];
                
                // Map the businesses to include status
                const mappedBusinesses = businesses.map((business: any) => {
                    const status = business.is_approved === 1 ? 'approved' : 
                                  business.rejection_reason ? 'rejected' : 'pending';
                    return {
                        ...business,
                        status: status as 'pending' | 'approved' | 'rejected'
                    } as Business;
                });
                
                console.log('Loaded pending businesses:', mappedBusinesses);
                update(state => ({ ...state, pendingBusinesses: mappedBusinesses, loading: false }));
                return mappedBusinesses;
            } catch (error) {
                console.error('Failed to load pending businesses:', error);
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
                
                // Reload businesses with updated data
                const businessesResponse = await api.getPendingBusinesses() as unknown as ApiPendingBusinessesResponse;
                const businesses = businessesResponse.data || [];
                
                // Map the businesses to include status
                const mappedBusinesses = businesses.map((business: any) => {
                    const status = business.is_approved === 1 ? 'approved' : 
                                  business.rejection_reason ? 'rejected' : 'pending';
                    return {
                        ...business,
                        status: status as 'pending' | 'approved' | 'rejected'
                    } as Business;
                });
                
                update(state => ({ ...state, pendingBusinesses: mappedBusinesses, loading: false }));
                return response;
            } catch (error) {
                console.error('Failed to approve business:', error);
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
                
                // Reload businesses with updated data
                const businessesResponse = await api.getPendingBusinesses() as unknown as ApiPendingBusinessesResponse;
                const businesses = businessesResponse.data || [];
                
                // Map the businesses to include status
                const mappedBusinesses = businesses.map((business: any) => {
                    const status = business.is_approved === 1 ? 'approved' : 
                                  business.rejection_reason ? 'rejected' : 'pending';
                    return {
                        ...business,
                        status: status as 'pending' | 'approved' | 'rejected'
                    } as Business;
                });
                
                update(state => ({ ...state, pendingBusinesses: mappedBusinesses, loading: false }));
                return response;
            } catch (error) {
                console.error('Failed to reject business:', error);
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
                allBusinesses: [],
                reports: [],
                loading: false,
                error: null
            });
        }
    };
}

export const admin = createAdminStore(); 