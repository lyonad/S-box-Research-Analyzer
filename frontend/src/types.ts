/**
 * Type definitions for S-box analyzer
 */

export interface SBox {
  sbox: number[];
  matrix_used?: string;
  constant?: number;
  generation_time_ms?: number;
}

export interface NonlinearityMetrics {
  min: number;
  max: number;
  average: number;
}

export interface SACMetrics {
  average: number;
  min: number;
  max: number;
  std: number;
  matrix?: number[][];
}

export interface BICNLMetrics {
  min: number;
  max: number;
  average: number;
}

export interface BICSACMetrics {
  average_deviation: number;
  max_deviation: number;
  min_deviation: number;
}

export interface LAPMetrics {
  max_lap: number;
  max_bias: number;
  average_bias: number;
}

export interface DAPMetrics {
  max_dap: number;
  average_dap: number;
}

export interface AnalysisResults {
  sbox_name: string;
  nonlinearity: NonlinearityMetrics;
  sac: SACMetrics;
  bic_nl: BICNLMetrics;
  bic_sac: BICSACMetrics;
  lap: LAPMetrics;
  dap: DAPMetrics;
  analysis_time_ms: number;
}

export interface ComparisonData {
  k44_sbox: number[];
  aes_sbox: number[];
  custom_sbox?: number[] | null;
  k44_analysis: Omit<AnalysisResults, 'sbox_name' | 'analysis_time_ms'>;
  aes_analysis: Omit<AnalysisResults, 'sbox_name' | 'analysis_time_ms'>;
  custom_analysis?: Omit<AnalysisResults, 'sbox_name' | 'analysis_time_ms'> | null;
  generation_time_ms: number;
  analysis_time_ms: number;
}

export interface MetricComparison {
  name: string;
  k44: number;
  aes: number;
  custom?: number;
  target?: number | string;
  unit?: string;
}

export interface EncryptRequest {
  plaintext: string;
  key: string;
  sbox_type: 'k44' | 'aes' | 'custom';
  custom_sbox?: number[];
}

export interface EncryptResponse {
  ciphertext: string; // Base64 encoded
  sbox_type: string;
  encryption_time_ms: number;
}

export interface DecryptRequest {
  ciphertext: string; // Base64 encoded
  key: string;
  sbox_type: 'k44' | 'aes' | 'custom';
  custom_sbox?: number[];
}

export interface DecryptResponse {
  plaintext: string;
  sbox_type: string;
  decryption_time_ms: number;
}

