// src/app/dashboard/warehouse-3d-management/page.tsx
'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, Transition } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Html } from '@react-three/drei';
import WarehouseScene from '@/app/components/dashboard/WarehouseScene';

export default function Warehouse3DManagementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [warehouseId, setWarehouseId] = useState<string | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setWarehouseId(id);
    }
    setInitialLoadComplete(true);
  }, [searchParams]);

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  };

  const pageTransition: Transition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.5,
  };

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="flex flex-col items-center justify-center bg-gray-100 p-8 min-h-screen"
    >
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-6xl text-center">
        <h2 className="text-3xl font-bold mb-4 text-gray-800">3 Boyutlu Depo Yönetimi</h2>

        {!initialLoadComplete ? (
          <div className="flex flex-col items-center justify-center h-64">
            <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-lg text-gray-700">Depo bilgileri yükleniyor...</p>
          </div>
        ) : warehouseId ? (
          <>
            <p className="text-lg text-gray-700 mb-6">
              <strong>Depo ID:</strong> <span className="font-semibold text-blue-600">{warehouseId}</span>
            </p>

            <div className="w-full h-[600px] bg-gray-200 rounded-lg overflow-hidden mb-6 relative border border-gray-300">
              <Canvas camera={{ position: [0, 0, 20], fov: 75 }} shadows>
                <ambientLight intensity={0.4} />
                <pointLight position={[10, 10, 10]} intensity={0.8} />
                <Suspense fallback={
                  <Html center>
                    <div className="text-lg text-gray-700 bg-white p-2 rounded-md shadow-md">
                      3D Model Yükleniyor...
                      <svg className="animate-spin mx-auto mt-2 h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  </Html>
                }>
                  <WarehouseScene warehouseId={warehouseId} />
                </Suspense>
                <OrbitControls enableZoom enablePan enableRotate />
                <Environment preset="city" />
              </Canvas>
              <div className="absolute bottom-4 left-4 right-4 text-xs text-gray-600 bg-white bg-opacity-75 p-2 rounded-md">
                <strong>Kullanım:</strong> Fare sol tuş ile döndür, sağ tuş ile kaydır, tekerlek ile yakınlaştır/uzaklaştır.
              </div>
            </div>

            <p className="text-gray-600 mb-6">
              Bu sahnede konteyner ekleme, taşıma ve silme işlemlerini interaktif olarak gerçekleştirebilirsiniz.
            </p>
          </>
        ) : (
          <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-md">
            <p className="font-bold">Uyarı:</p>
            <p>Lütfen yönetmek istediğiniz depoyu seçin. Dashboard'dan bir depo ID'si ile bu sayfaya yönlenmelisiniz.</p>
            <p className="text-sm mt-2">Örnek URL: <code className="bg-gray-200 p-1 rounded">/dashboard/warehouse-3d-management?id=DEPO001</code></p>
          </div>
        )}

        <Link
          href="/dashboard"
          className="inline-block mt-6 py-2 px-6 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
        >
          Dashboard'a Geri Dön
        </Link>
      </div>
    </motion.div>
  );
}
