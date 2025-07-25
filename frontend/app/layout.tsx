// src/app/layout.tsx (veya app/layout.tsx)
import './globals.css';
import Link from 'next/link'; 

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
    <html lang="tr">
      <body className="flex flex-col min-h-screen"> {/* body'ye flex ve min-h-screen eklendi */}
        <nav className="bg-gray-800 p-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <Link href="/pages/dashboard" className="text-white text-2xl font-bold hover:text-blue-300 transition-colors">
              Depo Yönetimi
            </Link>
            <div className="space-x-4">
              <Link href="/pages/add-warehouse" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Depo Ekle
              </Link>
              <Link href="/pages/my-warehouses" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Depolarım
              </Link>
            </div>
          </div>
        </nav>
        <main className="flex-grow"> {/* `flex-grow` ekliyoruz */}
          {children}
        </main>
        {/* Opsiyonel: Eğer sabit bir footer'ınız varsa buraya eklersiniz */}
        {/* <footer className="bg-gray-800 text-white p-4 text-center">
          Footer İçeriği
        </footer> */}
      </body>
    </html>
  );
}