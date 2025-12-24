'use client';

import { FiInstagram, FiGithub } from 'react-icons/fi';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-6 md:mb-0">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Rapor Agit</h3>
            <p className="text-gray-600 text-sm">
              Dibuat dengan ❤️ oleh Davina Anandia • {currentYear}
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Alat bantu perhitungan nilai akademik untuk siswa
            </p>
          </div>
          
          <div className="flex space-x-4">
            <a
              href="https://www.instagram.com/davinannd"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-800 transition-colors"
              aria-label="Instagram"
            >
              <FiInstagram size={20} />
            </a>
            
            <a
              href="https://github.com/davvanandia"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-800 transition-colors"
              aria-label="GitHub"
            >
              <FiGithub size={20} />
            </a>
          </div>
        </div>
        
        <div className="text-center mt-6 pt-6 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            © {currentYear} Rapor Agit. Semua hak dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}