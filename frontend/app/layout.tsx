// src/app/layout.tsx
// src/app/globals.css'i import ettiğinizden emin olun
import './globals.css';
import Sidebar from '@/app/components/Sidebar'; // Sidebar bileşenini import et

export const metadata = {
  title: 'Depo Yönetim Sistemi',
  description: 'Gelişmiş Depo Yönetimi Uygulaması',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="h-full">
      <body className="flex h-full min-h-screen"> {/* `h-full` ekledik, `flex` ve `min-h-screen` zaten vardı */}
        {/* Sidebar burada olacak */}
        <Sidebar />

        {/* Ana İçerik Alanı */}
        {/* Sidebar ile birlikte sayfayı doldurması için flex-grow ve overflow-y-auto ekliyoruz */}
        <main className="flex-grow p-4 md:p-8 overflow-y-hidden bg-gray-100">
          {children}
        </main>

      </body>
    </html>
  );
}