/**
 * Parameter Presets Component
 * Save and load parameter configurations for research
 */

import React, { useState, useEffect } from 'react';

interface Preset {
  name: string;
  matrix: number[];
  constant: number;
  timestamp: number;
}

interface ParameterPresetsProps {
  onLoadPreset: (matrix: number[], constant: number) => void;
  currentMatrix: number[];
  currentConstant: number;
}

const ParameterPresets: React.FC<ParameterPresetsProps> = ({
  onLoadPreset,
  currentMatrix,
  currentConstant,
}) => {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [presetName, setPresetName] = useState('');

  useEffect(() => {
    // Load presets from localStorage
    const saved = localStorage.getItem('sbox-presets');
    if (saved) {
      try {
        setPresets(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading presets:', e);
      }
    }
  }, []);

  const savePreset = () => {
    if (!presetName.trim()) {
      alert('Please enter a preset name');
      return;
    }

    const newPreset: Preset = {
      name: presetName.trim(),
      matrix: [...currentMatrix],
      constant: currentConstant,
      timestamp: Date.now(),
    };

    const updated = [...presets, newPreset];
    setPresets(updated);
    localStorage.setItem('sbox-presets', JSON.stringify(updated));
    setPresetName('');
  };

  const loadPreset = (preset: Preset) => {
    onLoadPreset(preset.matrix, preset.constant);
  };

  const deletePreset = (index: number) => {
    const updated = presets.filter((_, i) => i !== index);
    setPresets(updated);
    localStorage.setItem('sbox-presets', JSON.stringify(updated));
  };

  return (
    <div className="glass-effect rounded-xl p-4 border border-primary-light/10">
      <h4 className="font-heading text-lg font-bold text-white mb-4">
        💾 Parameter Presets
      </h4>

      {/* Save Preset */}
      <div className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            placeholder="Preset name..."
            className="flex-1 px-3 py-2 bg-neutral-dark border border-primary-light/20 rounded-lg font-body text-sm text-white focus:border-accent-pink focus:outline-none"
            onKeyPress={(e) => e.key === 'Enter' && savePreset()}
          />
          <button
            onClick={savePreset}
            className="px-4 py-2 bg-accent-pink hover:bg-accent-muted text-white rounded-lg font-body text-sm font-semibold transition-colors"
          >
            Save
          </button>
        </div>
      </div>

      {/* Preset List */}
      {presets.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {presets.map((preset, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-neutral-dark/50 rounded-lg border border-primary-light/10"
            >
              <div className="flex-1">
                <p className="font-body text-sm font-semibold text-white">
                  {preset.name}
                </p>
                <p className="font-mono text-xs text-primary-light">
                  Matrix: {preset.matrix.length === 8 ? '8×8' : 'Invalid'} | 
                  C=0x{preset.constant.toString(16).toUpperCase()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => loadPreset(preset)}
                  className="px-3 py-1 bg-accent-pink/20 hover:bg-accent-pink/30 text-accent-pink rounded font-body text-xs font-semibold transition-colors"
                >
                  Load
                </button>
                <button
                  onClick={() => deletePreset(index)}
                  className="px-3 py-1 bg-primary-light/20 hover:bg-primary-light/30 text-primary-light rounded font-body text-xs font-semibold transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {presets.length === 0 && (
        <p className="font-body text-sm text-primary-light/70 text-center py-4">
          No presets saved. Save your current parameters for quick access.
        </p>
      )}
    </div>
  );
};

export default ParameterPresets;

