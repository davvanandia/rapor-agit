'use client';

import { useState, useEffect } from 'react';
import { FiArrowUp } from 'react-icons/fi';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed right-6 bottom-6 z-50 p-3 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 
        text-white shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}
      aria-label="Scroll to top"
    >
      <div className="relative">
        <FiArrowUp size={24} />
        <div className="absolute inset-0 animate-ping bg-blue-400/30 rounded-full"></div>
      </div>
    </button>
  );
}