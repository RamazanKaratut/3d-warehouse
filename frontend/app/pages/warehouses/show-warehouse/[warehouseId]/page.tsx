// app/my-warehouses/[warehouseId]/page.tsx
'use client';

import React, { useRef } from 'react'; // useState kaldırıldı
import { useParams } from 'next/navigation';
import { useWarehouseData } from '@/app/hooks/useWarehouseData';
import { useBabylonScene } from '@/app/hooks/useBabylonScene';
import '@/app/utils/babylonUtils';
import { WarehouseDetailPanel } from '@/app/components/common/WarehouseDetailModal'; // Panel import edildi

const ShowWarehousePage: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { warehouseId } = useParams();

    const { warehouse, loading, error } = useWarehouseData(warehouseId);

    // Modal state'leri kaldırıldı

    useBabylonScene(canvasRef, warehouse);

    // Modal açma/kapatma fonksiyonları kaldırıldı


    if (loading) {
        console.log("Loading ekranı gösteriliyor...");
        return (
            <div className="flex justify-center items-center h-screen text-gray-600">
                <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-lg">Depo Verileri Yükleniyor...</span>
            </div>
        );
    }

    if (error) {
        console.error("Hata ekranı gösteriliyor. Detay:", error);
        return (
            <div className="flex flex-col justify-center items-center h-screen text-red-600">
                <p className="text-2xl font-bold mb-4">Hata Oluştu!</p>
                <p className="text-xl font-semibold mb-6">Detay: {error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-6 py-3 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition duration-300 ease-in-out text-lg"
                >
                    Tekrar Dene
                </button>
            </div>
        );
    }

    if (!warehouse) {
        console.log("Warehouse verisi null, 'Depo bulunamadı' mesajı gösteriliyor.");
        return (
            <div className="flex justify-center items-center h-screen text-gray-500">
                Depo bulunamadı veya yüklenemedi.
            </div>
        );
    }

    console.log("Depo içeriği render ediliyor.");
    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <div className="bg-white shadow-md p-4 text-center">
                <h1 className="text-3xl font-bold text-blue-700">Depo: {warehouse.ad}</h1>
                <p className="text-gray-600 mt-2">
                    Konum: {warehouse.konum || 'Belirtilmemiş'} | Alan: {
                        warehouse.alan_verisi_3d && warehouse.alan_verisi_3d.calculated_area_m2
                            ? `${(warehouse.alan_verisi_3d.calculated_area_m2 / 1000000).toFixed(4)} km²`
                            : 'N/A'
                    }
                </p>
            </div>
            <div className="flex-grow flex p-4 space-x-4 overflow-hidden bg-gray-100" style={{ maxHeight: 'calc(100vh - 150px)' }}> {/* Buraya eklendi */}
                <div className="w-1/3 min-w-[300px] max-w-sm h-full">
                    <WarehouseDetailPanel warehouse={warehouse} />
                </div>
                <div className="flex-grow h-full relative">
                    <canvas
                        ref={canvasRef}
                        className="w-full h-full block border border-gray-300 rounded-md shadow-lg"
                    />
                </div>
            </div>
        </div>
    );
};

export default ShowWarehousePage;