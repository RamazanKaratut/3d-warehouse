// app/my-warehouses/page.tsx
'use client'; // Bu bir istemci bileşeni olduğu için gerekli

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // useRouter'ı import ettik

interface Warehouse {
  id: string; // Backend'den gelen ID string olabilir veya number olabilir, modelinize göre ayarlayın
  name: string;
  location: string;
  capacity: number;
  area_m2: number;
  description: string;
  type: string; // 'open' veya 'closed'
  height_m: number | null; // Kapalı depolarda null olabilir
  // Diğer alanlar (GeoJSON gibi) burada gösterilmeyebilir veya daha detaylı bir sayfada gösterilebilir
}

export default function MyWarehouses() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter(); // useRouter hook'unu başlattık

  const API_BASE_URL = 'http://localhost:5000'; // Backend temel URL
  const API_AUTH_URL = `${API_BASE_URL}/auth`; // Backend auth rotası
  const API_WAREHOUSE_LIST_URL = `${API_BASE_URL}/api/warehouses`; // Backend depoları listeleme rotası

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        setLoading(true);
        setError(null); // Yeni yüklemede hata durumunu sıfırla

        // --- ÖNCE OTURUM KONTROLÜ ---
        const authResponse = await fetch(`${API_AUTH_URL}/protected`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Çerezleri gönder
        });

        if (!authResponse.ok) {
          // Eğer token geçersizse veya yoksa, login sayfasına yönlendir
          console.log("Oturum geçerli değil, giriş sayfasına yönlendiriliyor.");
          router.push('/');
          return; // Yönlendirme yapıldığı için devam etme
        }

        // --- OTURUM GEÇERLİYSE DEPOLARI ÇEK ---
        const response = await fetch(API_WAREHOUSE_LIST_URL, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Çerezleri gönder (JWT token'ı için)
        });

        const data = await response.json();

        if (response.ok) {
          setWarehouses(data);
        } else {
          setError(data.message || 'Depolar yüklenirken bir hata oluştu.');
          console.error("Backend'den hata:", data.message);
        }
      } catch (err) {
        // Ağ hataları veya fetch hatası durumunda
        setError('Depolar yüklenirken bir ağ sorunu oluştu.');
        console.error('Depo çekme sırasında hata:', err);
        // Genellikle ağ hatasında da login sayfasına yönlendirme uygun olabilir
        // Ancak burada kullanıcıya bir hata mesajı gösterip tekrar denemesini isteyebiliriz
      } finally {
        setLoading(false);
      }
    };

    fetchWarehouses();
  }, [router, API_AUTH_URL, API_WAREHOUSE_LIST_URL]); // Bağımlılıkları ekledik

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Depolar Yükleniyor...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-red-600">
        <p className="text-xl font-semibold">Hata: {error}</p>
        <button
          onClick={() => window.location.reload()} // Sayfayı yenileyerek tekrar deneme imkanı sun
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  if (warehouses.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-gray-500">
        <p className="text-xl mb-4">Henüz eklenmiş bir depo bulunmamaktadır.</p>
        <p className="text-md">Yeni bir depo eklemek için "Depo Ekle" sayfasına gidebilirsiniz.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        <span role="img" aria-label="boxes">📦</span> Depolarım
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {warehouses.map((warehouse) => (
          <div key={warehouse.id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300 ease-in-out">
            <h2 className="text-xl font-semibold text-blue-700 mb-2">{warehouse.name}</h2>
            <p className="text-gray-600 mb-1"><span className="font-medium">Konum:</span> {warehouse.location}</p>
            <p className="text-gray-600 mb-1"><span className="font-medium">Kapasite:</span> {warehouse.capacity} ton</p>
            <p className="text-gray-600 mb-1"><span className="font-medium">Alan:</span> {warehouse.area_m2.toFixed(2)} m²</p>
            <p className="text-gray-600 mb-1"><span className="font-medium">Tip:</span> {warehouse.type === 'open' ? 'Açık Depo' : 'Kapalı Depo'}</p>
            {warehouse.type === 'closed' && warehouse.height_m !== null && (
              <p className="text-gray-600 mb-1"><span className="font-medium">Yükseklik:</span> {warehouse.height_m.toFixed(2)} metre</p>
            )}
            <p className="text-gray-500 text-sm mt-3 italic">{warehouse.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}