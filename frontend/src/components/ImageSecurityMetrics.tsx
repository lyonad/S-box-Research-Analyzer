import React from 'react';

interface ImageSecurityMetricsProps {
  metrics: {
    entropy: {
      original: { overall: number; red?: number; green?: number; blue?: number };
      encrypted: { overall: number; red?: number; green?: number; blue?: number };
    };
    npcr: { overall: number; red?: number; green?: number; blue?: number };
    uaci: { overall: number; red?: number; green?: number; blue?: number };
    correlation: {
      original: { average: number };
      encrypted: { average: number };
    };
  };
}

const ImageSecurityMetrics: React.FC<ImageSecurityMetricsProps> = ({ metrics }) => {
  // Ideal values based on research paper
  const IDEAL_ENTROPY = 8.0; // Maximum for 8-bit images
  const IDEAL_NPCR = 99.6; // Percentage
  const IDEAL_UACI = 33.4635; // Percentage
  const IDEAL_CORRELATION = 0.0; // Lower is better (encrypted should be close to 0)

  const getQualityBadge = (value: number, ideal: number, tolerance: number, higherIsBetter: boolean = true) => {
    const diff = Math.abs(value - ideal);
    if (diff <= tolerance) {
      return { text: 'Excellent', color: 'text-green-400', bg: 'bg-green-400/20' };
    } else if (diff <= tolerance * 2) {
      return { text: 'Good', color: 'text-yellow-400', bg: 'bg-yellow-400/20' };
    } else {
      return { text: 'Fair', color: 'text-orange-400', bg: 'bg-orange-400/20' };
    }
  };

  const entropyBadge = getQualityBadge(metrics.entropy.encrypted.overall, IDEAL_ENTROPY, 0.1);
  const npcrBadge = getQualityBadge(metrics.npcr.overall, IDEAL_NPCR, 0.5);
  const uaciBadge = getQualityBadge(metrics.uaci.overall, IDEAL_UACI, 1.0);
  const correlationBadge = getQualityBadge(Math.abs(metrics.correlation.encrypted.average), IDEAL_CORRELATION, 0.1, false);

  return (
    <div className="mt-4 sm:mt-6 space-y-4 sm:space-y-6">
      <h3 className="font-subheading text-lg sm:text-xl text-white mb-3">
        Security Metrics Analysis
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Entropy */}
        <div className="glass-effect rounded-lg p-4 border border-text-primary/20">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-body text-sm font-semibold text-white">Entropy</h4>
            <span className={`text-xs px-2 py-1 rounded ${entropyBadge.bg} ${entropyBadge.color}`}>
              {entropyBadge.text}
            </span>
          </div>
          <p className="text-xs text-text-primary/70 mb-3">
            Measures randomness/uncertainty. Higher is better (ideal: 8.0)
          </p>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-text-primary">Original:</span>
              <span className="text-sm font-mono text-white">{metrics.entropy.original.overall.toFixed(4)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-text-primary">Encrypted:</span>
              <span className="text-sm font-mono text-green-400">{metrics.entropy.encrypted.overall.toFixed(4)}</span>
            </div>
            <div className="mt-2 pt-2 border-t border-text-primary/20">
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-primary/70">Improvement:</span>
                <span className="text-green-400">
                  +{((metrics.entropy.encrypted.overall - metrics.entropy.original.overall) * 100).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* NPCR */}
        <div className="glass-effect rounded-lg p-4 border border-text-primary/20">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-body text-sm font-semibold text-white">NPCR</h4>
            <span className={`text-xs px-2 py-1 rounded ${npcrBadge.bg} ${npcrBadge.color}`}>
              {npcrBadge.text}
            </span>
          </div>
          <p className="text-xs text-text-primary/70 mb-3">
            Number of Pixels Change Rate (ideal: ~99.6%)
          </p>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-text-primary">Overall:</span>
              <span className="text-sm font-mono text-green-400">{metrics.npcr.overall.toFixed(4)}%</span>
            </div>
            {metrics.npcr.red && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-primary/70">Red:</span>
                <span className="text-sm font-mono text-white">{metrics.npcr.red.toFixed(2)}%</span>
              </div>
            )}
            {metrics.npcr.green && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-primary/70">Green:</span>
                <span className="text-sm font-mono text-white">{metrics.npcr.green.toFixed(2)}%</span>
              </div>
            )}
            {metrics.npcr.blue && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-primary/70">Blue:</span>
                <span className="text-sm font-mono text-white">{metrics.npcr.blue.toFixed(2)}%</span>
              </div>
            )}
          </div>
        </div>

        {/* UACI */}
        <div className="glass-effect rounded-lg p-4 border border-text-primary/20">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-body text-sm font-semibold text-white">UACI</h4>
            <span className={`text-xs px-2 py-1 rounded ${uaciBadge.bg} ${uaciBadge.color}`}>
              {uaciBadge.text}
            </span>
          </div>
          <p className="text-xs text-text-primary/70 mb-3">
            Unified Average Changing Intensity (ideal: ~33.46%)
          </p>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-text-primary">Overall:</span>
              <span className="text-sm font-mono text-green-400">{metrics.uaci.overall.toFixed(4)}%</span>
            </div>
            {metrics.uaci.red && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-primary/70">Red:</span>
                <span className="text-sm font-mono text-white">{metrics.uaci.red.toFixed(2)}%</span>
              </div>
            )}
            {metrics.uaci.green && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-primary/70">Green:</span>
                <span className="text-sm font-mono text-white">{metrics.uaci.green.toFixed(2)}%</span>
              </div>
            )}
            {metrics.uaci.blue && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-primary/70">Blue:</span>
                <span className="text-sm font-mono text-white">{metrics.uaci.blue.toFixed(2)}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Correlation Coefficient */}
        <div className="glass-effect rounded-lg p-4 border border-text-primary/20">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-body text-sm font-semibold text-white">Correlation</h4>
            <span className={`text-xs px-2 py-1 rounded ${correlationBadge.bg} ${correlationBadge.color}`}>
              {correlationBadge.text}
            </span>
          </div>
          <p className="text-xs text-text-primary/70 mb-3">
            Pixel correlation (lower is better, ideal: 0.0)
          </p>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-text-primary">Original:</span>
              <span className="text-sm font-mono text-white">{metrics.correlation.original.average.toFixed(4)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-text-primary">Encrypted:</span>
              <span className="text-sm font-mono text-green-400">{metrics.correlation.encrypted.average.toFixed(4)}</span>
            </div>
            <div className="mt-2 pt-2 border-t border-text-primary/20">
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-primary/70">Reduction:</span>
                <span className="text-green-400">
                  {((1 - Math.abs(metrics.correlation.encrypted.average) / Math.abs(metrics.correlation.original.average)) * 100).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-surface-dark/50 rounded-lg border border-text-primary/20">
        <p className="text-xs text-text-primary/70 font-body">
          <strong className="text-white">Interpretation:</strong> Entropy mendekati 8.0, NPCR mendekati 99.6%, 
          dan UACI mendekati 33.46% menunjukkan enkripsi yang baik. Correlation yang rendah (mendekati 0) 
          menunjukkan bahwa pixel-pixel terenkripsi tidak memiliki korelasi, membuat analisis statistik menjadi sulit.
        </p>
      </div>
    </div>
  );
};

export default ImageSecurityMetrics;

