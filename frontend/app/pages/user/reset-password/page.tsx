// src/app/pages/reset-password/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, Transition } from 'framer-motion';

export default function ResetPasswordPage() {
    const searchParams = useSearchParams();
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const router = useRouter();
    const [token, setToken] = useState<string | null>(null);

    const API_URL = 'http://localhost:5000/auth';

    useEffect(() => {
        const urlToken = searchParams.get('token');
        if (urlToken) {
            setToken(urlToken);
        } else {
            setMessage('Şifre sıfırlama tokenı bulunamadı veya geçersiz.');
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        if (!token) {
            setMessage('Geçersiz veya eksik token.');
            return;
        }

        if (password !== confirmPassword) {
            setMessage('Şifreler uyuşmuyor.');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, new_password: password }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);
                setTimeout(() => router.push('/'), 3000);
            } else {
                setMessage(data.message || 'Şifre sıfırlama başarısız oldu.');
            }
        } catch (error) {
            console.error('Şifre sıfırlama isteği sırasında hata:', error);
            setMessage('Ağ hatası oluştu. Lütfen daha sonra tekrar deneyin.');
        }
    };

    const pageVariants = {
        initial: { opacity: 0, y: -20 },
        in: { opacity: 1, y: 0 },
        out: { opacity: 0, y: 20 },
    };

    const pageTransition: Transition = {
        type: 'tween',
        ease: 'anticipate',
        duration: 0.5,
    };

    return (
        <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="min-h-screen flex items-center justify-center bg-gray-100"
        >
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Şifre Sıfırla</h2>
                {!token ? (
                    <p className="text-red-600 text-center mb-4">Şifre sıfırlama tokenı bulunamadı veya geçersiz.</p>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                Yeni Şifre:
                            </label>
                            <input
                                type="password"
                                id="newPassword"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                Yeni Şifre (Tekrar):
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Şifreyi Sıfırla
                            </button>
                        </div>
                    </form>
                )}

                {message && (
                    <p className={`mt-4 text-center ${message.includes('başarıyla sıfırlandı') ? 'text-green-600' : 'text-red-600'}`}>
                        {message}
                    </p>
                )}
            </div>
        </motion.div>
    );
}