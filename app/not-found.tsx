'use client';

import Link from 'next/link';
import { FiHome, FiBarChart2, FiAlertTriangle, FiArrowLeft } from 'react-icons/fi';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Error Illustration */}
          <div className="text-center mb-8">
            <div className="relative w-48 h-48 mx-auto mb-6">
              <div className="absolute inset-0 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="text-6xl text-blue-600">404</div>
              </div>
              <div className="absolute -top-2 -right-2 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <FiAlertTriangle className="text-red-600 text-2xl" />
              </div>
            </div>
          </div>

          {/* Error Message */}
          <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Halaman Tidak Ditemukan
            </h1>
            
            <p className="text-gray-600 mb-6">
              Sepertinya Anda tersesat di antara data nilai dan analisis. 
              Halaman yang Anda cari tidak dapat ditemukan atau telah dipindahkan.
            </p>
            
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-4">
              <span className="text-gray-700 font-bold">?</span>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-2">Kemungkinan penyebab:</h3>
              <ul className="text-gray-600 text-sm text-left space-y-1">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  URL yang dimasukkan salah atau ada typo
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Halaman telah dihapus atau dipindahkan
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Link yang Anda klik mungkin rusak
                </li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <Link
              href="/"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-6 rounded-lg transition-all flex items-center justify-center space-x-3"
            >
              <FiHome size={20} />
              <span>Kembali ke Dashboard</span>
            </Link>
            
            <Link
              href="/results"
              className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-4 px-6 rounded-lg transition-all flex items-center justify-center space-x-3 border border-gray-300"
            >
              <FiBarChart2 size={20} />
              <span>Lihat Hasil Analisis</span>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}