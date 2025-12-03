/**
 * Parameter Info Component
 * Displays the parameters used for S-box generation
 */

import React from 'react';

interface ParameterInfoProps {
  matrix: number[];
  matrixName: string;
  constant: number;
  defaultMatrix?: number[];
  defaultConstant?: number;
}

const ParameterInfo: React.FC<ParameterInfoProps> = ({
  matrix,
  matrixName,
  constant,
  defaultMatrix,
  defaultConstant,
}) => {
  const isDefault = defaultMatrix && 
    JSON.stringify(matrix) === JSON.stringify(defaultMatrix) &&
    constant === (defaultConstant || 0x63);

  return (
    <div className="glass-effect rounded-xl p-6 mb-6 border border-text-primary/10">
      <h3 className="font-subheading text-xl text-white mb-4">
        S-box Parameters
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Matrix Info */}
        <div className="space-y-3">
          <div>
            <label className="font-body text-sm font-semibold text-text-primary block mb-2">
              Affine Transformation Matrix
            </label>
            <div className="bg-surface-dark/50 rounded-lg p-4 border border-text-primary/20">
              <p className="font-body font-bold text-white mb-2">{matrixName}</p>
              <div className="font-mono text-xs text-text-primary space-y-1 max-h-40 overflow-y-auto">
                {matrix.map((row, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-12 text-text-primary/70">Row {i}:</span>
                    <span className="text-white">{row.toString(2).padStart(8, '0')}</span>
                    <span className="text-light-grey">(0x{row.toString(16).toUpperCase().padStart(2, '0')})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Constant Info */}
        <div className="space-y-3">
          <div>
            <label className="font-body text-sm font-semibold text-text-primary block mb-2">
              Constant Vector (C)
            </label>
            <div className="bg-surface-dark/50 rounded-lg p-4 border border-text-primary/20">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono text-2xl font-bold text-white">
                  0x{constant.toString(16).toUpperCase().padStart(2, '0')}
                </span>
                <span className="font-body text-text-primary">
                  ({constant} decimal)
                </span>
              </div>
              {defaultConstant && constant !== defaultConstant && (
                <p className="font-body text-xs text-light-grey mt-2">
                  Different from default (0x{defaultConstant.toString(16).toUpperCase()})
                </p>
              )}
            </div>
          </div>

          {/* Formula */}
          <div>
            <label className="font-body text-sm font-semibold text-text-primary block mb-2">
              Generation Formula
            </label>
            <div className="bg-surface-dark/50 rounded-lg p-4 border border-text-primary/20">
              <p className="font-mono text-sm text-white">
                S(x) = Matrix × x^(-1) ⊕ 0x{constant.toString(16).toUpperCase()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Indicator */}
      {isDefault && (
        <div className="mt-4 p-3 bg-white/10 border border-white/30 rounded-lg">
          <p className="font-body text-sm text-white text-center">
            Using default parameters (K44 Matrix - Best Performer, C=0x63)
          </p>
        </div>
      )}
      
      {!isDefault && (
        <div className="mt-4 p-3 bg-surface-dark/50 border border-text-primary/30 rounded-lg">
          <p className="font-body text-sm text-text-primary text-center">
            Custom parameters active - Different from defaults
          </p>
        </div>
      )}
    </div>
  );
};

export default ParameterInfo;

