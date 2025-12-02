/**
 * Header Component
 */

import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full bg-neutral-dark border-b border-primary-light/10 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src="/images/UNNES Logo.png" 
              alt="UNNES" 
              className="w-12 h-12 object-contain"
            />
            <div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold text-white">
                AES S-box Research Analyzer
              </h1>
              <p className="font-body text-primary-light text-xs md:text-sm">
                Affine Matrices Exploration Platform
              </p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-primary-light font-semibold uppercase tracking-wide">Status</div>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-accent-pink rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-accent-pink">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

