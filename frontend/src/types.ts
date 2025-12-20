/**
 * Type definitions for S-box analyzer
 */

export interface SBox {
  sbox: number[];
  matrix_used?: string;
  constant?: number;
  generation_time_ms?: number;
  validation?: SBoxValidationResult;
}

export interface BitBalance {
  bit: number;
  ones: number;
  zeros: number;
  expected: number;
}

export interface DuplicateValueInfo {
  value: number;
  count: number;
}

export interface SBoxValidationResult {
  is_balanced: boolean;
  is_bijective: boolean;
  is_valid: boolean;
  unique_values: number;
  bit_balance: BitBalance[];
  duplicate_values: DuplicateValueInfo[];
  missing_values: number[];
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
  average_sac: number;
  max_sac: number;
  min_sac: number;
  std_sac: number;
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

export interface DifferentialUniformityMetrics {
  max_du: number;
  average_du: number;
}

export interface AlgebraicDegreeMetrics {
  min: number;
  max: number;
  average: number;
  degrees: number[];
}

export interface TransparencyOrderMetrics {
  transparency_order: number;
  max_correlation: number;
  min_correlation: number;
}

export interface CorrelationImmunityMetrics {
  min: number;
  max: number;
  average: number;
  orders: number[];
}

export interface CycleStructureMetrics {
  count: number;
  max_length: number;
  min_length: number;
  fixed_points: number;
}

export interface AnalysisResults {
  sbox_name: string;
  nonlinearity: NonlinearityMetrics;
  sac: SACMetrics;
  bic_nl: BICNLMetrics;
  bic_sac: BICSACMetrics;
  lap: LAPMetrics;
  dap: DAPMetrics;
  differential_uniformity: DifferentialUniformityMetrics;
  algebraic_degree: AlgebraicDegreeMetrics;
  transparency_order: TransparencyOrderMetrics;
  correlation_immunity: CorrelationImmunityMetrics;
  cycle_structure: CycleStructureMetrics;
  analysis_time_ms: number;
}

export interface ComparisonData {
  k44_sbox: number[];
  aes_sbox: number[];
  custom_sbox?: number[] | null;
  k44_analysis: Omit<AnalysisResults, 'sbox_name' | 'analysis_time_ms'>;
  aes_analysis: Omit<AnalysisResults, 'sbox_name' | 'analysis_time_ms'>;
  custom_analysis?: Omit<AnalysisResults, 'sbox_name' | 'analysis_time_ms'> | null;
  k44_validation: SBoxValidationResult;
  aes_validation: SBoxValidationResult;
  custom_validation?: SBoxValidationResult | null;
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
  better?: 'higher' | 'lower' | 'closest' | 'closest_to_zero';
  ideal?: number;
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

export interface ImageEncryptionSecurityMetrics {
  entropy: {
    original: {
      red?: number;
      green?: number;
      blue?: number;
      overall: number;
    };
    encrypted: {
      red?: number;
      green?: number;
      blue?: number;
      overall: number;
    };
  };
  npcr: {
    red?: number;
    green?: number;
    blue?: number;
    overall: number;
  };
  uaci: {
    red?: number;
    green?: number;
    blue?: number;
    overall: number;
  };
  correlation: {
    original: {
      horizontal: {
        red?: number;
        green?: number;
        blue?: number;
        overall: number;
      };
      vertical: {
        red?: number;
        green?: number;
        blue?: number;
        overall: number;
      };
      diagonal: {
        red?: number;
        green?: number;
        blue?: number;
        overall: number;
      };
      average: number;
    };
    encrypted: {
      horizontal: {
        red?: number;
        green?: number;
        blue?: number;
        overall: number;
      };
      vertical: {
        red?: number;
        green?: number;
        blue?: number;
        overall: number;
      };
      diagonal: {
        red?: number;
        green?: number;
        blue?: number;
        overall: number;
      };
      average: number;
    };
  };
}

