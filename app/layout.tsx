import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';

export const metadata: Metadata = {
  title: 'Rapor Agit - Hitung Rata-Rata Rapor',
  description: 'Hitung dan analisis rata-rata nilai rapor dari kelas 10-12',
  icons: {
    icon: '/RA.png',
    shortcut: '/RA.png',
    apple: '/RA.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="bg-gray-white">
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