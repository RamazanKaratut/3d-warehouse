// app/add-warehouse/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { WarehouseForm } from '@/app/components/forms/WarehouseForm';
import { WarehouseAreaDisplay } from '@/app/components/warehouses/WarehouseAreaDisplay';
import { WarehouseFormProvider, useWarehouseForm } from '@/app/contexts/WarehouseFormContext'; // Context'i import et

// Bu bileşen artık sadece auth kontrolünü ve ana handleSubmit'i yönetecek.
// Form durumlarını ve setter'larını Context'ten alacak.
function AddWarehouseContent() {
  const {
    warehouseName, location, capacity, description,
    drawnAreaGeoJSON, calculatedAreaM2,
    addMethod, warehouseWidth, warehouseLength,
    warehouseType, warehouseHeight,
    setLoading, setMessage, resetForm,
  } = useWarehouseForm(); // Context'ten durumu ve setter'ları al

  const router = useRouter();

  const API_BASE_URL = 'http://localhost:5000';
  const API_AUTH_URL = `${API_BASE_URL}/auth`;
  const API_WAREHOUSE_URL = `${API_BASE_URL}/api/warehouses`;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_AUTH_URL}/protected`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        if (!response.ok) {
          console.log("Oturum geçerli değil, giriş sayfasına yönlendiriliyor.");
          router.push('/');
        }
      } catch (error) {
        console.error('Yetkilendirme kontrolü sırasında hata:', error);
        router.push('/');
      }
    };

    checkAuth();
  }, [router, API_AUTH_URL]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    let finalAreaM2: number | null = null;
    let geoJsonToSend: any | null = null;
    let heightToSend: number | null = null;

    if (addMethod === 'map') {
      if (!drawnAreaGeoJSON || calculatedAreaM2 === null) {
        setMessage('Lütfen harita üzerinde bir depo alanı çizin.');
        setLoading(false);
        return;
      }
      finalAreaM2 = parseFloat(calculatedAreaM2.toFixed(2));
      geoJsonToSend = drawnAreaGeoJSON;
    } else { // addMethod === 'manual'
      if (!warehouseWidth || !warehouseLength || calculatedAreaM2 === null) {
        setMessage('Lütfen depo genişliği ve uzunluğunu girin.');
        setLoading(false);
        return;
      }
      finalAreaM2 = parseFloat(calculatedAreaM2.toFixed(2));
    }

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
      area_m2: finalAreaM2,
      geo_json: geoJsonToSend,
      type: warehouseType,
      height_m: heightToSend,
    };

    try {
      const response = await fetch(API_WAREHOUSE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newWarehouse),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('🎉 Depo başarıyla eklendi!');
        resetForm(); // Formu context üzerinden sıfırla
        router.push('/my-warehouses');
      } else {
        setMessage(data.message || 'Depo eklenirken bir hata oluştu.');
        console.error("Backend'den hata:", data.message);
      }
    } catch (error) {
      console.error('Depo eklerken ağ hatası oluştu:', error);
      setMessage('Depo eklenirken bir ağ sorunu oluştu. Lütfen internet bağlantınızı kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8 w-full">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        <span role="img" aria-label="warehouse">📦</span> Yeni Depo Ekle
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-screen-5xl">
        <div className="flex flex-col lg:col-span-1 items-center">
          {/* WarehouseForm bileşenini form etiketiyle sarmalayarak handleSubmit'i ona bağla */}
          <form onSubmit={handleSubmit} className="w-full max-w-md">
            <WarehouseForm />
          </form>
        </div>

        <WarehouseAreaDisplay />
      </div>
    </div>
  );
}

// Ana AddWarehouse bileşeni, ContextProvider'ı sarmalar
export default function AddWarehouse() {
  return (
    <WarehouseFormProvider>
      <AddWarehouseContent />
    </WarehouseFormProvider>
  );
}