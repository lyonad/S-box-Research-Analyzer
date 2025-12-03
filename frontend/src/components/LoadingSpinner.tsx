/**
 * Loading Spinner Component
 * Enhanced with awesome animation
 */

import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading...', 
  size = 'lg' 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-24 h-24'
  };

  const containerSize = sizeClasses[size];

  // For small size, just show simple spinner
  if (size === 'sm') {
    return (
      <div className={`${containerSize} border-3 border-text-primary/30 border-t-white rounded-full animate-spin`}></div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative" style={{ width: '120px', height: '120px' }}>
        {/* Outer rotating ring */}
        <div className="absolute inset-0 rounded-full border-2 border-white/10 animate-[spin_3s_linear_infinite]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
        </div>

        {/* Middle counter-rotating ring */}
        <div className="absolute inset-[15px] rounded-full border-2 border-white/20 animate-[spin_2s_linear_infinite_reverse]">
          <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white/80 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.6)]"></div>
        </div>

        {/* Inner fast spinning ring */}
        <div className="absolute inset-[30px] rounded-full border-2 border-white/30 animate-[spin_1s_linear_infinite]">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2.5 h-2.5 bg-gradient-to-br from-white to-light-grey rounded-full shadow-[0_0_10px_rgba(255,255,255,0.7)]"></div>
        </div>

        {/* Center pulsing dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 w-4 h-4 bg-white rounded-full animate-ping opacity-75"></div>
            <div className="relative w-4 h-4 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.9)]"></div>
          </div>
        </div>

        {/* Orbiting particles */}
        <div className="absolute inset-[-10px] animate-[spin_4s_linear_infinite]">
          <div className="absolute top-1/4 right-0 w-1.5 h-1.5 bg-white/60 rounded-full"></div>
        </div>
        <div className="absolute inset-[-10px] animate-[spin_5s_linear_infinite_reverse]">
          <div className="absolute bottom-1/4 left-0 w-1.5 h-1.5 bg-white/60 rounded-full"></div>
        </div>
      </div>

      {/* Message with typing effect */}
      <p className="mt-8 font-body text-white font-medium text-lg animate-pulse">
        {message}
      </p>
      
      {/* Progress dots */}
      <div className="flex gap-2 mt-4">
        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
