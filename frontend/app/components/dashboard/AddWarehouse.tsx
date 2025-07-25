// src/app/add-warehouse/page.tsx
'use client';

import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import area from '@turf/area'; // Turf.js'in alan hesaplama fonksiyonu

// DynamicMap bileşenini SSR olmadan dinamik olarak yüklüyoruz.
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
  const [loading, setLoading] = useState(false);

  const [drawnAreaGeoJSON, setDrawnAreaGeoJSON] = useState<any>(null);
  const [calculatedAreaM2, setCalculatedAreaM2] = useState<number | null>(null);

  const handleMapDrawn = useCallback((geoJsonData: any) => {
    console.log("Harita üzerinde alan çizildi:", geoJsonData);
    setDrawnAreaGeoJSON(geoJsonData);

    if (geoJsonData && geoJsonData.geometry && (geoJsonData.geometry.type === 'Polygon' || geoJsonData.geometry.type === 'MultiPolygon')) {
      try {
        const calculated = area(geoJsonData);
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

    const warehouseData = {
      name: warehouseName.trim(),
      locationDescription: warehouseLocation.trim(),
      areaCoordinates: drawnAreaGeoJSON.geometry.coordinates,
      areaGeoJSON: drawnAreaGeoJSON,
      calculatedAreaM2: calculatedAreaM2.toFixed(2),
    };

    console.log('Depo Ekleme İsteği Gönderiliyor:', warehouseData);

    try {
      const response = await fetch('/api/add-warehouse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': 'Bearer YOUR_AUTH_TOKEN',
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
    <div className="flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8 w-full"> {/* mx-auto yerine w-full ile esneklik */}
      <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center"> {/* text-gray-900 yapıldı */}
        <span role="img" aria-label="warehouse">📦</span> Yeni Depo Ekle
      </h1>

      {/* Grid yapısı: Form için 1 sütun, Harita için 2 sütun */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-screen-2xl"> {/* max-w-screen-2xl eklendi */}
        {/* Sol Form Alanı */}
        {/* h-full ile harita ile yüksekliği eşitlendi, items-center ile form ortalandı */}
        <div className="flex flex-col lg:col-span-1 items-center h-full"> 
          {/* Formun kendi genişliği max-w-md ile sınırlandı */}
          <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-2xl shadow-xl border border-gray-200 mb-8 w-full max-w-md"> {/* max-w-md eklendi */}
            
            <div>
              <label htmlFor="warehouseName" className="block text-sm font-medium text-gray-900 mb-1"> {/* text-gray-900 yapıldı */}
                Depo Adı:
              </label>
              <input
                type="text"
                id="warehouseName"
                value={warehouseName}
                onChange={(e) => setWarehouseName(e.target.value)}
                placeholder="Örn: Kayseri Merkez Depo"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-150 ease-in-out text-gray-900" // text-gray-900 eklendi
              />
            </div>

            <div>
              <label htmlFor="warehouseLocation" className="block text-sm font-medium text-gray-900 mb-1"> {/* text-gray-900 yapıldı */}
                Depo Konumu (Adres/Açıklama):
              </label>
              <input
                type="text"
                id="warehouseLocation"
                value={warehouseLocation}
                onChange={(e) => setWarehouseLocation(e.target.value)}
                placeholder="Örn: Kayseri Organize Sanayi Bölgesi, 12. Cadde"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-150 ease-in-out text-gray-900" // text-gray-900 eklendi
              />
            </div>

            {drawnAreaGeoJSON && calculatedAreaM2 !== null && (
              <div className="text-sm text-gray-900 bg-blue-50 border border-blue-200 rounded-lg p-3"> {/* text-gray-900 yapıldı */}
                <p><strong>✅ Haritada alan çizildi.</strong></p>
                <p>
                  Tahmini Alan: <span className="font-semibold text-blue-800">{calculatedAreaM2.toFixed(2)} m²</span>
                </p>
                <p className="text-xs text-gray-900 mt-1">Koordinatlar ve detaylı GeoJSON, kaydetme isteğiyle gönderilecek.</p> {/* text-gray-900 yapıldı */}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !drawnAreaGeoJSON || calculatedAreaM2 === null}
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
        </div>

        {/* Sağ Harita Alanı */}
        {/* min-h-[75vh] ile harita yüksekliği ayarlandı, lg:col-span-2 ile 2 sütun kaplaması sağlandı */}
        <div className="rounded-xl overflow-hidden border border-gray-200 lg:col-span-2 min-h-[75vh] shadow-inner">
          <DynamicMap onAreaDrawn={handleMapDrawn} />
        </div>
      </div>
    </div>
  );
}