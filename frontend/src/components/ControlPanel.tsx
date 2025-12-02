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
    <div className="glass-effect rounded-2xl p-8 mb-8 border border-primary-light/10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex-1">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-3">
            Control Panel
          </h2>
          <p className="font-body text-primary-light text-base mb-4">
            Generate and analyze S-boxes using multiple affine matrices (K44, K43, K45, AES, and custom) with comprehensive cryptographic strength testing
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-4 py-2 bg-accent-pink/20 text-accent-pink text-sm font-semibold rounded-full border border-accent-pink/30">
              Multiple Matrices
            </span>
            <span className="px-4 py-2 bg-accent-muted/20 text-accent-muted text-sm font-semibold rounded-full border border-accent-muted/30">
              GF(2⁸)
            </span>
            <span className="px-4 py-2 bg-primary-light/10 text-primary-light text-sm font-semibold rounded-full border border-primary-light/20">
              Polynomial: 0x11B
            </span>
            <span className="px-4 py-2 bg-primary-light/10 text-primary-light text-sm font-semibold rounded-full border border-primary-light/20">
              Customizable
            </span>
          </div>
        </div>
        
        <div className="flex flex-col gap-3 w-full md:w-auto">
          <button
            onClick={onGenerateAndCompare}
            disabled={loading}
            className={`
              font-body px-10 py-5 rounded-xl font-bold text-white text-lg
              transition-all duration-300 transform shadow-lg
              ${loading 
                ? 'bg-primary-light/20 cursor-not-allowed' 
                : 'bg-accent-pink hover:bg-accent-muted hover:shadow-2xl hover:scale-105'
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
          
          <div className="font-body text-sm text-primary-light text-center">
            Performs complete cryptographic analysis
            {hasCustomParams && (
              <span className="block mt-1 text-accent-pink font-semibold">
                Custom S-box will be included automatically
              </span>
            )}
          </div>
          
          {showCustomOption && (
            <div className="mt-2 text-center">
              <p className="font-body text-xs text-primary-light/70">
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

