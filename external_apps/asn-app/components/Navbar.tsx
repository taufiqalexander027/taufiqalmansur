import React from 'react';
import { BeeLogo } from './BeeLogo';
import { ViewState } from '../types';
import { Home } from 'lucide-react';

interface NavbarProps {
  currentView: ViewState;
  onHomeClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onHomeClick }) => {
  return (
    <nav className="bg-blue-900 text-white shadow-lg sticky top-0 z-50 no-print">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={onHomeClick}>
          <BeeLogo className="w-10 h-10" />
          <div>
            <h1 className="text-lg font-bold leading-tight">E-LAPORAN ASN</h1>
            <p className="text-xs text-blue-200">Provinsi Jawa Timur</p>
            <p className="text-[10px] italic text-blue-300 mt-0.5">
              Created by <span className="font-bold text-yellow-300">Taufiq Al Mansur</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {currentView !== 'HOME' && (
            <button
              onClick={onHomeClick}
              className="p-2 bg-blue-800 rounded-full hover:bg-blue-700 transition-colors"
            >
              <Home size={20} />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};