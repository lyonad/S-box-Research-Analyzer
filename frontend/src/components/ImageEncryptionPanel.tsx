import React, { useState, useRef } from 'react';
import HistogramChart from './HistogramChart';

interface ImageEncryptionPanelProps {
  className?: string;
  customSBox?: number[] | null;
  customSBoxName?: string;
}

interface HistogramData {
  red: number[];
  green: number[];
  blue: number[];
}

const ImageEncryptionPanel: React.FC<ImageEncryptionPanelProps> = ({ 
  className = '', 
  customSBox = null,
  customSBoxName = 'Custom'
}) => {
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [key, setKey] = useState('');
  const [sboxType, setSboxType] = useState<'k44' | 'aes' | 'custom'>('k44');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    imageUrl: string;
    sboxType: string;
    time: number;
    histograms?: {
      original: HistogramData;
      encrypted: HistogramData;
    };
  } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleEncrypt = async () => {
    if (!selectedFile) {
      setError('Please select an image file to encrypt');
      return;
    }
    if (!key.trim()) {
      setError('Please enter encryption key');
      return;
    }
    if (sboxType === 'custom' && !customSBox) {
      setError('Custom S-box is required but not available. Please generate a custom S-box first.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('key', key);
      formData.append('sbox_type', sboxType);
      if (sboxType === 'custom' && customSBox) {
        formData.append('custom_sbox', JSON.stringify(customSBox));
      }

      const response = await fetch('https://aml-s9xx-box.tail31204e.ts.net/encrypt-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Encryption failed' }));
        throw new Error(errorData.detail || 'Encryption failed');
      }

      // Get headers before converting to blob
      const encryptionTime = response.headers.get('X-Encryption-Time');
      const sboxTypeHeader = response.headers.get('X-Sbox-Type');
      const histogramDataHeader = response.headers.get('X-Histogram-Data');
      
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      // Convert from ms to seconds
      const time = parseFloat(encryptionTime || '0') / 1000;

      // Parse histogram data if available
      let histograms: { original: HistogramData; encrypted: HistogramData } | undefined;
      if (histogramDataHeader) {
        try {
          const decoded = atob(histogramDataHeader);
          const parsed = JSON.parse(decoded);
          histograms = {
            original: parsed.original,
            encrypted: parsed.encrypted,
          };
        } catch (e) {
          console.error('Failed to parse histogram data:', e);
        }
      }

      setResult({
        imageUrl,
        sboxType: sboxTypeHeader || sboxType,
        time,
        histograms,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Encryption failed';
      setError(errorMessage);
      console.error('Encryption error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecrypt = async () => {
    if (!selectedFile) {
      setError('Please select an encrypted image file to decrypt');
      return;
    }
    if (!key.trim()) {
      setError('Please enter decryption key');
      return;
    }
    if (sboxType === 'custom' && !customSBox) {
      setError('Custom S-box is required but not available. Please generate a custom S-box first.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('key', key);
      formData.append('sbox_type', sboxType);
      if (sboxType === 'custom' && customSBox) {
        formData.append('custom_sbox', JSON.stringify(customSBox));
      }

      const response = await fetch('https://aml-s9xx-box.tail31204e.ts.net/decrypt-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Decryption failed' }));
        throw new Error(errorData.detail || 'Decryption failed');
      }

      // Get headers before converting to blob
      const decryptionTime = response.headers.get('X-Decryption-Time');
      const sboxTypeHeader = response.headers.get('X-Sbox-Type');
      
      console.log('Response headers:', {
        'X-Decryption-Time': decryptionTime,
        'X-Sbox-Type': sboxTypeHeader,
        allHeaders: Array.from(response.headers.entries())
      });
      
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      // Convert from ms to seconds
      const time = parseFloat(decryptionTime || '0') / 1000;

      setResult({
        imageUrl,
        sboxType: sboxTypeHeader || sboxType,
        time,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Decryption failed';
      setError(errorMessage);
      console.error('Decryption error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;

    const link = document.createElement('a');
    link.href = result.imageUrl;
    link.download = mode === 'encrypt' ? 'encrypted_image.png' : 'decrypted_image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setKey('');
    setError(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`glass-effect rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-text-primary/10 ${className}`}>
      <div className="mb-4 sm:mb-6">
        <h2 className="font-subheading text-xl sm:text-2xl md:text-3xl text-white mb-2 sm:mb-3">
          Image Encryption & Decryption
        </h2>
        <p className="font-body text-text-primary text-sm sm:text-base">
          Encrypt and decrypt images using AES-128 with K44, AES, or custom S-box. Encrypted images are visible as cipher images.
        </p>
      </div>

      <div className="mb-4 sm:mb-6">
        <div className="flex gap-2 sm:gap-4 mb-3 sm:mb-4">
          <button
            onClick={() => {
              setMode('encrypt');
              setError(null);
              setResult(null);
            }}
            className={`
              flex-1 px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-body font-semibold transition-all text-sm sm:text-base
              ${
                mode === 'encrypt'
                  ? 'bg-white text-black hover:bg-dark-grey hover:text-white shadow-lg'
                  : 'bg-surface-dark/50 text-text-primary hover:bg-white/20 hover:brightness-110 border border-text-primary/20 hover:border-white/40 transition-all'
              }
            `}
          >
            Encrypt Image
          </button>
          <button
            onClick={() => {
              setMode('decrypt');
              setError(null);
              setResult(null);
            }}
            className={`
              flex-1 px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-body font-semibold transition-all text-sm sm:text-base
              ${
                mode === 'decrypt'
                  ? 'bg-white text-black hover:bg-dark-grey hover:text-white shadow-lg'
                  : 'bg-surface-dark/50 text-text-primary hover:bg-white/20 hover:brightness-110 border border-text-primary/20 hover:border-white/40 transition-all'
              }
            `}
          >
            Decrypt Image
          </button>
        </div>

        <div className="flex gap-2 sm:gap-4 flex-wrap">
          <button
            onClick={() => setSboxType('k44')}
            className={`
              flex-1 min-w-[80px] sm:min-w-[120px] px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-body font-medium transition-all text-xs sm:text-sm
              ${
                sboxType === 'k44'
                  ? 'bg-white/20 text-white border-2 border-white/50'
                  : 'bg-surface-dark/50 text-text-primary border-2 border-text-primary/20 hover:border-white/40 hover:bg-white/20 hover:brightness-110 transition-all'
              }
            `}
          >
            K44 S-box
          </button>
          <button
            onClick={() => setSboxType('aes')}
            className={`
              flex-1 min-w-[80px] sm:min-w-[120px] px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-body font-medium transition-all text-xs sm:text-sm
              ${
                sboxType === 'aes'
                  ? 'bg-light-grey/20 text-light-grey border-2 border-light-grey/50'
                  : 'bg-surface-dark/50 text-text-primary border-2 border-text-primary/20 hover:border-white/40 hover:bg-white/20 hover:brightness-110 transition-all'
              }
            `}
          >
            AES S-box
          </button>
          {customSBox && (
            <button
              onClick={() => setSboxType('custom')}
              className={`
                flex-1 min-w-[80px] sm:min-w-[120px] px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-body font-medium transition-all text-xs sm:text-sm
                ${
                  sboxType === 'custom'
                    ? 'bg-white/20 text-white border-2 border-white/50'
                    : 'bg-surface-dark/50 text-text-primary border-2 border-text-primary/20 hover:border-white/40 hover:bg-white/20 hover:brightness-110 transition-all'
                }
              `}
            >
              {customSBoxName}
            </button>
          )}
        </div>
      </div>

      <div className="mb-4 sm:mb-6">
        <label className="block font-body text-sm font-semibold text-white mb-2">
          {mode === 'encrypt' ? 'Select Image to Encrypt' : 'Select Encrypted Image to Decrypt'}
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-surface-dark border border-text-primary/20 rounded-lg font-body text-sm text-white focus:border-white focus:outline-none"
        />
        {selectedFile && (
          <p className="mt-2 font-body text-xs sm:text-sm text-text-primary">
            Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
          </p>
        )}
      </div>

      {previewUrl && mode === 'encrypt' && (
        <div className="mb-4 sm:mb-6">
          <label className="block font-body text-sm font-semibold text-white mb-2">Original Image Preview</label>
          <div className="border border-text-primary/20 rounded-lg p-2 bg-surface-dark/50">
            <img
              src={previewUrl}
              alt="Original"
              className="max-w-full max-h-64 mx-auto rounded"
            />
          </div>
        </div>
      )}

      <div className="mb-4 sm:mb-6">
        <label className="block font-body text-sm font-semibold text-white mb-2">
          {mode === 'encrypt' ? 'Encryption' : 'Decryption'} Key
        </label>
        <input
          type="text"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Enter key (will be padded/truncated to 16 bytes)"
          className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-surface-dark border border-text-primary/20 rounded-lg font-body text-sm text-white focus:border-white focus:outline-none"
        />
      </div>

      {error && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-accent-warning/10 border-l-4 border-accent-warning rounded-lg">
          <p className="font-body text-sm text-accent-warning">{error}</p>
        </div>
      )}

      <div className="flex gap-2 sm:gap-4 mb-4 sm:mb-6">
        <button
          onClick={mode === 'encrypt' ? handleEncrypt : handleDecrypt}
          disabled={loading || !selectedFile || !key.trim()}
          className={`
            flex-1 px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-body font-semibold transition-all text-sm sm:text-base
            ${
              loading || !selectedFile || !key.trim()
                ? 'bg-surface-dark text-text-primary/50 cursor-not-allowed border border-text-primary/30'
                : 'bg-white text-black hover:bg-dark-grey hover:text-white shadow-lg'
            }
          `}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {mode === 'encrypt' ? 'Encrypting...' : 'Decrypting...'}
            </span>
          ) : (
            mode === 'encrypt' ? 'Encrypt Image' : 'Decrypt Image'
          )}
        </button>
        <button
          onClick={handleClear}
          className="px-4 sm:px-6 py-2 sm:py-3 bg-surface-dark/50 text-text-primary hover:bg-white/20 hover:brightness-110 border border-text-primary/20 hover:border-white/40 rounded-lg sm:rounded-xl font-body font-semibold transition-all text-sm sm:text-base"
        >
          Clear
        </button>
      </div>

      {result && (
        <div className="mt-4 sm:mt-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="font-subheading text-lg sm:text-xl text-white">
              {mode === 'encrypt' ? 'Encrypted Image (Cipher Image)' : 'Decrypted Image'}
            </h3>
            <button
              onClick={handleDownload}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-body text-xs sm:text-sm font-semibold transition-colors"
            >
              Download
            </button>
          </div>
          <div className="border border-text-primary/20 rounded-lg p-2 bg-surface-dark/50 mb-3 sm:mb-4">
            <img
              src={result.imageUrl}
              alt={mode === 'encrypt' ? 'Encrypted' : 'Decrypted'}
              className="max-w-full max-h-96 mx-auto rounded"
            />
          </div>
          <div className="flex items-center gap-4 text-xs sm:text-sm text-text-primary mb-4">
            <span>S-box: {result.sboxType.toUpperCase()}</span>
            <span>Time: {result.time.toFixed(2)}s</span>
          </div>

          {/* Histogram Charts */}
          {result.histograms && mode === 'encrypt' && (
            <div className="mt-4 sm:mt-6 space-y-4 sm:space-y-6">
              <h3 className="font-subheading text-lg sm:text-xl text-white mb-3">
                Histogram Analysis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <HistogramChart
                  histogram={result.histograms.original}
                  title="Original Image Histogram"
                />
                <HistogramChart
                  histogram={result.histograms.encrypted}
                  title="Encrypted Image Histogram"
                />
              </div>
              <p className="text-xs sm:text-sm text-text-primary/70 font-body mt-2">
                Histogram menunjukkan distribusi intensitas pixel untuk setiap channel RGB (Red, Green, Blue). 
                Gambar terenkripsi yang baik akan memiliki histogram yang lebih merata dibandingkan gambar asli.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageEncryptionPanel;

