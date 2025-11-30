// Location: resources/js/Components/Welcome/Navigation.jsx

import React from 'react';
import { Package } from 'lucide-react';

const Navigation = ({ mobileNavOpen, setMobileNavOpen }) => {
  const gradients = {
    primary: 'bg-gradient-to-r from-amber-700 to-orange-700',
  };

  return (
    <>
      <nav className="relative z-10">
        <div className="container mx-auto flex items-center justify-between py-6 px-6">
          {/* Logo Icon Only - No Text */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-700 to-orange-800 rounded-xl flex items-center justify-center shadow-lg">
              <Package className="w-7 h-7 text-white" />
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-stone-800 hover:text-amber-800 font-medium transition-colors">
              Features
            </a>
            <a href="#stats" className="text-stone-800 hover:text-amber-800 font-medium transition-colors">
              Statistics
            </a>
            <a href="#testimonials" className="text-stone-800 hover:text-amber-800 font-medium transition-colors">
              Testimonials
            </a>
            <a href="#contact" className="text-stone-800 hover:text-amber-800 font-medium transition-colors">
              Contact
            </a>
            <a href="/login" className="px-4 py-2 rounded-lg bg-white border-2 border-amber-400 text-amber-800 font-semibold hover:border-amber-600 transition-all">
              Login
            </a>
            <a href="/register" className={`px-6 py-2.5 rounded-lg ${gradients.primary} text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all`}>
              Register
            </a>
          </div>

          <button
            className="md:hidden p-2 rounded-lg bg-white/70 backdrop-blur border border-amber-300"
            onClick={() => setMobileNavOpen(v => !v)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>

      {mobileNavOpen && (
        <div className="md:hidden relative z-10 container mx-auto px-6 pb-4 space-y-2">
          <a href="#features" className="block px-4 py-3 bg-white/80 backdrop-blur rounded-lg border border-amber-300 text-stone-800 font-medium">
            Features
          </a>
          <a href="#stats" className="block px-4 py-3 bg-white/80 backdrop-blur rounded-lg border border-amber-300 text-stone-800 font-medium">
            Statistics
          </a>
          <a href="#testimonials" className="block px-4 py-3 bg-white/80 backdrop-blur rounded-lg border border-amber-300 text-stone-800 font-medium">
            Testimonials
          </a>
          <a href="#contact" className="block px-4 py-3 bg-white/80 backdrop-blur rounded-lg border border-amber-300 text-stone-800 font-medium">
            Contact
          </a>
          <div className="flex gap-2">
            <a href="/login" className="flex-1 px-4 py-3 rounded-lg bg-white border-2 border-amber-400 text-amber-800 font-semibold text-center">
              Login
            </a>
            <a href="/register" className={`flex-1 px-4 py-3 rounded-lg ${gradients.primary} text-white font-semibold text-center`}>
              Register
            </a>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;