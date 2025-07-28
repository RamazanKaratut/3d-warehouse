// src/app/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Yeni ikon bileşenleri
const ThreeDIcon = () => (
  <svg className="w-16 h-16 text-blue-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.292v5.136a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>
);

const GlobeIcon = () => (
  <svg className="w-16 h-16 text-purple-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h7a2 2 0 002-2v-1a2 2 0 012-2h2.945M22 7v3h-3m3-3L19 4m0 0l-3 3m3-3H9m12 0a9 9 0 01-9 9m-6.256-.474L3.483 16.5A2 2 0 002 18.273V20a2 2 0 002 2h16a2 2 0 002-2v-1.727a2 2 0 00-1.483-1.777l-2.261-1.22M15 9V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4"></path>
  </svg>
);

const ChartIcon = () => (
  <svg className="w-16 h-16 text-teal-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2zm0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
  </svg>
);


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
          setMessage(data.message || 'Korumalı kaynağa erişim başarısız.');
          router.push('/');
        }
      } catch (error) {
        console.error('Korumalı kaynak isteği sırasında hata:', error);
        setMessage('Ağ hatası oluştu. Lütfen daha sonra tekrar deneyin.');
        router.push('/');
      }
    };

    fetchProtectedData();
  }, [router]);

  return (
    <div className="flex flex-col items-center bg-gray-100 p-6 md:p-10 w-full min-h-screen"> {/* min-h-screen ekledim ki sayfa içeriği az olsa bile tam yüksekliği kapsasın */}
      {/* Genel Bilgilendirme ve Ana Başlık Alanı */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 p-8 md:p-12 rounded-3xl shadow-xl w-full max-w-6xl text-center text-white mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 animate-fade-in-down">
          3 Boyutlu Depo Takip Sistemi
        </h1>
        <p className="text-lg md:text-xl font-light opacity-90 animate-fade-in">
          Envanterinizi hassasiyetle yönetin, depolama alanınızı optimize edin ve operasyonel verimliliği artırın.
        </p>
        {message && <p className="mt-4 text-white text-opacity-80 text-md animate-fade-in delay-200">{message}</p>}
      </div>

      {/* Ana Özellikler / Navigasyon Kartları */}
      <div className="w-full max-w-6xl flex flex-wrap justify-center gap-8 mb-10">

        {/* Depo Ekle Kartı */}
        <Link href="/pages/warehouses/add-warehouse" passHref>
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer flex flex-col items-center justify-center text-center h-full border border-blue-100 hover:border-blue-400 w-96">
            <GlobeIcon />
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">Yeni Depo Ekle</h3>
            <p className="text-gray-600">
              Harita üzerinde yeni depolama alanları tanımlayın ve anında sisteminize entegre edin.
            </p>
          </div>
        </Link>

        {/* Depolarım Kartı */}
        <Link href="/pages/warehouses/my-warehouses" passHref>
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer flex flex-col items-center justify-center text-center h-full border border-green-100 hover:border-green-400 w-96">
            <ChartIcon />
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">Depolarım</h3>
            <p className="text-gray-600">
              Mevcut tüm depolarınızın detaylı görünümüne erişin, kapasitelerini ve doluluk oranlarını takip edin.
            </p>
          </div>
        </Link>
      </div>

      {/* Ek Bilgilendirme Alanı (İsteğe Bağlı) */}
      <div className="w-full max-w-6xl text-center text-gray-600 mt-8 mb-4">
        <p className="text-md">
          Depo Yönetim Sistemi ile iş süreçlerinizi dijitalleştirin, hataları minimize edin ve operasyonel maliyetlerinizi düşürün. Her şey parmaklarınızın ucunda!
        </p>
      </div>

      {/* Footer veya telif hakkı bilgisi */}
      <footer className="w-full max-w-6xl text-center text-gray-400 text-sm mt-auto py-4 border-t border-gray-200">
        <p>&copy; {new Date().getFullYear()} Depo Takip Sistemi. Tüm Hakları Saklıdır.</p>
      </footer>
    </div>
  );
}