import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-blue-950 p-8">
      <div className="text-center max-w-2xl">
        {/* Animasi */}
        <div className="relative mb-8">
          <div className="text-9xl font-bold text-blue-400 opacity-20">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl font-bold text-white">
              Page Not Found
            </div>
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-4">Oops! Halaman Tidak Ditemukan</h1>
        
        <p className="text-gray-300 mb-8 text-lg">
          Sepertinya Anda tersesat di dunia angka dan nilai. 
          Halaman yang Anda cari mungkin telah dipindahkan, dihapus, atau tidak pernah ada.
        </p>
        
        <div className="bg-gray-800/50 rounded-xl p-6 mb-8 border border-gray-700">
          <h3 className="text-xl font-semibold text-blue-300 mb-3">Cobalah:</h3>
          <ul className="text-gray-300 space-y-2 text-left">
            <li>• Kembali ke <Link href="/" className="text-blue-400 hover:underline">Dashboard</Link></li>
            <li>• Periksa URL yang dimasukkan</li>
            <li>• Gunakan menu navigasi di atas</li>
            <li>• Atau mulai input data rapor dari awal</li>
          </ul>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-all transform hover:scale-105"
          >
            🏠 Kembali ke Beranda
          </Link>
          
          <Link
            href="/results"
            className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-8 rounded-lg transition-all border border-gray-600"
          >
            📊 Lihat Hasil & Grafik
          </Link>
        </div>
        
        {/* Dekorasi */}
        <div className="mt-12 text-gray-500 text-sm">
          <p>Error Code: 404 | Rapor Agit by Davina Anandia</p>
        </div>
      </div>
    </div>
  );
}