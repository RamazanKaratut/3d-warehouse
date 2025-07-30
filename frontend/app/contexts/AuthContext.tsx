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
        '/',
        '/pages/user/register',
        '/pages/user/reset-password',
        '/pages/user/forgot-password'
    ];

    // usePathname() bir string döndürdüğü için, direkt includes kullanabiliriz.
    const isPublicPath = publicPaths.includes(pathname);

    const checkAuthStatus = useCallback(async () => {
        setIsLoadingAuth(true); // Kimlik doğrulama kontrolü başladığında yükleme durumunu ayarla
        try {
            // Backend'e geçerli bir oturum olup olmadığını sorar.
            // Axios 'withCredentials: true' olduğu için tarayıcı HTTP-Only çerezleri otomatik gönderir.
            const response = await api.get('/auth/protected');

            // Eğer buraya gelirse (catch'e düşmezse), istek başarılıdır (200 OK).
            setIsLoggedIn(true);
            setUsername(response.data.username); // Backend'den gelen kullanıcı adını sakla
            console.log("Auth check successful, user logged in:", response.data.username); // Log için kullanıcı adı eklendi

            // Kullanıcı giriş yapmışsa ve genel bir yoldaysa, dashboard'a yönlendir
            if (isPublicPath) {
                router.replace('/pages/dashboard');
            }
        } catch (error: any) {
            if (error.response && error.response.status === 401) {
                console.warn('Auth check: User is not authenticated or session expired (401).'); // Artık bu mesajı görmelisiniz
            } else {
                console.error('Auth check error (unexpected):', error);
            }

            setIsLoggedIn(false);
            setUsername(null);

            if (!isPublicPath) { // Eğer şu anki sayfa korumalı bir sayfa ise
                router.replace('/'); // Giriş sayfasına yönlendir
            }
        } finally {
            setIsLoadingAuth(false); // Kimlik doğrulama kontrolü tamamlandığında yükleme durumunu bitir
        }
    }, [router, pathname, isPublicPath]); // Bağımlılıklar güncellendi

    useEffect(() => {
        // Uygulama yüklendiğinde veya yol değiştiğinde kimlik doğrulama durumunu kontrol et.
        // Public yollarda gereksiz yönlendirmeyi önlemek için 'isPublicPath' kullanılmaz,
        // çünkü checkAuthStatus zaten içeride yönlendirme mantığını yönetiyor.
        // Amaç, her yol değişiminde oturumun hala geçerli olup olmadığını kontrol etmektir.
        checkAuthStatus();
    }, [checkAuthStatus]); // `checkAuthStatus` useCallback olduğu için doğru bağımlılık

    const logout = useCallback(async () => {
        try {
            await api.post('/auth/logout', {}); // Backend'deki logout endpoint'i çerezleri temizleyecek
            console.log("Logout successful on backend."); // Backend başarılıysa logla
        } catch (error) {
            console.error('Logout isteği sırasında hata:', error);
            // Hata olsa bile frontend durumunu temizle ve yönlendir.
            // Kullanıcı deneyimi için önemli.
        } finally {
            setIsLoggedIn(false);
            setUsername(null);
            localStorage.removeItem('rememberedUsername');
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