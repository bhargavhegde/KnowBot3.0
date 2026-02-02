'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { apiService, User } from '@/lib/api';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (credentials: any) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    const fetchUser = async () => {
        try {
            const response = await apiService.getMe();
            setUser(response.data);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Redirect logic
        if (!loading) {
            const isAuthPage = pathname === '/login' || pathname === '/register';
            if (!user && !isAuthPage) {
                router.push('/login');
            } else if (user && isAuthPage) {
                router.push('/');
            }
        }
    }, [user, loading, pathname, router]);

    const login = async (credentials: any) => {
        try {
            const response = await apiService.login(credentials);
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            await fetchUser();
            router.push('/');
        } catch (error) {
            throw error;
        }
    };

    const register = async (data: any) => {
        try {
            await apiService.register(data);
            // Automatically login after registration
            await login({ username: data.username, password: data.password });
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                register,
                logout,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
