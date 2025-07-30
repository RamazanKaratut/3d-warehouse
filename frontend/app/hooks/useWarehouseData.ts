// app/hooks/useWarehouseData.ts
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/app/utils/api';
import { Warehouse } from '@/app/types/warehouse';
import { UseWarehouseDataResult } from '@/app/types/warehouse';

export const useWarehouseData = (warehouseId: string | string[] | undefined): UseWarehouseDataResult => {
    const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        async function fetchWarehouseData() {
            if (!warehouseId) {
                console.log("warehouseId mevcut değil, fetchWarehouseData çalışmayacak.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                console.log(`API'den depo verisi çekiliyor: /api/warehouses/${warehouseId}`);
                const response = await api.get(`/api/warehouses/${warehouseId}`);
                setWarehouse(response.data);
                console.log("API'den çekilen warehouse data:", response.data);
            } catch (err: any) {
                console.error('Depo verisi çekilirken hata:', err);
                setError(err.response?.data?.message || 'Depo verileri yüklenirken bir sorun oluştu.');
                if (err.response?.status === 401 || !localStorage.getItem('access_token')) {
                    console.log("Yetkilendirme hatası veya token yok, ana sayfaya yönlendiriliyor.");
                    router.push('/');
                }
            } finally {
                setLoading(false);
                console.log("Veri çekme işlemi tamamlandı. Loading durumu:", false);
            }
        }

        fetchWarehouseData();
    }, [warehouseId, router]);

    return { warehouse, loading, error };
};