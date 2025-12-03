/**
 * Encryption Panel Component
 * Provides encryption and decryption functionality using K44 or AES S-box
 */

import React, { useState } from 'react';
import apiService from '../api';
import LoadingSpinner from './LoadingSpinner';

interface EncryptionPanelProps {
  className?: string;
  customSBox?: number[] | null;
  customSBoxName?: string;
}

const EncryptionPanel: React.FC<EncryptionPanelProps> = ({ 
  className = '', 
  customSBox = null,
  customSBoxName = 'Custom'
}) => {
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [plaintext, setPlaintext] = useState('');
  const [ciphertext, setCiphertext] = useState('');
  const [key, setKey] = useState('');
  const [sboxType, setSboxType] = useState<'k44' | 'aes' | 'custom'>('k44');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    text: string;
    sboxType: string;
    time: number;
  } | null>(null);

  const handleEncrypt = async () => {
    if (!plaintext.trim()) {
      setError('Please enter plaintext to encrypt');
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
      const response = await apiService.encrypt({
        plaintext,
        key,
        sbox_type: sboxType,
        custom_sbox: sboxType === 'custom' ? (customSBox ?? undefined) : undefined,
      });

      setCiphertext(response.ciphertext);
      setResult({
        text: response.ciphertext,
        sboxType: response.sbox_type,
        time: response.encryption_time_ms,
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Encryption failed');
      console.error('Encryption error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecrypt = async () => {
    if (!ciphertext.trim()) {
      setError('Please enter ciphertext to decrypt');
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
      const response = await apiService.decrypt({
        ciphertext,
        key,
        sbox_type: sboxType,
        custom_sbox: sboxType === 'custom' ? (customSBox ?? undefined) : undefined,
      });

      setPlaintext(response.plaintext);
      setResult({
        text: response.plaintext,
        sboxType: response.sbox_type,
        time: response.decryption_time_ms,
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Decryption failed');
      console.error('Decryption error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleClear = () => {
    setPlaintext('');
    setCiphertext('');
    setKey('');
    setError(null);
    setResult(null);
  };

  return (
    <div className={`glass-effect rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-text-primary/10 ${className}`}>
      <div className="mb-4 sm:mb-6">
        <h2 className="font-subheading text-xl sm:text-2xl md:text-3xl text-white mb-2 sm:mb-3">
          Encryption & Decryption
        </h2>
        <p className="font-body text-text-primary text-sm sm:text-base">
          Encrypt and decrypt messages using AES-128 with K44, AES, or custom S-box
        </p>
      </div>

      {/* Mode Selection */}
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
            Encrypt
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
            Decrypt
          </button>
        </div>

        {/* S-box Type Selection */}
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
              disabled={!customSBox}
              className={`
                flex-1 min-w-[80px] sm:min-w-[120px] px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-body font-medium transition-all text-xs sm:text-sm
                ${
                  sboxType === 'custom'
                    ? 'bg-white/20 text-white border-2 border-white/50'
                    : 'bg-surface-dark/50 text-text-primary border-2 border-text-primary/20 hover:border-white/40 hover:bg-white/20 hover:brightness-110 transition-all'
                }
                ${!customSBox ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              title={customSBox ? `Use ${customSBoxName} S-box` : 'No custom S-box available'}
            >
              {customSBoxName}
            </button>
          )}
        </div>
        {customSBox && sboxType === 'custom' && (
          <div className="mt-2 p-2 bg-white/10 border border-white/30 rounded-lg">
            <p className="text-xs text-white font-body">
              Using custom S-box: {customSBoxName}
            </p>
          </div>
        )}
      </div>

      {/* Input Fields */}
      <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
        {/* Plaintext (for encryption) or Ciphertext (for decryption) */}
        <div>
          <label className="block font-body text-xs sm:text-sm font-semibold text-text-primary mb-1.5 sm:mb-2">
            {mode === 'encrypt' ? 'Plaintext' : 'Ciphertext (Base64)'}
          </label>
          <div className="relative">
            <textarea
              value={mode === 'encrypt' ? plaintext : ciphertext}
              onChange={(e) => {
                if (mode === 'encrypt') {
                  setPlaintext(e.target.value);
                } else {
                  setCiphertext(e.target.value);
                }
                setError(null);
              }}
              placeholder={mode === 'encrypt' ? 'Enter text to encrypt...' : 'Enter base64 ciphertext...'}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-surface-dark border border-text-primary/30 rounded-lg sm:rounded-xl text-white font-mono text-xs sm:text-sm focus:outline-none focus:border-white focus:ring-2 focus:ring-white/30 resize-none"
              rows={3}
            />
            {(mode === 'encrypt' ? plaintext : ciphertext) && (
              <button
                onClick={() => handleCopy(mode === 'encrypt' ? plaintext : ciphertext)}
                className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 px-2 sm:px-3 py-0.5 sm:py-1 bg-surface-dark hover:bg-white/20 hover:border-white/40 hover:brightness-110 border border-text-primary/20 text-text-primary rounded-lg text-[10px] sm:text-xs font-body transition-all"
              >
                Copy
              </button>
            )}
          </div>
        </div>

        {/* Key */}
        <div>
          <label className="block font-body text-xs sm:text-sm font-semibold text-text-primary mb-1.5 sm:mb-2">
            Key (will be padded/truncated to 16 bytes)
          </label>
          <input
            type="text"
            value={key}
            onChange={(e) => {
              setKey(e.target.value);
              setError(null);
            }}
            placeholder="Enter encryption key..."
            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-surface-dark border border-text-primary/30 rounded-lg sm:rounded-xl text-white font-mono text-xs sm:text-sm focus:outline-none focus:border-white focus:ring-2 focus:ring-white/30"
          />
          <p className="mt-1 text-[10px] sm:text-xs text-text-primary/70 font-body">
            Key will be automatically adjusted to 16 bytes
          </p>
          {sboxType === 'custom' && !customSBox && (
            <p className="mt-1 text-[10px] sm:text-xs text-accent-warning font-body">
              Warning: Custom S-box is required but not available.
            </p>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-accent-warning/20 border border-accent-warning/50 rounded-xl">
          <p className="text-accent-warning font-body text-sm">{error}</p>
        </div>
      )}

      {/* Result Display */}
      {result && (
          <div className="mb-4 p-4 bg-white/10 border border-white/30 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white font-body text-sm font-semibold">
              {mode === 'encrypt' ? 'Encrypted' : 'Decrypted'} successfully!
            </p>
            <span className="text-xs text-text-primary font-body">
              {result.time.toFixed(2)} ms
            </span>
          </div>
          <div className="relative">
            <textarea
              value={result.text}
              readOnly
                className="w-full px-4 py-3 bg-surface-dark border border-white/30 rounded-xl text-white font-mono text-sm resize-none"
              rows={mode === 'encrypt' ? 3 : 4}
            />
            <button
              onClick={() => handleCopy(result.text)}
                className="absolute top-2 right-2 px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-body transition-all"
            >
              Copy
            </button>
          </div>
          <p className="mt-2 text-xs text-text-primary/70 font-body">
            Using {result.sboxType.toUpperCase()} S-box
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 sm:gap-4">
        <button
          onClick={mode === 'encrypt' ? handleEncrypt : handleDecrypt}
          disabled={loading}
            className={`
            flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl font-body font-bold text-sm sm:text-base md:text-lg
            transition-all duration-300 transform shadow-lg
            ${
              loading
                ? 'bg-surface-dark text-text-primary/50 cursor-not-allowed border border-text-primary/30 opacity-60'
                : 'bg-white text-black hover:bg-dark-grey hover:text-white hover:shadow-2xl hover:brightness-95'
            }
          `}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2 sm:gap-3">
              <LoadingSpinner size="sm" />
              Processing...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-1.5 sm:gap-2">
              {mode === 'encrypt' ? (
                <>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Encrypt
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                  Decrypt
                </>
              )}
            </span>
          )}
        </button>
        <button
          onClick={handleClear}
          className="px-4 sm:px-6 py-3 sm:py-4 bg-surface-dark hover:bg-white/20 hover:border-white/40 hover:brightness-110 border border-text-primary/20 text-text-primary rounded-lg sm:rounded-xl font-body font-semibold transition-all text-sm sm:text-base"
        >
          Clear
        </button>
      </div>

      {/* Info */}
      <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-surface-dark/50 rounded-lg sm:rounded-xl border border-text-primary/20">
        <p className="text-[10px] sm:text-xs text-text-primary/70 font-body leading-relaxed">
          <strong className="text-text-primary">Note:</strong> This implementation uses AES-128 in CBC mode with PKCS7 padding. 
          The key will be automatically padded or truncated to 16 bytes.
        </p>
      </div>
    </div>
  );
};

export default EncryptionPanel;

