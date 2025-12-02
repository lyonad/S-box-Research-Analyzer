/**
 * Header Component
 */

import React from 'react';

interface HeaderProps {
  backendStatus: 'active' | 'inactive' | 'checking';
}

const Header: React.FC<HeaderProps> = ({ backendStatus }) => {
  const getStatusConfig = () => {
    switch (backendStatus) {
      case 'active':
        return {
          color: 'bg-green-500',
          text: 'Active',
          textColor: 'text-green-400',
          pulse: true,
        };
      case 'inactive':
        return {
          color: 'bg-red-500',
          text: 'Inactive',
          textColor: 'text-red-400',
          pulse: false,
        };
      case 'checking':
      default:
        return {
          color: 'bg-yellow-500',
          text: 'Checking...',
          textColor: 'text-yellow-400',
          pulse: true,
        };
    }
  };

  const statusConfig = getStatusConfig();

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
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-primary-light font-semibold uppercase tracking-wide hidden md:block">
                Backend Status
              </div>
              <div className="flex items-center gap-2 mt-1 justify-end md:justify-start">
                <div 
                  className={`w-2 h-2 ${statusConfig.color} rounded-full ${
                    statusConfig.pulse ? 'animate-pulse' : ''
                  }`}
                  title={`Backend is ${statusConfig.text.toLowerCase()}`}
                ></div>
                <span className={`text-sm font-semibold ${statusConfig.textColor} hidden sm:inline`}>
                  {statusConfig.text}
                </span>
                <span className={`text-xs font-semibold ${statusConfig.textColor} sm:hidden`}>
                  {backendStatus === 'active' ? 'ON' : backendStatus === 'inactive' ? 'OFF' : '...'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

