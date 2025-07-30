// src/app/new-password/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function NewPasswordPage() {
    const [newPassword, setNewPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [token, setToken] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();

    const API_URL = 'http://localhost:5000/auth';

    useEffect(() => {
        const urlToken = searchParams.get('token');
        if (urlToken) {
            setToken(urlToken);
            setMessage('');
        } else {
            setMessage('Geçersiz veya eksik şifre sıfırlama linki.');
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        if (!token) {
            setMessage('Sıfırlama tokenı bulunamadı. Lütfen maildeki linki doğru kullandığınızdan emin olun.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage('Şifreler uyuşmuyor.');
            return;
        }

        if (newPassword.length < 6) {
            setMessage('Şifre en az 6 karakter olmalıdır.');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, new_password: newPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message || 'Şifreniz başarıyla sıfırlandı!');
                setTimeout(() => {
                    router.push('/');
                }, 3000);
            } else {
                setMessage(data.message || 'Şifre sıfırlama başarısız oldu. Lütfen tekrar deneyin.');
            }
        } catch (error) {
            console.error('Şifre sıfırlama isteği sırasında hata:', error);
            setMessage('Ağ hatası oluştu. Lütfen daha sonra tekrar deneyin.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 p-4 sm:p-6 lg:p-8">
            <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200">
                <h2 className="text-4xl font-extrabold text-center mb-8 text-gray-900 leading-tight">
                    Şifre Sıfırla
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="new-password" className="block text-sm font-semibold text-gray-700 mb-1">
                            Yeni Şifre:
                        </label>
                        <input
                            type="password"
                            id="new-password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base transition-all duration-200 ease-in-out"
                        />
                    </div>
                    <div>
                        <label htmlFor="confirm-password" className="block text-sm font-semibold text-gray-700 mb-1">
                            Yeni Şifre (Tekrar):
                        </label>
                        <input
                            type="password"
                            id="confirm-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base transition-all duration-200 ease-in-out"
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 ease-in-out transform hover:-translate-y-0.5"
                        >
                            Şifreyi Sıfırla
                        </button>
                    </div>
                </form>

                {message && (
                    <div
                        className={`mt-6 p-3 rounded-md text-center text-sm font-medium ${
                            message.includes('başarılı') ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'
                        }`}
                    >
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}