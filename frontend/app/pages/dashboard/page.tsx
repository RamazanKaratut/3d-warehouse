// src/app/pages/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Eğer kullanılıyorsa kalsın, kullanılmıyorsa kaldırılabilir

// Yeni oluşturduğumuz bileşenleri import ediyoruz
import CurrentWarehouses from '@/app/components/dashboard/CurrentWarehouses';
import AddWarehouse from '@/app/components/dashboard/AddWarehouse';

export default function DashboardPage() {
  const [message, setMessage] = useState<string>('');
  const router = useRouter();

  const API_URL = 'http://localhost:5000/auth'; // Backend adresiniz

  useEffect(() => {
    const fetchProtectedData = async () => {
      try {
        const response = await fetch(`${API_URL}/protected`, {
          method: 'GET',
          credentials: 'include', // Çerezleri göndermeyi unutmayın
        });

        const data = await response.json();

        if (response.ok) {
          setMessage(data.message);
        } else {
          setMessage(data.message || 'Veri çekilemedi.');
          if (response.status === 401) {
            // Yetkilendirme yoksa ana sayfaya (giriş) yönlendir
            setTimeout(() => router.push('/'), 1500);
          }
        }
      } catch (error) {
        console.error('Korumalı kaynak isteği sırasında hata:', error);
        setMessage('Ağ hatası oluştu. Lütfen daha sonra tekrar deneyin.');
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

      {/* Depo kartları */}
      <div className="w-full max-w-5xl flex flex-col gap-6">
        <CurrentWarehouses />
        <AddWarehouse />
      </div>
    </div>
  );
}