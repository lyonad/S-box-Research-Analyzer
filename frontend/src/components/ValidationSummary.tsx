import React from 'react';
import { SBoxValidationResult } from '../types';

interface ValidationSummaryProps {
  title: string;
  validation?: SBoxValidationResult | null;
}

const ValidationSummary: React.FC<ValidationSummaryProps> = ({ title, validation }) => {
  if (!validation) {
    return null;
  }

  const badgeClass = (ok: boolean) =>
    ok
      ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40'
      : 'bg-accent-warning/20 text-accent-warning border-accent-warning/40';

  return (
    <div className="glass-effect rounded-xl p-4 sm:p-5 mb-5 border border-text-primary/15">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div>
          <p className="font-heading text-lg text-white">{title}</p>
          <p className="font-body text-xs text-text-primary/70">
            Balanced & Bijective validation per paper requirement (2 criteria)
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span className="text-text-primary/70 uppercase tracking-widest text-[10px]">
            Status
          </span>
          <span
            className={`px-3 py-1 rounded-full border ${
              validation.is_valid
                ? 'bg-emerald-500/10 text-emerald-200 border-emerald-400/40'
                : 'bg-accent-warning/10 text-accent-warning border-accent-warning/40'
            }`}
          >
            {validation.is_valid ? 'Valid' : 'Invalid'}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div
          className={`px-3 py-2 rounded-lg border font-body text-sm ${badgeClass(
            validation.is_balanced
          )}`}
        >
          Balanced output bits (128/128)
        </div>
        <div
          className={`px-3 py-2 rounded-lg border font-body text-sm ${badgeClass(
            validation.is_bijective
          )}`}
        >
          Bijective 0–255 (unique={validation.unique_values})
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {validation.bit_balance.map((entry) => {
          const balanced = entry.ones === entry.expected;
          return (
            <div
              key={entry.bit}
              className={`rounded-lg border px-3 py-2 ${
                balanced
                  ? 'border-emerald-400/30 bg-emerald-500/5'
                  : 'border-accent-warning/40 bg-accent-warning/5'
              }`}
            >
              <p className="font-body text-xs text-text-primary/60">Bit {entry.bit}</p>
              <p className="font-mono text-sm text-white">
                1s: {entry.ones} / 0s: {entry.zeros}
              </p>
            </div>
          );
        })}
      </div>

      {(!validation.is_bijective || validation.duplicate_values.length > 0) && (
        <div className="mt-4">
          <p className="font-body text-xs text-accent-warning mb-1">Bijectivity issues:</p>
          {validation.missing_values.length > 0 && (
            <p className="font-mono text-[11px] text-text-primary">
              Missing values: {validation.missing_values.slice(0, 16).join(', ')}
              {validation.missing_values.length > 16 && '…'}
            </p>
          )}
          {validation.duplicate_values.length > 0 && (
            <p className="font-mono text-[11px] text-text-primary mt-1">
              Duplicates:{' '}
              {validation.duplicate_values
                .map((item) => `${item.value}×${item.count}`)
                .join(', ')}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ValidationSummary;


