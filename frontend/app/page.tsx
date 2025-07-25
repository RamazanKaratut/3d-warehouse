// src/app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, Transition } from 'framer-motion';

export default function LoginPage() {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const router = useRouter();

  const API_URL = 'http://localhost:5000/auth'; // Backend adresiniz

  useEffect(() => {
    // "Beni Hatırla" bilgisi varsa localStorage'dan çek
    const storedUsername = localStorage.getItem('rememberedUsername');
    const storedPassword = localStorage.getItem('rememberedPassword'); // Güvenlik uyarısını unutmayın!
    if (storedUsername && storedPassword) {
      setUsername(storedUsername);
      setPassword(storedPassword);
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
        // "Beni Hatırla" seçiliyse bilgileri localStorage'a kaydet
        if (rememberMe) {
          localStorage.setItem('rememberedUsername', username);
          localStorage.setItem('rememberedPassword', password); // Güvenlik uyarısı!
        } else {
          // Seçili değilse veya giriş başarısız olursa temizle
          localStorage.removeItem('rememberedUsername');
          localStorage.removeItem('rememberedPassword');
        }
        router.push('/pages/dashboard'); // Doğru yönlendirme
      } else {
        setMessage(data.message || 'Giriş başarısız oldu.');
        // Giriş başarısız olursa "beni hatırla" bilgilerini temizle
        localStorage.removeItem('rememberedUsername');
        localStorage.removeItem('rememberedPassword');
      }
    } catch (error) {
      console.error('Giriş isteği sırasında hata:', error);
      setMessage('Ağ hatası oluştu. Lütfen daha sonra tekrar deneyin.');
      // Ağ hatasında da "beni hatırla" bilgilerini temizle
      localStorage.removeItem('rememberedUsername');
      localStorage.removeItem('rememberedPassword');
    }
  };

  // Animasyon varyantları
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
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
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Giriş Yap</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Kullanıcı Adı:
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Şifre:
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Beni Hatırla
              </label>
            </div>
            <div className="text-sm">
              <Link href="/pages/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                Şifremi Unuttum?
              </Link>
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Giriş Yap
            </button>
          </div>
        </form>

        {message && (
          <p className={`mt-4 text-center ${message.includes('başarılı') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Hesabınız yok mu?{' '}
            <Link href="/pages/register" className="font-medium text-blue-600 hover:text-blue-500">
              Kaydolun
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
}