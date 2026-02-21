import axios from 'axios';
import { toast } from 'sonner';
import { AuthResponse, LoginCredentials, RegisterCredentials } from '@/types/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add interceptor to attach token
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Response interceptor for maintenance mode
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 503) {
            const maintenanceMessage = error.response.data?.message || "Platform is under maintenance. Please try again later.";
            toast.error(maintenanceMessage, {
                duration: 5000,
                id: 'maintenance-error'
            });
        }
        return Promise.reject(error);
    }
);

export const authService = {
    // User Auth
    register: async (data: RegisterCredentials) => {
        return api.post<AuthResponse>('/auth/register', data);
    },
    login: async (data: LoginCredentials) => {
        return api.post<AuthResponse>('/auth/login', data);
    },
    verifyOtp: async (data: { code: string; type: string }) => {
        return api.post<AuthResponse>('/auth/verify-otp', data);
    },
    logout: async () => {
        return api.post<AuthResponse>('/auth/logout');
    },
    getProfile: async () => {
        return api.get<AuthResponse>('/auth/profile');
    },
    updateProfile: async (data: FormData) => {
        return api.put<AuthResponse>('/auth/profile', data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    resendUserOtp: async (data: { email: string; type: string }) => {
        return api.post<AuthResponse>('/auth/resend-otp', data);
    },

    // Partner Auth
    partnerRegister: async (data: RegisterCredentials) => {
        return api.post<AuthResponse>('/partner/register-partner', data);
    },
    partnerRequestLoginOtp: async (email: string) => {
        return api.post<AuthResponse>('/partner/request-login-otp', { email });
    },
    partnerVerifyLoginOtp: async (email: string, otp: string) => {
        return api.post<AuthResponse>('/partner/verify-login-otp', { email, otp });
    },
    partnerProfile: async () => {
        return api.get<AuthResponse>('/partner/profile');
    }
};

export default api;
