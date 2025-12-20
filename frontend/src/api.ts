/**
 * API service for communicating with backend
 */

import axios from 'axios';
import { SBox, AnalysisResults, ComparisonData, EncryptRequest, EncryptResponse, DecryptRequest, DecryptResponse } from './types';

// Get API base URL from environment variables with fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Validate API URL
if (!API_BASE_URL) {
  console.error('VITE_API_BASE_URL is not configured in environment variables');
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 120 seconds (2 minutes) for heavy operations like comparison and analysis
  withCredentials: false,
});

// Add request interceptor for logging and error handling
api.interceptors.request.use(
  (config) => {
    // Log requests in development mode
    if (import.meta.env.DEV) {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for centralized error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const message = error.response.data?.detail || error.message;
      
      console.error(`API Error ${status}:`, message);
      
      if (status === 429) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      } else if (status === 413) {
        throw new Error('File too large. Maximum size is 8MB.');
      } else if (status >= 500) {
        throw new Error('Server error. Please try again later.');
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('Network error:', error.message);
      
      // Check if it's a timeout error
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('Request timeout. The operation is taking longer than expected. Please try again or use a smaller dataset.');
      }
      
      throw new Error('Unable to connect to server. Please check your connection and ensure the backend is running.');
    }
    
    return Promise.reject(error);
  }
);

// Export API base URL for use in other modules
export const getApiBaseUrl = () => API_BASE_URL;

export const apiService = {
  /**
   * Generate S-box using research matrices (K44, K43, K45), standard AES, or custom parameters
   */
  async generateSBox(
    useK44: boolean = true, 
    customMatrix?: number[], 
    customConstant?: number
  ): Promise<SBox> {
    const requestBody: {
      use_k44?: boolean;
      custom_matrix?: number[];
      constant?: number;
    } = {};
    
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
  async getMatrixInfo(): Promise<Record<string, unknown>> {
    const response = await api.get('/matrix-info');
    return response.data;
  },

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; service: string }> {
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

