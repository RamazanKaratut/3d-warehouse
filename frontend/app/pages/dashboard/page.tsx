// src/app/pages/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const [message, setMessage] = useState<string>('');
  const router = useRouter();

  const API_URL = 'http://localhost:5000/auth'; // Backend adresiniz

  useEffect(() => {
    const fetchProtectedData = async () => {
      try {
        const response = await fetch(`${API_URL}/protected`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        const data = await response.json();

        if (response.ok) {
          setMessage(data.message);
        } else {
          // Token geçersizse veya süresi dolduysa login sayfasına yönlendir
          setMessage(data.message || 'Korumalı kaynağa erişim başarısız.');
          router.push('/'); // <-- BURADA LOGIN SAYFASINA YÖNLENDİRME YAPIYORSUNUZ
        }
      } catch (error) {
        console.error('Korumalı kaynak isteği sırasında hata:', error);
        setMessage('Ağ hatası oluştu. Lütfen daha sonra tekrar deneyin.');
        router.push('/'); // <-- BURADA DA YÖNLENDİRME YAPIYORSUNUZ
      }
    };

    fetchProtectedData();
  }, [router]);

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        // Çıkış yapıldığında "beni hatırla" bilgilerini temizle
        localStorage.removeItem('rememberedUsername');
        localStorage.removeItem('rememberedPassword');
        setTimeout(() => router.push('/'), 1000); // Çıkış yaptıktan sonra ana sayfaya (giriş) yönlendir
      } else {
        setMessage(data.message || 'Çıkış başarısız oldu.');
      }
    } catch (error) {
      console.error('Çıkış isteği sırasında hata:', error);
      setMessage('Ağ hatası oluştu.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-6 md:p-10">
      {/* Başlık ve çıkış butonu */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg w-full max-w-5xl text-center mb-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900">Yönetim Paneli</h2>
        {message && <p className="text-gray-700 mb-4">{message}</p>}
        <button
          onClick={handleLogout}
          className="py-2 px-5 rounded-xl text-white bg-red-600 hover:bg-red-700 transition duration-200 text-base md:text-lg"
        >
          Çıkış Yap
        </button>
      </div>

      {/* Yeni navigasyon kartları */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {/* Depo Ekle Kartı */}
        <Link href="/pages/add-warehouse" passHref>
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out cursor-pointer flex flex-col items-center justify-center text-center h-48 border border-blue-200 hover:border-blue-400">
            <span className="text-6xl mb-4" role="img" aria-label="add warehouse">➕📦</span>
            <h3 className="text-2xl font-semibold text-gray-800">Yeni Depo Ekle</h3>
            <p className="text-gray-500 mt-2">Harita üzerinde alan belirleyerek yeni bir depo kaydedin.</p>
          </div>
        </Link>

        {/* Depolarım Kartı */}
        <Link href="/pages/my-warehouses" passHref>
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out cursor-pointer flex flex-col items-center justify-center text-center h-48 border border-green-200 hover:border-green-400">
            <span className="text-6xl mb-4" role="img" aria-label="my warehouses">📊📦</span>
            <h3 className="text-2xl font-semibold text-gray-800">Depolarım</h3>
            <p className="text-gray-500 mt-2">Tüm mevcut depolarınızı görüntüleyin ve yönetin.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}