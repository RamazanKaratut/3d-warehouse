// WarehouseForm.tsx
'use client';

import React from 'react';
import { useWarehouseForm } from '@/app/contexts/WarehouseFormContext';

export function WarehouseForm() {
    const {
        warehouseName, setWarehouseName,
        location, setLocation,
        capacity, setCapacity,
        description, setDescription,
        addMethod, setAddMethod,
        warehouseType, setWarehouseType,
        warehouseHeight, setWarehouseHeight,
        calculatedAreaM2,
        loading,
        message,
    } = useWarehouseForm();

    const isSubmitDisabled = loading || calculatedAreaM2 === null || !warehouseType || (warehouseType === 'closed' && !warehouseHeight);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200 mb-8 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Depo Bilgileri</h2>

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
                        <span className="ml-2 text-gray-700">Harita Üzerinden Çizim</span>
                    </label>
                    <label className="inline-flex items-center">
                        <input
                            type="radio"
                            className="form-radio text-blue-600"
                            name="addMethod"
                            value="manual"
                            checked={addMethod === 'manual'}
                            onChange={() => setAddMethod('manual')}
                        />
                        <span className="ml-2 text-gray-700">Serbest Çizim</span>
                    </label>
                </div>
            </div>

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

                {warehouseType === 'closed' && (
                    <div>
                        <label htmlFor="warehouseHeight" className="block text-sm font-medium text-gray-700">Depo Yüksekliği (metre)</label>
                        <input
                            type="number"
                            id="warehouseHeight"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-2 py-1.5 focus:ring-blue-500 focus:border-blue-500 text-sm max-h-10"
                            value={warehouseHeight}
                            onChange={(e) => setWarehouseHeight(e.target.value)}
                            required={warehouseType === 'closed'}
                        />
                    </div>
                )}

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

                {addMethod === 'map' && (
                    <div className="col-span-1 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-gray-700"><strong>💡 Harita Üzerinden Çizim:</strong></p>
                        <p className="text-sm text-yellow-800">Lütfen sağdaki harita alanını kullanarak depo alanını çizin.</p>
                    </div>
                )}

                {calculatedAreaM2 !== null && (
                    <div className="col-span-1 bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-gray-700"><strong>✅ Hesaplanan Alan:</strong></p>
                        <p className="text-xl font-semibold text-blue-800">{calculatedAreaM2.toFixed(2)} m²</p>
                    </div>
                )}
                
                {addMethod === 'manual' && (
                    <div className="col-span-1 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-gray-700"><strong>💡 Serbest Çizim:</strong></p>
                        <p className="text-sm text-yellow-800">Harita alanına serbestçe bir poligon çizerek depo alanını belirleyin.</p>
                    </div>
                )}

                <div className="col-span-1">
                    <button
                        type="submit"
                        disabled={isSubmitDisabled}
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
            </div>

            {message && (
                <p className={`text-center text-sm mt-3 p-2 rounded-lg ${message.includes('başarıyla') ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'}`}>
                    {message}
                </p>
            )}
        </div>
    );
}