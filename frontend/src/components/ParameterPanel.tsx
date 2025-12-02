/**
 * Parameter Panel Component
 * Allows researchers to tweak S-box generation parameters
 */

import React, { useState } from 'react';
import ParameterPresets from './ParameterPresets';

interface ParameterPanelProps {
  onParametersChange: (params: {
    matrix: number[];
    constant: number;
    useCustom: boolean;
  }) => void;
  defaultMatrix: number[];
  defaultConstant: number;
  autoGenerate?: boolean;
}

const ParameterPanel: React.FC<ParameterPanelProps> = ({
  onParametersChange,
  defaultMatrix,
  defaultConstant,
  autoGenerate = false,
}) => {
  const [useCustom, setUseCustom] = useState(false);
  const [matrixCategory, setMatrixCategory] = useState<'paper' | 'standard' | 'variations' | 'custom'>('paper');
  const [selectedMatrix, setSelectedMatrix] = useState<string>('k44');
  const [customMatrix, setCustomMatrix] = useState<string[]>(defaultMatrix.map(m => m.toString(2).padStart(8, '0')));
  const [constant, setConstant] = useState<number>(defaultConstant);
  const [constantInput, setConstantInput] = useState<string>(defaultConstant.toString(16).toUpperCase().padStart(2, '0'));

  // Paper Matrices - From the research paper
  const PAPER_MATRICES = {
    k44: {
      name: 'K44 Matrix (Best Performer)',
      description: 'NL=112, SAC=0.50073, BIC-NL=112',
      matrix: [0b01010111, 0b10101011, 0b11010101, 0b11101010, 0b01110101, 0b10111010, 0b01011101, 0b10101110],
    },
    k43: {
      name: 'K43 Matrix',
      description: 'Alternative from paper exploration',
      matrix: [0b11010101, 0b10101011, 0b01010111, 0b11101010, 0b01110101, 0b10111010, 0b01011101, 0b10101110],
    },
    k45: {
      name: 'K45 Matrix',
      description: 'Alternative from paper exploration',
      matrix: [0b01010111, 0b10101011, 0b11010101, 0b11101010, 0b10111010, 0b01110101, 0b01011101, 0b10101110],
    },
  };

  // Standard Matrices
  const STANDARD_MATRICES = {
    aes: {
      name: 'AES Matrix (Rijndael)',
      description: 'Standard AES S-box matrix',
      matrix: [0b11110001, 0b11100011, 0b11000111, 0b10001111, 0b00011111, 0b00111110, 0b01111100, 0b11111000],
    },
  };

  // Common Variations (for experimentation)
  const VARIATION_MATRICES = {
    identity: {
      name: 'Identity Matrix',
      description: 'For testing and comparison',
      matrix: [0b10000000, 0b01000000, 0b00100000, 0b00010000, 0b00001000, 0b00000100, 0b00000010, 0b00000001],
    },
    k44_rotated: {
      name: 'K44 Rotated',
      description: 'Rotated version of K44 for comparison',
      matrix: [0b10101110, 0b01010111, 0b10101011, 0b11010101, 0b11101010, 0b01110101, 0b10111010, 0b01011101],
    },
  };

  const getCurrentMatrix = (): number[] => {
    if (matrixCategory === 'paper' && PAPER_MATRICES[selectedMatrix as keyof typeof PAPER_MATRICES]) {
      return [...PAPER_MATRICES[selectedMatrix as keyof typeof PAPER_MATRICES].matrix];
    }
    if (matrixCategory === 'standard' && STANDARD_MATRICES[selectedMatrix as keyof typeof STANDARD_MATRICES]) {
      return [...STANDARD_MATRICES[selectedMatrix as keyof typeof STANDARD_MATRICES].matrix];
    }
    if (matrixCategory === 'variations' && VARIATION_MATRICES[selectedMatrix as keyof typeof VARIATION_MATRICES]) {
      return [...VARIATION_MATRICES[selectedMatrix as keyof typeof VARIATION_MATRICES].matrix];
    }
    if (matrixCategory === 'custom') {
      try {
        const matrixValues = customMatrix.map(r => {
          const trimmed = r.trim();
          if (trimmed.startsWith('0x') || trimmed.match(/^[0-9A-Fa-f]{1,2}$/)) {
            return parseInt(trimmed.replace('0x', ''), 16) & 0xFF;
          } else if (trimmed.match(/^[01]{1,8}$/)) {
            return parseInt(trimmed, 2) & 0xFF;
          } else {
            const parsed = parseInt(trimmed, 10);
            return (!isNaN(parsed) && parsed >= 0 && parsed <= 255) ? parsed : 0;
          }
        });
        // Validate all values are valid
        if (matrixValues.every(v => v >= 0 && v <= 255) && matrixValues.length === 8) {
          return matrixValues;
        }
      } catch (e) {
        // Return default on error
      }
    }
    return [...PAPER_MATRICES.k44.matrix]; // Default fallback
  };

  const handleCategoryChange = (category: 'paper' | 'standard' | 'variations' | 'custom') => {
    setMatrixCategory(category);
    if (category === 'paper') {
      setSelectedMatrix('k44');
      applyParameters(PAPER_MATRICES.k44.matrix, constant);
    } else if (category === 'standard') {
      setSelectedMatrix('aes');
      applyParameters(STANDARD_MATRICES.aes.matrix, constant);
    } else if (category === 'variations') {
      setSelectedMatrix('identity');
      applyParameters(VARIATION_MATRICES.identity.matrix, constant);
    }
  };

  const handleMatrixSelect = (matrixKey: string) => {
    setSelectedMatrix(matrixKey);
    const matrix = getMatrixByKey(matrixKey);
    if (matrix) {
      applyParameters(matrix, constant);
    }
  };

  const getMatrixByKey = (key: string) => {
    if (PAPER_MATRICES[key as keyof typeof PAPER_MATRICES]) {
      return PAPER_MATRICES[key as keyof typeof PAPER_MATRICES].matrix;
    }
    if (STANDARD_MATRICES[key as keyof typeof STANDARD_MATRICES]) {
      return STANDARD_MATRICES[key as keyof typeof STANDARD_MATRICES].matrix;
    }
    if (VARIATION_MATRICES[key as keyof typeof VARIATION_MATRICES]) {
      return VARIATION_MATRICES[key as keyof typeof VARIATION_MATRICES].matrix;
    }
    return null;
  };

  const handleMatrixRowChange = (index: number, value: string) => {
    const newMatrix = [...customMatrix];
    newMatrix[index] = value;
    setCustomMatrix(newMatrix);
    
    if (matrixCategory === 'custom') {
      try {
        const matrixValues = newMatrix.map(row => {
          // Accept binary (8 bits) or hex (0xXX or XX)
          const trimmed = row.trim();
          if (trimmed.startsWith('0x') || trimmed.match(/^[0-9A-Fa-f]{1,2}$/)) {
            return parseInt(trimmed.replace('0x', ''), 16) & 0xFF;
          } else if (trimmed.match(/^[01]{1,8}$/)) {
            return parseInt(trimmed, 2) & 0xFF;
          } else {
            // Try to parse as decimal
            const parsed = parseInt(trimmed, 10);
            if (!isNaN(parsed) && parsed >= 0 && parsed <= 255) {
              return parsed;
            }
            throw new Error('Invalid format');
          }
        });
        // Only apply if all rows are valid
        if (matrixValues.every(v => !isNaN(v) && v >= 0 && v <= 255)) {
          applyParameters(matrixValues, constant);
        }
      } catch (e) {
        // Invalid input, don't update
      }
    }
  };

  const handleConstantChange = (value: string) => {
    setConstantInput(value);
    try {
      let newConstant: number;
      if (value.startsWith('0x') || value.match(/^[0-9A-Fa-f]{1,2}$/)) {
        newConstant = parseInt(value.replace('0x', ''), 16);
      } else {
        newConstant = parseInt(value, 10);
      }
      
      if (!isNaN(newConstant) && newConstant >= 0 && newConstant <= 255) {
        setConstant(newConstant);
        const currentMatrix = getCurrentMatrix();
        // Only apply if we have a valid matrix
        if (currentMatrix && currentMatrix.length === 8) {
          applyParameters(currentMatrix, newConstant);
        }
      }
    } catch (e) {
      // Invalid input
    }
  };

  const applyParameters = (matrix: number[], constValue: number) => {
    onParametersChange({
      matrix,
      constant: constValue,
      useCustom: matrixCategory === 'custom',
    });
  };

  const resetToDefaults = () => {
    setMatrixCategory('paper');
    setSelectedMatrix('k44');
    setConstant(defaultConstant);
    setConstantInput(defaultConstant.toString(16).toUpperCase().padStart(2, '0'));
    setCustomMatrix(defaultMatrix.map(m => m.toString(2).padStart(8, '0')));
    applyParameters(PAPER_MATRICES.k44.matrix, defaultConstant);
  };

  return (
    <div className="glass-effect rounded-2xl p-6 mb-8 border border-primary-light/10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-heading text-2xl font-bold text-white mb-2">
            🔬 Research Parameters
          </h3>
          <p className="font-body text-sm text-primary-light">
            Adjust S-box generation parameters for experimentation
          </p>
        </div>
        <button
          onClick={resetToDefaults}
          className="px-4 py-2 bg-primary-light/20 hover:bg-primary-light/30 text-primary-light rounded-lg font-body text-sm font-medium transition-colors"
        >
          Reset to Defaults
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Matrix Selection */}
        <div>
          <label className="block font-body text-sm font-semibold text-white mb-3">
            Affine Transformation Matrix
          </label>
          
          {/* Category Selection */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <button
              onClick={() => handleCategoryChange('paper')}
              className={`px-3 py-2 rounded-lg font-body text-xs font-semibold transition-all ${
                matrixCategory === 'paper'
                  ? 'bg-accent-pink text-white'
                  : 'bg-primary-light/10 text-primary-light hover:bg-primary-light/20'
              }`}
            >
              Paper
            </button>
            <button
              onClick={() => handleCategoryChange('standard')}
              className={`px-3 py-2 rounded-lg font-body text-xs font-semibold transition-all ${
                matrixCategory === 'standard'
                  ? 'bg-accent-pink text-white'
                  : 'bg-primary-light/10 text-primary-light hover:bg-primary-light/20'
              }`}
            >
              Standard
            </button>
            <button
              onClick={() => handleCategoryChange('variations')}
              className={`px-3 py-2 rounded-lg font-body text-xs font-semibold transition-all ${
                matrixCategory === 'variations'
                  ? 'bg-accent-pink text-white'
                  : 'bg-primary-light/10 text-primary-light hover:bg-primary-light/20'
              }`}
            >
              Variations
            </button>
            <button
              onClick={() => handleCategoryChange('custom')}
              className={`px-3 py-2 rounded-lg font-body text-xs font-semibold transition-all ${
                matrixCategory === 'custom'
                  ? 'bg-accent-pink text-white'
                  : 'bg-primary-light/10 text-primary-light hover:bg-primary-light/20'
              }`}
            >
              Custom
            </button>
          </div>

          {/* Matrix Selection within Category */}
          {matrixCategory === 'paper' && (
            <div className="space-y-2 mb-4">
              {Object.entries(PAPER_MATRICES).map(([key, matrix]) => (
                <button
                  key={key}
                  onClick={() => handleMatrixSelect(key)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                    selectedMatrix === key && matrixCategory === 'paper'
                      ? 'bg-accent-pink/20 border-accent-pink text-white'
                      : 'bg-neutral-dark/50 border-primary-light/20 text-primary-light hover:border-primary-light/40'
                  }`}
                >
                  <div className="font-body font-semibold text-sm">{matrix.name}</div>
                  <div className="font-body text-xs text-primary-light/70 mt-1">{matrix.description}</div>
                </button>
              ))}
            </div>
          )}

          {matrixCategory === 'standard' && (
            <div className="space-y-2 mb-4">
              {Object.entries(STANDARD_MATRICES).map(([key, matrix]) => (
                <button
                  key={key}
                  onClick={() => handleMatrixSelect(key)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                    selectedMatrix === key && matrixCategory === 'standard'
                      ? 'bg-accent-pink/20 border-accent-pink text-white'
                      : 'bg-neutral-dark/50 border-primary-light/20 text-primary-light hover:border-primary-light/40'
                  }`}
                >
                  <div className="font-body font-semibold text-sm">{matrix.name}</div>
                  <div className="font-body text-xs text-primary-light/70 mt-1">{matrix.description}</div>
                </button>
              ))}
            </div>
          )}

          {matrixCategory === 'variations' && (
            <div className="space-y-2 mb-4">
              {Object.entries(VARIATION_MATRICES).map(([key, matrix]) => (
                <button
                  key={key}
                  onClick={() => handleMatrixSelect(key)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                    selectedMatrix === key && matrixCategory === 'variations'
                      ? 'bg-accent-pink/20 border-accent-pink text-white'
                      : 'bg-neutral-dark/50 border-primary-light/20 text-primary-light hover:border-primary-light/40'
                  }`}
                >
                  <div className="font-body font-semibold text-sm">{matrix.name}</div>
                  <div className="font-body text-xs text-primary-light/70 mt-1">{matrix.description}</div>
                </button>
              ))}
            </div>
          )}

          {/* Matrix Input (8 rows) */}
          {matrixCategory === 'custom' && (
            <div className="space-y-2">
              <p className="font-body text-xs text-primary-light mb-2">
                Enter 8 rows as binary (8 bits) or hex (0xXX):
              </p>
              {customMatrix.map((row, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="font-mono text-xs text-primary-light w-6">Row {index}:</span>
                  <input
                    type="text"
                    value={row}
                    onChange={(e) => handleMatrixRowChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 bg-neutral-dark border border-primary-light/20 rounded-lg font-mono text-sm text-white focus:border-accent-pink focus:outline-none"
                    placeholder="01010111 or 0x57"
                  />
                  <span className="font-mono text-xs text-primary-light w-16">
                    {(() => {
                      try {
                        const trimmed = row.trim();
                        let val: number;
                        if (trimmed.startsWith('0x') || trimmed.match(/^[0-9A-Fa-f]{1,2}$/)) {
                          val = parseInt(trimmed.replace('0x', ''), 16);
                        } else if (trimmed.match(/^[01]{1,8}$/)) {
                          val = parseInt(trimmed, 2);
                        } else {
                          val = parseInt(trimmed, 10);
                        }
                        if (!isNaN(val) && val >= 0 && val <= 255) {
                          return `0x${val.toString(16).toUpperCase().padStart(2, '0')}`;
                        }
                        return '--';
                      } catch {
                        return '--';
                      }
                    })()}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Display current matrix */}
          {matrixCategory !== 'custom' && (
            <div className="mt-4 p-4 bg-neutral-dark/50 rounded-lg border border-primary-light/10">
              <div className="flex items-center justify-between mb-2">
                <p className="font-body text-xs text-primary-light">
                  Current Matrix:
                </p>
                <button
                  onClick={() => {
                    const current = getCurrentMatrix();
                    setCustomMatrix(current.map(m => m.toString(2).padStart(8, '0')));
                    setMatrixCategory('custom');
                    setSelectedMatrix('custom');
                  }}
                  className="text-xs text-accent-pink hover:text-accent-muted font-body"
                >
                  Edit as Custom
                </button>
              </div>
              <div className="font-mono text-xs text-primary-light space-y-1 max-h-32 overflow-y-auto">
                {getCurrentMatrix().map((row, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-12">Row {i}:</span>
                    <span>{row.toString(2).padStart(8, '0')}</span>
                    <span className="text-accent-muted">(0x{row.toString(16).toUpperCase().padStart(2, '0')})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Constant Input */}
        <div>
          <label className="block font-body text-sm font-semibold text-white mb-3">
            Constant Vector (C)
          </label>
          
          <div className="space-y-4">
            <div>
              <input
                type="text"
                value={constantInput}
                onChange={(e) => handleConstantChange(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-dark border border-primary-light/20 rounded-lg font-mono text-lg text-white focus:border-accent-pink focus:outline-none"
                placeholder="0x63 or 99"
              />
              <p className="font-body text-xs text-primary-light mt-2">
                Enter as hex (0x63) or decimal (99). Current: 0x{constant.toString(16).toUpperCase()} ({constant})
              </p>
            </div>

            {/* Quick presets */}
            <div>
              <p className="font-body text-xs text-primary-light mb-2">Quick Presets:</p>
              <div className="flex flex-wrap gap-2">
                {[0x63, 0x00, 0xFF, 0xAA, 0x55].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => {
                      setConstant(preset);
                      setConstantInput(preset.toString(16).toUpperCase().padStart(2, '0'));
                      const currentMatrix = getCurrentMatrix();
                      applyParameters(currentMatrix, preset);
                    }}
                    className={`px-3 py-1 rounded font-mono text-xs font-semibold transition-all ${
                      constant === preset
                        ? 'bg-accent-pink text-white'
                        : 'bg-primary-light/10 text-primary-light hover:bg-primary-light/20'
                    }`}
                  >
                    0x{preset.toString(16).toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Parameters Summary */}
      <div className="mt-6 pt-6 border-t border-primary-light/10">
        <p className="font-body text-sm text-primary-light mb-2">Active Parameters:</p>
        <div className="flex flex-wrap gap-4 font-mono text-xs">
          <span className="text-accent-pink">
            Matrix: {matrixCategory === 'paper' && PAPER_MATRICES[selectedMatrix as keyof typeof PAPER_MATRICES] 
              ? PAPER_MATRICES[selectedMatrix as keyof typeof PAPER_MATRICES].name
              : matrixCategory === 'standard' && STANDARD_MATRICES[selectedMatrix as keyof typeof STANDARD_MATRICES]
              ? STANDARD_MATRICES[selectedMatrix as keyof typeof STANDARD_MATRICES].name
              : matrixCategory === 'variations' && VARIATION_MATRICES[selectedMatrix as keyof typeof VARIATION_MATRICES]
              ? VARIATION_MATRICES[selectedMatrix as keyof typeof VARIATION_MATRICES].name
              : 'Custom'}
          </span>
          <span className="text-accent-muted">
            Constant: 0x{constant.toString(16).toUpperCase()} ({constant})
          </span>
          <span className="text-primary-light">
            Formula: S(x) = Matrix × x^(-1) ⊕ 0x{constant.toString(16).toUpperCase()}
          </span>
        </div>
      </div>

      {/* Parameter Presets */}
      <div className="mt-6 pt-6 border-t border-primary-light/10">
        <ParameterPresets
          onLoadPreset={(matrix, constValue) => {
            // Try to identify which category this matrix belongs to
            let found = false;
            
            // Check if it's a paper matrix
            for (const [key, matrixData] of Object.entries(PAPER_MATRICES)) {
              if (JSON.stringify(matrix) === JSON.stringify(matrixData.matrix)) {
                setMatrixCategory('paper');
                setSelectedMatrix(key);
                found = true;
                break;
              }
            }
            
            // Check if it's a standard matrix
            if (!found) {
              for (const [key, matrixData] of Object.entries(STANDARD_MATRICES)) {
                if (JSON.stringify(matrix) === JSON.stringify(matrixData.matrix)) {
                  setMatrixCategory('standard');
                  setSelectedMatrix(key);
                  found = true;
                  break;
                }
              }
            }
            
            // Check if it's a variation matrix
            if (!found) {
              for (const [key, matrixData] of Object.entries(VARIATION_MATRICES)) {
                if (JSON.stringify(matrix) === JSON.stringify(matrixData.matrix)) {
                  setMatrixCategory('variations');
                  setSelectedMatrix(key);
                  found = true;
                  break;
                }
              }
            }
            
            // If not found, use custom
            if (!found) {
              setMatrixCategory('custom');
              setCustomMatrix(matrix.map(m => m.toString(2).padStart(8, '0')));
            }
            
            setConstant(constValue);
            setConstantInput(constValue.toString(16).toUpperCase().padStart(2, '0'));
            applyParameters(matrix, constValue);
          }}
          currentMatrix={getCurrentMatrix()}
          currentConstant={constant}
        />
      </div>
    </div>
  );
};

export default ParameterPanel;

