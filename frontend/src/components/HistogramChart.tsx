/**
 * Histogram Chart Component
 * Displays RGB histogram for images
 */

import React, { useEffect, useRef, useState } from 'react';

interface HistogramChartProps {
  histogram: {
    red: number[];
    green: number[];
    blue: number[];
  };
  title: string;
  className?: string;
}

const HistogramChart: React.FC<HistogramChartProps> = ({ 
  histogram, 
  title, 
  className = '' 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modalCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    // Find max value for normalization
    const maxRed = Math.max(...histogram.red);
    const maxGreen = Math.max(...histogram.green);
    const maxBlue = Math.max(...histogram.blue);
    const maxValue = Math.max(maxRed, maxGreen, maxBlue);

    // Draw grid
    ctx.strokeStyle = '#2a2a3e';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = (height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw histogram bars
    const barWidth = width / 256;
    const scale = (height - 20) / maxValue;

    // Draw Red channel
    ctx.fillStyle = 'rgba(255, 0, 0, 0.6)';
    for (let i = 0; i < 256; i++) {
      const barHeight = histogram.red[i] * scale;
      ctx.fillRect(i * barWidth, height - barHeight - 10, barWidth - 1, barHeight);
    }

    // Draw Green channel
    ctx.fillStyle = 'rgba(0, 255, 0, 0.6)';
    for (let i = 0; i < 256; i++) {
      const barHeight = histogram.green[i] * scale;
      ctx.fillRect(i * barWidth, height - barHeight - 10, barWidth - 1, barHeight);
    }

    // Draw Blue channel
    ctx.fillStyle = 'rgba(0, 0, 255, 0.6)';
    for (let i = 0; i < 256; i++) {
      const barHeight = histogram.blue[i] * scale;
      ctx.fillRect(i * barWidth, height - barHeight - 10, barWidth - 1, barHeight);
    }

    // Draw axis labels
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('0', 5, height - 5);
    ctx.textAlign = 'right';
    ctx.fillText('255', width - 5, height - 5);
  }, [histogram]);

  // Draw histogram on modal canvas (larger size)
  useEffect(() => {
    if (!isModalOpen) return;
    
    const canvas = modalCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    // Find max value for normalization
    const maxRed = Math.max(...histogram.red);
    const maxGreen = Math.max(...histogram.green);
    const maxBlue = Math.max(...histogram.blue);
    const maxValue = Math.max(maxRed, maxGreen, maxBlue);

    // Draw grid
    ctx.strokeStyle = '#2a2a3e';
    ctx.lineWidth = 2;
    for (let i = 0; i <= 4; i++) {
      const y = (height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw histogram bars
    const barWidth = width / 256;
    const scale = (height - 40) / maxValue;

    // Draw Red channel
    ctx.fillStyle = 'rgba(255, 0, 0, 0.6)';
    for (let i = 0; i < 256; i++) {
      const barHeight = histogram.red[i] * scale;
      ctx.fillRect(i * barWidth, height - barHeight - 20, barWidth - 1, barHeight);
    }

    // Draw Green channel
    ctx.fillStyle = 'rgba(0, 255, 0, 0.6)';
    for (let i = 0; i < 256; i++) {
      const barHeight = histogram.green[i] * scale;
      ctx.fillRect(i * barWidth, height - barHeight - 20, barWidth - 1, barHeight);
    }

    // Draw Blue channel
    ctx.fillStyle = 'rgba(0, 0, 255, 0.6)';
    for (let i = 0; i < 256; i++) {
      const barHeight = histogram.blue[i] * scale;
      ctx.fillRect(i * barWidth, height - barHeight - 20, barWidth - 1, barHeight);
    }

    // Draw axis labels
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('0', 10, height - 10);
    ctx.textAlign = 'right';
    ctx.fillText('255', width - 10, height - 10);
  }, [histogram, isModalOpen]);

  return (
    <>
      <div className={className}>
        <h4 className="font-body text-sm font-semibold text-white mb-2">{title}</h4>
        <div 
          className="border border-text-primary/20 rounded-lg p-2 bg-surface-dark/50 cursor-pointer hover:border-white/40 hover:bg-surface-dark/70 transition-all"
          onClick={() => setIsModalOpen(true)}
        >
          <canvas
            ref={canvasRef}
            width={512}
            height={200}
            className="w-full h-auto rounded"
          />
          <div className="flex items-center justify-center gap-4 mt-2 text-xs text-text-primary">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500/60 rounded"></div>
              <span>Red</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500/60 rounded"></div>
              <span>Green</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500/60 rounded"></div>
              <span>Blue</span>
            </div>
          </div>
          <p className="text-center text-xs text-text-primary/60 mt-2">
            Klik untuk memperbesar
          </p>
        </div>
      </div>

      {/* Modal for enlarged histogram */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="glass-effect rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-text-primary/20 max-w-6xl w-full mx-4 max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-subheading text-xl sm:text-2xl text-white">{title}</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-body text-sm font-semibold transition-colors"
              >
                Tutup
              </button>
            </div>
            <div className="border border-text-primary/20 rounded-lg p-4 bg-surface-dark/50">
              <canvas
                ref={modalCanvasRef}
                width={1024}
                height={400}
                className="w-full h-auto rounded"
              />
              <div className="flex items-center justify-center gap-6 mt-4 text-sm text-text-primary">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500/60 rounded"></div>
                  <span>Red</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500/60 rounded"></div>
                  <span>Green</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500/60 rounded"></div>
                  <span>Blue</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HistogramChart;

