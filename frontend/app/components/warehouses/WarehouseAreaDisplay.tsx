// components/warehouses/WarehouseAreaDisplay.tsx
'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useWarehouseForm } from '../../contexts/WarehouseFormContext';

const DynamicMap = dynamic(() => import('../map/DynamicMap'), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center h-full text-gray-500">
      Harita Yükleniyor...
    </div>
  ),
});

export function WarehouseAreaDisplay() {
  const { handleMapDrawn, mapInitialCenter, mapInitialZoom, addMethod } = useWarehouseForm();

  return (
    <div className="flex flex-col items-center justify-center lg:col-span-2 min-h-[75vh]">
      <div className="w-full rounded-xl overflow-hidden border border-gray-200 h-full shadow-inner">
        <DynamicMap
          key={addMethod}
          onAreaDrawn={handleMapDrawn}
          initialCenter={mapInitialCenter}
          initialZoom={mapInitialZoom}
        />
      </div>
    </div>
  );
}