// src/app/contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import api from '@/app/utils/api';

interface AuthContextType {
    isLoggedIn: boolean;
    username: string | null;
    isLoadingAuth: boolean;
    checkAuthStatus: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [username, setUsername] = useState<string | null>(null);
    const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
    const router = useRouter();
    const pathname = usePathname();

    const publicPaths = [
        '/',
        '/pages/user/register',
        '/pages/user/reset-password',
        '/pages/user/forgot-password'
    ];

    const isPublicPath = publicPaths.includes(pathname);

    const checkAuthStatus = useCallback(async () => {
        setIsLoadingAuth(true);
        try {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                setIsLoggedIn(false);
                setUsername(null);
                if (!isPublicPath) {
                    router.replace('/');
                }
                return;
            }

            const response = await api.get('/auth/protected');
            if (response.status === 200) {
                setIsLoggedIn(true);
                setUsername(response.data.username);
                if (isPublicPath) {
                    router.replace('/pages/dashboard');
                }
            } else {
                setIsLoggedIn(false);
                setUsername(null);
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                if (!isPublicPath) {
                    router.replace('/');
                }
            }
        } catch (error: any) {
            console.error('Auth check error:', error);
            setIsLoggedIn(false);
            setUsername(null);
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            if (!isPublicPath) {
                router.replace('/');
            }
        } finally {
            setIsLoadingAuth(false);
        }
    }, [router, pathname, isPublicPath]);

    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);


    const logout = useCallback(async () => {
        try {
            await api.post('/auth/logout', {});
        } catch (error) {
            console.error('Logout isteği sırasında hata:', error);
        } finally {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('rememberedUsername');
            setIsLoggedIn(false);
            setUsername(null);
            router.replace('/');
        }
    }, [router]);

    if (isLoadingAuth) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ isLoggedIn, username, isLoadingAuth, checkAuthStatus, logout }}>
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