// src/app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// Framer Motion artık import edilmiyor

export default function LoginPage() {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const router = useRouter();

  const API_URL = 'http://localhost:5000/auth'; // Backend adresiniz

  useEffect(() => {
    const storedUsername = localStorage.getItem('rememberedUsername');
    if (storedUsername) {
      setUsername(storedUsername);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        if (rememberMe) {
          localStorage.setItem('rememberedUsername', username);
        } else {
          localStorage.removeItem('rememberedUsername');
        }
        router.push('/pages/dashboard');
      } else {
        setMessage(data.message || 'Giriş başarısız oldu.');
        localStorage.removeItem('rememberedUsername');
      }
    } catch (error) {
      console.error('Giriş isteği sırasında hata:', error);
      setMessage('Ağ hatası oluştu. Lütfen daha sonra tekrar deneyin.');
      localStorage.removeItem('rememberedUsername');
    }
  };

  return (
    // motion.div yerine normal div kullanıldı
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 p-4 sm:p-6 lg:p-8"
    >
      {/* motion.div yerine normal div kullanıldı */}
      <div
        className="bg-white p-8 sm:p-10 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200"
      >
        <h2 className="text-4xl font-extrabold text-center mb-8 text-gray-900 leading-tight">
          Giriş Yap
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* motion.div'ler kaldırıldı */}
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
                <Link href="/pages/forgot-password" className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors duration-200">
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
          // motion.div yerine normal div kullanıldı
          <div
            className={`mt-6 p-3 rounded-md text-center text-sm font-medium ${
              message.includes('başarılı') ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'
            }`}
          >
            {message}
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-base text-gray-700">
            Hesabınız yok mu?{' '}
            <Link href="/pages/register" className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors duration-200">
              Kaydolun
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}