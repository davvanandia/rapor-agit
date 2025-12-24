'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FiHome, FiBarChart2, FiMenu, FiX } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { getStoredData } from '@/lib/storage';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRenderMenu, setShouldRenderMenu] = useState(false);
  
  // Refs untuk mendeteksi klik di luar menu
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const checkHasData = () => {
    const data = getStoredData();
    return data.some(semester => semester.subjects.length > 0);
  };

  const handleAnalyticsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!checkHasData()) {
      Swal.fire({
        title: 'Belum Ada Data',
        html: '<p class="text-gray-600">Silakan input data semester terlebih dahulu sebelum melihat analisis.</p>',
        icon: 'info',
        confirmButtonText: 'Mengerti',
        background: '#ffffff',
        color: '#374151',
        customClass: {
          popup: 'rounded-lg border border-gray-200'
        }
      });
    } else {
      router.push('/results');
      closeMenu();
    }
  };

  const navItems = [
    { href: '/', label: 'Dashboard', icon: FiHome, onClick: undefined },
    { href: '/results', label: 'Analisis', icon: FiBarChart2, onClick: handleAnalyticsClick },
  ];

  // Fungsi untuk membuka menu dengan animasi
  const openMenu = () => {
    setIsMenuOpen(true);
    setShouldRenderMenu(true);
    setIsAnimating(true);
  };

  // Fungsi untuk menutup menu dengan animasi
  const closeMenu = () => {
    setIsAnimating(false);
    
    // Delay untuk menunggu animasi keluar selesai sebelum menghapus dari DOM
    setTimeout(() => {
      setIsMenuOpen(false);
      setShouldRenderMenu(false);
    }, 300); // Sesuaikan dengan durasi animasi
  };

  // Toggle menu
  const toggleMenu = () => {
    if (isMenuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  // Effect untuk menangani klik di luar menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Jika menu terbuka dan klik dilakukan di luar menu dan tombol menu
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        closeMenu();
      }
    };

    // Tambahkan event listener saat komponen mount
    document.addEventListener('mousedown', handleClickOutside);
    
    // Bersihkan event listener saat komponen unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Effect untuk menutup menu saat route berubah
  useEffect(() => {
    closeMenu();
  }, [pathname]);

  // Effect untuk mencegah scroll saat menu mobile terbuka
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen]);

  // Classes untuk animasi
  const menuClasses = `md:hidden pb-4 transition-all duration-300 ease-in-out transform ${
    isAnimating && shouldRenderMenu 
      ? 'opacity-100 translate-y-0' 
      : 'opacity-0 -translate-y-4'
  }`;

  const overlayClasses = `fixed inset-0 bg-black/20 z-40 md:hidden transition-opacity duration-300 ${
    isAnimating && shouldRenderMenu 
      ? 'opacity-100' 
      : 'opacity-0'
  }`;

  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo dengan gambar */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-md overflow-hidden flex items-center justify-center">
                <img 
                  src="/raporagit.png" 
                  alt="Rapor Agit Logo" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback jika gambar tidak ditemukan
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="w-full h-full bg-blue-600 flex items-center justify-center">
                          <span class="text-white font-bold text-sm">RA</span>
                        </div>
                      `;
                    }
                  }}
                />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Rapor Agit</h1>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                if (item.onClick) {
                  return (
                    <button
                      key={item.href}
                      onClick={item.onClick}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive 
                          ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={16} />
                      <span>{item.label}</span>
                    </button>
                  );
                } else {
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive 
                          ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={16} />
                      <span>{item.label}</span>
                    </Link>
                  );
                }
              })}
            </div>

            {/* Mobile Menu Button */}
            <button
              ref={menuButtonRef}
              onClick={toggleMenu}
              className="md:hidden p-2 text-gray-700 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors duration-200"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>

          {/* Mobile Menu */}
          <div ref={menuRef}>
            {shouldRenderMenu && (
              <div className={menuClasses}>
                <div className="space-y-1 pt-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    if (item.onClick) {
                      return (
                        <button
                          key={item.href}
                          onClick={(e) => {
                            item.onClick!(e);
                          }}
                          className={`flex items-center space-x-3 px-4 py-3 rounded-md w-full text-left transition-all duration-200 ${
                            isActive 
                              ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                          }`}
                          style={{
                            animation: isAnimating && shouldRenderMenu 
                              ? 'slideIn 0.3s ease-out forwards' 
                              : 'none',
                            animationDelay: item.href === '/' ? '0.05s' : '0.1s'
                          }}
                        >
                          <Icon size={18} />
                          <span className="font-medium">{item.label}</span>
                        </button>
                      );
                    } else {
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center space-x-3 px-4 py-3 rounded-md transition-all duration-200 ${
                            isActive 
                              ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                          }`}
                          style={{
                            animation: isAnimating && shouldRenderMenu 
                              ? 'slideIn 0.3s ease-out forwards' 
                              : 'none',
                            animationDelay: item.href === '/' ? '0.05s' : '0.1s'
                          }}
                        >
                          <Icon size={18} />
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      );
                    }
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Overlay untuk mobile menu - HANYA DI MOBILE */}
      {shouldRenderMenu && (
        <div 
          className={overlayClasses}
          onClick={closeMenu}
        />
      )}

      {/* CSS untuk animasi */}
      <style jsx global>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}