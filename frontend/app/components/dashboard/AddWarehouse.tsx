'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import area from '@turf/area';

const DynamicMap = dynamic(() => import('../../components/map/DynamicMap'), {
  ssr: false,
  loading: () => <p className="text-center text-gray-500">Harita Yükleniyor...</p>,
});

export default function AddWarehouse() {
  const [warehouseName, setWarehouseName] = useState('');
  const [warehouseLocation, setWarehouseLocation] = useState('');
  const [message, setMessage] = useState('');
  const [drawnArea, setDrawnArea] = useState<any>(null);
  const [calculatedArea, setCalculatedArea] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (!warehouseName || !warehouseLocation) {
      setMessage('Lütfen depo adı ve konumunu girin.');
      return;
    }

    if (!drawnArea) {
      setMessage('Lütfen harita üzerinde depo alanını çizin.');
      return;
    }

    const warehouseData = {
      name: warehouseName,
      location: warehouseLocation,
      area: calculatedArea ? calculatedArea.toFixed(2) : null,
      coordinates: drawnArea.geometry.coordinates,
    };

    console.log('Depo Ekleme İsteği:', warehouseData);
    setMessage(`"${warehouseName}" deposu başarıyla eklendi. Alan bilgisi kaydedildi.`);

    setWarehouseName('');
    setWarehouseLocation('');
    setDrawnArea(null);
    setCalculatedArea(null);
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">📦 Yeni Depo Ekle</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
        {/* Sol Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Depo Adı:
            </label>
            <input
              type="text"
              value={warehouseName}
              onChange={(e) => setWarehouseName(e.target.value)}
              placeholder="Örn: Kayseri Merkez Depo"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Depo Konumu:
            </label>
            <input
              type="text"
              value={warehouseLocation}
              onChange={(e) => setWarehouseLocation(e.target.value)}
              placeholder="Örn: Kayseri Organize Sanayi"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {drawnArea && (
            <div className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p><strong>✅ Poligon çizildi.</strong></p>
              {calculatedArea !== null && (
                <p>
                  Alan: <span className="font-semibold">{calculatedArea.toFixed(2)} m²</span>
                </p>
              )}
              <p className="text-xs text-gray-500">Koordinatlar konsolda görüntülenebilir.</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-medium py-2 rounded-xl hover:bg-blue-700 transition"
          >
            💾 Depoyu Kaydet
          </button>

          {message && (
            <p className={`text-center text-sm mt-3 ${message.includes('başarı') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}
        </form>

        {/* Sağ Harita */}
        <div className="rounded-xl overflow-hidden border border-gray-200 h-[400px]">
          <DynamicMap setDrawnArea={setDrawnArea} setCalculatedArea={setCalculatedArea} />
        </div>
      </div>
    </div>
  );
}
