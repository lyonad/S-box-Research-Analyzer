/**
 * Metrics Panel Component
 * Displays cryptographic strength test results
 */

import React from 'react';
import { AnalysisResults } from '../types';

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

  return (
    <div className="glass-effect rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-text-primary/10">
      <div className="flex items-center mb-3 sm:mb-5 pb-3 sm:pb-4 border-b border-text-primary/20">
        {icon && <span className="text-2xl sm:text-3xl mr-2 sm:mr-3">{icon}</span>}
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
        <div className="w-16 sm:w-20 md:w-24 h-1 bg-gradient-primary mb-2 sm:mb-3"></div>
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
              label: 'Avg Deviation', 
              value: results.bic_sac.average_deviation.toFixed(5),
              status: results.bic_sac.average_deviation < 0.01 ? 'good' : 'warning'
            },
            { label: 'Max Deviation', value: results.bic_sac.max_deviation.toFixed(5), status: 'info' },
            { label: 'Min Deviation', value: results.bic_sac.min_deviation.toFixed(5), status: 'info' },
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
      </div>
    </div>
  );
};

export default MetricsPanel;

