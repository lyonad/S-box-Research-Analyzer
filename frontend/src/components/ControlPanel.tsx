/**
 * Control Panel Component
 */

import React from 'react';

interface ControlPanelProps {
  onGenerateAndCompare: () => void;
  loading: boolean;
  showCustomOption?: boolean;
  hasCustomParams?: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  onGenerateAndCompare, 
  loading, 
  showCustomOption = false,
  hasCustomParams = false
}) => {
  return (
    <div className="glass-effect rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 border border-text-primary/10">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6">
        <div className="flex-1 w-full lg:w-auto">
          <h2 className="font-subheading text-xl sm:text-2xl md:text-3xl text-white mb-2 sm:mb-3">
            Control Panel
          </h2>
          <p className="font-body text-text-primary text-sm sm:text-base mb-3 sm:mb-4">
            Generate and analyze S-boxes using multiple affine matrices (K44, K43, K45, AES, and custom) with comprehensive cryptographic strength testing
          </p>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {/* Multiple Matrices Badge */}
            <div className="relative">
              <div className="relative px-3 sm:px-4 py-1.5 sm:py-2 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden">
                {/* Continuous Shimmer Animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                {/* Pulsing Border Glow */}
                <div className="absolute inset-0 rounded-lg border border-white/20 animate-pulse opacity-50"></div>
                <div className="flex items-center relative z-10">
                  <span className="text-xs sm:text-sm font-semibold text-white">Multiple Matrices</span>
                </div>
              </div>
            </div>

            {/* GF(2⁸) Badge */}
            <div className="relative">
              <div className="relative px-3 sm:px-4 py-1.5 sm:py-2 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden">
                {/* Continuous Shimmer Animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" style={{ animationDelay: '0.5s' }}></div>
                {/* Pulsing Border Glow */}
                <div className="absolute inset-0 rounded-lg border border-white/20 animate-pulse opacity-50" style={{ animationDelay: '0.5s' }}></div>
                <div className="flex items-center relative z-10">
                  <span className="text-xs sm:text-sm font-semibold text-white">GF(2⁸)</span>
                </div>
              </div>
            </div>

            {/* Polynomial Badge */}
            <div className="relative">
              <div className="relative px-3 sm:px-4 py-1.5 sm:py-2 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden">
                {/* Continuous Shimmer Animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" style={{ animationDelay: '1s' }}></div>
                {/* Pulsing Border Glow */}
                <div className="absolute inset-0 rounded-lg border border-white/20 animate-pulse opacity-50" style={{ animationDelay: '1s' }}></div>
                <div className="flex items-center relative z-10">
                  <span className="text-xs sm:text-sm font-semibold text-white/90">Polynomial: 0x11B</span>
                </div>
              </div>
            </div>

            {/* Customizable Badge */}
            <div className="relative">
              <div className="relative px-3 sm:px-4 py-1.5 sm:py-2 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden">
                {/* Continuous Shimmer Animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" style={{ animationDelay: '1.5s' }}></div>
                {/* Pulsing Border Glow */}
                <div className="absolute inset-0 rounded-lg border border-white/20 animate-pulse opacity-50" style={{ animationDelay: '1.5s' }}></div>
                <div className="flex items-center relative z-10">
                  <span className="text-xs sm:text-sm font-semibold text-white/90">Customizable</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-2 sm:gap-3 w-full lg:w-auto">
          <button
            onClick={onGenerateAndCompare}
            disabled={loading}
            className={`
              font-body px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base md:text-lg
              transition-all duration-300 transform shadow-lg
              ${loading 
                ? 'bg-surface-dark text-text-primary/50 cursor-not-allowed border border-text-primary/30 opacity-60' 
                : 'bg-white text-black hover:bg-dark-grey hover:text-white hover:shadow-2xl hover:brightness-95'
              }
            `}
          >
            {loading ? (
              <span className="flex items-center gap-3 justify-center">
                <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </span>
            ) : (
              <span className="flex items-center gap-3 justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate & Analyze
              </span>
            )}
          </button>
          
          <div className="font-body text-sm text-text-primary text-center">
            Performs complete cryptographic analysis
            {hasCustomParams && (
              <span className="block mt-1 text-white font-semibold">
                Custom S-box will be included automatically
              </span>
            )}
          </div>
          
          {showCustomOption && (
            <div className="mt-2 text-center">
              <p className="font-body text-xs text-text-primary/70">
                {hasCustomParams 
                  ? 'Custom parameters detected - will be included in comparison'
                  : 'Use Research Parameters panel above to customize'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;

