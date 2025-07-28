// components/warehouses/WarehouseAreaDisplay.tsx
import React from 'react';
import dynamic from 'next/dynamic';
import { useWarehouseForm } from '../../contexts/WarehouseFormContext';

// DynamicMap bileşenini sadece istemci tarafında yüklüyoruz (SSR kapalı)
const DynamicMap = dynamic(() => import('../map/DynamicMap'), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center h-full text-gray-500">
      Harita Yükleniyor...
    </div>
  ),
});

export function WarehouseAreaDisplay() {
  const { addMethod, handleMapDrawn, calculatedAreaM2 } = useWarehouseForm();

  return (
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
  );
}