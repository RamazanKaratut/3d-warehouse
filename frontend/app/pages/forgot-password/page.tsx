// src/app/forgot-password/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
// Framer Motion artık import edilmiyor

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

  return (
    // motion.div yerine normal div kullanıldı
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 p-4 sm:p-6 lg:p-8"
    >
      {/* motion.div yerine normal div kullanıldı */}
      <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200">
        <h2 className="text-4xl font-extrabold text-center mb-8 text-gray-900 leading-tight">
          Şifremi Unuttum
        </h2>
        <p className="text-center text-gray-700 mb-6 text-base"> {/* Stil güncellendi */}
          Şifrenizi sıfırlamak için e-posta adresinizi girin.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6"> {/* Boşluk artırıldı */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-1">
              E-posta:
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              // Stil güncellendi ve text-gray-900 eklendi
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base transition-all duration-200 ease-in-out text-gray-900"
            />
          </div>
          <div>
            <button
              type="submit"
              // Stil güncellendi (gradient, shadow, hover efekti)
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-300 ease-in-out transform hover:-translate-y-0.5"
            >
              Şifre Sıfırlama Linki Gönder
            </button>
          </div>
        </form>

        {message && (
          // motion.div yerine normal div kullanıldı, stil güncellendi
          <div
            className={`mt-6 p-3 rounded-md text-center text-sm font-medium ${message.includes('gönderildi') ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'
              }`}
          >
            {message}
          </div>
        )}

        <div className="mt-8 text-center"> {/* Boşluk artırıldı */}
          <p className="text-base text-gray-700"> {/* Stil güncellendi */}
            Giriş sayfasına geri dön{' '}
            <Link href="/" className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors duration-200">
              Giriş Yap
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}