import React from 'react';

export interface SecurityScoreEntry {
  id: string;
  label: string;
  score: number;
  wins: string[];
  isBest?: boolean;
}

interface SecurityScoreboardProps {
  entries: SecurityScoreEntry[];
}

const SecurityScoreboard: React.FC<SecurityScoreboardProps> = ({ entries }) => {
  if (!entries || entries.length === 0) {
    return null;
  }

  return (
    <div className="glass-effect rounded-2xl p-5 sm:p-6 border border-text-primary/15">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
        <div>
          <p className="font-heading text-xl text-white">Global Ranking (Higher = Better)</p>
          <p className="font-body text-xs text-text-primary/70">
            Skor = jumlah metrik yang dimenangkan (boleh seri). Semakin banyak kemenangan,
            semakin kuat secara kriptografi.
          </p>
        </div>
        <span className="text-[11px] uppercase tracking-widest text-text-primary/70">
          Akumulasi kemenangan lintas 10 metrik
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className={`rounded-xl border px-4 py-5 flex flex-col gap-3 ${
              entry.isBest
                ? 'border-white/60 bg-white/10 shadow-lg'
                : 'border-text-primary/20 bg-surface-dark/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="font-heading text-lg text-white">{entry.label}</p>
              {entry.isBest && (
                <span className="text-[10px] font-semibold uppercase tracking-widest text-white">
                  Top Score
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-4xl font-bold text-white">{entry.score}</span>
              <span className="text-xs text-text-primary/70 uppercase tracking-widest">
                wins
              </span>
            </div>
            <div className="space-y-1">
              {entry.wins.length === 0 ? (
                <p className="text-xs text-text-primary/60 font-body">
                  Belum ada metrik yang dimenangkan sendiri (semua seri)
                </p>
              ) : (
                entry.wins.map((metric) => (
                  <div
                    key={`${entry.id}-${metric}`}
                    className="text-xs font-body text-white/80 bg-white/5 border border-white/10 rounded-lg px-2 py-1"
                  >
                    {metric}
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SecurityScoreboard;

