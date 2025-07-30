// src/components/Sidebar.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useAuth } from '@/app/contexts/AuthContext';

const DashboardIcon = () => (
    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m0 0l-7 7m7-7v10a1 1 0 00-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
);
const AddWarehouseIcon = () => (
    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
);
const MyWarehousesIcon = () => (
    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2H7a2 2 0 00-2 2v2m12 0h.02"></path></svg>
);
const SettingsIcon = () => (
    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
);
const LogoutIcon = () => (
    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
);

const UserIcon = () => (
    <svg className="w-6 h-6 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
);


const Sidebar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const { isLoggedIn, username, isLoadingAuth, logout } = useAuth();

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const handleLogout = async () => {
        await logout();
        setIsOpen(false);
    };

    const navItems = [
        { name: 'Kontrol Paneli', href: '/pages/dashboard', icon: <DashboardIcon /> },
        { name: 'Depo Ekle', href: '/pages/warehouses/add-warehouse', icon: <AddWarehouseIcon /> },
        { name: 'Depolarım', href: '/pages/warehouses/my-warehouses', icon: <MyWarehousesIcon /> },
        { name: 'Ayarlar', href: '/pages/warehouses/settings', icon: <SettingsIcon /> },
    ];

    if (isLoadingAuth || !isLoggedIn) {
        return null;
    }

    return (
        <>
            <div className="md:hidden flex items-center justify-between bg-gray-800 p-4 shadow-md text-white">
                <Link href="/pages/dashboard" className="text-2xl font-bold">Depo Yönetimi</Link>
                <button onClick={toggleSidebar} className="text-gray-300 hover:text-white focus:outline-none">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                </button>
            </div>

            {isOpen && (
                <div
                    className="fixed inset-0 bg-black opacity-50 z-40 md:hidden"
                    onClick={toggleSidebar}
                ></div>
            )}

            <aside
                className={`fixed inset-y-0 left-0 bg-gray-900 text-white w-64 p-5 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    } md:translate-x-0 transition-transform duration-300 ease-in-out z-50 md:z-auto md:relative md:flex-shrink-0
                min-h-screen overflow-y-hidden`}
            >
                <div className="flex justify-between items-center mb-6 md:hidden">
                    <span className="text-2xl font-bold">Menü</span>
                    <button onClick={toggleSidebar} className="text-gray-300 hover:text-white focus:outline-none">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <h2 className="text-3xl font-bold mb-2 hidden md:block">Depo Yönetimi</h2>

                {username && (
                    <p className="text-xl font-semibold text-gray-300 mt-4 mb-4 flex items-center justify-center md:justify-start">
                        <UserIcon />
                        {username}
                    </p>
                )}

                <nav className="flex flex-col h-full">
                    <ul className="flex-grow">
                        {navItems.map((item) => (
                            <li key={item.name} className="mb-2">
                                <Link
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center px-4 py-2 rounded-lg transition-colors duration-200
                                    ${pathname === item.href
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                        }`}
                                >
                                    {item.icon}
                                    {item.name}
                                </Link>
                            </li>
                        ))}
                        <li className="mt-2">
                            <button
                                onClick={handleLogout}
                                className="flex items-center px-4 py-2 rounded-lg transition-colors duration-200 w-full text-left
                                            text-red-300 hover:bg-red-700 hover:text-white focus:outline-none"
                            >
                                <LogoutIcon />
                                Çıkış Yap
                            </button>
                        </li>
                    </ul>
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;