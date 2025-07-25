// src/components/layout/Sidebar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Depo Ekle', href: '/pages/add-warehouse' },
    { name: 'Depo Listele', href: '/pages/my-warehouses' },
    { name: '3D Depo Yönetimi', href: '/pages/warehouse-3d-management' }, // Bu satırı ekleyin
  ];

  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col h-screen p-4 shadow-lg">
      <div className="text-2xl font-bold mb-8 text-blue-400">
        AkYapı Depo
      </div>
      <nav className="flex-1">
        <ul>
          {navItems.map((item) => (
            <li key={item.href} className="mb-2">
              <Link
                href={item.href}
                className={`flex items-center p-3 rounded-lg transition-colors duration-200
                  ${pathname === item.href
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'hover:bg-gray-700 text-gray-300'
                  }`}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="text-sm text-gray-400 mt-auto pt-4 border-t border-gray-700">
        © 2025 AkYapı
      </div>
    </div>
  );
}