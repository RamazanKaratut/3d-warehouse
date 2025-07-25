// src/app/add-warehouse/page.tsx
'use client';

import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import area from '@turf/area'; // Turf.js'in alan hesaplama fonksiyonu

// DynamicMap bileşenini SSR olmadan dinamik olarak yüklüyoruz.
// Bu, harita kütüphanelerinin (örn. Leaflet) sadece istemci tarafında çalışmasını sağlar.
const DynamicMap = dynamic(() => import('../../components/map/DynamicMap'), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center h-full text-gray-500">
      Harita Yükleniyor...
    </div>
  ),
});

export default function AddWarehouse() {
  const [warehouseName, setWarehouseName] = useState('');
  const [warehouseLocation, setWarehouseLocation] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false); // Yükleme durumu için state

  // Çizilen GeoJSON nesnesi (örneğin bir Polygon veya MultiPolygon)
  const [drawnAreaGeoJSON, setDrawnAreaGeoJSON] = useState<any>(null);
  // Hesaplanan alan (m² cinsinden)
  const [calculatedAreaM2, setCalculatedAreaM2] = useState<number | null>(null);

  // DynamicMap'ten gelen çizim verisini işleyecek callback fonksiyonu
  // Bu fonksiyon, DynamicMap bileşenine 'onAreaDrawn' prop'u olarak geçecek.
  const handleMapDrawn = useCallback((geoJsonData: any) => {
    console.log("Harita üzerinde alan çizildi:", geoJsonData);
    setDrawnAreaGeoJSON(geoJsonData);

    // Turf.js kullanarak alanı hesapla.
    // DynamicMap'ten GeoJSON Polygon veya MultiPolygon döndüğünden emin olun.
    if (geoJsonData && geoJsonData.geometry && (geoJsonData.geometry.type === 'Polygon' || geoJsonData.geometry.type === 'MultiPolygon')) {
      try {
        const calculated = area(geoJsonData); // Turf.js ile alanı hesapla
        setCalculatedAreaM2(calculated);
        console.log("Hesaplanan alan:", calculated.toFixed(2), "m²");
      } catch (e) {
        console.error("Alan hesaplanırken hata oluştu:", e);
        setCalculatedAreaM2(null);
        setMessage("Çizilen alanın hesaplanmasında bir hata oluştu. Lütfen geçerli bir poligon çizin.");
      }
    } else {
      setCalculatedAreaM2(null);
      setMessage("Geçerli bir depo alanı çizmediniz veya çizim formatı hatalı.");
    }
    // Başarılı çizim durumunda mesajı temizle
    if (geoJsonData && geoJsonData.geometry) {
      setMessage('');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    if (!warehouseName.trim() || !warehouseLocation.trim()) {
      setMessage('Lütfen depo adı ve konumunu girin.');
      setLoading(false);
      return;
    }

    if (!drawnAreaGeoJSON || !calculatedAreaM2) {
      setMessage('Lütfen harita üzerinde depo alanını çizin ve alanın hesaplandığından emin olun.');
      setLoading(false);
      return;
    }

    // Backend'e gönderilecek depo verileri
    const warehouseData = {
      name: warehouseName.trim(),
      locationDescription: warehouseLocation.trim(),
      // GeoJSON formatında koordinatlar, genellikle bir GeoJSON nesnesi olarak gönderilir.
      // Eğer backend sadece koordinatları bekliyorsa burayı düzenleyebilirsiniz.
      areaCoordinates: drawnAreaGeoJSON.geometry.coordinates,
      areaGeoJSON: drawnAreaGeoJSON, // Tam GeoJSON nesnesini göndermek daha esnek ve bilgi doludur
      calculatedAreaM2: calculatedAreaM2.toFixed(2), // Hesaplanan alanı iki ondalık basamakla gönder
    };

    console.log('Depo Ekleme İsteği Gönderiliyor:', warehouseData);

    try {
      // API endpoint'inizi kendi backend adresinizle değiştirin
      const response = await fetch('/api/add-warehouse', { // Örn: http://localhost:5000/api/warehouses
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': 'Bearer YOUR_AUTH_TOKEN', // Eğer kimlik doğrulama gerekiyorsa
        },
        body: JSON.stringify(warehouseData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Depo kaydı başarısız oldu.');
      }

      const result = await response.json();
      setMessage(`"${warehouseName}" deposu başarıyla eklendi! (ID: ${result.id || 'Bilinmiyor'})`);
      console.log('Depo başarıyla kaydedildi:', result);

      // Formu temizle
      setWarehouseName('');
      setWarehouseLocation('');
      setDrawnAreaGeoJSON(null);
      setCalculatedAreaM2(null);

    } catch (error: any) {
      console.error('Depo kaydı sırasında hata oluştu:', error);
      setMessage(`Hata: ${error.message || 'Depo kaydı sırasında bir sorun oluştu.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        <span role="img" aria-label="warehouse">📦</span> Yeni Depo Ekle
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
        {/* Sol Form Alanı */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="warehouseName" className="block text-sm font-medium text-gray-700 mb-1">
              Depo Adı:
            </label>
            <input
              type="text"
              id="warehouseName"
              value={warehouseName}
              onChange={(e) => setWarehouseName(e.target.value)}
              placeholder="Örn: Kayseri Merkez Depo"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-150 ease-in-out"
            />
          </div>

          <div>
            <label htmlFor="warehouseLocation" className="block text-sm font-medium text-gray-700 mb-1">
              Depo Konumu (Adres/Açıklama):
            </label>
            <input
              type="text"
              id="warehouseLocation"
              value={warehouseLocation}
              onChange={(e) => setWarehouseLocation(e.target.value)}
              placeholder="Örn: Kayseri Organize Sanayi Bölgesi, 12. Cadde"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-150 ease-in-out"
            />
          </div>

          {drawnAreaGeoJSON && calculatedAreaM2 !== null && (
            <div className="text-sm text-gray-700 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p><strong>✅ Haritada alan çizildi.</strong></p>
              <p>
                Tahmini Alan: <span className="font-semibold text-blue-800">{calculatedAreaM2.toFixed(2)} m²</span>
              </p>
              <p className="text-xs text-gray-600 mt-1">Koordinatlar ve detaylı GeoJSON, kaydetme isteğiyle gönderilecek.</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !drawnAreaGeoJSON || calculatedAreaM2 === null} // Yükleme sırasında ve alan çizilmeden butonu devre dışı bırak
            className="w-full bg-blue-600 text-white font-medium py-2 rounded-xl hover:bg-blue-700 transition duration-300 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
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

          {message && (
            <p className={`text-center text-sm mt-3 p-2 rounded-lg ${
              message.includes('başarıyla') ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'
            }`}>
              {message}
            </p>
          )}
        </form>

        {/* Sağ Harita Alanı */}
        <div className="rounded-xl overflow-hidden border border-gray-200 h-[400px] shadow-inner">
          {/* DynamicMap'e geri çağrı fonksiyonunu 'onAreaDrawn' prop'u olarak geçiyoruz */}
          <DynamicMap onAreaDrawn={handleMapDrawn} />
        </div>
      </div>
    </div>
  );
}