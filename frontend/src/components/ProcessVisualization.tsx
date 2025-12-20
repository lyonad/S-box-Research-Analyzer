import React from 'react';

const validationCriteria = [
  {
    title: 'Balance',
    detail:
      'Representasi biner dari seluruh keluaran harus memiliki jumlah bit 0 dan 1 yang identik (128 masing-masing). Ketidakseimbangan langsung mendiskualifikasi kandidat.',
  },
  {
    title: 'Bijective',
    detail:
      'Semua 256 nilai (0–255) harus muncul tepat sekali. Tidak boleh ada nilai yang hilang atau duplikasi, sehingga S-box dapat dibalik dengan sempurna.',
  },
];

const metricList = [
  'Nonlinearity (NL)',
  'Strict Avalanche Criterion (SAC)',
  'Bit Independence Criterion - NL',
  'Bit Independence Criterion - SAC',
  'Linear Approximation Probability (LAP)',
  'Differential Approximation Probability (DAP)',
  'Differential Uniformity (DU)',
  'Algebraic Degree (AD)',
  'Transparency Order (TO)',
  'Correlation Immunity (CI)',
];

const executionFlow = [
  {
    step: 'Langkah 1',
    title: 'Menentukan matriks affine 8×8',
    valueLabel: 'Ruang Matriks',
    value: '2⁶⁴ kombinasi',
    description:
      'Parameter Panel memberikan kontrol penuh atas 8 baris × 8 kolom bit (0/1). Kombinasi bit ini membentuk ruang pencarian 2⁶⁴ sehingga tiap matriks potensial dapat dipilih atau dimasukkan sesuai eksplorasi paper.',
    codeRefs: ['frontend/src/components/ParameterPanel.tsx', 'backend/sbox_generator.py'],
  },
  {
    step: 'Langkah 2',
    title: 'Transformasi inverse GF(2⁸) + polinomial AES',
    valueLabel: 'Polinomial',
    value: '0x11B',
    description:
      'Setiap byte kandidat dibalik pada GF(2⁸) menggunakan polinomial irreduksibel AES (x⁸ + x⁴ + x³ + x + 1). Matriks affine yang dipilih kemudian diaplikasikan sebagai transformasi linear + konstanta seperti pada paper.',
    codeRefs: ['backend/galois_field.py', 'backend/sbox_generator.py'],
  },
  {
    step: 'Langkah 3',
    title: 'Pembentukan kandidat S-box',
    valueLabel: 'Output',
    value: '2⁶⁴ S-box',
    description:
      'Setiap kombinasi matriks + konstanta menghasilkan tabel 256 nilai (0–255). Meski UI menampilkan satu kandidat waktu-nyata, pipeline merujuk pada seluruh 2⁶⁴ kemungkinan seperti dijelaskan di penelitian.',
    codeRefs: ['backend/sbox_generator.py'],
  },
  {
    step: 'Langkah 4',
    title: 'Seleksi Balance & Bijective',
    valueLabel: 'Tersisa',
    value: '128 S-box',
    description:
      'Hanya kandidat dengan bit output seimbang (128 nol & 128 satu per bit) dan permutasi lengkap 0–255 (tanpa duplikasi) yang dipertahankan. Paper melaporkan 128 S-box memenuhi kriteria ini.',
    codeRefs: ['backend/full_project_verification.py'],
  },
  {
    step: 'Langkah 5',
    title: 'Pengujian 10 metrik kriptografi',
    valueLabel: 'Suite',
    value: 'NL, SAC, … CI',
    description:
      'Setiap S-box lolos validasi diuji otomatis terhadap NL, SAC, BIC-NL, BIC-SAC, LAP, DAP, DU, AD, TO, dan CI. Mayoritas metrik menginginkan nilai seminimal mungkin, kecuali NL/BIC (maksimal) dan SAC (≈0.5).',
    codeRefs: ['backend/cryptographic_tests.py', 'frontend/src/components/MetricsPanel.tsx'],
  },
  {
    step: 'Langkah 6',
    title: 'Penentuan pemenang & komparasi',
    valueLabel: 'Hasil',
    value: 'K44 terbaik',
    description:
      'Tabel perbandingan memilih nilai terbaik per metrik (dengan kriteria “lower/higher/closest”). Menurut paper, S-box ke-44 (K44) unggul. UI menandai setiap metrik untuk Research, AES, dan Custom.',
    codeRefs: ['frontend/src/components/ComparisonTable.tsx', 'backend/main.py (/compare)'],
  },
];

const quantitativeStats = [
  {
    label: 'Jumlah Matriks Affine 8×8',
    value: '2⁶⁴',
    description: 'Setiap posisi (8×8) menampung bit 0/1 sehingga total kombinasi mencapai 18.4×10¹⁸.',
  },
  {
    label: 'Kandidat S-box',
    value: '2⁶⁴',
    description: 'Masing-masing matriks + konstanta affine membentuk satu S-box kandidat di GF(2⁸).',
  },
  {
    label: 'S-box Valid (Balance + Bijective)',
    value: '128',
    description: 'Hanya 128 kandidat yang memenuhi keseimbangan 128/128 dan permutasi 0–255 tanpa duplikasi.',
  },
  {
    label: 'S-box Terbaik (Paper)',
    value: 'K44',
    description: 'Menjadi unggulan setelah pengujian NL, SAC, BIC, LAP, DAP, DU, AD, TO, dan CI.',
  },
];

const ProcessVisualization: React.FC = () => {
  return (
    <section className="mb-8 sm:mb-10 md:mb-12">
      <div className="glass-effect rounded-2xl border border-white/10 p-5 sm:p-7 md:p-9">
        <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8">
          <span className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold uppercase tracking-widest text-text-primary/70">
            <span className="w-2 h-2 bg-white/70 rounded-full animate-pulse"></span>
            Research Pipeline Overview
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl text-white">
            Proses Lengkap Explorasi Affine Matrix → S-box
          </h2>
          <p className="font-body text-text-primary text-sm sm:text-base max-w-3xl">
            Visual berikut merangkum alur kerja yang diimplementasikan aplikasi berdasarkan paper{' '}
            <span className="font-semibold">“AES S-box modification uses affine matrices exploration”</span>{' '}
            (DOI: 10.1007/s11071-024-10414-3).
          </p>
        </div>

        <div className="mb-6 sm:mb-8 space-y-4">
          <h3 className="text-white font-heading text-xl sm:text-2xl">
            Langkah eksekusi dari awal hingga akhir
          </h3>
          <div className="space-y-4">
            {executionFlow.map((item) => (
              <div
                key={item.step}
                className="relative pl-6 border-l border-white/15 pb-4 last:pb-0"
              >
                <span className="absolute -left-[6px] top-3 w-3 h-3 bg-white rounded-full shadow-md"></span>
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-widest text-text-primary/70">
                  <span>{item.step}</span>
                  <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/80">{item.valueLabel}</span>
                  <span className="text-white/90">{item.value}</span>
                </div>
                <h4 className="text-white font-heading text-lg sm:text-xl mt-1">{item.title}</h4>
                <p className="text-sm text-text-primary/90 leading-relaxed mt-1">{item.description}</p>
                {item.codeRefs && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {item.codeRefs.map((ref) => (
                      <span
                        key={ref}
                        className="text-[11px] font-mono text-white/80 bg-white/5 border border-white/15 rounded-md px-2 py-0.5"
                      >
                        {ref}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-4 mb-6 sm:mb-8">
          {quantitativeStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/10 bg-surface-dark/70 p-4 sm:p-5 flex flex-col gap-2"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-text-primary/60">
                {stat.label}
              </p>
              <p className="text-2xl sm:text-3xl font-heading text-white">{stat.value}</p>
              <p className="text-sm text-text-primary/85 leading-relaxed">{stat.description}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 sm:gap-5 md:grid-cols-2 mb-6 sm:mb-8">
          {validationCriteria.map((criterion) => (
            <div
              key={criterion.title}
              className="rounded-2xl border border-white/10 bg-surface-dark/60 p-5 sm:p-6 flex flex-col gap-2 shadow-lg"
            >
              <h4 className="text-white text-lg font-heading">{criterion.title}</h4>
              <p className="text-sm text-text-primary/90 leading-relaxed">{criterion.detail}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
            <h4 className="text-white text-lg font-heading">10 Pengujian Kriptografi</h4>
          </div>
          <p className="text-sm text-text-primary mb-4">
            Mayoritas metrik menggunakan prinsip “semakin kecil semakin baik”. Pengecualian:
            Nonlinearity & BIC membutuhkan nilai maksimum, sedangkan SAC terbaik bila mendekati 0.5.
          </p>
          <div className="flex flex-wrap gap-2">
            {metricList.map((metric) => (
              <span
                key={metric}
                className="px-3 py-1.5 rounded-full border border-white/15 text-xs font-semibold text-white/80 bg-white/5"
              >
                {metric}
              </span>
            ))}
          </div>
        </div>

        <p className="text-xs text-text-primary/60 mt-6">
          * Setelah seluruh tahapan, 128 kandidat tersisa diuji berdampingan (Research K44, AES S-box,
          dan custom) melalui tabel perbandingan di bawah. K44 consistently unggul seperti yang
          dilaporkan pada paper.
        </p>
      </div>
    </section>
  );
};

export default ProcessVisualization;

