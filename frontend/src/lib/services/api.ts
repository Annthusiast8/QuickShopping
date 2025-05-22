import { auth } from '../stores/auth';
import { browser } from '$app/environment';

const BASE_URL = 'http://localhost/QuickShopping/backend/public/api';

// Response type definitions
export interface LoginResponse {
    token: string;
    user: any;
    message: string;
}

export interface ApiResponse {
    message: string;
    [key: string]: any;
}

export interface ProfileData {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    avatar?: File;
}

export interface AddressData {
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    is_default?: boolean;
}

export interface ProductData {
    name: string;
    price: number;
    description?: string;
    stock?: number;
    category?: string;
    variations?: {
        sizes?: string[];
        colors?: string[];
    };
    image?: File;
}

export interface CartItemData {
    item_id: number;
    quantity: number;
    variation?: {
        color?: string;
        size?: string;
    };
}

export interface ReviewData {
    rating: number;
    comment: string;
}

export interface ReportData {
    reason: string;
    description: string;
}

export interface OrderData {
    quantity: number;
    shipping_address: string;
}

export interface BusinessProfileData {
    name: string;
    description?: string;
    logo?: File;
    contact_email?: string;
    contact_phone?: string;
    address?: string;
}

export interface VariationData {
    size?: string;
    color?: string;
    stock: number;
    price_adjustment?: number;
    sku?: string;
}

export interface FilterParams {
    category?: string;
    min_price?: number;
    max_price?: number;
    search?: string;
    sort_by?: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'date_asc' | 'date_desc' | 'rating';
    filter?: 'new' | 'top_rated';
    per_page?: number;
    page?: number;
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: 'customer' | 'seller' | 'admin';
}

// Helper function for API requests
async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${BASE_URL}/${endpoint.startsWith('/') ? endpoint.slice(1) : endpoint}`;
    console.log('Fetching from URL:', url);
    
    // Add default headers
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(options.headers as Record<string, string> || {})
    };
    
    // Add auth token if available
    if (browser) {
        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }
    
    console.log('Request headers:', headers);
    
    try {
        // Send request
        const response = await fetch(url, {
            ...options,
            headers
        });
        
        console.log('Response status:', response.status);
        
        // Handle 401 Unauthorized
        if (response.status === 401) {
            console.log('Unauthorized access, logging out...');
            if (browser) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
            window.location.href = '/login';
            throw new Error('Unauthorized access');
        }
        
        // Parse JSON response
        const data = await response.json();
        
        if (!response.ok) {
            console.error('API Error:', data);
            throw new Error(data.message || `HTTP error: ${response.status}`);
        }
        
        console.log('API Response:', data);
        return data;
    } catch (error) {
        console.error('API Request failed:', error);
        throw error;
    }
}

// Helper function for multipart form data (file uploads)
async function uploadApi<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${BASE_URL}/${endpoint.startsWith('/') ? endpoint.slice(1) : endpoint}`;
    
    // Headers for file upload (don't set Content-Type, browser will set it with boundary)
    const headers: HeadersInit = {
        'Accept': 'application/json',
    };
    
    // Add auth token if available
    if (browser) {
        const token = localStorage.getItem('token');
        if (token) {
            (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
        }
    }
    
    // Send request
    const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData
    });
    
    // Handle 401 Unauthorized
    if (response.status === 401) {
        auth.logout();
    }
    
    // Parse JSON response
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error: ${response.status}`);
    }
    
    return response.json();
}

export const api = {
    // ===== AUTH ENDPOINTS =====
    login: async (credentials: { email: string; password: string }): Promise<LoginResponse> => {
        return fetchApi<LoginResponse>('login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    },
    
    loginWithRole: async (role: string, credentials: { email: string; password: string }): Promise<LoginResponse> => {
        return fetchApi<LoginResponse>(`login/${role}`, {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    },
    
    logout: async (): Promise<ApiResponse> => {
        return fetchApi<ApiResponse>('logout', {
            method: 'POST'
        });
    },

    register: async (role: string, data: any): Promise<ApiResponse> => {
        return fetchApi<ApiResponse>(`register/${role}`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    deleteAccount: async (password: string): Promise<ApiResponse> => {
        return fetchApi<ApiResponse>('account/delete', {
            method: 'POST',
            body: JSON.stringify({ password })
        });
    },

    // ===== PROFILE ENDPOINTS =====
    getProfile: async (): Promise<any> => {
        return fetchApi<any>('profile');
    },

    updateProfile: async (profileData: ProfileData): Promise<ApiResponse> => {
        // If there's a file to upload, use FormData
        if (profileData.avatar) {
            const formData = new FormData();
            Object.entries(profileData).forEach(([key, value]) => {
                if (key === 'avatar' && value instanceof File) {
                    formData.append(key, value);
                } else if (value !== undefined && typeof value !== 'object') {
                    formData.append(key, String(value));
                }
            });
            return uploadApi<ApiResponse>('profile', formData);
        }
        
        return fetchApi<ApiResponse>('profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    },

    // ===== ADDRESS ENDPOINTS =====
    getAddresses: async (): Promise<any[]> => {
        return fetchApi<any[]>('customer/addresses');
    },

    addAddress: async (address: AddressData): Promise<ApiResponse> => {
        return fetchApi<ApiResponse>('customer/addresses', {
            method: 'POST',
            body: JSON.stringify(address)
        });
    },

    updateAddress: async (addressId: number, address: Partial<AddressData>): Promise<ApiResponse> => {
        return fetchApi<ApiResponse>(`customer/addresses/${addressId}`, {
            method: 'PUT',
            body: JSON.stringify(address)
        });
    },

    deleteAddress: async (addressId: number): Promise<ApiResponse> => {
        return fetchApi<ApiResponse>(`customer/addresses/${addressId}`, {
            method: 'DELETE'
        });
    },

    // ===== PRODUCT ENDPOINTS =====
    getProducts: async (filters?: FilterParams): Promise<any> => {
        let queryString = '';
        if (filters) {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined) {
                    params.append(key, value.toString());
                }
            });
            queryString = params.toString();
        }
        return fetchApi<any>(`items${queryString ? '?' + queryString : ''}`);
    },

    getProduct: async (productId: number): Promise<any> => {
        return fetchApi<any>(`items/${productId}`);
    },

    reportProduct: async (itemId: number, reportData: ReportData): Promise<ApiResponse> => {
        return fetchApi<ApiResponse>(`items/${itemId}/report`, {
            method: 'POST',
            body: JSON.stringify(reportData)
        });
    },

    // ===== CART ENDPOINTS =====
    getCart: async (): Promise<any> => {
        return fetchApi<any>('cart');
    },

    addToCart: async (cartItem: CartItemData): Promise<ApiResponse> => {
        return fetchApi<ApiResponse>('cart/add', {
            method: 'POST',
            body: JSON.stringify(cartItem)
        });
    },

    updateCartItem: async (itemId: number, updateData: Partial<CartItemData>): Promise<ApiResponse> => {
        return fetchApi<ApiResponse>(`cart/update/${itemId}`, {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });
    },

    removeFromCart: async (itemId: number, variation?: { color?: string; size?: string }): Promise<ApiResponse> => {
        return fetchApi<ApiResponse>(`cart/remove/${itemId}`, {
            method: 'DELETE',
            body: variation ? JSON.stringify({ variation }) : undefined
        });
    },

    checkout: async (checkoutData: { shipping_address: string; payment_method: string }): Promise<ApiResponse> => {
        return fetchApi<ApiResponse>('cart/checkout', {
            method: 'POST',
            body: JSON.stringify(checkoutData)
        });
    },

    // ===== ORDER ENDPOINTS =====
    getOrders: async (): Promise<any[]> => {
        return fetchApi<any[]>('orders');
    },

    getOrder: async (orderId: number): Promise<any> => {
        return fetchApi<any>(`orders/${orderId}`);
    },

    placeDirectOrder: async (itemId: number, orderData: OrderData): Promise<ApiResponse> => {
        return fetchApi<ApiResponse>(`items/${itemId}/orders`, {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    },

    // ===== REVIEW ENDPOINTS =====
    addReview: async (itemId: number, reviewData: ReviewData): Promise<ApiResponse> => {
        return fetchApi<ApiResponse>(`items/${itemId}/reviews`, {
            method: 'POST',
            body: JSON.stringify(reviewData)
        });
    },

    updateReview: async (reviewId: number, reviewData: Partial<ReviewData>): Promise<ApiResponse> => {
        return fetchApi<ApiResponse>(`reviews/${reviewId}`, {
            method: 'PUT',
            body: JSON.stringify(reviewData)
        });
    },

    deleteReview: async (reviewId: number): Promise<ApiResponse> => {
        return fetchApi<ApiResponse>(`reviews/${reviewId}`, {
            method: 'DELETE'
        });
    },

    // ===== SELLER ENDPOINTS =====
    getSellerProfile: async (): Promise<any> => {
        return fetchApi<any>('seller/profile');
    },

    updateSellerProfile: async (profileData: BusinessProfileData): Promise<ApiResponse> => {
        // If there's a file to upload, use FormData
        if (profileData.logo) {
            const formData = new FormData();
            Object.entries(profileData).forEach(([key, value]) => {
                if (key === 'logo' && value instanceof File) {
                    formData.append(key, value);
                } else if (value !== undefined && typeof value !== 'object') {
                    formData.append(key, String(value));
                }
            });
            return uploadApi<ApiResponse>('seller/profile', formData);
        }
        
        return fetchApi<ApiResponse>('seller/profile', {
            method: 'POST',
            body: JSON.stringify(profileData)
        });
    },

    getSellerProducts: async (): Promise<any[]> => {
        return fetchApi<any[]>('seller/products');
    },

    addSellerProduct: async (productData: ProductData): Promise<ApiResponse> => {
        // If there's a file to upload, use FormData
        if (productData.image) {
            const formData = new FormData();
            Object.entries(productData).forEach(([key, value]) => {
                if (key === 'variations' && value) {
                    formData.append(key, JSON.stringify(value));
                } else if (key === 'image' && value instanceof File) {
                    formData.append(key, value);
                } else if (value !== undefined && typeof value !== 'object') {
                    formData.append(key, String(value));
                }
            });
            return uploadApi<ApiResponse>('seller/products/add', formData);
        }
        
        return fetchApi<ApiResponse>('seller/products/add', {
            method: 'POST',
            body: JSON.stringify(productData)
        });
    },

    updateSellerProduct: async (productId: number, productData: Partial<ProductData>): Promise<ApiResponse> => {
        // If there's a file to upload, use FormData
        if (productData.image) {
            const formData = new FormData();
            Object.entries(productData).forEach(([key, value]) => {
                if (key === 'variations' && value) {
                    formData.append(key, JSON.stringify(value));
                } else if (key === 'image' && value instanceof File) {
                    formData.append(key, value);
                } else if (value !== undefined && typeof value !== 'object') {
                    formData.append(key, String(value));
                }
            });
            return uploadApi<ApiResponse>(`seller/products/update/${productId}`, formData);
        }
        
        return fetchApi<ApiResponse>(`seller/products/update/${productId}`, {
            method: 'POST',
            body: JSON.stringify(productData)
        });
    },

    deleteSellerProduct: async (productId: number): Promise<ApiResponse> => {
        return fetchApi<ApiResponse>(`seller/products/delete/${productId}`, {
            method: 'DELETE'
        });
    },

    addProductVariation: async (productId: number, variationData: VariationData): Promise<ApiResponse> => {
        return fetchApi<ApiResponse>(`seller/products/${productId}/variations`, {
            method: 'POST',
            body: JSON.stringify(variationData)
        });
    },

    updateProductVariation: async (productId: number, variationId: number, variationData: Partial<VariationData>): Promise<ApiResponse> => {
        return fetchApi<ApiResponse>(`seller/products/${productId}/variations/${variationId}`, {
            method: 'PUT',
            body: JSON.stringify(variationData)
        });
    },

    deleteProductVariation: async (productId: number, variationId: number): Promise<ApiResponse> => {
        return fetchApi<ApiResponse>(`seller/products/${productId}/variations/${variationId}`, {
            method: 'DELETE'
        });
    },

    getSellerOrders: async (): Promise<any[]> => {
        return fetchApi<any[]>('seller/orders');
    },

    updateOrderStatus: async (orderId: number, status: 'approved' | 'rejected' | 'completed'): Promise<ApiResponse> => {
        return fetchApi<ApiResponse>(`seller/orders/${orderId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    },

    // ===== ADMIN ENDPOINTS =====
    getUsers: async (): Promise<any[]> => {
        return fetchApi<any[]>('admin/users');
    },

    updateUserRole: async (userId: number, role: string): Promise<ApiResponse> => {
        return fetchApi<ApiResponse>(`admin/users/${userId}/role`, {
            method: 'PUT',
            body: JSON.stringify({ role })
        });
    },

    deleteUser: async (userId: number): Promise<ApiResponse> => {
        return fetchApi<ApiResponse>(`admin/users/${userId}`, {
            method: 'DELETE'
        });
    },

    getAllBusinesses: async (params?: { status?: string; search?: string; sort_by?: string; sort_order?: string; per_page?: number; page?: number }): Promise<any> => {
        let queryParams = '';
        
        if (params) {
            const queryParts = [];
            for (const [key, value] of Object.entries(params)) {
                if (value !== undefined) {
                    queryParts.push(`${key}=${encodeURIComponent(value)}`);
                }
            }
            if (queryParts.length > 0) {
                queryParams = `?${queryParts.join('&')}`;
            }
        }
        
        return fetchApi<any>(`admin/businesses${queryParams}`);
    },
    
    getPendingBusinesses: async (): Promise<any[]> => {
        return fetchApi<any[]>('admin/businesses/pending');
    },

    approveBusiness: async (shopId: number): Promise<ApiResponse> => {
        return fetchApi<ApiResponse>(`admin/businesses/${shopId}/approve`, {
            method: 'PUT'
        });
    },

    rejectBusiness: async (shopId: number, rejectionReason: string): Promise<ApiResponse> => {
        return fetchApi<ApiResponse>(`admin/businesses/${shopId}/reject`, {
            method: 'PUT',
            body: JSON.stringify({ rejection_reason: rejectionReason })
        });
    },

    getReports: async (status?: 'pending' | 'reviewed' | 'resolved' | 'all'): Promise<any[]> => {
        const queryString = status ? `?status=${status}` : '';
        return fetchApi<any[]>(`admin/reports${queryString}`);
    },

    reviewReport: async (reportId: number, reviewData: { status: 'reviewed' | 'resolved', admin_notes?: string, remove_item?: boolean }): Promise<ApiResponse> => {
        return fetchApi<ApiResponse>(`admin/reports/${reportId}/review`, {
            method: 'PUT',
            body: JSON.stringify(reviewData)
        });
    },

    // ===== HEALTH CHECK ENDPOINTS =====
    checkAdminHealth: async (): Promise<ApiResponse> => {
        return fetchApi<ApiResponse>('health/admin');
    },

    checkCustomerHealth: async (): Promise<ApiResponse> => {
        return fetchApi<ApiResponse>('health/customer');
    },

    checkSellerHealth: async (): Promise<ApiResponse> => {
        return fetchApi<ApiResponse>('health/seller');
    }
};
