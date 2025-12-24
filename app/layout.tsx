import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';

export const metadata: Metadata = {
  title: 'Rapor Agit - Kalkulator Nilai Akademik',
  description: 'Hitung dan analisis rata-rata nilai rapor dari kelas 10-12',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-gray-50">
        <Navbar />
        <main>
          {children}
        </main>
        <Footer />
        <ScrollToTop />
      </body>
    </html>
  );
}