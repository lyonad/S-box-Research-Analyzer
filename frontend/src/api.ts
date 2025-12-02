/**
 * API service for communicating with backend
 */

import axios from 'axios';
import { SBox, AnalysisResults, ComparisonData, EncryptRequest, EncryptResponse, DecryptRequest, DecryptResponse } from './types';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  /**
   * Generate S-box using research matrices (K44, K43, K45), standard AES, or custom parameters
   */
  async generateSBox(
    useK44: boolean = true, 
    customMatrix?: number[], 
    customConstant?: number
  ): Promise<SBox> {
    const requestBody: any = {};
    
    // Always send custom matrix if provided (for K43, K45, variations, or truly custom)
    // Always send constant if provided (for custom constant values)
    if (customMatrix && customMatrix.length === 8) {
      requestBody.custom_matrix = customMatrix;
    }
    
    if (customConstant !== undefined) {
      requestBody.constant = customConstant;
    }
    
    // Only set use_k44 if we're not sending a custom matrix
    if (!customMatrix || customMatrix.length !== 8) {
      requestBody.use_k44 = useK44;
    } else {
      // When custom matrix is provided, don't use use_k44 flag
      requestBody.use_k44 = false;
    }
    
    const response = await api.post('/generate-sbox', requestBody);
    return response.data;
  },

  /**
   * Analyze S-box cryptographic strength
   */
  async analyzeSBox(sbox: number[], name: string = 'Custom S-box'): Promise<AnalysisResults> {
    const response = await api.post('/analyze', {
      sbox,
      name,
    });
    return response.data;
  },

  /**
   * Compare research S-box (K44) and standard AES S-boxes, optionally including custom S-box
   */
  async compareSBoxes(customSBox?: number[]): Promise<ComparisonData> {
    const response = await api.post('/compare', {
      custom_sbox: customSBox || null,
    });
    return response.data;
  },

  /**
   * Get matrix information
   */
  async getMatrixInfo(): Promise<any> {
    const response = await api.get('/matrix-info');
    return response.data;
  },

  /**
   * Health check
   */
  async healthCheck(): Promise<any> {
    const response = await api.get('/health');
    return response.data;
  },

  /**
   * Encrypt plaintext using AES-128 with K44 or AES S-box
   */
  async encrypt(request: EncryptRequest): Promise<EncryptResponse> {
    const response = await api.post('/encrypt', request);
    return response.data;
  },

  /**
   * Decrypt ciphertext using AES-128 with K44 or AES S-box
   */
  async decrypt(request: DecryptRequest): Promise<DecryptResponse> {
    const response = await api.post('/decrypt', request);
    return response.data;
  },
};

export default apiService;

