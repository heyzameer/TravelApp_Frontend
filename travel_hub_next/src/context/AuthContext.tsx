"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, LoginCredentials } from '@/types/auth';
import { authService } from '@/services/api';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    partnerLogin: (email: string, otp: string) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const checkAuth = React.useCallback(async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setIsLoading(false);
            return;
        }
        try {
            const response = await authService.getProfile();
            if (response.data.success && response.data.data?.user) {
                setUser(response.data.data.user);
            } else {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                setUser(null);
            }
        } catch (error) {
            console.error('Auth check failed', error);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const login = async (credentials: LoginCredentials) => {
        try {
            const response = await authService.login(credentials);
            if (response.data.success && response.data.data) {
                localStorage.setItem('accessToken', response.data.data.accessToken);
                localStorage.setItem('refreshToken', response.data.data.refreshToken);
                setUser(response.data.data.user);
                router.push('/');
            }
        } catch (error) {
            throw error;
        }
    };

    const partnerLogin = async (email: string, otp: string) => {
        try {
            const response = await authService.partnerVerifyLoginOtp(email, otp);
            if (response.data.success && response.data.data) {
                localStorage.setItem('accessToken', response.data.data.accessToken);
                localStorage.setItem('refreshToken', response.data.data.refreshToken);
                // The partner login response structure might be slightly different or same
                // Based on JSON: data.user exists
                setUser(response.data.data.user as User);
                router.push('/');
            }
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Logout error', error);
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setUser(null);
            router.push('/auth/login');
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isLoading,
            login,
            partnerLogin,
            logout,
            checkAuth
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
