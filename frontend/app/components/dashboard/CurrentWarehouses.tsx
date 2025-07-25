'use client';

import React from 'react';
import Link from 'next/link';
import { Warehouse } from '@/app/types/warehouse'; // opsiyonel: tip tanımı varsa

const warehouses = [
  { id: '1', name: 'Ana Depo (İstanbul)', location: 'İstanbul', capacity: '1000 m³' },
  { id: '2', name: 'İzmir Lojistik Merkezi', location: 'İzmir', capacity: '750 m³' },
  { id: '3', name: 'Ankara Dağıtım Deposu', location: 'Ankara', capacity: '500 m³' },
];

export default function CurrentWarehouses() {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">📦 Mevcut Depolar</h2>

      {warehouses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {warehouses.map((warehouse) => (
            <Link
              key={warehouse.id}
              href={`/pages/warehouse-3d-management?id=${warehouse.id}`}
              className="group border border-gray-200 rounded-2xl p-5 hover:shadow-md hover:border-blue-500 transition-all duration-200 flex flex-col justify-between bg-gray-50 hover:bg-white"
            >
              <div>
                <h3 className="text-xl font-semibold text-blue-700 group-hover:underline">{warehouse.name}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  📍 {warehouse.location}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  🧱 Kapasite: {warehouse.capacity}
                </p>
              </div>
              <div className="mt-4 text-right">
                <span className="inline-block text-blue-600 group-hover:text-blue-800 text-sm font-medium">
                  Detayları Gör &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">Henüz kayıtlı depo bulunmuyor. Yeni bir depo ekleyebilirsiniz.</p>
      )}

      <p className="mt-6 text-xs text-gray-400 italic">
        * Depo adına tıklayarak 3 boyutlu yönetim ekranına geçebilirsiniz. (Bu özellik yakında aktif edilecektir.)
      </p>
    </div>
  );
}
