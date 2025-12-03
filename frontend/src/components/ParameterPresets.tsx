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
    <div className="glass-effect rounded-xl p-4 border border-text-primary/20">
      <h4 className="font-subheading text-lg text-white mb-4">
        Parameter Presets
      </h4>

      {/* Save Preset */}
      <div className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            placeholder="Preset name..."
            className="flex-1 px-3 py-2 bg-surface-dark border border-text-primary/20 rounded-lg font-body text-sm text-white focus:border-white focus:outline-none"
            onKeyPress={(e) => e.key === 'Enter' && savePreset()}
          />
          <button
            onClick={savePreset}
            className="px-4 py-2 bg-white hover:bg-dark-grey hover:text-white text-black rounded-lg font-body text-sm font-semibold transition-colors"
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
              className="flex items-center justify-between p-2 bg-surface-dark/50 rounded-lg border border-text-primary/20"
            >
              <div className="flex-1">
                <p className="font-body text-sm font-semibold text-white">
                  {preset.name}
                </p>
                <p className="font-mono text-xs text-text-primary">
                  Matrix: {preset.matrix.length === 8 ? '8×8' : 'Invalid'} | 
                  C=0x{preset.constant.toString(16).toUpperCase()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => loadPreset(preset)}
                  className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded font-body text-xs font-semibold transition-colors"
                >
                  Load
                </button>
                <button
                  onClick={() => deletePreset(index)}
                  className="px-3 py-1 bg-surface-dark hover:bg-white/20 hover:border-white/40 hover:brightness-110 border border-text-primary/20 text-text-primary rounded font-body text-xs font-semibold transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {presets.length === 0 && (
        <p className="font-body text-sm text-text-primary/70 text-center py-4">
          No presets saved. Save your current parameters for quick access.
        </p>
      )}
    </div>
  );
};

export default ParameterPresets;

