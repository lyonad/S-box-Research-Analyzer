/**
 * Parameter Panel Component
 * Allows researchers to tweak S-box generation parameters
 */

import React, { useState } from 'react';
import ParameterPresets from './ParameterPresets';

type MatrixCategory = 'paper' | 'standard' | 'variations' | 'custom';

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
}) => {
  const [matrixCategory, setMatrixCategory] = useState<MatrixCategory>('paper');
  const [selectedMatrix, setSelectedMatrix] = useState<string>('k44');
  const [customMatrix, setCustomMatrix] = useState<string[]>(defaultMatrix.map(m => m.toString(2).padStart(8, '0')));
  const [constant, setConstant] = useState<number>(defaultConstant);
  const [constantInput, setConstantInput] = useState<string>(defaultConstant.toString(16).toUpperCase().padStart(2, '0'));
  // Keep state available for potential extensions; currently unused
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [lastR0Value, setLastR0Value] = useState<number>(defaultMatrix[0]);
  console.log(lastR0Value); // Biar dianggap kepakai

  const parseRowValue = (row: string): number | null => {
    const trimmed = row.trim();
    if (trimmed.startsWith('0x') || trimmed.match(/^[0-9A-Fa-f]{1,2}$/)) {
      return parseInt(trimmed.replace('0x', ''), 16) & 0xFF;
    }
    if (trimmed.match(/^[01]{1,8}$/)) {
      return parseInt(trimmed, 2) & 0xFF;
    }
    const parsed = parseInt(trimmed, 10);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 255) {
      return parsed;
    }
    return null;
  };

  const formatBinary = (v: number) => v.toString(2).padStart(8, '0');

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

  const handleCategoryChange = (category: MatrixCategory) => {
    setMatrixCategory(category);
    if (category === 'paper') {
      setSelectedMatrix('k44');
      applyParameters(PAPER_MATRICES.k44.matrix, constant, { categoryOverride: 'paper' });
    } else if (category === 'standard') {
      setSelectedMatrix('aes');
      applyParameters(STANDARD_MATRICES.aes.matrix, constant, { categoryOverride: 'standard' });
    } else if (category === 'variations') {
      setSelectedMatrix('identity');
      applyParameters(VARIATION_MATRICES.identity.matrix, constant, { categoryOverride: 'variations' });
    }
  };

  const handleMatrixSelect = (matrixKey: string) => {
    setSelectedMatrix(matrixKey);
    const matrix = getMatrixByKey(matrixKey);
    if (matrix) {
      applyParameters(matrix, constant, { categoryOverride: matrixCategory });
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
        // Jika R0 diubah: auto-isi R1..R7 sebagai R0+i (mod 256)
        if (index === 0) {
          const base = parseRowValue(value);
          if (base === null) throw new Error('Invalid format');
          const autoMatrix = Array.from({ length: 8 }, (_, i) => (base + i) % 256);
          setCustomMatrix(autoMatrix.map(formatBinary));
          setLastR0Value(base);
          applyParameters(autoMatrix, constant, { categoryOverride: 'custom' });
          return;
        }

        // Selain R0, tetap validasi normal
        const matrixValues = newMatrix.map(row => {
          const parsed = parseRowValue(row);
          if (parsed === null) {
            throw new Error('Invalid format');
          }
          return parsed;
        });
        if (matrixValues.every(v => !isNaN(v) && v >= 0 && v <= 255)) {
          applyParameters(matrixValues, constant, { categoryOverride: 'custom' });
        }
      } catch (e) {
        // Invalid input, don't update
      }
    }
  };

  const adjustR0 = (delta: number) => {
    const current = parseRowValue(customMatrix[0]);
    if (current === null) return;
    const next = (current + delta + 256) % 256;
    handleMatrixRowChange(0, formatBinary(next));
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
          applyParameters(currentMatrix, newConstant, { categoryOverride: matrixCategory });
        }
      }
    } catch (e) {
      // Invalid input
    }
  };

  const applyParameters = (
    matrix: number[],
    constValue: number,
    options?: { categoryOverride?: MatrixCategory }
  ) => {
    const activeCategory = options?.categoryOverride ?? matrixCategory;
    onParametersChange({
      matrix,
      constant: constValue,
      useCustom: activeCategory === 'custom',
    });
  };

  const resetToDefaults = () => {
    setMatrixCategory('paper');
    setSelectedMatrix('k44');
    setConstant(defaultConstant);
    setConstantInput(defaultConstant.toString(16).toUpperCase().padStart(2, '0'));
    setCustomMatrix(defaultMatrix.map(m => m.toString(2).padStart(8, '0')));
    applyParameters(PAPER_MATRICES.k44.matrix, defaultConstant, { categoryOverride: 'paper' });
  };

  return (
    <div className="glass-effect rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border border-text-primary/10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <h3 className="font-subheading text-lg sm:text-xl md:text-2xl text-white mb-1 sm:mb-2">
            Research Parameters
          </h3>
          <p className="font-body text-xs sm:text-sm text-text-primary">
            Adjust S-box generation parameters
          </p>
        </div>
        <button
          onClick={resetToDefaults}
          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-surface-dark hover:bg-white/20 hover:border-white/40 hover:brightness-110 border border-text-primary/20 text-text-primary rounded-lg font-body text-xs sm:text-sm font-medium transition-all self-start sm:self-auto"
        >
          Reset
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Matrix Selection */}
        <div>
          <label className="block font-body text-sm font-semibold text-white mb-3">
            Affine Transformation Matrix
          </label>
          
          {/* Category Selection */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 mb-3 sm:mb-4">
            <button
              onClick={() => handleCategoryChange('paper')}
              className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-body text-[10px] sm:text-xs font-semibold transition-all ${
                matrixCategory === 'paper'
                  ? 'bg-white text-black hover:bg-dark-grey hover:text-white'
                  : 'bg-surface-dark/50 text-text-primary hover:bg-white/20 hover:border-white/40 hover:brightness-110 border border-text-primary/20 transition-all'
              }`}
            >
              Paper
            </button>
            <button
              onClick={() => handleCategoryChange('standard')}
              className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-body text-[10px] sm:text-xs font-semibold transition-all ${
                matrixCategory === 'standard'
                  ? 'bg-white text-black hover:bg-dark-grey hover:text-white'
                  : 'bg-surface-dark/50 text-text-primary hover:bg-white/20 hover:border-white/40 hover:brightness-110 border border-text-primary/20 transition-all'
              }`}
            >
              Standard
            </button>
            <button
              onClick={() => handleCategoryChange('variations')}
              className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-body text-[10px] sm:text-xs font-semibold transition-all ${
                matrixCategory === 'variations'
                  ? 'bg-white text-black hover:bg-dark-grey hover:text-white'
                  : 'bg-surface-dark/50 text-text-primary hover:bg-white/20 hover:border-white/40 hover:brightness-110 border border-text-primary/20 transition-all'
              }`}
            >
              Variations
            </button>
            <button
              onClick={() => handleCategoryChange('custom')}
              className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-body text-[10px] sm:text-xs font-semibold transition-all ${
                matrixCategory === 'custom'
                  ? 'bg-white text-black hover:bg-dark-grey hover:text-white'
                  : 'bg-surface-dark/50 text-text-primary hover:bg-white/20 hover:border-white/40 hover:brightness-110 border border-text-primary/20 transition-all'
              }`}
            >
              Custom
            </button>
          </div>

          {/* Matrix Selection within Category */}
          {matrixCategory === 'paper' && (
            <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
              {Object.entries(PAPER_MATRICES).map(([key, matrix]) => (
                <button
                  key={key}
                  onClick={() => handleMatrixSelect(key)}
                  className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 rounded-lg border transition-all ${
                    selectedMatrix === key && matrixCategory === 'paper'
                      ? 'bg-white/20 border-white text-white'
                      : 'bg-surface-dark/50 border-text-primary/30 text-text-primary hover:border-white/40 hover:bg-white/20 hover:brightness-110 transition-all'
                  }`}
                >
                  <div className="font-body font-semibold text-xs sm:text-sm">{matrix.name}</div>
                  <div className="font-body text-[10px] sm:text-xs text-text-primary/70 mt-0.5 sm:mt-1 truncate">{matrix.description}</div>
                </button>
              ))}
            </div>
          )}

          {matrixCategory === 'standard' && (
            <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
              {Object.entries(STANDARD_MATRICES).map(([key, matrix]) => (
                <button
                  key={key}
                  onClick={() => handleMatrixSelect(key)}
                  className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 rounded-lg border transition-all ${
                    selectedMatrix === key && matrixCategory === 'standard'
                      ? 'bg-white/20 border-white text-white'
                      : 'bg-surface-dark/50 border-text-primary/30 text-text-primary hover:border-white/40 hover:bg-white/20 hover:brightness-110 transition-all'
                  }`}
                >
                  <div className="font-body font-semibold text-xs sm:text-sm">{matrix.name}</div>
                  <div className="font-body text-[10px] sm:text-xs text-text-primary/70 mt-0.5 sm:mt-1 truncate">{matrix.description}</div>
                </button>
              ))}
            </div>
          )}

          {matrixCategory === 'variations' && (
            <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
              {Object.entries(VARIATION_MATRICES).map(([key, matrix]) => (
                <button
                  key={key}
                  onClick={() => handleMatrixSelect(key)}
                  className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 rounded-lg border transition-all ${
                    selectedMatrix === key && matrixCategory === 'variations'
                      ? 'bg-white/20 border-white text-white'
                      : 'bg-surface-dark/50 border-text-primary/30 text-text-primary hover:border-white/40 hover:bg-white/20 hover:brightness-110 transition-all'
                  }`}
                >
                  <div className="font-body font-semibold text-xs sm:text-sm">{matrix.name}</div>
                  <div className="font-body text-[10px] sm:text-xs text-text-primary/70 mt-0.5 sm:mt-1 truncate">{matrix.description}</div>
                </button>
              ))}
            </div>
          )}

          {/* Matrix Input (8 rows) */}
          {matrixCategory === 'custom' && (
            <div className="space-y-1.5 sm:space-y-2">
              <p className="font-body text-[10px] sm:text-xs text-text-primary mb-1.5 sm:mb-2">
                Enter 8 rows as binary or hex:
              </p>
              {customMatrix.map((row, index) => (
                <div key={index} className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-mono text-[10px] sm:text-xs text-text-primary w-5 sm:w-6 flex-shrink-0">R{index}:</span>
                <div className="grid grid-cols-[minmax(0,1fr)_54px] items-center gap-1 sm:gap-1.5 flex-1 min-w-0">
                  <input
                    type="text"
                    value={row}
                    onChange={(e) => handleMatrixRowChange(index, e.target.value)}
                      className="w-full min-w-0 px-2 sm:px-3 py-1.5 sm:py-2 bg-surface-dark border border-text-primary/20 rounded-lg font-mono text-xs sm:text-sm text-white focus:border-white focus:outline-none"
                    placeholder="01010111"
                  />
                  {index === 0 && matrixCategory === 'custom' ? (
                    <div className="flex items-center gap-1 w-[54px] sm:w-[60px] justify-end">
                      <button
                        type="button"
                        onClick={() => adjustR0(-1)}
                        className="w-6 h-8 sm:w-7 sm:h-9 bg-white/10 border border-white/20 rounded text-sm font-mono text-white hover:bg-white/20 transition-colors flex items-center justify-center"
                        title="Kurangi R0"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustR0(1)}
                        className="w-6 h-8 sm:w-7 sm:h-9 bg-white/10 border border-white/20 rounded text-sm font-mono text-white hover:bg-white/20 transition-colors flex items-center justify-center"
                        title="Tambah R0"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <div className="w-[54px] sm:w-[60px]"></div>
                  )}
                </div>
                  <span className="font-mono text-[10px] sm:text-xs text-text-primary w-10 sm:w-16 flex-shrink-0 text-right">
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
            <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-surface-dark/50 rounded-lg border border-text-primary/20">
              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                <p className="font-body text-[10px] sm:text-xs text-text-primary">
                  Current Matrix:
                </p>
                <button
                  onClick={() => {
                    const current = getCurrentMatrix();
                    setCustomMatrix(current.map(m => m.toString(2).padStart(8, '0')));
                    setMatrixCategory('custom');
                    setSelectedMatrix('custom');
                  }}
                   className="text-[10px] sm:text-xs text-light-grey hover:text-white font-body"
                >
                  Edit
                </button>
              </div>
              <div className="font-mono text-[10px] sm:text-xs text-text-primary space-y-0.5 sm:space-y-1 max-h-28 sm:max-h-32 overflow-y-auto">
                {getCurrentMatrix().map((row, i) => (
                  <div key={i} className="flex items-center gap-1 sm:gap-2">
                    <span className="w-8 sm:w-12">R{i}:</span>
                    <span className="hidden sm:inline">{row.toString(2).padStart(8, '0')}</span>
                      <span className="text-light-grey">(0x{row.toString(16).toUpperCase().padStart(2, '0')})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Constant Input */}
        <div>
          <label className="block font-body text-xs sm:text-sm font-semibold text-white mb-2 sm:mb-3">
            Constant Vector (C)
          </label>
          
          <div className="space-y-3 sm:space-y-4">
            <div>
              <input
                type="text"
                value={constantInput}
                onChange={(e) => handleConstantChange(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-surface-dark border border-text-primary/20 rounded-lg font-mono text-base sm:text-lg text-white focus:border-white focus:outline-none"
                placeholder="0x63 or 99"
              />
              <p className="font-body text-[10px] sm:text-xs text-text-primary mt-1.5 sm:mt-2">
                Hex/decimal. Current: 0x{constant.toString(16).toUpperCase()} ({constant})
              </p>
            </div>

            {/* Quick presets */}
            <div>
              <p className="font-body text-[10px] sm:text-xs text-text-primary mb-1.5 sm:mb-2">Quick Presets:</p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {[0x63, 0x00, 0xFF, 0xAA, 0x55].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => {
                      setConstant(preset);
                      setConstantInput(preset.toString(16).toUpperCase().padStart(2, '0'));
                      const currentMatrix = getCurrentMatrix();
                      applyParameters(currentMatrix, preset, { categoryOverride: matrixCategory });
                    }}
                    className={`px-2 sm:px-3 py-1 rounded font-mono text-[10px] sm:text-xs font-semibold transition-all ${
                        constant === preset
                         ? 'bg-white text-black hover:bg-dark-grey hover:text-white'
                         : 'bg-surface-dark/50 text-text-primary hover:bg-white/20 hover:border-white/40 hover:brightness-110 border border-text-primary/20 transition-all'
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
      <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-text-primary/20">
        <p className="font-body text-xs sm:text-sm text-text-primary mb-1.5 sm:mb-2">Active Parameters:</p>
        <div className="flex flex-wrap gap-2 sm:gap-4 font-mono text-[10px] sm:text-xs">
            <span className="text-white truncate max-w-full">
            Matrix: {matrixCategory === 'paper' && PAPER_MATRICES[selectedMatrix as keyof typeof PAPER_MATRICES] 
              ? PAPER_MATRICES[selectedMatrix as keyof typeof PAPER_MATRICES].name
              : matrixCategory === 'standard' && STANDARD_MATRICES[selectedMatrix as keyof typeof STANDARD_MATRICES]
              ? STANDARD_MATRICES[selectedMatrix as keyof typeof STANDARD_MATRICES].name
              : matrixCategory === 'variations' && VARIATION_MATRICES[selectedMatrix as keyof typeof VARIATION_MATRICES]
              ? VARIATION_MATRICES[selectedMatrix as keyof typeof VARIATION_MATRICES].name
              : 'Custom'}
          </span>
            <span className="text-light-grey">
            C: 0x{constant.toString(16).toUpperCase()}
          </span>
          <span className="text-text-primary hidden sm:inline">
            S(x) = M × x^(-1) ⊕ 0x{constant.toString(16).toUpperCase()}
          </span>
        </div>
      </div>

      {/* Parameter Presets */}
      <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-text-primary/20">
        <ParameterPresets
          onLoadPreset={(matrix, constValue) => {
            // Try to identify which category this matrix belongs to
            let found = false;
            let targetCategory: MatrixCategory = 'custom';
            
            // Check if it's a paper matrix
            for (const [key, matrixData] of Object.entries(PAPER_MATRICES)) {
              if (JSON.stringify(matrix) === JSON.stringify(matrixData.matrix)) {
                setMatrixCategory('paper');
                setSelectedMatrix(key);
                found = true;
                targetCategory = 'paper';
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
                  targetCategory = 'standard';
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
                  targetCategory = 'variations';
                  break;
                }
              }
            }
            
            // If not found, use custom
            if (!found) {
              setMatrixCategory('custom');
              setCustomMatrix(matrix.map(m => m.toString(2).padStart(8, '0')));
              targetCategory = 'custom';
            }
            
            setConstant(constValue);
            setConstantInput(constValue.toString(16).toUpperCase().padStart(2, '0'));
            applyParameters(matrix, constValue, { categoryOverride: targetCategory });
          }}
          currentMatrix={getCurrentMatrix()}
          currentConstant={constant}
        />
      </div>
    </div>
  );
};

export default ParameterPanel;

