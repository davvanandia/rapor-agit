"use client";

import { FiInstagram, FiGithub } from "react-icons/fi";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Text */}
          <p className="text-sm text-gray-500 text-center md:text-left">
            © {currentYear} Rapor Agit By Davina Anandia - All Rights Reserved
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            <a
              href="https://www.instagram.com/davinannd"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-gray-500 hover:text-gray-800 transition-colors"
            >
              <FiInstagram size={18} />
            </a>

            <a
              href="https://github.com/davvanandia"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="text-gray-500 hover:text-gray-800 transition-colors"
            >
              <FiGithub size={18} />
            </a>

            <a
  href="https://www.tiktok.com/@davinadapinskuyy"
  target="_blank"
  rel="noopener noreferrer"
  aria-label="TikTok"
  className="text-gray-500 hover:text-gray-800 transition-colors"
  title="TikTok"
>
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="18" 
    height="18" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
