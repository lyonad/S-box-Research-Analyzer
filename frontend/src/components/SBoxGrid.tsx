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
  highlightColor = 'bg-white'
}) => {
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);
  const [selectedCell, setSelectedCell] = useState<number | null>(null);

  const getRowHeader = (row: number) => row.toString(16).toUpperCase();
  const getColHeader = (col: number) => col.toString(16).toUpperCase();
  const decimalRows = Array.from({ length: 16 }, (_, row) =>
    sbox.slice(row * 16, row * 16 + 16)
  );

  return (
    <div className="w-full">
      <h3 className="font-subheading text-2xl mb-6 text-white">{title}</h3>
      
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Grid container */}
          <div className="glass-effect rounded-xl p-6 border border-text-primary/20">
            <div className="grid gap-0" style={{ gridTemplateColumns: 'auto repeat(16, minmax(0, 1fr))' }}>
              {/* Top-left corner cell */}
              <div className="p-2 text-center font-mono text-xs font-bold text-text-primary">
                x
              </div>
              
              {/* Column headers */}
              {[...Array(16)].map((_, col) => (
                <div 
                  key={`col-${col}`}
                  className="p-2 text-center font-mono text-xs font-bold text-white"
                >
                  {getColHeader(col)}
                </div>
              ))}

              {/* Grid rows */}
              {[...Array(16)].map((_, row) => (
                <React.Fragment key={`row-${row}`}>
                  {/* Row header */}
                    <div className="p-2 text-center font-mono text-xs font-bold text-white">
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
                          p-1 flex items-center justify-center text-center font-mono text-xs font-semibold
                          border border-text-primary/20
                          cursor-pointer
                          transition-all duration-150
                          ${isSelected ? `${highlightColor} text-black shadow-lg scale-105 border-white` : ''}
                          ${isHovered && !isSelected ? 'bg-white/20 scale-105 border-white/50' : ''}
                          ${!isHovered && !isSelected ? 'bg-surface-dark text-text-primary hover:bg-white/35 hover:border-white/80 hover:brightness-125 transition-all' : ''}
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
              <div className="glass-effect rounded-xl p-6 border border-text-primary/10 animate-fade-in">
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
                          <span className="font-body text-sm text-text-primary">Position:</span>
                            <div className="mt-1 font-mono font-bold text-white text-lg">
                            [{getRowHeader(row)}{getColHeader(col)}]
                          </div>
                        </div>
                        <div>
                          <span className="font-body text-sm text-text-primary">Index:</span>
                          <div className="mt-1 font-mono font-bold text-text-primary text-lg">
                            {index}
                          </div>
                        </div>
                        <div>
                          <span className="font-body text-sm text-text-primary">Hex:</span>
                          <div className="mt-1 font-mono font-bold text-light-grey text-lg">
                            0x{value.toString(16).toUpperCase().padStart(2, '0')}
                          </div>
                        </div>
                        <div>
                          <span className="font-body text-sm text-text-primary">Decimal:</span>
                          <div className="mt-1 font-mono font-bold text-text-primary text-lg">
                            {value}
                          </div>
                        </div>
                        <div className="col-span-2 md:col-span-4">
                          <span className="font-body text-sm text-text-primary">Binary:</span>
                            <div className="mt-1 font-mono font-bold text-white text-lg">
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
      {/* Decimal listing */}
      <div className="mt-4 glass-effect rounded-xl p-4 border border-text-primary/10 overflow-x-auto">
        <h4 className="font-body text-sm text-white mb-2">Nilai desimal</h4>
        <div className="min-w-[680px]">
          <div
            className="font-mono text-xs text-text-primary grid gap-1 sm:gap-1.5"
            style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}
          >
            {decimalRows.flat().map((val, idx) => (
              <span
                key={`dec-${idx}`}
                className="px-2 py-1 bg-white/5 rounded border border-white/10 text-center"
              >
                {val.toString().padStart(3, ' ')}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SBoxGrid;

