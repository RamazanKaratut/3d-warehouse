// 'use client'; // Bu satır kalmalı

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/app/utils/api'; // Bu import kalmalı, çünkü Axios instance'ınızda withCredentials: true var
import { useAuth } from '@/app/contexts/AuthContext'; // Bu import kalmalı

export default function LoginPage() {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [rememberMe, setRememberMe] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('');
    const router = useRouter();
    const { isLoggedIn, isLoadingAuth, checkAuthStatus } = useAuth(); // useAuth hook'u kalmalı

    useEffect(() => {
        // isLoadingAuth tamamlandığında ve kullanıcı giriş yapmışsa, dashboard'a yönlendir.
        // Bu mantık doğru, çünkü checkAuthStatus zaten arka planda oturum durumunu kontrol ediyor.
        if (!isLoadingAuth && isLoggedIn) {
            router.replace('/pages/dashboard');
        }

        // 'Beni Hatırla' işlevselliği için kullanıcı adını localStorage'dan alma kısmı kalabilir.
        // Bu, kimlik doğrulama tokenları ile ilgili değildir, sadece kullanıcı deneyimi içindir.
        const storedUsername = localStorage.getItem('rememberedUsername');
        if (storedUsername) {
            setUsername(storedUsername);
            setRememberMe(true);
        }
    }, [isLoggedIn, isLoadingAuth, router]); // Bağımlılıklar doğru

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        try {
            // Giriş isteği api (Axios) üzerinden gönderilir.
            // Axios'taki `withCredentials: true` sayesinde
            // backend'den gelen HTTP-Only çerezler otomatik olarak işlenir.
            const response = await api.post('/auth/login', { username, password });
            const data = response.data; // Backend'den gelen 'message', 'username', 'user_id' gibi bilgiler

            setMessage(data.message); // Giriş başarılı mesajını göster

            // --- BURA ÖNEMLİ DEĞİŞİKLİK: localStorage.setItem satırlarını KALDIR ---
            // localStorage.setItem('access_token', data.access_token); // Bu satırı SİL
            // localStorage.setItem('refresh_token', data.refresh_token); // Bu satırı SİL

            // 'Beni Hatırla' mantığı kullanıcı adı için hala geçerli olabilir.
            if (rememberMe) {
                localStorage.setItem('rememberedUsername', username);
            } else {
                localStorage.removeItem('rememberedUsername');
            }

            // checkAuthStatus çağrısı kalmalı. Bu, AuthContext'in oturum durumunu günceller.
            // (Artık localStorage'dan token okumadığı, direkt backend'e sorduğu için.)
            await checkAuthStatus();

            // Başarılı girişten sonra kullanıcıyı dashboard'a yönlendir.
            router.replace('/pages/dashboard');
        } catch (error: any) {
            // Hata durumunda mesaj göster.
            if (error.response && error.response.data && error.response.data.message) {
                setMessage(error.response.data.message);
            } else {
                setMessage('Giriş başarısız oldu. Lütfen tekrar deneyin.');
            }
            console.log('Giriş isteği sırasında hata:', error);

            // --- BURA ÖNEMLİ DEĞİŞİKLİK: localStorage.removeItem satırlarını KALDIR ---
            // localStorage.removeItem('access_token'); // Bu satırı SİL
            // localStorage.removeItem('refresh_token'); // Bu satırı SİL

            // Sadece 'Beni Hatırla' için kaydedilen kullanıcı adını hata durumunda da silebiliriz.
            localStorage.removeItem('rememberedUsername');
        }
    };

    // Yükleme durumu veya zaten giriş yapılmışsa spinner göster. Bu kısım kalmalı.
    if (isLoadingAuth || (isLoggedIn && !isLoadingAuth)) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Giriş formu ve diğer UI elemanları kalmalı.
    return (
        <div
            className="min-h-screen flex flex-col lg:flex-row items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 p-4 sm:p-6 lg:p-8"
        >
            <div className="lg:w-1/2 w-full lg:pr-12 text-center lg:text-left mb-12 lg:mb-0">
                <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6 animate-fade-in-down">
                    Akyapı 3D Depo Yönetimi
                    <br />
                    Sistemi'ne Hoş Geldiniz
                </h1>
                <p className="text-lg text-gray-700 leading-relaxed mb-8 animate-fade-in-up">
                    Depo süreçlerinizi optimize edin, verimliliği artırın ve 3D görselleştirme ile stoklarınızı
                    gerçek zamanlı takip edin. İşletmenizin geleceğini dijitalleştirmeye başlayın!
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 animate-fade-in-up delay-200">
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                        <div className="flex items-center mb-4">
                            <svg className="w-8 h-8 text-indigo-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10v11h18V10M3 10L12 3l9 7M6 10v4m6-4v4m6-4v4"></path></svg>
                            <h3 className="text-xl font-semibold text-gray-900">3D Depo Görselleştirme</h3>
                        </div>
                        <p className="text-gray-600 text-sm">
                            Deponuzu sanal ortamda 3 boyutlu görün, ürün yerleşimlerini optimize edin ve hataları minimize edin.
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                        <div className="flex items-center mb-4">
                            <svg className="w-8 h-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            <h3 className="text-xl font-semibold text-gray-900">Gerçek Zamanlı Takip</h3>
                        </div>
                        <p className="text-gray-600 text-sm">
                            Stok seviyelerini, sevkiyatları ve tüm depo hareketlerini anlık olarak takip edin, kararlarınızı hızlandırın.
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                        <div className="flex items-center mb-4">
                            <svg className="w-8 h-8 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"></path></svg>
                            <h3 className="text-xl font-semibold text-gray-900">Verimlilik Artışı</h3>
                        </div>
                        <p className="text-gray-600 text-sm">
                            Otomatik rota optimizasyonu ve akıllı depolama önerileri ile operasyonel verimliliğinizi maksimize edin.
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                        <div className="flex items-center mb-4">
                            <svg className="w-8 h-8 text-orange-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c1.333-1.333 2.667-1.333 4 0C17.333 9.333 17.333 10.667 16 12s-2.667 1.333-4 0c-1.333-1.333-1.333-2.667 0-4zm-4 4a4 4 0 100-8 4 4 0 000 8z"></path></svg>
                            <h3 className="text-xl font-semibold text-gray-900">Kapsamlı Raporlama</h3>
                        </div>
                        <p className="text-gray-600 text-sm">
                            Detaylı analizler ve özelleştirilebilir raporlarla iş kararlarınızı verilere dayalı alın.
                        </p>
                    </div>
                </div>
            </div>

            <div className="lg:w-1/2 w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl shadow-2xl border border-gray-200 animate-fade-in-right">
                <h2 className="text-4xl font-extrabold text-center mb-8 text-gray-900 leading-tight">
                    Giriş Yap
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-1">
                            Kullanıcı Adı:
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base transition-all duration-200 ease-in-out"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
                            Şifre:
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base transition-all duration-200 ease-in-out"
                        />
                    </div>
                    <div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                    Beni Hatırla
                                </label>
                            </div>
                            <div className="text-sm">
                                <Link href="/pages/user/forgot-password" className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors duration-200">
                                    Şifremi Unuttum?
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 ease-in-out transform hover:-translate-y-0.5"
                        >
                            Giriş Yap
                        </button>
                    </div>
                </form>

                {message && (
                    <div
                        className={`mt-6 p-3 rounded-md text-center text-sm font-medium ${message.includes('başarılı') ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'
                            }`}
                    >
                        {message}
                    </div>
                )}

                <div className="mt-8 text-center">
                    <p className="text-base text-gray-700">
                        Hesabınız yok mu?{' '}
                        <Link href="/pages/user/register" className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors duration-200">
                            Kaydolun
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}