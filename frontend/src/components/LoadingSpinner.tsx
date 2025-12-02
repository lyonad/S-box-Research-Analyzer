/**
 * Loading Spinner Component
 */

import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative w-20 h-20">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="w-20 h-20 border-4 border-primary-light/30 border-t-accent-pink rounded-full animate-spin"></div>
        </div>
      </div>
      <p className="mt-6 font-body text-primary-light font-medium text-lg">{message}</p>
    </div>
  );
};

export default LoadingSpinner;

