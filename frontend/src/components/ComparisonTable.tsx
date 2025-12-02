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
  const getBetterValue = (k44: number, aes: number, lowerIsBetter: boolean = false) => {
    if (lowerIsBetter) {
      return k44 < aes ? 'k44' : k44 > aes ? 'aes' : 'equal';
    }
    return k44 > aes ? 'k44' : k44 < aes ? 'aes' : 'equal';
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="glass-effect rounded-2xl p-8 border border-primary-light/10">
        <div className="mb-6">
          <h3 className="font-heading text-3xl font-bold text-white mb-2">
            📊 Side-by-Side Comparison
          </h3>
          <div className="w-24 h-1 bg-gradient-primary"></div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-primary-light/20">
                <th className="text-left py-4 px-4 font-heading text-base font-bold text-white">Metric</th>
                <th className="text-center py-4 px-4 font-heading text-base font-bold text-accent-pink">Research S-box (K44)</th>
                <th className="text-center py-4 px-4 font-heading text-base font-bold text-accent-muted">Standard AES S-box</th>
                <th className="text-center py-4 px-4 font-heading text-base font-bold text-primary-light">Target</th>
                <th className="text-center py-4 px-4 font-heading text-base font-bold text-white">Winner</th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map((comparison, index) => {
                const lowerIsBetter = comparison.name.includes('LAP') || 
                                     comparison.name.includes('DAP') || 
                                     comparison.name.includes('Deviation');
                const winner = getBetterValue(comparison.k44, comparison.aes, lowerIsBetter);
                
                return (
                  <tr 
                    key={index}
                    className="border-b border-primary-light/10 hover:bg-primary-light/5 transition-colors"
                  >
                    <td className="py-4 px-4 font-body text-primary-light font-medium">{comparison.name}</td>
                    <td className={`py-4 px-4 text-center font-mono font-bold ${
                      winner === 'k44' ? 'text-accent-pink' : 'text-accent-muted'
                    }`}>
                      {typeof comparison.k44 === 'number' 
                        ? comparison.k44.toFixed(5) 
                        : comparison.k44}
                      {comparison.unit && <span className="text-xs ml-1">{comparison.unit}</span>}
                    </td>
                    <td className={`py-4 px-4 text-center font-mono font-bold ${
                      winner === 'aes' ? 'text-accent-pink' : 'text-accent-muted'
                    }`}>
                      {typeof comparison.aes === 'number' 
                        ? comparison.aes.toFixed(5) 
                        : comparison.aes}
                      {comparison.unit && <span className="text-xs ml-1">{comparison.unit}</span>}
                    </td>
                    <td className="py-4 px-4 text-center font-body text-primary-light text-sm">
                      {comparison.target || '-'}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {winner === 'equal' ? (
                        <span className="font-body text-primary-light/50">-</span>
                      ) : winner === 'k44' ? (
                        <span className="font-body text-accent-pink font-bold">Research ✓</span>
                      ) : (
                        <span className="font-body text-accent-muted font-bold">AES ✓</span>
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

