/**
 * Metrics Panel Component
 * Displays cryptographic strength test results
 */

import React from 'react';
import { AnalysisResults } from '../types';

const ACCENT_GRADIENTS: Record<string, string> = {
  blue: 'from-sky-400/80 via-blue-500/80 to-indigo-500/70',
  purple: 'from-violet-400/80 via-fuchsia-500/80 to-purple-600/70',
  pink: 'from-rose-400/80 via-pink-500/80 to-red-500/70',
  green: 'from-emerald-400/80 via-teal-500/80 to-green-500/70',
  orange: 'from-amber-400/80 via-orange-500/80 to-red-500/70',
  grey: 'from-slate-400/80 via-gray-500/80 to-slate-600/70',
};

const getAccentGradient = (key?: string) =>
  (key && ACCENT_GRADIENTS[key]) || ACCENT_GRADIENTS.blue;

interface MetricsPanelProps {
  results: AnalysisResults;
  title: string;
  accentColor?: string;
}

interface MetricCardProps {
  title: string;
  icon: string;
  metrics: { label: string; value: string | number; target?: string; status?: 'good' | 'warning' | 'info' }[];
  accentColor?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, icon, metrics, accentColor = 'blue' }) => {
  const getStatusColor = (status?: 'good' | 'warning' | 'info') => {
    switch (status) {
      case 'good':
        return 'text-white';
      case 'warning':
        return 'text-accent-warning';
      case 'info':
      default:
        return 'text-text-primary';
    }
  };

  const accentGradient = getAccentGradient(accentColor);

  return (
    <div className="glass-effect rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-text-primary/10">
      <div className="flex items-center mb-3 sm:mb-5 pb-3 sm:pb-4 border-b border-text-primary/20">
        {icon && (
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${accentGradient} flex items-center justify-center mr-3`}>
            <span className="text-xl text-white">{icon}</span>
          </div>
        )}
        <h4 className="font-subheading text-base sm:text-lg md:text-xl text-white">{title}</h4>
      </div>
      
      <div className="space-y-2 sm:space-y-4">
        {metrics.map((metric, index) => (
          <div key={index} className="flex justify-between items-center gap-2">
            <span className="font-body text-xs sm:text-sm text-text-primary font-medium">{metric.label}:</span>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <span className={`text-xs sm:text-sm font-mono font-bold ${getStatusColor(metric.status)}`}>
                {typeof metric.value === 'number' ? metric.value.toFixed(5) : metric.value}
              </span>
              {metric.target && (
                <span className="font-body text-[10px] sm:text-xs text-text-primary/70 hidden sm:inline">
                  ({metric.target})
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MetricsPanel: React.FC<MetricsPanelProps> = ({ results, title, accentColor = 'blue' }) => {
  // Determine status based on values
  const getNLStatus = (avg: number): 'good' | 'warning' | 'info' => {
    if (avg >= 110) return 'good';
    if (avg >= 100) return 'warning';
    return 'info';
  };

  const getSACStatus = (avg: number): 'good' | 'warning' | 'info' => {
    const deviation = Math.abs(avg - 0.5);
    if (deviation <= 0.01) return 'good';
    if (deviation <= 0.05) return 'warning';
    return 'info';
  };

  return (
    <div className="w-full">
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h3 className="font-subheading text-xl sm:text-2xl md:text-3xl text-white mb-2">{title}</h3>
        <div className={`w-16 sm:w-20 md:w-24 h-1 bg-gradient-to-r ${getAccentGradient(accentColor)} mb-2 sm:mb-3`}></div>
        <p className="font-body text-xs sm:text-sm text-text-primary">
          Analysis: {(results.analysis_time_ms / 1000).toFixed(2)}s
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {/* Nonlinearity */}
        <MetricCard
          title="Nonlinearity (NL)"
          icon=""
          accentColor={accentColor}
          metrics={[
            { label: 'Minimum', value: results.nonlinearity.min, status: 'info' },
            { label: 'Maximum', value: results.nonlinearity.max, status: 'info' },
            { 
              label: 'Average', 
              value: results.nonlinearity.average.toFixed(2), 
              target: '112',
              status: getNLStatus(results.nonlinearity.average)
            },
          ]}
        />

        {/* SAC */}
        <MetricCard
          title="SAC"
          icon=""
          accentColor={accentColor}
          metrics={[
            { 
              label: 'Average', 
              value: results.sac.average.toFixed(5), 
              target: '~0.5',
              status: getSACStatus(results.sac.average)
            },
            { label: 'Std Dev', value: results.sac.std.toFixed(5), status: 'info' },
            { label: 'Min', value: results.sac.min.toFixed(5), status: 'info' },
            { label: 'Max', value: results.sac.max.toFixed(5), status: 'info' },
          ]}
        />

        {/* BIC-NL */}
        <MetricCard
          title="BIC-NL"
          icon=""
          accentColor={accentColor}
          metrics={[
            { label: 'Minimum', value: results.bic_nl.min, status: 'info' },
            { label: 'Maximum', value: results.bic_nl.max, status: 'info' },
            { label: 'Average', value: results.bic_nl.average.toFixed(2), status: 'good' },
          ]}
        />

        {/* BIC-SAC */}
        <MetricCard
          title="BIC-SAC"
          icon=""
          accentColor={accentColor}
          metrics={[
            { 
              label: 'Average SAC', 
              value: results.bic_sac.average_sac.toFixed(5),
              target: '~0.5',
              status: Math.abs(results.bic_sac.average_sac - 0.5) < 0.01 ? 'good' : 'warning'
            },
            { label: 'Min SAC', value: results.bic_sac.min_sac.toFixed(5), status: 'info' },
            { label: 'Max SAC', value: results.bic_sac.max_sac.toFixed(5), status: 'info' },
          ]}
        />

        {/* LAP */}
        <MetricCard
          title="LAP"
          icon="📐"
          accentColor={accentColor}
          metrics={[
            { 
              label: 'Max LAP', 
              value: results.lap.max_lap.toFixed(5),
              status: results.lap.max_lap < 0.55 ? 'good' : 'warning'
            },
            { label: 'Max Bias', value: results.lap.max_bias.toFixed(5), status: 'info' },
            { label: 'Avg Bias', value: results.lap.average_bias.toFixed(5), status: 'info' },
          ]}
        />

        {/* DAP */}
        <MetricCard
          title="DAP"
          icon="🎲"
          accentColor={accentColor}
          metrics={[
            { 
              label: 'Max DAP', 
              value: results.dap.max_dap.toFixed(5),
              status: results.dap.max_dap < 0.05 ? 'good' : 'warning'
            },
            { label: 'Average DAP', value: results.dap.average_dap.toFixed(5), status: 'info' },
          ]}
        />

        {/* Differential Uniformity */}
        <MetricCard
          title="Differential Uniformity"
          icon="🔀"
          accentColor={accentColor}
          metrics={[
            { 
              label: 'Max DU', 
              value: results.differential_uniformity.max_du,
              target: '4 (AES)',
              status: results.differential_uniformity.max_du <= 4 ? 'good' : 'warning'
            },
            { label: 'Average DU', value: results.differential_uniformity.average_du.toFixed(2), status: 'info' },
          ]}
        />

        {/* Algebraic Degree */}
        <MetricCard
          title="Algebraic Degree"
          icon="🔢"
          accentColor={accentColor}
          metrics={[
            { 
              label: 'Max', 
              value: results.algebraic_degree.max,
              target: '7 (AES)',
              status: results.algebraic_degree.max >= 7 ? 'good' : 'warning'
            },
            { label: 'Min', value: results.algebraic_degree.min, status: 'info' },
            { label: 'Average', value: results.algebraic_degree.average.toFixed(2), status: 'info' },
          ]}
        />

        {/* Transparency Order */}
        <MetricCard
          title="Transparency Order"
          icon="🔍"
          accentColor={accentColor}
          metrics={[
            { 
              label: 'TO', 
              value: results.transparency_order.transparency_order.toFixed(5),
              target: 'Lower is better',
              status: results.transparency_order.transparency_order < 0.3 ? 'good' : 'warning'
            },
            { label: 'Max Correlation', value: results.transparency_order.max_correlation.toFixed(5), status: 'info' },
            { label: 'Min Correlation', value: results.transparency_order.min_correlation.toFixed(5), status: 'info' },
          ]}
        />

        {/* Correlation Immunity */}
        <MetricCard
          title="Correlation Immunity"
          icon="🛡️"
          accentColor={accentColor}
          metrics={[
            { 
              label: 'Max Order', 
              value: results.correlation_immunity.max,
              target: 'Higher is better',
              status: results.correlation_immunity.max >= 1 ? 'good' : 'info'
            },
            { label: 'Min Order', value: results.correlation_immunity.min, status: 'info' },
            { label: 'Average', value: results.correlation_immunity.average.toFixed(2), status: 'info' },
          ]}
        />

        {/* Cycle Structure (New) */}
        <MetricCard
          title="Cycle Structure"
          icon="🔄"
          accentColor={accentColor}
          metrics={[
            { 
              label: 'Max Cycle', 
              value: results.cycle_structure.max_length,
              target: 'Max 256',
              status: results.cycle_structure.max_length > 200 ? 'good' : 'warning'
            },
            { label: 'Cycle Count', value: results.cycle_structure.count, status: 'info' },
            { 
              label: 'Fixed Points', 
              value: results.cycle_structure.fixed_points, 
              target: '0',
              status: results.cycle_structure.fixed_points === 0 ? 'good' : 'warning'
            },
          ]}
        />
      </div>
    </div>
  );
};

export default MetricsPanel;

