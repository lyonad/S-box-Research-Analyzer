/**
 * Main Application Component
 * AES S-box Research Analyzer
 * Comprehensive platform for affine matrices exploration and S-box research
 */

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import TeamSection from './components/TeamSection';
import ControlPanel from './components/ControlPanel';
import ParameterPanel from './components/ParameterPanel';
import ParameterInfo from './components/ParameterInfo';
import SBoxGrid from './components/SBoxGrid';
import MetricsPanel from './components/MetricsPanel';
import ComparisonTable from './components/ComparisonTable';
import LoadingSpinner from './components/LoadingSpinner';
import apiService from './api';
import { ComparisonData, MetricComparison, AnalysisResults, SBox } from './types';

// Default K44 matrix (from paper - best performer)
const DEFAULT_K44_MATRIX = [
  0b01010111, 0b10101011, 0b11010101, 0b11101010,
  0b01110101, 0b10111010, 0b01011101, 0b10101110,
];

const DEFAULT_CONSTANT = 0x63;

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [activeTab, setActiveTab] = useState<'k44' | 'aes' | 'comparison' | 'custom'>('comparison');
  const [customParams, setCustomParams] = useState<{
    matrix: number[];
    constant: number;
    useCustom: boolean;
  }>({
    matrix: DEFAULT_K44_MATRIX,
    constant: DEFAULT_CONSTANT,
    useCustom: false,
  });
  const [customSBox, setCustomSBox] = useState<number[] | null>(null);
  const [customAnalysis, setCustomAnalysis] = useState<AnalysisResults | null>(null);
  const [customSBoxParams, setCustomSBoxParams] = useState<{
    matrix: number[];
    matrixName: string;
    constant: number;
  } | null>(null);

  // Check API health on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        await apiService.healthCheck();
      } catch (err) {
        setError('Unable to connect to backend API. Please ensure the server is running on http://localhost:8000');
      }
    };
    checkHealth();
  }, []);

  const handleGenerateAndCompare = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiService.compareSBoxes();
      setComparisonData(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to generate and analyze S-boxes. Please check the backend server.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleParametersChange = (params: {
    matrix: number[];
    constant: number;
    useCustom: boolean;
  }) => {
      setCustomParams(params);
    // Don't auto-generate, let user click button
    setCustomSBox(null);
    setCustomAnalysis(null);
    setCustomSBoxParams(null);
  };

  const handleGenerateCustom = async () => {
    setLoading(true);
    setError(null);

    try {
      // Always send the matrix and constant, regardless of useCustom flag
      // The API will handle determining if it's K44, AES, or custom
      const sboxResponse = await apiService.generateSBox(
        false, // Don't use use_k44 flag when we have explicit matrix
        customParams.matrix,
        customParams.constant
      );
      setCustomSBox(sboxResponse.sbox);
      
      // Determine matrix name for display
      const matrixName = sboxResponse.matrix_used || 
        (customParams.useCustom ? 'Custom Matrix' : 'Selected Matrix');
      
      // Store parameters for display
      setCustomSBoxParams({
        matrix: [...customParams.matrix],
        matrixName: matrixName,
        constant: customParams.constant,
      });
      
      const analysisResponse = await apiService.analyzeSBox(
        sboxResponse.sbox,
        `${matrixName} S-box (C=0x${customParams.constant.toString(16).toUpperCase()})`
      );
      setCustomAnalysis(analysisResponse);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to generate custom S-box. Please check parameters.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Prepare comparison metrics
  const getComparisonMetrics = (): MetricComparison[] => {
    if (!comparisonData) return [];

    return [
      {
        name: 'Nonlinearity (Avg)',
        k44: comparisonData.k44_analysis.nonlinearity.average,
        aes: comparisonData.aes_analysis.nonlinearity.average,
        target: '112',
      },
      {
        name: 'Nonlinearity (Min)',
        k44: comparisonData.k44_analysis.nonlinearity.min,
        aes: comparisonData.aes_analysis.nonlinearity.min,
        target: '112',
      },
      {
        name: 'SAC (Average)',
        k44: comparisonData.k44_analysis.sac.average,
        aes: comparisonData.aes_analysis.sac.average,
        target: '~0.5',
      },
      {
        name: 'SAC (Std Dev)',
        k44: comparisonData.k44_analysis.sac.std,
        aes: comparisonData.aes_analysis.sac.std,
        target: 'Lower is better',
      },
      {
        name: 'BIC-NL (Average)',
        k44: comparisonData.k44_analysis.bic_nl.average,
        aes: comparisonData.aes_analysis.bic_nl.average,
        target: 'Higher is better',
      },
      {
        name: 'BIC-SAC (Avg Deviation)',
        k44: comparisonData.k44_analysis.bic_sac.average_deviation,
        aes: comparisonData.aes_analysis.bic_sac.average_deviation,
        target: 'Lower is better',
      },
      {
        name: 'LAP (Max)',
        k44: comparisonData.k44_analysis.lap.max_lap,
        aes: comparisonData.aes_analysis.lap.max_lap,
        target: 'Lower is better',
      },
      {
        name: 'LAP (Max Bias)',
        k44: comparisonData.k44_analysis.lap.max_bias,
        aes: comparisonData.aes_analysis.lap.max_bias,
        target: 'Lower is better',
      },
      {
        name: 'DAP (Max)',
        k44: comparisonData.k44_analysis.dap.max_dap,
        aes: comparisonData.aes_analysis.dap.max_dap,
        target: 'Lower is better',
      },
    ];
  };

  // Prepare full analysis results for MetricsPanel
  const getK44Results = (): AnalysisResults | null => {
    if (!comparisonData) return null;
    return {
      sbox_name: 'Research S-box (K44)',
      ...comparisonData.k44_analysis,
      analysis_time_ms: comparisonData.analysis_time_ms / 2, // Approximate
    };
  };

  const getAESResults = (): AnalysisResults | null => {
    if (!comparisonData) return null;
    return {
      sbox_name: 'AES S-box',
      ...comparisonData.aes_analysis,
      analysis_time_ms: comparisonData.analysis_time_ms / 2, // Approximate
    };
  };

  return (
    <div className="min-h-screen w-full bg-neutral-darker">
      <Header />
      <Hero />
      <TeamSection />

      <main className="container mx-auto px-4 py-12">
        {/* Error Display */}
        {error && (
          <div className="mb-8 p-6 bg-accent-pink/10 border-l-4 border-accent-pink rounded-lg shadow-md">
            <div className="flex items-center gap-3 text-accent-pink">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-heading text-lg font-bold">Error:</span>
            </div>
            <p className="mt-3 font-body text-sm text-primary-light">{error}</p>
          </div>
        )}

        {/* Parameter Panel */}
        <ParameterPanel
          onParametersChange={handleParametersChange}
          defaultMatrix={DEFAULT_K44_MATRIX}
          defaultConstant={DEFAULT_CONSTANT}
          autoGenerate={false}
        />
        
        {/* Generate Custom S-box Button */}
        {(customParams.useCustom || 
          JSON.stringify(customParams.matrix) !== JSON.stringify(DEFAULT_K44_MATRIX) || 
          customParams.constant !== DEFAULT_CONSTANT) && (
          <div className="mb-8 glass-effect rounded-2xl p-6 border border-primary-light/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading text-xl font-bold text-white mb-2">
                  Custom Parameters Active
                </h3>
                <p className="font-body text-sm text-primary-light">
                  Generate S-box with custom matrix and constant
                </p>
              </div>
              <button
                onClick={handleGenerateCustom}
                disabled={loading}
                className="px-8 py-4 bg-accent-pink hover:bg-accent-muted text-white rounded-xl font-body font-bold text-lg transition-all shadow-lg hover:shadow-2xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Generating...' : 'Generate Custom S-box'}
              </button>
            </div>
          </div>
        )}

        {/* Control Panel */}
        <ControlPanel 
          onGenerateAndCompare={handleGenerateAndCompare} 
          loading={loading}
          showCustomOption={true}
        />
        

        {/* Loading State */}
        {loading && (
          <div className="glass-effect rounded-2xl p-16 border border-primary-light/20">
            <LoadingSpinner message="Generating S-boxes and performing cryptographic analysis..." />
          </div>
        )}

        {/* Results */}
        {!loading && comparisonData && (
          <>
            {/* Performance Info */}
            <div className="mb-8 flex flex-wrap gap-4">
              <div className="glass-effect rounded-xl px-6 py-3 flex items-center gap-3 border border-primary-light/10">
                <span className="font-body text-primary-light text-sm font-medium">Generation Time:</span>
                <span className="font-mono font-bold text-accent-pink text-lg">
                  {comparisonData.generation_time_ms.toFixed(2)}ms
                </span>
              </div>
              <div className="glass-effect rounded-xl px-6 py-3 flex items-center gap-3 border border-primary-light/10">
                <span className="font-body text-primary-light text-sm font-medium">Analysis Time:</span>
                <span className="font-mono font-bold text-accent-muted text-lg">
                  {comparisonData.analysis_time_ms.toFixed(2)}ms
                </span>
              </div>
              <div className="glass-effect rounded-xl px-6 py-3 flex items-center gap-3 border border-primary-light/10">
                <span className="font-body text-primary-light text-sm font-medium">Total Time:</span>
                <span className="font-mono font-bold text-primary-light text-lg">
                  {(comparisonData.generation_time_ms + comparisonData.analysis_time_ms).toFixed(2)}ms
                </span>
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-8 flex gap-3 overflow-x-auto border-b-2 border-primary-light/10">
              <button
                onClick={() => setActiveTab('comparison')}
                className={`font-heading px-8 py-4 rounded-t-xl font-bold transition-all ${
                  activeTab === 'comparison'
                    ? 'bg-accent-pink text-white shadow-lg -mb-0.5'
                    : 'text-primary-light hover:text-accent-pink hover:bg-primary-light/5'
                }`}
              >
                Comparison
              </button>
              <button
                onClick={() => setActiveTab('k44')}
                className={`font-heading px-8 py-4 rounded-t-xl font-bold transition-all ${
                  activeTab === 'k44'
                    ? 'bg-accent-pink text-white shadow-lg -mb-0.5'
                    : 'text-primary-light hover:text-accent-pink hover:bg-primary-light/5'
                }`}
              >
                Research (K44)
              </button>
              <button
                onClick={() => setActiveTab('aes')}
                className={`font-heading px-8 py-4 rounded-t-xl font-bold transition-all ${
                  activeTab === 'aes'
                    ? 'bg-accent-pink text-white shadow-lg -mb-0.5'
                    : 'text-primary-light hover:text-accent-pink hover:bg-primary-light/5'
                }`}
              >
                AES S-box
              </button>
              {customSBox && (
                <button
                  onClick={() => setActiveTab('custom')}
                  className={`font-heading px-8 py-4 rounded-t-xl font-bold transition-all ${
                    activeTab === 'custom'
                      ? 'bg-accent-pink text-white shadow-lg -mb-0.5'
                      : 'text-primary-light hover:text-accent-pink hover:bg-primary-light/5'
                  }`}
                >
                  Custom S-box
                </button>
              )}
            </div>

            {/* Tab Content */}
            <div className="space-y-8">
              {activeTab === 'k44' && (
                <>
                  <SBoxGrid 
                    sbox={comparisonData.k44_sbox} 
                    title="Research S-box (K44) - 16×16 Hexadecimal Grid"
                    highlightColor="bg-accent-pink"
                  />
                  {getK44Results() && (
                    <MetricsPanel 
                      results={getK44Results()!} 
                      title="Research S-box (K44) - Cryptographic Strength Analysis"
                      accentColor="blue"
                    />
                  )}
                </>
              )}

              {activeTab === 'aes' && (
                <>
                  <SBoxGrid 
                    sbox={comparisonData.aes_sbox} 
                    title="Standard AES S-box - 16×16 Hexadecimal Grid"
                    highlightColor="bg-accent-muted"
                  />
                  {getAESResults() && (
                    <MetricsPanel 
                      results={getAESResults()!} 
                      title="AES S-box - Cryptographic Strength Analysis"
                      accentColor="purple"
                    />
                  )}
                </>
              )}

              {activeTab === 'comparison' && (
                <>
                  <ComparisonTable comparisons={getComparisonMetrics()} />
                  
                  {/* Side-by-side S-boxes */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <SBoxGrid 
                      sbox={comparisonData.k44_sbox} 
                      title="Research S-box (K44)"
                      highlightColor="bg-accent-pink"
                    />
                    <SBoxGrid 
                      sbox={comparisonData.aes_sbox} 
                      title="AES S-box"
                      highlightColor="bg-accent-muted"
                    />
                  </div>
                </>
              )}

              {activeTab === 'custom' && customSBox && customAnalysis && customSBoxParams && (
                <>
                  <ParameterInfo
                    matrix={customSBoxParams.matrix}
                    matrixName={customSBoxParams.matrixName}
                    constant={customSBoxParams.constant}
                    defaultMatrix={DEFAULT_K44_MATRIX}
                    defaultConstant={DEFAULT_CONSTANT}
                  />
                  <SBoxGrid 
                    sbox={customSBox} 
                    title={`${customSBoxParams.matrixName} S-box (C=0x${customSBoxParams.constant.toString(16).toUpperCase()})`}
                    highlightColor="bg-accent-pink"
                  />
                  <MetricsPanel 
                    results={customAnalysis} 
                    title={`${customSBoxParams.matrixName} S-box - Cryptographic Analysis`}
                    accentColor="pink"
                  />
                </>
              )}
            </div>
          </>
        )}

        {/* Custom S-box Results (Independent) */}
        {!loading && customSBox && customAnalysis && customSBoxParams && !comparisonData && (
          <div className="space-y-8">
            <div className="mb-6">
              <h2 className="font-heading text-3xl font-bold text-white mb-2">
                Custom S-box Analysis
              </h2>
              <div className="w-24 h-1 bg-gradient-primary"></div>
            </div>
            <ParameterInfo
              matrix={customSBoxParams.matrix}
              matrixName={customSBoxParams.matrixName}
              constant={customSBoxParams.constant}
              defaultMatrix={DEFAULT_K44_MATRIX}
              defaultConstant={DEFAULT_CONSTANT}
            />
            <SBoxGrid 
              sbox={customSBox} 
              title={`${customSBoxParams.matrixName} S-box (C=0x${customSBoxParams.constant.toString(16).toUpperCase()})`}
              highlightColor="bg-accent-pink"
            />
            <MetricsPanel 
              results={customAnalysis} 
              title={`${customSBoxParams.matrixName} S-box - Cryptographic Analysis`}
              accentColor="pink"
            />
          </div>
        )}

        {/* Initial State */}
        {!loading && !comparisonData && !customSBox && !error && (
          <div className="glass-effect rounded-2xl p-16 text-center border border-primary-light/10">
            <div className="text-7xl mb-6">🔐</div>
            <h2 className="font-heading text-3xl font-bold text-white mb-4">
              Ready to Analyze
            </h2>
            <p className="font-body text-lg text-primary-light mb-4">
              Use the Research Parameters panel above to explore different affine matrices and customize S-box generation, or
            </p>
            <p className="font-body text-lg text-primary-light">
              Click "Generate & Analyze" to compare multiple S-box configurations
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full bg-neutral-darker text-white mt-16 border-t border-primary-light/10">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img 
                src="/images/UNNES Logo.png" 
                alt="UNNES" 
                className="w-12 h-12 object-contain"
              />
              <div className="text-left">
                <p className="font-heading text-sm font-bold text-white">AES S-box Research Analyzer</p>
                <p className="font-body text-xs text-primary-light">
                  Universitas Negeri Semarang
                </p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="font-body text-sm text-primary-light">
                Affine Matrices Exploration Platform
              </p>
              <p className="font-body text-xs text-primary-light/70 mt-1">
                Based on research:{' '}
                <a 
                  href="https://link.springer.com/article/10.1007/s11071-024-10414-3" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-accent-pink hover:text-accent-muted underline transition-colors duration-200"
                >
                  AES S-box modification uses affine matrices exploration
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

