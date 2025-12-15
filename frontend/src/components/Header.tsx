/**
 * Header Component
 */

import React, { useState, useEffect } from 'react';

interface HeaderProps {
  backendStatus: 'active' | 'inactive' | 'checking';
}

const Header: React.FC<HeaderProps> = ({ backendStatus }) => {
  const [isHidden, setIsHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Only hide/show after scrolling past 100px to prevent flickering at top
      if (currentScrollY > 100) {
        // Hide when scrolling down, show when scrolling up
        if (currentScrollY > lastScrollY && !isHidden) {
          setIsHidden(true);
        } else if (currentScrollY < lastScrollY && isHidden) {
          setIsHidden(false);
        }
      } else {
        // Always show at the top of the page
        setIsHidden(false);
      }

      setLastScrollY(currentScrollY);
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY, isHidden]);

  const getStatusConfig = () => {
    switch (backendStatus) {
      case 'active':
        return {
          color: 'bg-green-400',
          text: 'Active',
          textColor: 'text-green-300',
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
          color: 'bg-yellow-400',
          text: 'Checking...',
          textColor: 'text-yellow-300',
          pulse: true,
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <header className={`w-full bg-surface-dark border-b border-text-primary/20 shadow-lg sticky top-0 z-50 transition-transform duration-300 ease-in-out ${
      isHidden ? '-translate-y-full' : 'translate-y-0'
    }`}>
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1">
            <img 
              src="/images/LOGO.png" 
              alt="Logo" 
              className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-contain flex-shrink-0"
            />
            <div className="min-w-0">
              <h1 className="font-heading text-sm sm:text-lg md:text-2xl lg:text-3xl text-white truncate">
                AES S-box Research Analyzer
              </h1>
              <p className="font-body text-text-primary text-xs md:text-sm truncate hidden sm:block">
                Affine Matrices Exploration Platform
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-text-primary font-semibold uppercase tracking-wide hidden md:block">
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

