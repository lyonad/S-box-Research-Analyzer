/**
 * S-Box Grid Component
 * Displays S-box values in a 16x16 hexadecimal grid
 */

import React, { useState } from 'react';

interface SBoxGridProps {
  sbox: number[];
  title: string;
  highlightColor?: string;
}

const SBoxGrid: React.FC<SBoxGridProps> = ({ 
  sbox, 
  title,
  highlightColor = 'bg-blue-500'
}) => {
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);
  const [selectedCell, setSelectedCell] = useState<number | null>(null);

  const getRowHeader = (row: number) => row.toString(16).toUpperCase();
  const getColHeader = (col: number) => col.toString(16).toUpperCase();

  return (
    <div className="w-full">
      <h3 className="font-heading text-2xl font-bold mb-6 text-white">{title}</h3>
      
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Grid container */}
          <div className="glass-effect rounded-xl p-6 border border-primary-light/10">
            <div className="grid gap-0" style={{ gridTemplateColumns: 'auto repeat(16, minmax(0, 1fr))' }}>
              {/* Top-left corner cell */}
              <div className="p-2 text-center font-mono text-xs font-bold text-primary-light">
                x
              </div>
              
              {/* Column headers */}
              {[...Array(16)].map((_, col) => (
                <div 
                  key={`col-${col}`}
                  className="p-2 text-center font-mono text-xs font-bold text-accent-pink"
                >
                  {getColHeader(col)}
                </div>
              ))}

              {/* Grid rows */}
              {[...Array(16)].map((_, row) => (
                <React.Fragment key={`row-${row}`}>
                  {/* Row header */}
                  <div className="p-2 text-center font-mono text-xs font-bold text-accent-pink">
                    {getRowHeader(row)}
                  </div>
                  
                  {/* Row cells */}
                  {[...Array(16)].map((_, col) => {
                    const index = row * 16 + col;
                    const value = sbox[index];
                    const isHovered = hoveredCell === index;
                    const isSelected = selectedCell === index;
                    
                    return (
                      <div
                        key={`cell-${index}`}
                        className={`
                          p-2 text-center font-mono text-sm font-semibold
                          border border-primary-light/10
                          cursor-pointer
                          transition-all duration-150
                          ${isSelected ? `${highlightColor} text-white shadow-lg scale-105 border-accent-pink` : ''}
                          ${isHovered && !isSelected ? 'bg-accent-muted/20 scale-105 border-accent-muted/50' : ''}
                          ${!isHovered && !isSelected ? 'bg-neutral-dark text-primary-light hover:bg-primary-light/10' : ''}
                        `}
                        onMouseEnter={() => setHoveredCell(index)}
                        onMouseLeave={() => setHoveredCell(null)}
                        onClick={() => setSelectedCell(isSelected ? null : index)}
                        title={`Position: [${row}${getColHeader(col)}] = 0x${value.toString(16).toUpperCase().padStart(2, '0')} (${value})`}
                      >
                        {value.toString(16).toUpperCase().padStart(2, '0')}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Cell info display - Always reserve space to prevent layout shift */}
          <div className="mt-6 min-h-[220px]">
            {(hoveredCell !== null || selectedCell !== null) && (
              <div className="glass-effect rounded-xl p-6 border border-primary-light/10 animate-fade-in">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {(() => {
                    const index = selectedCell !== null ? selectedCell : hoveredCell;
                    if (index === null) return null;
                    
                    const row = Math.floor(index / 16);
                    const col = index % 16;
                    const value = sbox[index];
                    
                    return (
                      <>
                        <div>
                          <span className="font-body text-sm text-primary-light">Position:</span>
                          <div className="mt-1 font-mono font-bold text-accent-pink text-lg">
                            [{getRowHeader(row)}{getColHeader(col)}]
                          </div>
                        </div>
                        <div>
                          <span className="font-body text-sm text-primary-light">Index:</span>
                          <div className="mt-1 font-mono font-bold text-primary-light text-lg">
                            {index}
                          </div>
                        </div>
                        <div>
                          <span className="font-body text-sm text-primary-light">Hex:</span>
                          <div className="mt-1 font-mono font-bold text-accent-muted text-lg">
                            0x{value.toString(16).toUpperCase().padStart(2, '0')}
                          </div>
                        </div>
                        <div>
                          <span className="font-body text-sm text-primary-light">Decimal:</span>
                          <div className="mt-1 font-mono font-bold text-primary-light text-lg">
                            {value}
                          </div>
                        </div>
                        <div className="col-span-2 md:col-span-4">
                          <span className="font-body text-sm text-primary-light">Binary:</span>
                          <div className="mt-1 font-mono font-bold text-accent-pink text-lg">
                            {value.toString(2).padStart(8, '0')}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SBoxGrid;

