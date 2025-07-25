// app/add-warehouse/page.tsx
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import area from '@turf/area'; // @turf/area kütüphanesini import ettiğinizden emin olun
import { useRouter } from 'next/navigation';

// DynamicMap bileşenini sadece istemci tarafında yüklüyoruz (SSR kapalı)
const DynamicMap = dynamic(() => import('../../components/map/DynamicMap'), {
  ssr: false, // Sunucu tarafı renderlamayı kapat
  loading: () => ( // Harita yüklenirken gösterilecek içerik
    <div className="flex justify-center items-center h-full text-gray-500">
      Harita Yükleniyor...
    </div>
  ),
});

export default function AddWarehouse() {
  // Form durumları
  const [warehouseName, setWarehouseName] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('');
  const [description, setDescription] = useState('');

  // Yükleme ve mesaj durumları
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Harita çizimi ile ilgili durumlar
  const [drawnAreaGeoJSON, setDrawnAreaGeoJSON] = useState<any | null>(null);
  const [calculatedAreaM2, setCalculatedAreaM2] = useState<number | null>(null);

  // Ekleme yöntemi (harita veya manuel) ve manuel giriş durumları
  const [addMethod, setAddMethod] = useState<'map' | 'manual'>('map');
  const [warehouseWidth, setWarehouseWidth] = useState('');
  const [warehouseLength, setWarehouseLength] = useState('');
  const [warehouseType, setWarehouseType] = useState<'open' | 'closed' | ''>('');
  const [warehouseHeight, setWarehouseHeight] = useState('');

  const router = useRouter();

  const API_BASE_URL = 'http://localhost:5000'; // Backend temel URL
  const API_AUTH_URL = `${API_BASE_URL}/auth`; // Backend auth rotası
  const API_WAREHOUSE_URL = `${API_BASE_URL}/api/warehouses`; // Yeni depo ekleme rotası (Backend'deki gerçek API endpoint'i)

  // Sayfa yüklendiğinde oturum kontrolünü yap
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_AUTH_URL}/protected`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Çerezleri gönder
        });

        if (!response.ok) {
          console.log("Oturum geçerli değil, giriş sayfasına yönlendiriliyor.");
          router.push('/');
        }
      } catch (error) {
        console.error('Yetkilendirme kontrolü sırasında hata:', error);
        router.push('/');
      }
    };

    checkAuth();
  }, [router, API_AUTH_URL]);

  // Harita üzerinde alan çizildiğinde çalışacak callback
  const handleMapDrawn = useCallback((geoJsonData: any) => {
    setDrawnAreaGeoJSON(geoJsonData);
    const calculated = area(geoJsonData); // turf.js ile alanı hesapla
    setCalculatedAreaM2(calculated);
    console.log("Çizilen GeoJSON:", geoJsonData); // Debugging için
    console.log("Çizilen alan (m²):", calculated); // Debugging için
  }, []);

  // Manuel olarak girilen genişlik ve uzunluğa göre alanı hesapla
  const calculateManualArea = useCallback(() => {
    const width = parseFloat(warehouseWidth);
    const length = parseFloat(warehouseLength);
    if (!isNaN(width) && !isNaN(length) && width > 0 && length > 0) {
      setCalculatedAreaM2(width * length);
    } else {
      setCalculatedAreaM2(null);
    }
  }, [warehouseWidth, warehouseLength]);

  React.useEffect(() => {
    if (addMethod === 'manual') {
      calculateManualArea();
    }
  }, [addMethod, warehouseWidth, warehouseLength, calculateManualArea]);

  // Form gönderme işlemi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Varsayılan form gönderme davranışını engelle
    setLoading(true);
    setMessage('');

    let finalAreaM2: number | null = null;
    let geoJsonToSend: any | null = null;
    let heightToSend: number | null = null;

    // Alan hesaplama yöntemine göre gerekli kontroller
    if (addMethod === 'map') {
      if (!drawnAreaGeoJSON || calculatedAreaM2 === null) {
        setMessage('Lütfen harita üzerinde bir depo alanı çizin.');
        setLoading(false);
        return;
      }
      finalAreaM2 = parseFloat(calculatedAreaM2.toFixed(2)); // Alanı virgülden sonra 2 basamağa yuvarla
      geoJsonToSend = drawnAreaGeoJSON;
    } else { // addMethod === 'manual'
      if (!warehouseWidth || !warehouseLength || calculatedAreaM2 === null) {
        setMessage('Lütfen depo genişliği ve uzunluğunu girin.');
        setLoading(false);
        return;
      }
      finalAreaM2 = parseFloat(calculatedAreaM2.toFixed(2)); // Alanı virgülden sonra 2 basamağa yuvarla
    }

    // Depo tipi kontrolü
    if (!warehouseType) {
      setMessage('Lütfen deponun açık mı kapalı mı olduğunu seçin.');
      setLoading(false);
      return;
    }

    // Kapalı depo ise yükseklik kontrolü
    if (warehouseType === 'closed') {
      const height = parseFloat(warehouseHeight);
      if (isNaN(height) || height <= 0) {
        setMessage('Kapalı depolar için geçerli bir yükseklik girin.');
        setLoading(false);
        return;
      }
      heightToSend = parseFloat(height.toFixed(2)); // Yüksekliği virgülden sonra 2 basamağa yuvarla
    }

    // Gönderilecek depo verileri nesnesi
    const newWarehouse = {
      name: warehouseName,
      location: location,
      capacity: parseInt(capacity, 10), // Kapasiteyi sayıya çevir
      description: description,
      area_m2: finalAreaM2,
      geo_json: geoJsonToSend, // Harita üzerinden gelirse GeoJSON verisi
      type: warehouseType,
      height_m: heightToSend, // Kapalı depo ise yükseklik verisi
    };

    try {
      // Backend'e POST isteği yap
      const response = await fetch(API_WAREHOUSE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // JWT token'ı için çerezleri gönder
        body: JSON.stringify(newWarehouse),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('🎉 Depo başarıyla eklendi!');
        // Formu temizle
        setWarehouseName('');
        setLocation('');
        setCapacity('');
        setDescription('');
        setDrawnAreaGeoJSON(null);
        setCalculatedAreaM2(null);
        setWarehouseWidth('');
        setWarehouseLength('');
        setWarehouseType('');
        setWarehouseHeight('');
        // Depo eklendikten sonra depolarım sayfasına yönlendirme yapabiliriz
        router.push('/my-warehouses');
      } else {
        // Backend'den gelen hata mesajını göster
        setMessage(data.message || 'Depo eklenirken bir hata oluştu.');
        console.error("Backend'den hata:", data.message);
      }
    } catch (error) {
      console.error('Depo eklerken ağ hatası oluştu:', error);
      setMessage('Depo eklenirken bir ağ sorunu oluştu. Lütfen internet bağlantınızı kontrol edin.');
    } finally {
      setLoading(false); // Yükleme durumunu kapat
    }
  };

  return (
    <div className="flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8 w-full">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        <span role="img" aria-label="warehouse">📦</span> Yeni Depo Ekle
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-screen-5xl">
        {/* Sol Taraftaki Form Alanı */}
        <div className="flex flex-col lg:col-span-1 items-center">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200 mb-8 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Depo Bilgileri</h2>

            {/* Ekleme Yöntemi Seçimi (Radio butonları) */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Depo Alanı Ekleme Yöntemi:</label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-blue-600"
                    name="addMethod"
                    value="map"
                    checked={addMethod === 'map'}
                    onChange={() => setAddMethod('map')}
                  />
                  <span className="ml-2 text-gray-700">Harita Üzerinden Seçim</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-blue-600"
                    name="addMethod"
                    value="manual"
                    checked={addMethod === 'manual'}
                    onChange={() => {
                      setAddMethod('manual');
                      setDrawnAreaGeoJSON(null); // Harita seçimini sıfırla
                    }}
                  />
                  <span className="ml-2 text-gray-700">Manuel Kare Girişi</span>
                </label>
              </div>
            </div>

            {/* Depo Bilgileri Giriş Alanları - Hepsi alt alta gelecek şekilde ayarlandı */}
            <div className="grid grid-cols-1 gap-3 mb-4">
              <div>
                <label htmlFor="warehouseName" className="block text-sm font-medium text-gray-700">Depo Adı</label>
                <input
                  type="text"
                  id="warehouseName"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-2 py-1.5 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  value={warehouseName}
                  onChange={(e) => setWarehouseName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">Konum</label>
                <input
                  type="text"
                  id="location"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-2 py-1.5 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">Kapasite (ton)</label>
                <input
                  type="number"
                  id="capacity"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-2 py-1.5 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  required
                />
              </div>

              {/* Depo Tipi Seçimi */}
              <div>
                <label htmlFor="warehouseType" className="block text-sm font-medium text-gray-700">Depo Tipi</label>
                <select
                  id="warehouseType"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-2 py-1.5 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
                  value={warehouseType}
                  onChange={(e) => setWarehouseType(e.target.value as 'open' | 'closed' | '')}
                  required
                >
                  <option value="">Seçiniz</option>
                  <option value="open">Açık Depo</option>
                  <option value="closed">Kapalı Depo</option>
                </select>
              </div>

              {/* Depo Yüksekliği (Sadece Kapalı Depo ise göster) */}
              {warehouseType === 'closed' && (
                <div>
                  <label htmlFor="warehouseHeight" className="block text-sm font-medium text-gray-700">Depo Yüksekliği (metre)</label>
                  <input
                    type="number"
                    id="warehouseHeight"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-2 py-1.5 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    value={warehouseHeight}
                    onChange={(e) => setWarehouseHeight(e.target.value)}
                    required={warehouseType === 'closed'}
                  />
                </div>
              )}

              {/* Açıklama alanı (artık col-span-1) */}
              <div className="col-span-1">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Açıklama</label>
                <textarea
                  id="description"
                  rows={2}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-2 py-1.5 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>

              {/* Manuel Giriş Alanları (Sadece 'manual' ise göster) */}
              {addMethod === 'manual' && (
                <>
                  <div>
                    <label htmlFor="warehouseWidth" className="block text-sm font-medium text-gray-700">Genişlik (metre)</label>
                    <input
                      type="number"
                      id="warehouseWidth"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-2 py-1.5 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      value={warehouseWidth}
                      onChange={(e) => setWarehouseWidth(e.target.value)}
                      required={addMethod === 'manual'}
                    />
                  </div>
                  <div>
                    <label htmlFor="warehouseLength" className="block text-sm font-medium text-gray-700">Uzunluk (metre)</label>
                    <input
                      type="number"
                      id="warehouseLength"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-2 py-1.5 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      value={warehouseLength}
                      onChange={(e) => setWarehouseLength(e.target.value)}
                      required={addMethod === 'manual'}
                    />
                  </div>
                </>
              )}

              {/* Hesaplanan Alan Gösterimi (artık col-span-1) */}
              {calculatedAreaM2 !== null && (
                <div className="col-span-1 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-gray-700"><strong>✅ Hesaplanan Alan:</strong></p>
                  <p className="text-sm font-semibold text-blue-800">{calculatedAreaM2.toFixed(2)} m²</p>
                </div>
              )}

              {/* Gönder Butonu (artık col-span-1) */}
              <div className="col-span-1">
                <button
                  type="submit"
                  disabled={loading || (addMethod === 'map' && !drawnAreaGeoJSON) || (addMethod === 'manual' && (!warehouseWidth || !warehouseLength)) || !warehouseType || (warehouseType === 'closed' && !warehouseHeight)}
                  className="w-full bg-blue-600 text-white font-medium py-2 rounded-xl hover:bg-blue-700 transition duration-300 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-base"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      💾 Depoyu Kaydet
                    </>
                  )}
                </button>
              </div>
            </div> {/* Depo Bilgileri Grid sonu */}

            {/* Mesaj gösterimi (başarılı/hata) */}
            {message && (
              <p className={`text-center text-sm mt-3 p-2 rounded-lg ${message.includes('başarıyla') ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'
                }`}>
                {message}
              </p>
            )}
          </form>
        </div> {/* Sol taraftaki form alanının bitişi */}

        {/* Sağ Taraftaki Harita veya Manuel Simülasyon Alanı */}
        <div className="flex flex-col items-center justify-center lg:col-span-2 min-h-[75vh]">
          {addMethod === 'map' ? (
            <div className="w-full rounded-xl overflow-hidden border border-gray-200 h-full shadow-inner">
              <DynamicMap onAreaDrawn={handleMapDrawn} />
            </div>
          ) : (
            <div className="w-full h-full bg-gray-50 rounded-xl shadow-inner border border-gray-200 flex flex-col justify-center items-center p-4 text-gray-600">
              <span className="text-8xl mb-4" role="img" aria-label="area drawing">📐</span>
              <p className="text-lg font-semibold text-center">Manuel Alan Girişi Aktif</p>
              <p className="text-sm text-center mt-2">Genişlik ve Uzunluk değerlerini girerek depo alanını simüle edebilirsiniz.</p>
              {calculatedAreaM2 !== null && (
                <p className="text-xl font-bold text-blue-800 mt-4">
                  Hesaplanan Alan: {calculatedAreaM2.toFixed(2)} m²
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}