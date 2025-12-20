"""
Image Encryption Security Tests
Based on paper: "S-box Construction on AES Algorithm using Affine Matrix Modification 
to Improve Image Encryption Security"

Tests implemented:
1. Entropy - measures randomness (ideal: 7.9994 or close to 8)
2. NPCR (Number of Pixels Change Rate) - measures pixel change percentage (ideal: ~99.6%)
3. UACI (Unified Average Changing Intensity) - measures average intensity change (ideal: ~33.4%)
4. Histogram Analysis - visual distribution analysis
5. Correlation Coefficient - measures pixel correlation
"""

import numpy as np
from typing import Dict, Any, Tuple
from PIL import Image
import io


def calculate_entropy(image_array: np.ndarray) -> Dict[str, float]:
    """
    Calculate Shannon entropy for image
    
    Entropy measures the randomness/uncertainty in the image.
    Higher entropy (closer to 8 for 8-bit images) indicates better encryption.
    
    Formula: H = -Σ(p(i) * log2(p(i)))
    where p(i) is the probability of pixel value i
    
    Args:
        image_array: numpy array of image (can be grayscale or RGB)
    
    Returns:
        Dictionary with entropy values for each channel and overall
    """
    results = {}
    
    if len(image_array.shape) == 2:
        # Grayscale image
        hist, _ = np.histogram(image_array.flatten(), bins=256, range=(0, 256))
        hist = hist[hist > 0]  # Remove zeros
        prob = hist / hist.sum()
        entropy = -np.sum(prob * np.log2(prob))
        results['overall'] = float(entropy)
    else:
        # RGB image
        for idx, channel_name in enumerate(['red', 'green', 'blue']):
            channel = image_array[:, :, idx]
            hist, _ = np.histogram(channel.flatten(), bins=256, range=(0, 256))
            hist = hist[hist > 0]  # Remove zeros
            prob = hist / hist.sum()
            entropy = -np.sum(prob * np.log2(prob))
            results[channel_name] = float(entropy)
        
        # Overall entropy (average of RGB channels)
        results['overall'] = float(np.mean([results['red'], results['green'], results['blue']]))
    
    return results


def calculate_npcr(original: np.ndarray, encrypted: np.ndarray) -> Dict[str, float]:
    """
    Calculate NPCR (Number of Pixels Change Rate)
    
    NPCR measures the percentage of pixels that changed between original and encrypted images.
    Higher NPCR (closer to 100%) indicates better encryption.
    
    Formula: NPCR = (Σ D(i,j) / (M × N)) × 100%
    where D(i,j) = 0 if P1(i,j) == P2(i,j), else 1
    
    Args:
        original: numpy array of original image
        encrypted: numpy array of encrypted image
    
    Returns:
        Dictionary with NPCR values for each channel and overall
    """
    if original.shape != encrypted.shape:
        raise ValueError("Original and encrypted images must have the same dimensions")
    
    results = {}
    
    if len(original.shape) == 2:
        # Grayscale
        diff = (original != encrypted).astype(np.float64)
        npcr = (np.sum(diff) / diff.size) * 100.0
        results['overall'] = float(npcr)
    else:
        # RGB
        for idx, channel_name in enumerate(['red', 'green', 'blue']):
            orig_channel = original[:, :, idx]
            encr_channel = encrypted[:, :, idx]
            diff = (orig_channel != encr_channel).astype(np.float64)
            npcr = (np.sum(diff) / diff.size) * 100.0
            results[channel_name] = float(npcr)
        
        # Overall NPCR (average of RGB channels)
        results['overall'] = float(np.mean([results['red'], results['green'], results['blue']]))
    
    return results


def calculate_uaci(original: np.ndarray, encrypted: np.ndarray) -> Dict[str, float]:
    """
    Calculate UACI (Unified Average Changing Intensity)
    
    UACI measures the average intensity change between original and encrypted images.
    Ideal value for 8-bit images: ~33.4635%
    
    Formula: UACI = (1 / (M × N)) × Σ |P1(i,j) - P2(i,j)| / 255 × 100%
    
    Args:
        original: numpy array of original image
        encrypted: numpy array of encrypted image
    
    Returns:
        Dictionary with UACI values for each channel and overall
    """
    if original.shape != encrypted.shape:
        raise ValueError("Original and encrypted images must have the same dimensions")
    
    results = {}
    
    if len(original.shape) == 2:
        # Grayscale
        diff = np.abs(original.astype(np.float64) - encrypted.astype(np.float64))
        uaci = (np.sum(diff) / (diff.size * 255.0)) * 100.0
        results['overall'] = float(uaci)
    else:
        # RGB
        for idx, channel_name in enumerate(['red', 'green', 'blue']):
            orig_channel = original[:, :, idx].astype(np.float64)
            encr_channel = encrypted[:, :, idx].astype(np.float64)
            diff = np.abs(orig_channel - encr_channel)
            uaci = (np.sum(diff) / (diff.size * 255.0)) * 100.0
            results[channel_name] = float(uaci)
        
        # Overall UACI (average of RGB channels)
        results['overall'] = float(np.mean([results['red'], results['green'], results['blue']]))
    
    return results


def calculate_correlation_coefficient(image_array: np.ndarray, direction: str = 'horizontal') -> Dict[str, float]:
    """
    Calculate correlation coefficient between adjacent pixels
    
    Good encryption should have low correlation (close to 0).
    Original images typically have high correlation (close to 1).
    
    Args:
        image_array: numpy array of image
        direction: 'horizontal', 'vertical', or 'diagonal'
    
    Returns:
        Dictionary with correlation coefficients for each channel
    """
    results = {}
    
    if len(image_array.shape) == 2:
        # Grayscale
        if direction == 'horizontal':
            x = image_array[:, :-1].flatten()
            y = image_array[:, 1:].flatten()
        elif direction == 'vertical':
            x = image_array[:-1, :].flatten()
            y = image_array[1:, :].flatten()
        else:  # diagonal
            x = image_array[:-1, :-1].flatten()
            y = image_array[1:, 1:].flatten()
        
        if len(x) > 0:
            corr = np.corrcoef(x, y)[0, 1]
            results['overall'] = float(corr) if not np.isnan(corr) else 0.0
        else:
            results['overall'] = 0.0
    else:
        # RGB
        for idx, channel_name in enumerate(['red', 'green', 'blue']):
            channel = image_array[:, :, idx]
            if direction == 'horizontal':
                x = channel[:, :-1].flatten()
                y = channel[:, 1:].flatten()
            elif direction == 'vertical':
                x = channel[:-1, :].flatten()
                y = channel[1:, :].flatten()
            else:  # diagonal
                x = channel[:-1, :-1].flatten()
                y = channel[1:, 1:].flatten()
            
            if len(x) > 0:
                corr = np.corrcoef(x, y)[0, 1]
                results[channel_name] = float(corr) if not np.isnan(corr) else 0.0
            else:
                results[channel_name] = 0.0
        
        # Overall correlation (average of RGB channels)
        results['overall'] = float(np.mean([results['red'], results['green'], results['blue']]))
    
    return results


def analyze_image_encryption(original_image: np.ndarray, encrypted_image: np.ndarray) -> Dict[str, Any]:
    """
    Comprehensive image encryption security analysis
    
    Calculates all security metrics:
    - Entropy (for both original and encrypted)
    - NPCR (Number of Pixels Change Rate)
    - UACI (Unified Average Changing Intensity)
    - Correlation Coefficient (for both original and encrypted)
    
    Args:
        original_image: numpy array of original image (RGB)
        encrypted_image: numpy array of encrypted image (RGB)
    
    Returns:
        Dictionary containing all security metrics
    """
    # Ensure both images are RGB
    if len(original_image.shape) == 2:
        original_image = np.stack([original_image] * 3, axis=-1)
    if len(encrypted_image.shape) == 2:
        encrypted_image = np.stack([encrypted_image] * 3, axis=-1)
    
    results = {
        'entropy': {
            'original': calculate_entropy(original_image),
            'encrypted': calculate_entropy(encrypted_image)
        },
        'npcr': calculate_npcr(original_image, encrypted_image),
        'uaci': calculate_uaci(original_image, encrypted_image),
        'correlation': {
            'original': {
                'horizontal': calculate_correlation_coefficient(original_image, 'horizontal'),
                'vertical': calculate_correlation_coefficient(original_image, 'vertical'),
                'diagonal': calculate_correlation_coefficient(original_image, 'diagonal')
            },
            'encrypted': {
                'horizontal': calculate_correlation_coefficient(encrypted_image, 'horizontal'),
                'vertical': calculate_correlation_coefficient(encrypted_image, 'vertical'),
                'diagonal': calculate_correlation_coefficient(encrypted_image, 'diagonal')
            }
        }
    }
    
    # Calculate average correlation for easier comparison
    orig_corr = results['correlation']['original']
    encr_corr = results['correlation']['encrypted']
    results['correlation']['original']['average'] = np.mean([
        orig_corr['horizontal']['overall'],
        orig_corr['vertical']['overall'],
        orig_corr['diagonal']['overall']
    ])
    results['correlation']['encrypted']['average'] = np.mean([
        encr_corr['horizontal']['overall'],
        encr_corr['vertical']['overall'],
        encr_corr['diagonal']['overall']
    ])
    
    return results

