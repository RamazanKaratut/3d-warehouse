// src/app/LayoutContent.tsx
'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const noSidebarPaths = [
    '/',
    '/pages/user/register',
    '/pages/user/reset-password',
    '/pages/user/forgot-password'
  ];

  const shouldHideSidebar = noSidebarPaths.includes(pathname);

  return (
    <div className="flex min-h-screen">
      {!shouldHideSidebar && <Sidebar />}
      <main className={`flex-1 p-8 bg-gray-100 overflow-hidden ${!shouldHideSidebar ? '' : 'w-100%'}`}>
        {children}
      </main>
    </div>
  );
}