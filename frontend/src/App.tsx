/**
 * Main Application Component
 * AES S-box Research Analyzer
 * Comprehensive platform for affine matrices exploration and S-box research
 */

import { useState, useEffect, useRef } from 'react';
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
import EncryptionPanel from './components/EncryptionPanel';
import apiService from './api';
import { ComparisonData, MetricComparison, AnalysisResults } from './types';

// Default K44 matrix (from paper - best performer)
const DEFAULT_K44_MATRIX = [
  0b01010111, 0b10101011, 0b11010101, 0b11101010,
  0b01110101, 0b10111010, 0b01011101, 0b10101110,
];

const DEFAULT_CONSTANT = 0x63;

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<'active' | 'inactive' | 'checking'>('checking');
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

  const failureStreakRef = useRef(0);
  const backendStatusRef = useRef<'active' | 'inactive' | 'checking'>(backendStatus);
  const CHECKING_THRESHOLD = 2;
  const INACTIVE_THRESHOLD = 5;
  const HEALTH_CHECK_INTERVAL = 5000;

  useEffect(() => {
    backendStatusRef.current = backendStatus;
  }, [backendStatus]);

  // Check API health on mount and periodically
  useEffect(() => {
    let isMounted = true;

    const markBackendActive = () => {
      if (!isMounted) return;
      if (backendStatusRef.current !== 'active') {
        setBackendStatus('active');
      }
      setError((prevError) => {
        if (prevError && prevError.includes('Unable to connect to backend API')) {
          return null;
        }
        return prevError;
      });
    };

    const markBackendChecking = () => {
      if (!isMounted) return;
      if (backendStatusRef.current === 'active') {
        setBackendStatus('checking');
      }
    };

    const markBackendInactive = () => {
      if (!isMounted) return;
      if (backendStatusRef.current !== 'inactive') {
        setBackendStatus('inactive');
        setError((prevError) => {
          if (!prevError) {
            return 'Unable to connect to backend API. Please ensure the server is running on http://localhost:8000';
          }
          return prevError;
        });
      }
    };

    const checkHealth = async () => {
      try {
        await apiService.healthCheck();
        failureStreakRef.current = 0;
        markBackendActive();
      } catch (err) {
        failureStreakRef.current += 1;

        if (failureStreakRef.current >= INACTIVE_THRESHOLD) {
          markBackendInactive();
        } else if (
          failureStreakRef.current >= CHECKING_THRESHOLD &&
          backendStatusRef.current === 'active'
        ) {
          markBackendChecking();
        }
      }
    };

    // Initial check
    checkHealth();

    const interval = setInterval(checkHealth, HEALTH_CHECK_INTERVAL);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []); // Empty dependency array - only run on mount

  const handleParametersChange = (params: {
    matrix: number[];
    constant: number;
    useCustom: boolean;
  }) => {
      setCustomParams(params);
    // Clear custom S-box when parameters change
    setCustomSBox(null);
    setCustomAnalysis(null);
    setCustomSBoxParams(null);
  };

  const handleGenerateAndCompare = async () => {
    setLoading(true);
    setError(null);

    try {
      // Check if custom parameters are different from defaults
      const hasCustomParams = customParams.useCustom || 
        JSON.stringify(customParams.matrix) !== JSON.stringify(DEFAULT_K44_MATRIX) || 
        customParams.constant !== DEFAULT_CONSTANT;

      let customSBoxToCompare: number[] | undefined = undefined;
      let customSBoxParamsToStore: {
        matrix: number[];
        matrixName: string;
        constant: number;
      } | null = null;

      // Generate custom S-box if custom parameters are set
      if (hasCustomParams) {
        try {
      const sboxResponse = await apiService.generateSBox(
        false, // Don't use use_k44 flag when we have explicit matrix
        customParams.matrix,
        customParams.constant
      );
          
          customSBoxToCompare = sboxResponse.sbox;
      
      // Determine matrix name for display
      const matrixName = sboxResponse.matrix_used || 
        (customParams.useCustom ? 'Custom Matrix' : 'Selected Matrix');
      
      // Store parameters for display
          customSBoxParamsToStore = {
        matrix: [...customParams.matrix],
        matrixName: matrixName,
        constant: customParams.constant,
          };
          
          // Store custom S-box and params
          setCustomSBox(sboxResponse.sbox);
          setCustomSBoxParams(customSBoxParamsToStore);
      
          // Analyze custom S-box
      const analysisResponse = await apiService.analyzeSBox(
        sboxResponse.sbox,
        `${matrixName} S-box (C=0x${customParams.constant.toString(16).toUpperCase()})`
      );
      setCustomAnalysis(analysisResponse);
    } catch (err: any) {
          console.warn('Failed to generate custom S-box, continuing with K44 and AES only:', err);
          // Continue with comparison even if custom generation fails
        }
      }

      // Generate comparison with K44, AES, and custom (if available)
      const data = await apiService.compareSBoxes(customSBoxToCompare);
      setComparisonData(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to generate and analyze S-boxes. Please check the backend server.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Prepare comparison metrics
  const getComparisonMetrics = (): MetricComparison[] => {
    if (!comparisonData) return [];

    const hasCustom = comparisonData.custom_analysis !== null && comparisonData.custom_analysis !== undefined;

    return [
      {
        name: 'Nonlinearity (Avg)',
        k44: comparisonData.k44_analysis.nonlinearity.average,
        aes: comparisonData.aes_analysis.nonlinearity.average,
        custom: hasCustom ? comparisonData.custom_analysis!.nonlinearity.average : undefined,
        target: '112',
      },
      {
        name: 'Nonlinearity (Min)',
        k44: comparisonData.k44_analysis.nonlinearity.min,
        aes: comparisonData.aes_analysis.nonlinearity.min,
        custom: hasCustom ? comparisonData.custom_analysis!.nonlinearity.min : undefined,
        target: '112',
      },
      {
        name: 'SAC (Average)',
        k44: comparisonData.k44_analysis.sac.average,
        aes: comparisonData.aes_analysis.sac.average,
        custom: hasCustom ? comparisonData.custom_analysis!.sac.average : undefined,
        target: '~0.5',
        better: 'closest',
        ideal: 0.5,
      },
      {
        name: 'SAC (Std Dev)',
        k44: comparisonData.k44_analysis.sac.std,
        aes: comparisonData.aes_analysis.sac.std,
        custom: hasCustom ? comparisonData.custom_analysis!.sac.std : undefined,
        target: 'Lower is better',
        better: 'lower',
      },
      {
        name: 'BIC-NL (Average)',
        k44: comparisonData.k44_analysis.bic_nl.average,
        aes: comparisonData.aes_analysis.bic_nl.average,
        custom: hasCustom ? comparisonData.custom_analysis!.bic_nl.average : undefined,
        target: 'Higher is better',
      },
      {
        name: 'BIC-SAC (Average)',
        k44: comparisonData.k44_analysis.bic_sac.average_sac,
        aes: comparisonData.aes_analysis.bic_sac.average_sac,
        custom: hasCustom ? comparisonData.custom_analysis!.bic_sac.average_sac : undefined,
        target: '~0.5',
        better: 'closest',
        ideal: 0.5,
      },
      {
        name: 'LAP (Max)',
        k44: comparisonData.k44_analysis.lap.max_lap,
        aes: comparisonData.aes_analysis.lap.max_lap,
        custom: hasCustom ? comparisonData.custom_analysis!.lap.max_lap : undefined,
        target: 'Lower is better',
        better: 'lower',
      },
      {
        name: 'LAP (Max Bias)',
        k44: comparisonData.k44_analysis.lap.max_bias,
        aes: comparisonData.aes_analysis.lap.max_bias,
        custom: hasCustom ? comparisonData.custom_analysis!.lap.max_bias : undefined,
        target: 'Lower is better',
        better: 'lower',
      },
      {
        name: 'DAP (Max)',
        k44: comparisonData.k44_analysis.dap.max_dap,
        aes: comparisonData.aes_analysis.dap.max_dap,
        custom: hasCustom ? comparisonData.custom_analysis!.dap.max_dap : undefined,
        target: 'Lower is better',
        better: 'lower',
      },
      {
        name: 'Differential Uniformity (Max)',
        k44: comparisonData.k44_analysis.differential_uniformity.max_du,
        aes: comparisonData.aes_analysis.differential_uniformity.max_du,
        custom: hasCustom ? comparisonData.custom_analysis!.differential_uniformity.max_du : undefined,
        target: '4 (AES)',
        better: 'lower',
      },
      {
        name: 'Algebraic Degree (Max)',
        k44: comparisonData.k44_analysis.algebraic_degree.max,
        aes: comparisonData.aes_analysis.algebraic_degree.max,
        custom: hasCustom ? comparisonData.custom_analysis!.algebraic_degree.max : undefined,
        target: '7 (AES)',
      },
      {
        name: 'Transparency Order',
        k44: comparisonData.k44_analysis.transparency_order.transparency_order,
        aes: comparisonData.aes_analysis.transparency_order.transparency_order,
        custom: hasCustom ? comparisonData.custom_analysis!.transparency_order.transparency_order : undefined,
        target: 'Lower is better',
        better: 'lower',
      },
      {
        name: 'Correlation Immunity (Max)',
        k44: comparisonData.k44_analysis.correlation_immunity.max,
        aes: comparisonData.aes_analysis.correlation_immunity.max,
        custom: hasCustom ? comparisonData.custom_analysis!.correlation_immunity.max : undefined,
        target: 'Higher is better',
      },
      {
        name: 'Max Cycle Length',
        k44: comparisonData.k44_analysis.cycle_structure.max_length,
        aes: comparisonData.aes_analysis.cycle_structure.max_length,
        custom: hasCustom ? comparisonData.custom_analysis!.cycle_structure.max_length : undefined,
        target: 'Higher is better',
        better: 'higher',
      },
      {
        name: 'Fixed Points',
        k44: comparisonData.k44_analysis.cycle_structure.fixed_points,
        aes: comparisonData.aes_analysis.cycle_structure.fixed_points,
        custom: hasCustom ? comparisonData.custom_analysis!.cycle_structure.fixed_points : undefined,
        target: '0',
        better: 'closest_to_zero',
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

  const getCustomResults = (): AnalysisResults | null => {
    if (!comparisonData || !comparisonData.custom_analysis) return null;
    return {
      sbox_name: customSBoxParams?.matrixName || 'Custom S-box',
      ...comparisonData.custom_analysis,
      analysis_time_ms: comparisonData.analysis_time_ms / 3, // Approximate
    };
  };

  return (
    <div className="min-h-screen w-full bg-surface-darkest">
      <Header backendStatus={backendStatus} />
      <Hero />
      <TeamSection />

      <main className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
        {/* Error Display */}
        {error && (
          <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-accent-warning/10 border-l-4 border-accent-warning rounded-lg shadow-md">
            <div className="flex items-center gap-2 sm:gap-3 text-accent-warning">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-heading text-base sm:text-lg">Error:</span>
            </div>
            <p className="mt-2 sm:mt-3 font-body text-xs sm:text-sm text-text-primary">{error}</p>
          </div>
        )}

        {/* Parameter Panel */}
        <ParameterPanel
          onParametersChange={handleParametersChange}
          defaultMatrix={DEFAULT_K44_MATRIX}
          defaultConstant={DEFAULT_CONSTANT}
          autoGenerate={false}
        />

        {/* Control Panel */}
        <ControlPanel 
          onGenerateAndCompare={handleGenerateAndCompare} 
          loading={loading}
          showCustomOption={true}
          hasCustomParams={
            customParams.useCustom || 
            JSON.stringify(customParams.matrix) !== JSON.stringify(DEFAULT_K44_MATRIX) || 
            customParams.constant !== DEFAULT_CONSTANT
          }
        />
        

        {/* Loading State */}
        {loading && (
          <div className="glass-effect rounded-2xl p-16 border border-text-primary/20">
            <LoadingSpinner message="Generating S-boxes and performing cryptographic analysis..." />
          </div>
        )}

        {/* Results */}
        {!loading && comparisonData && (
          <>
            {/* Performance Info */}
            <div className="mb-6 sm:mb-8 flex flex-wrap gap-2 sm:gap-3 md:gap-4">
              <div className="glass-effect rounded-lg sm:rounded-xl px-3 sm:px-4 md:px-6 py-2 sm:py-3 flex items-center gap-2 sm:gap-3 border border-text-primary/10">
                <span className="font-body text-text-primary text-xs sm:text-sm font-medium">Generation:</span>
                <span className="font-mono font-bold text-white text-sm sm:text-base md:text-lg">
                  {(comparisonData.generation_time_ms / 1000).toFixed(2)}s
                </span>
              </div>
              <div className="glass-effect rounded-lg sm:rounded-xl px-3 sm:px-4 md:px-6 py-2 sm:py-3 flex items-center gap-2 sm:gap-3 border border-text-primary/10">
                <span className="font-body text-text-primary text-xs sm:text-sm font-medium">Analysis:</span>
                <span className="font-mono font-bold text-light-grey text-sm sm:text-base md:text-lg">
                  {(comparisonData.analysis_time_ms / 1000).toFixed(2)}s
                </span>
              </div>
              <div className="glass-effect rounded-lg sm:rounded-xl px-3 sm:px-4 md:px-6 py-2 sm:py-3 flex items-center gap-2 sm:gap-3 border border-text-primary/10">
                <span className="font-body text-text-primary text-xs sm:text-sm font-medium">Total:</span>
                <span className="font-mono font-bold text-text-primary text-sm sm:text-base md:text-lg">
                  {((comparisonData.generation_time_ms + comparisonData.analysis_time_ms) / 1000).toFixed(2)}s
                </span>
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-6 sm:mb-8 flex gap-1 sm:gap-2 md:gap-3 overflow-x-auto border-b-2 border-text-primary/20 pb-0 -mx-2 px-2 sm:mx-0 sm:px-0">
              <button
                onClick={() => setActiveTab('comparison')}
                className={`font-heading px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 md:py-4 rounded-t-lg sm:rounded-t-xl font-bold transition-all text-xs sm:text-sm md:text-base whitespace-nowrap ${
                  activeTab === 'comparison'
                    ? 'bg-white text-black hover:bg-dark-grey hover:text-white shadow-lg -mb-0.5'
                    : 'text-text-primary hover:text-white hover:bg-white/20 hover:brightness-110 transition-all'
                }`}
              >
                Comparison
              </button>
              <button
                onClick={() => setActiveTab('k44')}
                className={`font-heading px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 md:py-4 rounded-t-lg sm:rounded-t-xl font-bold transition-all text-xs sm:text-sm md:text-base whitespace-nowrap ${
                  activeTab === 'k44'
                    ? 'bg-white text-black hover:bg-dark-grey hover:text-white shadow-lg -mb-0.5'
                    : 'text-text-primary hover:text-white hover:bg-white/20 hover:brightness-110 transition-all'
                }`}
              >
                Research (K44)
              </button>
              <button
                onClick={() => setActiveTab('aes')}
                className={`font-heading px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 md:py-4 rounded-t-lg sm:rounded-t-xl font-bold transition-all text-xs sm:text-sm md:text-base whitespace-nowrap ${
                  activeTab === 'aes'
                    ? 'bg-white text-black hover:bg-dark-grey hover:text-white shadow-lg -mb-0.5'
                    : 'text-text-primary hover:text-white hover:bg-white/20 hover:brightness-110 transition-all'
                }`}
              >
                AES S-box
              </button>
              {customSBox && (
                <button
                  onClick={() => setActiveTab('custom')}
                   className={`font-heading px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 md:py-4 rounded-t-lg sm:rounded-t-xl font-bold transition-all text-xs sm:text-sm md:text-base whitespace-nowrap ${
                      activeTab === 'custom'
                       ? 'bg-white text-black shadow-lg -mb-0.5'
                       : 'text-text-primary hover:text-white hover:bg-white/20 hover:brightness-110 transition-all'
                  }`}
                >
                  Custom
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
                    highlightColor="bg-white"
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
                    highlightColor="bg-light-grey"
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
                  <div className={`grid grid-cols-1 ${comparisonData.custom_sbox ? 'xl:grid-cols-3' : 'lg:grid-cols-2'} gap-4 sm:gap-6 md:gap-8`}>
                    <SBoxGrid 
                      sbox={comparisonData.k44_sbox} 
                      title="Research S-box (K44)"
                      highlightColor="bg-white"
                    />
                    <SBoxGrid 
                      sbox={comparisonData.aes_sbox} 
                      title="AES S-box"
                      highlightColor="bg-light-grey"
                    />
                    {comparisonData.custom_sbox && (
                      <SBoxGrid 
                        sbox={comparisonData.custom_sbox} 
                        title={`Custom S-box${customSBoxParams ? ` (${customSBoxParams.matrixName})` : ''}`}
                        highlightColor="bg-white"
                    />
                    )}
                  </div>
                </>
              )}

              {activeTab === 'custom' && (
                <>
                  {/* Show custom from comparison if available, otherwise from standalone */}
                  {comparisonData && comparisonData.custom_sbox && comparisonData.custom_analysis ? (
                    <>
                      {customSBoxParams && (
                        <ParameterInfo
                          matrix={customSBoxParams.matrix}
                          matrixName={customSBoxParams.matrixName}
                          constant={customSBoxParams.constant}
                          defaultMatrix={DEFAULT_K44_MATRIX}
                          defaultConstant={DEFAULT_CONSTANT}
                        />
                      )}
                      <SBoxGrid 
                        sbox={comparisonData.custom_sbox} 
                        title={`Custom S-box${customSBoxParams ? ` (${customSBoxParams.matrixName})` : ''}`}
                        highlightColor="bg-white"
                      />
                      {getCustomResults() && (
                        <MetricsPanel 
                          results={getCustomResults()!} 
                          title={`Custom S-box - Cryptographic Analysis`}
                          accentColor="pink"
                        />
                      )}
                    </>
                  ) : customSBox && customAnalysis && customSBoxParams ? (
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
                    highlightColor="bg-white"
                  />
                  <MetricsPanel 
                    results={customAnalysis} 
                    title={`${customSBoxParams.matrixName} S-box - Cryptographic Analysis`}
                    accentColor="pink"
                  />
                    </>
                  ) : null}
                </>
              )}
            </div>
          </>
        )}

        {/* Custom S-box Results (Independent) */}
        {!loading && customSBox && customAnalysis && customSBoxParams && !comparisonData && (
          <div className="space-y-8">
            <div className="mb-6">
              <h2 className="font-subheading text-3xl text-white mb-2">
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
                highlightColor="bg-white"
            />
            <MetricsPanel 
              results={customAnalysis} 
              title={`${customSBoxParams.matrixName} S-box - Cryptographic Analysis`}
              accentColor="pink"
            />
          </div>
        )}

        {/* Ready to Analyze Card */}
        {!loading && !comparisonData && !customSBox && !error && (
          <div className="glass-effect rounded-xl sm:rounded-2xl p-8 sm:p-12 md:p-16 text-center border border-text-primary/10">
            <h2 className="font-subheading text-xl sm:text-2xl md:text-3xl text-white mb-3 sm:mb-4">
              Ready to Analyze
            </h2>
            <p className="font-body text-sm sm:text-base md:text-lg text-text-primary mb-3 sm:mb-4">
              Use the Research Parameters panel above to explore different affine matrices and customize S-box generation, or
            </p>
            <p className="font-body text-sm sm:text-base md:text-lg text-text-primary">
              Click "Generate & Analyze" to compare multiple S-box configurations
            </p>
          </div>
        )}

        {/* Encryption & Decryption Panel */}
        <div className="mt-10 sm:mt-12 md:mt-16">
          <div className="mb-4 sm:mb-6">
            <h2 className="font-subheading text-xl sm:text-2xl md:text-3xl text-white mb-4">
              Encryption & Decryption
            </h2>
            <div className="w-16 h-[2px] bg-white/60"></div>
            <p className="font-body text-text-primary mt-3 sm:mt-4 text-sm sm:text-base">
              Encrypt and decrypt messages using AES-128 with K44, AES, or custom S-box
            </p>
          </div>
          <EncryptionPanel 
            customSBox={customSBox}
            customSBoxName={customSBoxParams?.matrixName || 'Custom'}
          />
        </div>

        {/* Initial State - REMOVED: Ready to Analyze card moved above Encryption section */}
        {!loading && !comparisonData && !customSBox && !error && (
          <div className="hidden">
            {/* This section is now empty - Ready to Analyze card moved above */}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full bg-surface-darkest text-white mt-10 sm:mt-12 md:mt-16 border-t border-text-primary/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <img 
                src="/images/UNNES Logo.png" 
                alt="UNNES" 
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
              />
              <div className="text-left">
                <p className="font-heading text-xs sm:text-sm text-white">AES S-box Research Analyzer</p>
                <p className="font-body text-[10px] sm:text-xs text-text-primary">
                  Universitas Negeri Semarang
                </p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="font-body text-xs sm:text-sm text-text-primary">
                Affine Matrices Exploration Platform
              </p>
              <p className="font-body text-[10px] sm:text-xs text-text-primary/70 mt-1">
                Based on research:{' '}
                <a 
                  href="https://link.springer.com/article/10.1007/s11071-024-10414-3" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white hover:text-light-grey underline transition-colors duration-200"
                >
                  AES S-box modification
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

