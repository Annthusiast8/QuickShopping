import { auth } from '../stores/auth';

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
    // Add other profile fields
}

export interface ProductData {
    name: string;
    price: number;
    description?: string;
    // Add other product fields
}

// Helper function for API requests
async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${BASE_URL}/${endpoint.startsWith('/') ? endpoint.slice(1) : endpoint}`;
    
    // Add default headers
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
    };
    
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
    
    // Send request
    const response = await fetch(url, {
        ...options,
        headers
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
        return fetchApi<LoginResponse>('/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    },
    
    logout: async (): Promise<ApiResponse> => {
        return fetchApi<ApiResponse>('/logout', {
            method: 'POST'
        });
    },

    register: async (role: string, data: any): Promise<ApiResponse> => {
        return fetchApi<ApiResponse>(`/register/${role}`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    // ===== PROFILE ENDPOINTS =====
    getProfile: async (userId: number): Promise<any> => {
        return fetchApi<any>(`customer/profile/${userId}`);
    },

    updateProfile: async (userId: number, profileData: ProfileData): Promise<ApiResponse> => {
        return fetchApi<ApiResponse>(`customer/profile/${userId}`, {
            method: 'POST',
            body: JSON.stringify(profileData)
        });
    },

    // ===== PRODUCT ENDPOINTS =====
    getProducts: async (): Promise<any[]> => {
        return fetchApi<any[]>('seller/products');
    },

    createProduct: async (productData: ProductData): Promise<ApiResponse> => {
        return fetchApi<ApiResponse>('seller/products/create', {
            method: 'POST',
            body: JSON.stringify(productData)
        });
    },

    updateProduct: async (productId: number, productData: Partial<ProductData>): Promise<ApiResponse> => {
        return fetchApi<ApiResponse>(`seller/products/update/${productId}`, {
            method: 'POST',
            body: JSON.stringify(productData)
        });
    },

    deleteProduct: async (productId: number): Promise<ApiResponse> => {
        return fetchApi<ApiResponse>(`seller/products/delete/${productId}`, {
            method: 'DELETE'
        });
    },

    // ===== ADMIN ENDPOINTS =====
    // Users management
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

    // ===== CUSTOMER PROFILE ENDPOINTS =====
    getCustomerProfile: async (): Promise<any> => {
        return fetchApi<any>('customer/profile');
    },

    updateCustomerProfile: async (profileData: Partial<any>): Promise<any> => {
        return fetchApi<any>('customer/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    },

    addCustomerAddress: async (address: any): Promise<any> => {
        return fetchApi<any>('customer/addresses', {
            method: 'POST',
            body: JSON.stringify(address)
        });
    },

    updateCustomerAddress: async (addressId: number, address: any): Promise<any> => {
        return fetchApi<any>(`customer/addresses/${addressId}`, {
            method: 'PUT',
            body: JSON.stringify(address)
        });
    },

    deleteCustomerAddress: async (addressId: number): Promise<any> => {
        return fetchApi<any>(`customer/addresses/${addressId}`, {
            method: 'DELETE'
        });
    },

    // ===== GENERIC REQUEST METHODS =====
    get: async <T = any>(endpoint: string): Promise<T> => {
        return fetchApi<T>(endpoint);
    },

    post: async <T = any>(endpoint: string, data: any): Promise<T> => {
        return fetchApi<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    put: async <T = any>(endpoint: string, data: any): Promise<T> => {
        return fetchApi<T>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    delete: async <T = any>(endpoint: string): Promise<T> => {
        return fetchApi<T>(endpoint, {
            method: 'DELETE'
        });
    }
};
