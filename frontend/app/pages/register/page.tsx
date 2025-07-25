// src/app/register/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, Transition } from 'framer-motion';

export default function RegisterPage() {
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const router = useRouter();

  const API_URL = 'http://localhost:5000/auth'; // Backend adresiniz

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
        setTimeout(() => router.push('/'), 2000); // Başarılı kayıttan sonra ana sayfaya (giriş) yönlendir
      } else {
        setMessage(data.message || 'Kayıt başarısız oldu.');
      }
    } catch (error) {
      console.error('Kayıt isteği sırasında hata:', error);
      setMessage('Ağ hatası oluştu. Lütfen daha sonra tekrar deneyin.');
    }
  };

  // Animasyon varyantları
  const pageVariants = {
    initial: { opacity: 0, x: -20 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: 20 },
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
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Kaydol</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="regUsername" className="block text-sm font-medium text-gray-700 mb-1">
              Kullanıcı Adı:
            </label>
            <input
              type="text"
              id="regUsername"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="regEmail" className="block text-sm font-medium text-gray-700 mb-1">
              E-posta:
            </label>
            <input
              type="email"
              id="regEmail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="regPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Şifre:
            </label>
            <input
              type="password"
              id="regPassword"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Kaydol
            </button>
          </div>
        </form>

        {message && (
          <p className={`mt-4 text-center ${message.includes('başarıyla kaydedildi') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Zaten bir hesabınız var mı?{' '}
            <Link href="/" className="font-medium text-blue-600 hover:text-blue-500">
              Giriş Yapın
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
}