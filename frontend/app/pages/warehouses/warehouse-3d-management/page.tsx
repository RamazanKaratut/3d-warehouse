// src/app/dashboard/warehouse-3d-management/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function WarehouseRegistrationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL'den gelen warehouseId'yi alıyoruz, belki bir üst depo ID'si olabilir
  // veya sadece sayfa yüklemesi için bir referans olabilir.
  // Bu sayfada 3D modelleme olmayacağı için direkt depo kaydına odaklanacağız.
  const [parentWarehouseId, setParentWarehouseId] = useState<string | null>(null);

  // Form için state'ler
  const [depoAdi, setDepoAdi] = useState<string>('');
  const [depoKonumu, setDepoKonumu] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Opsiyonel: Depo boyutları gibi ek alanlar ekleyebiliriz
  const [genislik, setGenislik] = useState<string>(''); // Metre cinsinden
  const [derinlik, setDerinlik] = useState<string>(''); // Metre cinsinden
  const [yukseklik, setYukseklik] = useState<string>(''); // Metre cinsinden

  // Backend API adresi (örnek olarak)
  const API_URL = 'http://localhost:5000/api/warehouses'; // Kendi API adresinizle değiştirin

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setParentWarehouseId(id);
      // Eğer bu sayfa belirli bir ana depo altına yeni depo kaydediyorsa,
      // bu ID'yi kullanabiliriz. Şu an sadece gösterim amaçlı.
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    // Form validasyonu
    if (!depoAdi.trim() || !depoKonumu.trim()) {
      setMessage('Lütfen depo adı ve konumu alanlarını doldurun.');
      setLoading(false);
      return;
    }

    // Boyutlar için sayısal kontrol
    const parsedGenislik = parseFloat(genislik);
    const parsedDerinlik = parseFloat(derinlik);
    const parsedYukseklik = parseFloat(yukseklik);

    if (genislik && (isNaN(parsedGenislik) || parsedGenislik <= 0)) {
      setMessage('Genişlik geçerli bir sayı olmalıdır.');
      setLoading(false);
      return;
    }
    if (derinlik && (isNaN(parsedDerinlik) || parsedDerinlik <= 0)) {
      setMessage('Derinlik geçerli bir sayı olmalıdır.');
      setLoading(false);
      return;
    }
    if (yukseklik && (isNaN(parsedYukseklik) || parsedYukseklik <= 0)) {
      setMessage('Yükseklik geçerli bir sayı olmalıdır.');
      setLoading(false);
      return;
    }


    try {
      // Backend'e gönderilecek veri objesi
      const depoData = {
        name: depoAdi,
        location: depoKonumu,
        parentWarehouseId: parentWarehouseId, // Eğer varsa, üst depo ID'si
        dimensions: {
          width: parsedGenislik || null,
          depth: parsedDerinlik || null,
          height: parsedYukseklik || null,
        },
        // İhtiyaç duyabileceğiniz diğer veriler
        // type: 'ana_depo', // Veya 'alt_depo', 'alan'
        // capacity: '1000m3',
      };

      console.log('Depo kaydı gönderiliyor:', depoData);

      // Backend API çağrısı
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${yourAuthToken}`, // Eğer kimlik doğrulama gerekiyorsa
        },
        body: JSON.stringify(depoData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Depo "${depoAdi}" başarıyla kaydedildi: ${data.message || ''}`);
        // Formu temizle
        setDepoAdi('');
        setDepoKonumu('');
        setGenislik('');
        setDerinlik('');
        setYukseklik('');
        // Belki kullanıcıyı başka bir sayfaya yönlendirebiliriz
        // router.push('/dashboard/warehouses');
      } else {
        setMessage(data.message || 'Depo kaydı başarısız oldu.');
      }
    } catch (error) {
      console.error('Depo kaydı sırasında hata:', error);
      setMessage('Ağ hatası oluştu veya sunucuya bağlanılamadı. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 p-8">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md text-center border border-gray-200">
        <h2 className="text-4xl font-extrabold mb-8 text-gray-900 leading-tight">
          Yeni Depo Kaydı
        </h2>

        {parentWarehouseId && (
          <p className="text-lg text-gray-700 mb-6">
            <strong className="text-indigo-600">Üst Depo ID:</strong> {parentWarehouseId}
            <br />
            (Bu depo altına kayıt yapılıyor olabilir.)
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="depoAdi" className="block text-sm font-semibold text-gray-700 mb-1 text-left">
              Depo Adı:
            </label>
            <input
              type="text"
              id="depoAdi"
              value={depoAdi}
              onChange={(e) => setDepoAdi(e.target.value)}
              placeholder="Örn: Kayseri Merkez Depo"
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base transition-all duration-200 ease-in-out"
            />
          </div>

          <div>
            <label htmlFor="depoKonumu" className="block text-sm font-semibold text-gray-700 mb-1 text-left">
              Depo Konumu:
            </label>
            <input
              type="text"
              id="depoKonumu"
              value={depoKonumu}
              onChange={(e) => setDepoKonumu(e.target.value)}
              placeholder="Örn: Kayseri Organize Sanayi"
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base transition-all duration-200 ease-in-out"
            />
          </div>

          {/* Opsiyonel: Boyutlar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="genislik" className="block text-sm font-semibold text-gray-700 mb-1 text-left">
                Genişlik (m):
              </label>
              <input
                type="number"
                id="genislik"
                value={genislik}
                onChange={(e) => setGenislik(e.target.value)}
                placeholder="Örn: 10"
                step="0.01"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base transition-all duration-200 ease-in-out"
              />
            </div>
            <div>
              <label htmlFor="derinlik" className="block text-sm font-semibold text-gray-700 mb-1 text-left">
                Derinlik (m):
              </label>
              <input
                type="number"
                id="derinlik"
                value={derinlik}
                onChange={(e) => setDerinlik(e.target.value)}
                placeholder="Örn: 20"
                step="0.01"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base transition-all duration-200 ease-in-out"
              />
            </div>
            <div>
              <label htmlFor="yukseklik" className="block text-sm font-semibold text-gray-700 mb-1 text-left">
                Yükseklik (m):
              </label>
              <input
                type="number"
                id="yukseklik"
                value={yukseklik}
                onChange={(e) => setYukseklik(e.target.value)}
                placeholder="Örn: 5"
                step="0.01"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base transition-all duration-200 ease-in-out"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-bold text-white bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Depoyu Kaydet'
              )}
            </button>
          </div>
        </form>

        {message && (
          <div className={`mt-6 p-4 rounded-md text-center text-sm font-medium ${
            message.includes('başarıyla kaydedildi') ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'
          }`}>
            {message}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            href="/dashboard"
            className="inline-block py-2 px-6 border border-transparent rounded-md shadow-sm text-base font-medium text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
          >
            Dashboard'a Geri Dön
          </Link>
        </div>
      </div>
    </div>
  );
}