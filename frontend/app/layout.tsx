import './globals.css';
import { Inter } from 'next/font/google';
import ClientLayoutWrapper from './ClientLayoutWrapper'; // Yeni oluşturduğumuz sarıcı bileşen

const inter = Inter({ subsets: ['latin'] });

export const metadata = { // Bu kısım burada kalmalı ve 'use client' olmamalı
  title: 'AkYapı Depo Yönetim Sistemi',
  description: 'Modern 3D Depo Yönetimi',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        {/* Tüm uygulamanın içeriği buradan geçecek */}
        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>
      </body>
    </html>
  );
}