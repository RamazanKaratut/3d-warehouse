// src/app/pages/warehouses/add-warehouse/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { WarehouseForm } from '@/app/components/forms/WarehouseForm';
import { WarehouseAreaDisplay } from '@/app/components/warehouses/WarehouseAreaDisplay';
import { WarehouseFormProvider, useWarehouseForm } from '@/app/contexts/WarehouseFormContext';
import bbox from '@turf/bbox';
import { polygon } from '@turf/helpers';
import api from '@/app/utils/api';

const getMetersPerDegreeAtLatitude = (latitude: number) => {
    const EARTH_RADIUS_METERS = 6371000;
    const circumferenceAtEquator = 2 * Math.PI * EARTH_RADIUS_METERS;
    const metersPerLatDegree = circumferenceAtEquator / 360;
    const metersPerLonDegree = metersPerLatDegree * Math.cos(latitude * Math.PI / 180);
    return { metersPerLatDegree, metersPerLonDegree };
};

function AddWarehouseContent() {
    const {
        warehouseName, location, capacity, description,
        drawnAreaGeoJSON, calculatedAreaM2,
        addMethod,
        warehouseType, warehouseHeight,
        setLoading, setMessage, resetForm,
    } = useWarehouseForm();

    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await api.get('/auth/protected');
                if (response.status !== 200) {
                    console.log("Oturum geçerli değil, giriş sayfasına yönlendiriliyor.");
                    router.push('/');
                }
            } catch (error: any) {
                console.error('Yetkilendirme kontrolü sırasında hata:', error);
                if (error.response?.status === 401 || !localStorage.getItem('access_token')) {
                    router.push('/');
                }
            }
        };
        checkAuth();
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        let typeToSend: string = '';
        if (warehouseType === 'open') {
            typeToSend = 'açık';
        } else if (warehouseType === 'closed') {
            typeToSend = 'kapalı';
        } else {
            setMessage("Lütfen bir depo tipi seçin.");
            setLoading(false);
            return;
        }

        let finalAreaM2: number | null = null;
        let areaDataForDB: any | null = null;
        let heightToSend: number | null = null;

        if (!drawnAreaGeoJSON || calculatedAreaM2 === null) {
            setMessage('Lütfen harita üzerinde bir depo alanı çizin.');
            setLoading(false);
            return;
        }

        finalAreaM2 = parseFloat(calculatedAreaM2.toFixed(2));

        const bounds = bbox(drawnAreaGeoJSON);
        const minLon = bounds[0];
        const minLat = bounds[1];
        const maxLon = bounds[2];
        const maxLat = bounds[3];

        const avgLat = (minLat + maxLat) / 2;
        const { metersPerLatDegree, metersPerLonDegree } = getMetersPerDegreeAtLatitude(avgLat);

        const widthInMeters = (maxLon - minLon) * metersPerLonDegree;
        const lengthInMeters = (maxLat - minLat) * metersPerLatDegree;

        areaDataForDB = {
            method: addMethod,
            geojson_data: drawnAreaGeoJSON,
            width_m: parseFloat(widthInMeters.toFixed(2)),
            length_m: parseFloat(lengthInMeters.toFixed(2)),
            calculated_area_m2: finalAreaM2,
        };

        if (!warehouseType) {
            setMessage('Lütfen deponun açık mı kapalı mı olduğunu seçin.');
            setLoading(false);
            return;
        }

        if (warehouseType === 'closed') {
            const height = parseFloat(warehouseHeight);
            if (isNaN(height) || height <= 0) {
                setMessage('Kapalı depolar için geçerli bir yükseklik girin.');
                setLoading(false);
                return;
            }
            heightToSend = parseFloat(height.toFixed(2));
        }

        const newWarehouse = {
            name: warehouseName,
            location: location,
            capacity: parseInt(capacity, 10),
            description: description,
            taban_alani: finalAreaM2,
            alan_verisi_3d: areaDataForDB,
            type: typeToSend,
            yukseklik: heightToSend,
        };

        console.log('Frontend tarafından gönderilen yeni depo verisi:', newWarehouse);

        try {
            const response = await api.post('/api/warehouses', newWarehouse);

            if (response.status === 201 || response.status === 200) {
                setMessage('🎉 Depo başarıyla eklendi!');
                resetForm();
                router.push('/pages/warehouses/my-warehouses');
            } else {
                setMessage(response.data.msg || response.data.error || 'Depo eklenirken bir hata oluştu.');
                console.error("Backend'den hata:", response.data.msg || response.data.error || 'Bilinmeyen Hata');
            }
        } catch (error: any) {
            console.error('Depo eklerken ağ hatası oluştu:', error);
            setMessage(error.response?.data?.msg || error.response?.data?.error || 'Depo eklenirken bir ağ sorunu oluştu. Lütfen internet bağlantınızı kontrol edin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8 w-100%">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                <span role="img" aria-label="warehouse">📦</span> Yeni Depo Ekle
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-screen-5xl">
                <div className="flex flex-col lg:col-span-1 items-center">
                    <form onSubmit={handleSubmit} className="w-full max-w-md">
                        <WarehouseForm />
                    </form>
                </div>

                <WarehouseAreaDisplay />
            </div>
        </div>
    );
}

export default function AddWarehouse() {
    return (
        <WarehouseFormProvider>
            <AddWarehouseContent />
        </WarehouseFormProvider>
    );
}