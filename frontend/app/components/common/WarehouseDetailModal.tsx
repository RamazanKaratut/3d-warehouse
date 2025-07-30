// components/common/WarehouseDetailPanel.tsx
import React from 'react';
import { Warehouse } from '@/app/types/warehouse';

interface WarehouseDetailPanelProps {
    warehouse: Warehouse | null;
}

export const WarehouseDetailPanel: React.FC<WarehouseDetailPanelProps> = ({ warehouse }) => {
    if (!warehouse) return null;

    const areaInKm2 = (warehouse.taban_alani && warehouse.taban_alani / 1000000);

    return (
        <div className="bg-white rounded-xl shadow-lg p-5 w-full h-full overflow-y-auto"> {/* p-6'dan p-5'e düşürüldü */}
            <div className="border-b pb-3 mb-3"> {/* pb-4'ten pb-3'e, mb-4'ten mb-3'e düşürüldü */}
                <h2 className="text-xl font-extrabold text-blue-800 flex items-center"> {/* text-2xl'den text-xl'e düşürüldü */}
                    <span className="mr-2 text-2xl">📦</span> {warehouse.ad} Detayları
                </h2>
            </div>

            <div className="space-y-2 text-gray-700 text-sm"> {/* space-y-3'ten space-y-2'ye, text-base'ten text-sm'e düşürüldü */}
                <p className="flex items-center">
                    <span className="font-semibold text-gray-800 mr-2 text-sm">ID:</span> {warehouse.id} {/* text-base'ten text-sm'e */}
                </p>
                <p className="flex items-center">
                    <span className="font-semibold text-gray-800 mr-2 text-sm">Ad:</span> {warehouse.ad}
                </p>
                <p className="flex items-center">
                    <span className="font-semibold text-gray-800 mr-2 text-sm">Taban Alanı:</span>
                    {areaInKm2 !== undefined && areaInKm2 !== null
                        ? `${areaInKm2.toFixed(4)} km²`
                        : 'N/A'}
                </p>
                <p className="flex items-center">
                    <span className="font-semibold text-gray-800 mr-2 text-sm">Kapasite:</span> {warehouse.kapasite} ton
                </p>
                <p className="flex items-center">
                    <span className="font-semibold text-gray-800 mr-2 text-sm">Tip:</span> {warehouse.tipi === 'açık' ? 'Açık Depo' : 'Kapalı Depo'}
                </p>
                {warehouse.yukseklik !== undefined && warehouse.yukseklik !== null && (
                    <p className="flex items-center">
                        <span className="font-semibold text-gray-800 mr-2 text-sm">Yükseklik:</span> {warehouse.yukseklik.toFixed(2)} metre
                    </p>
                )}
                {warehouse.raf_sayisi !== undefined && warehouse.raf_sayisi !== null && (
                    <p className="flex items-center">
                        <span className="font-semibold text-gray-800 mr-2 text-sm">Raf Sayısı:</span> {warehouse.raf_sayisi}
                    </p>
                )}
                <div className="border-t pt-2 mt-2"> {/* pt-3'ten pt-2'ye, mt-3'ten mt-2'ye düşürüldü */}
                    <p className="font-semibold text-gray-800 mb-1 text-sm">Açıklama:</p> {/* text-base'ten text-sm'e */}
                    <p className="text-gray-600 italic leading-tight text-sm"> {/* leading-snug'dan leading-tight'a, text-base'ten text-sm'e */}
                        {warehouse.aciklama || 'Açıklama bulunmuyor.'}
                    </p>
                </div>
                {warehouse.created_at && (
                    <p className="text-xs text-gray-500 mt-1"> {/* text-sm'den text-xs'e, mt-2'den mt-1'e */}
                        <span className="font-semibold">Oluşturulma Tarihi:</span> {new Date(warehouse.created_at).toLocaleString()}
                    </p>
                )}
            </div>
        </div>
    );
};