// src/app/register/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const [username, setUsername] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const router = useRouter();

    const API_URL = 'http://localhost:5000/auth';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);
                setTimeout(() => router.push('/'), 2000);
            } else {
                setMessage(data.message || 'Kayıt başarısız oldu.');
            }
        } catch (error) {
            console.error('Kayıt isteği sırasında hata:', error);
            setMessage('Ağ hatası oluştu. Lütfen daha sonra tekrar deneyin.');
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 p-4 sm:p-6 lg:p-8"
        >
            <div
                className="bg-white p-8 sm:p-10 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200"
            >
                <h2 className="text-4xl font-extrabold text-center mb-8 text-gray-900 leading-tight">
                    Kaydol
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="regUsername" className="block text-sm font-semibold text-gray-900 mb-1">
                            Kullanıcı Adı:
                        </label>
                        <input
                            type="text"
                            id="regUsername"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base transition-all duration-200 ease-in-out text-gray-900"
                        />
                    </div>
                    <div>
                        <label htmlFor="regEmail" className="block text-sm font-semibold text-gray-900 mb-1">
                            E-posta:
                        </label>
                        <input
                            type="email"
                            id="regEmail"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base transition-all duration-200 ease-in-out text-gray-900"
                        />
                    </div>
                    <div>
                        <label htmlFor="regPassword" className="block text-sm font-semibold text-gray-900 mb-1">
                            Şifre:
                        </label>
                        <input
                            type="password"
                            id="regPassword"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base transition-all duration-200 ease-in-out text-gray-900"
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 ease-in-out transform hover:-translate-y-0.5"
                        >
                            Kaydol
                        </button>
                    </div>
                </form>

                {message && (
                    <div
                        className={`mt-6 p-3 rounded-md text-center text-sm font-medium ${
                            message.includes('başarıyla kaydedildi') ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'
                        }`}
                    >
                        {message}
                    </div>
                )}

                <div className="mt-8 text-center">
                    <p className="text-base text-gray-900">
                        Zaten bir hesabınız var mı?{' '}
                        <Link href="/" className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors duration-200">
                            Giriş Yapın
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}