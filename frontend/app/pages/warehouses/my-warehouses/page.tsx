// app/my-warehouses/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Warehouse } from '@/app/types/warehouse';
import api from '@/app/utils/api';

export default function MyWarehouses() {
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();

    useEffect(() => {
        const fetchWarehouses = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await api.get('/api/warehouses');
                setWarehouses(response.data);
            } catch (err: any) {
                console.error('Depo çekme sırasında hata:', err);
                setError(err.response?.data?.message || 'Depolar yüklenirken bir ağ sorunu oluştu.');

                if (err.response?.status === 401 || !localStorage.getItem('access_token')) {
                    router.push('/');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchWarehouses();
    }, [router]);

    const handleCardClick = (warehouseId: number) => {
        router.push(`/pages/warehouses/show-warehouse/${warehouseId}`);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen text-gray-600">
                <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-lg">Depolar Yükleniyor...</span>
            </div>
        );
    }

    if (error) {
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

    if (warehouses.length === 0) {
        return (
            <div className="flex flex-col justify-center items-center h-screen text-gray-500 bg-gray-50 p-6 rounded-lg shadow-inner">
                <p className="text-3xl font-extrabold mb-4 text-blue-700">Hiç Deponuz Yok!</p>
                <p className="text-lg text-center mb-6">Depolarınızı yönetmeye başlamak için hemen yeni bir depo ekleyin.</p>
                <button
                    onClick={() => router.push('/pages/warehouses/add-warehouse')}
                    className="mt-6 px-8 py-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transform hover:scale-105 transition duration-300 ease-in-out text-xl font-semibold flex items-center justify-center"
                >
                    <span className="mr-2 text-2xl">➕</span> Yeni Depo Ekle
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-white shadow-md p-4 text-center">
                <h1 className="text-4xl font-extrabold text-gray-900 text-center">
                    <span role="img" aria-label="boxes" className="mr-3">📦</span> Depolarım
                </h1>
            </div>

            {/* Main Content Area with Scroll */}
            <div className="flex-grow overflow-hidden px-4 sm:px-6 lg:px-8 py-10">
                <div className="max-w-6xl mx-auto h-full">
                    <div className="overflow-y-auto h-full pr-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {warehouses.map((warehouse) => {
                                const areaInKm2 = (warehouse.taban_alani && warehouse.taban_alani / 1000000);
                                return (
                                    <div
                                        key={warehouse.id}
                                        className="bg-white p-8 rounded-2xl shadow-xl border-2 border-blue-300 hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 ease-in-out cursor-pointer flex flex-col justify-between"
                                        onClick={() => handleCardClick(warehouse.id)}
                                    >
                                        <div>
                                            <h2 className="text-3xl font-bold text-blue-800 mb-3 flex items-center">
                                                <span className="mr-2">🏠</span> {warehouse.ad}
                                            </h2>
                                            <p className="text-gray-700 mb-2 text-lg flex items-center">
                                                <span className="font-semibold text-gray-800 flex items-center mr-2">
                                                    <span className="mr-2 text-xl">📏</span> Taban Alanı:
                                                </span>{' '}
                                                {areaInKm2 !== undefined && areaInKm2 !== null
                                                    ? `${areaInKm2.toFixed(4)} km²`
                                                    : 'N/A'}
                                            </p>
                                            <p className="text-gray-700 mb-2 text-lg flex items-center">
                                                <span className="font-semibold text-gray-800 flex items-center mr-2">
                                                    <span className="mr-2 text-xl">🚚</span> Kapasite:
                                                </span>{' '}
                                                {warehouse.kapasite} ton
                                            </p>
                                            <p className="text-gray-700 mb-2 text-lg flex items-center">
                                                <span className="font-semibold text-gray-800 flex items-center mr-2">
                                                    <span className="mr-2 text-xl">⚙️</span> Tip:
                                                </span>{' '}
                                                {warehouse.tipi === 'açık' ? 'Açık Depo' : 'Kapalı Depo'}
                                            </p>
                                            {warehouse.tipi === 'kapalı' && warehouse.yukseklik !== undefined && warehouse.yukseklik !== null && (
                                                <p className="text-gray-700 mb-2 text-lg flex items-center">
                                                    <span className="font-semibold text-gray-800 flex items-center mr-2">
                                                        <span className="mr-2 text-xl">⬆️</span> Yükseklik:
                                                    </span>{' '}
                                                    {warehouse.yukseklik.toFixed(2)} metre
                                                </p>
                                            )}
                                            {warehouse.raf_sayisi !== undefined && warehouse.raf_sayisi !== null && (
                                                <p className="text-gray-700 mb-2 text-lg flex items-center">
                                                    <span className="font-semibold text-gray-800 flex items-center mr-2">
                                                        <span className="mr-2 text-xl">🗄️</span> Raf Sayısı:
                                                    </span>{' '}
                                                    {warehouse.raf_sayisi}
                                                </p>
                                            )}
                                        </div>
                                        <p className="text-gray-600 text-base mt-4 pt-4 border-t border-gray-100 italic">
                                            <span className="font-medium">Açıklama:</span> {warehouse.aciklama || 'Açıklama yok.'}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}