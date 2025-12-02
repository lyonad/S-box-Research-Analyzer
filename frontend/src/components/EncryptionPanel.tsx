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
        custom_sbox: sboxType === 'custom' ? customSBox : undefined,
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
        custom_sbox: sboxType === 'custom' ? customSBox : undefined,
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
    <div className={`glass-effect rounded-2xl p-8 border border-primary-light/10 ${className}`}>
      <div className="mb-6">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-3">
          Encryption & Decryption
        </h2>
        <p className="font-body text-primary-light text-base">
          Encrypt and decrypt messages using AES-128 with K44, AES, or custom S-box
        </p>
      </div>

      {/* Mode Selection */}
      <div className="mb-6">
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => {
              setMode('encrypt');
              setError(null);
              setResult(null);
            }}
            className={`
              flex-1 px-6 py-3 rounded-xl font-body font-semibold transition-all
              ${
                mode === 'encrypt'
                  ? 'bg-accent-pink text-white shadow-lg'
                  : 'bg-primary-light/10 text-primary-light hover:bg-primary-light/20'
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
              flex-1 px-6 py-3 rounded-xl font-body font-semibold transition-all
              ${
                mode === 'decrypt'
                  ? 'bg-accent-pink text-white shadow-lg'
                  : 'bg-primary-light/10 text-primary-light hover:bg-primary-light/20'
              }
            `}
          >
            Decrypt
          </button>
        </div>

        {/* S-box Type Selection */}
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={() => setSboxType('k44')}
            className={`
              flex-1 min-w-[120px] px-4 py-2 rounded-lg font-body font-medium transition-all text-sm
              ${
                sboxType === 'k44'
                  ? 'bg-blue-500/20 text-blue-400 border-2 border-blue-500/50'
                  : 'bg-primary-light/5 text-primary-light border-2 border-primary-light/10 hover:border-primary-light/20'
              }
            `}
          >
            K44 S-box
          </button>
          <button
            onClick={() => setSboxType('aes')}
            className={`
              flex-1 min-w-[120px] px-4 py-2 rounded-lg font-body font-medium transition-all text-sm
              ${
                sboxType === 'aes'
                  ? 'bg-purple-500/20 text-purple-400 border-2 border-purple-500/50'
                  : 'bg-primary-light/5 text-primary-light border-2 border-primary-light/10 hover:border-primary-light/20'
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
                flex-1 min-w-[120px] px-4 py-2 rounded-lg font-body font-medium transition-all text-sm
                ${
                  sboxType === 'custom'
                    ? 'bg-pink-500/20 text-pink-400 border-2 border-pink-500/50'
                    : 'bg-primary-light/5 text-primary-light border-2 border-primary-light/10 hover:border-primary-light/20'
                }
                ${!customSBox ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              title={customSBox ? `Use ${customSBoxName} S-box` : 'No custom S-box available'}
            >
              {customSBoxName} S-box
            </button>
          )}
        </div>
        {customSBox && sboxType === 'custom' && (
          <div className="mt-2 p-2 bg-pink-500/10 border border-pink-500/30 rounded-lg">
            <p className="text-xs text-pink-400 font-body">
              Using custom S-box: {customSBoxName}
            </p>
          </div>
        )}
      </div>

      {/* Input Fields */}
      <div className="space-y-4 mb-6">
        {/* Plaintext (for encryption) or Ciphertext (for decryption) */}
        <div>
          <label className="block font-body text-sm font-semibold text-primary-light mb-2">
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
              className="w-full px-4 py-3 bg-primary-dark/50 border border-primary-light/20 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-accent-pink/50 focus:ring-2 focus:ring-accent-pink/20 resize-none"
              rows={4}
            />
            {(mode === 'encrypt' ? plaintext : ciphertext) && (
              <button
                onClick={() => handleCopy(mode === 'encrypt' ? plaintext : ciphertext)}
                className="absolute top-2 right-2 px-3 py-1 bg-primary-light/10 hover:bg-primary-light/20 text-primary-light rounded-lg text-xs font-body transition-all"
              >
                Copy
              </button>
            )}
          </div>
        </div>

        {/* Key */}
        <div>
          <label className="block font-body text-sm font-semibold text-primary-light mb-2">
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
            className="w-full px-4 py-3 bg-primary-dark/50 border border-primary-light/20 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-accent-pink/50 focus:ring-2 focus:ring-accent-pink/20"
          />
          <p className="mt-1 text-xs text-primary-light/70 font-body">
            Key will be automatically adjusted to 16 bytes
          </p>
          {sboxType === 'custom' && !customSBox && (
            <p className="mt-1 text-xs text-red-400 font-body">
              Warning: Custom S-box is required but not available. Please generate a custom S-box first.
            </p>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl">
          <p className="text-red-400 font-body text-sm">{error}</p>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="mb-4 p-4 bg-green-500/20 border border-green-500/50 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <p className="text-green-400 font-body text-sm font-semibold">
              {mode === 'encrypt' ? 'Encrypted' : 'Decrypted'} successfully!
            </p>
            <span className="text-xs text-primary-light font-body">
              {result.time.toFixed(2)} ms
            </span>
          </div>
          <div className="relative">
            <textarea
              value={result.text}
              readOnly
              className="w-full px-4 py-3 bg-primary-dark/50 border border-green-500/30 rounded-xl text-white font-mono text-sm resize-none"
              rows={mode === 'encrypt' ? 3 : 4}
            />
            <button
              onClick={() => handleCopy(result.text)}
              className="absolute top-2 right-2 px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-xs font-body transition-all"
            >
              Copy
            </button>
          </div>
          <p className="mt-2 text-xs text-primary-light/70 font-body">
            Using {result.sboxType.toUpperCase()} S-box
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={mode === 'encrypt' ? handleEncrypt : handleDecrypt}
          disabled={loading}
          className={`
            flex-1 px-6 py-4 rounded-xl font-body font-bold text-white text-lg
            transition-all duration-300 transform shadow-lg
            ${
              loading
                ? 'bg-primary-light/20 cursor-not-allowed'
                : 'bg-accent-pink hover:bg-accent-muted hover:shadow-2xl hover:scale-105'
            }
          `}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <LoadingSpinner size="sm" />
              Processing...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              {mode === 'encrypt' ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Encrypt
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          className="px-6 py-4 bg-primary-light/10 hover:bg-primary-light/20 text-primary-light rounded-xl font-body font-semibold transition-all"
        >
          Clear
        </button>
      </div>

      {/* Info */}
      <div className="mt-6 p-4 bg-primary-light/5 rounded-xl border border-primary-light/10">
        <p className="text-xs text-primary-light/70 font-body leading-relaxed">
          <strong className="text-primary-light">Note:</strong> This implementation uses AES-128 in CBC mode with PKCS7 padding. 
          The key will be automatically padded or truncated to 16 bytes. 
          For decryption, use the same key and S-box type used for encryption.
        </p>
      </div>
    </div>
  );
};

export default EncryptionPanel;

