// src/app/contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import api from '@/app/utils/api'; // Axios instance with withCredentials: true

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
        '/', // Giriş sayfası
        '/pages/user/register',
        '/pages/user/reset-password',
        '/pages/user/forgot-password'
    ];

    const isPublicPath = publicPaths.includes(pathname);

    const checkAuthStatus = useCallback(async () => {
        setIsLoadingAuth(true);
        try {
            // Frontend'de localStorage'dan token okumaya ÇALIŞMAYIN.
            // Axios (api instance'ı) 'withCredentials: true' olduğu için
            // tarayıcı, backend'den gelen HTTP-Only çerezleri otomatik olarak gönderir.

            const response = await api.get('/auth/protected'); // Backend'e geçerli bir oturum olup olmadığını sorar
            
            // Eğer yanıt 200 OK ise, oturum geçerlidir.
            if (response.status === 200) {
                setIsLoggedIn(true);
                setUsername(response.data.username); // Backend'den gelen kullanıcı adını sakla
                
                // Eğer kullanıcı zaten giriş yapmışsa ve genel bir yoldaysa, dashboard'a yönlendir
                if (isPublicPath) {
                    router.replace('/pages/dashboard');
                }
            } else {
                // Backend 200 dışında bir status kodu döndürdüyse (örn. 401), oturum geçerli değil
                setIsLoggedIn(false);
                setUsername(null);
                // Korumalı bir yoldaysa, giriş sayfasına yönlendir
                if (!isPublicPath) {
                    router.replace('/');
                }
            }
        } catch (error: any) {
            // İstek sırasında bir hata oluştuysa (örn. ağ hatası, backend'den 401 yanıtı)
            // Axios 4xx/5xx hatalarında catch bloğuna düşer.
            console.error('Auth check error:', error);
            setIsLoggedIn(false);
            setUsername(null);
            
            // Tokenları localStorage'dan kaldırmanıza gerek yok, zaten orada yoklar
            // Eğer varsa (eski bir kalıntı), yine de temizlemek zarar vermez
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            
            // Korumalı bir yoldaysa, giriş sayfasına yönlendir
            if (!isPublicPath) {
                router.replace('/');
            }
        } finally {
            setIsLoadingAuth(false);
        }
    }, [router, pathname, isPublicPath]); // Bağımlılıkları güncelledik

    useEffect(() => {
        // Uygulama yüklendiğinde veya yol değiştiğinde kimlik doğrulama durumunu kontrol et
        // isPublicPath kontrolü, public yollarda gereksiz yönlendirmeyi engeller.
        checkAuthStatus();
    }, [checkAuthStatus]);


    const logout = useCallback(async () => {
        try {
            await api.post('/auth/logout', {}); // Backend'deki logout endpoint'i çerezleri temizleyecek
        } catch (error) {
            console.error('Logout isteği sırasında hata:', error);
        } finally {
            // Frontend tarafında localStorage'daki gereksiz tokenları temizle
            localStorage.removeItem('rememberedUsername'); // Bu hala kullanılabilir
            
            setIsLoggedIn(false);
            setUsername(null);
            router.replace('/'); // Kullanıcıyı giriş sayfasına yönlendir
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