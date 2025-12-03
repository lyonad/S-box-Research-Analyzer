/**
 * Comparison Table Component
 * Side-by-side comparison of research S-box (K44) and standard AES S-box metrics
 */

import React from 'react';
import { MetricComparison } from '../types';

interface ComparisonTableProps {
  comparisons: MetricComparison[];
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({ comparisons }) => {
  const hasCustom = comparisons.length > 0 && comparisons[0].custom !== undefined;

  const getBetterValue = (k44: number, aes: number, custom?: number, lowerIsBetter: boolean = false) => {
    const values = [
      { name: 'k44', value: k44 },
      { name: 'aes', value: aes },
    ];
    if (custom !== undefined) {
      values.push({ name: 'custom', value: custom });
    }

    if (lowerIsBetter) {
      values.sort((a, b) => a.value - b.value);
    } else {
      values.sort((a, b) => b.value - a.value);
    }

    // Check if all values are equal
    if (values.every(v => v.value === values[0].value)) {
      return 'equal';
    }

    return values[0].name;
  };

  return (
    <div className="w-full overflow-x-auto -mx-2 sm:mx-0 px-2 sm:px-0">
      <div className="glass-effect rounded-lg sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-text-primary/20">
        <div className="mb-4 sm:mb-6">
          <h3 className="font-subheading text-xl sm:text-2xl md:text-3xl text-white mb-2">
            Side-by-Side Comparison
          </h3>
          <div className="w-16 sm:w-20 md:w-24 h-1 bg-gradient-primary"></div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b-2 border-text-primary/20">
                <th className="text-left py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4 font-heading text-xs sm:text-sm md:text-base text-white">Metric</th>
                <th className="text-center py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4 font-heading text-xs sm:text-sm md:text-base text-white">Research (K44)</th>
                <th className="text-center py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4 font-heading text-xs sm:text-sm md:text-base text-light-grey">AES S-box</th>
                {hasCustom && (
                  <th className="text-center py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4 font-heading text-xs sm:text-sm md:text-base text-white">Custom</th>
                )}
                <th className="text-center py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4 font-heading text-xs sm:text-sm md:text-base text-text-primary">Target</th>
                <th className="text-center py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4 font-heading text-xs sm:text-sm md:text-base text-white">Winner</th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map((comparison, index) => {
                const lowerIsBetter = comparison.name.includes('LAP') || 
                                     comparison.name.includes('DAP') || 
                                     comparison.name.includes('Deviation');
                const winner = getBetterValue(comparison.k44, comparison.aes, comparison.custom, lowerIsBetter);
                
                return (
                  <tr 
                    key={index}
                    className="border-b border-text-primary/20"
                  >
                    <td className="py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4 font-body text-text-primary font-medium text-xs sm:text-sm md:text-base">{comparison.name}</td>
                    <td                     className={`py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4 text-center font-mono font-bold text-xs sm:text-sm md:text-base ${
                      winner === 'k44' ? 'text-white' : 'text-text-primary'
                    }`}>
                      {typeof comparison.k44 === 'number' 
                        ? comparison.k44.toFixed(5) 
                        : comparison.k44}
                      {comparison.unit && <span className="text-xs ml-1">{comparison.unit}</span>}
                    </td>
                    <td className={`py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4 text-center font-mono font-bold text-xs sm:text-sm md:text-base ${
                      winner === 'aes' ? 'text-white' : 'text-text-primary'
                    }`}>
                      {typeof comparison.aes === 'number' 
                        ? comparison.aes.toFixed(5) 
                        : comparison.aes}
                      {comparison.unit && <span className="text-[10px] sm:text-xs ml-1">{comparison.unit}</span>}
                    </td>
                    {hasCustom && (
                      <td                       className={`py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4 text-center font-mono font-bold text-xs sm:text-sm md:text-base ${
                        winner === 'custom' ? 'text-white' : 'text-text-primary'
                      }`}>
                        {comparison.custom !== undefined ? (
                          <>
                            {typeof comparison.custom === 'number' 
                              ? comparison.custom.toFixed(5) 
                              : comparison.custom}
                            {comparison.unit && <span className="text-xs ml-1">{comparison.unit}</span>}
                          </>
                        ) : (
                          <span className="text-text-primary/50">-</span>
                        )}
                      </td>
                    )}
                    <td className="py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4 text-center font-body text-text-primary text-[10px] sm:text-xs md:text-sm">
                      {comparison.target || '-'}
                    </td>
                    <td className="py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4 text-center">
                      {winner === 'equal' ? (
                        <span className="font-body text-text-primary/60 text-xs sm:text-sm">-</span>
                      ) : winner === 'k44' ? (
                        <span className="font-body text-white font-bold text-xs sm:text-sm">K44</span>
                      ) : winner === 'aes' ? (
                        <span className="font-body text-light-grey font-bold text-xs sm:text-sm">AES</span>
                      ) : (
                        <span className="font-body text-white font-bold text-xs sm:text-sm">Custom</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ComparisonTable;

