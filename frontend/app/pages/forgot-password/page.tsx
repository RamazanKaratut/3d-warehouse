// src/app/forgot-password/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, Transition } from 'framer-motion';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const API_URL = 'http://localhost:5000/auth'; // Backend adresiniz

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
      } else {
        setMessage(data.message || 'Şifre sıfırlama isteği başarısız oldu.');
      }
    } catch (error) {
      console.error('Şifre sıfırlama isteği sırasında hata:', error);
      setMessage('Ağ hatası oluştu. Lütfen daha sonra tekrar deneyin.');
    }
  };

  // Animasyon varyantları
  const pageVariants = {
    initial: { opacity: 0, scale: 0.9 },
    in: { opacity: 1, scale: 1 },
    out: { opacity: 0, scale: 0.9 },
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
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Şifremi Unuttum</h2>
        <p className="text-center text-gray-600 mb-5">
          Şifrenizi sıfırlamak için e-posta adresinizi girin.
        </p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              E-posta:
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Şifre Sıfırlama Linki Gönder
            </button>
          </div>
        </form>

        {message && (
          <p className={`mt-4 text-center ${message.includes('gönderildi') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Giriş sayfasına geri dön{' '}
            <Link href="/" className="font-medium text-blue-600 hover:text-blue-500">
              Giriş Yap
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
}