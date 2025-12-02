"""
Cryptographic strength tests for S-boxes:
- Nonlinearity (NL)
- Strict Avalanche Criterion (SAC)
- Bit Independence Criterion - Nonlinearity (BIC-NL)
- Bit Independence Criterion - SAC (BIC-SAC)
- Linear Approximation Probability (LAP)
- Differential Approximation Probability (DAP)
"""

import numpy as np
from typing import List, Dict, Tuple


def hamming_weight(n: int) -> int:
    """Calculate Hamming weight (number of 1's in binary representation)"""
    count = 0
    while n:
        count += n & 1
        n >>= 1
    return count


def walsh_hadamard_transform(truth_table: List[int]) -> List[int]:
    """
    Compute Walsh-Hadamard Transform of a Boolean function
    
    Args:
        truth_table: Boolean function as list of 256 values (0 or 1)
    
    Returns:
        Walsh spectrum
    """
    n = len(truth_table)
    spectrum = list(truth_table)
    
    h = 1
    while h < n:
        for i in range(0, n, h * 2):
            for j in range(i, i + h):
                x = spectrum[j]
                y = spectrum[j + h]
                spectrum[j] = x + y
                spectrum[j + h] = x - y
        h *= 2
    
    return spectrum


def calculate_nonlinearity(sbox: List[int]) -> Dict[str, float]:
    """
    Calculate nonlinearity of S-box
    Target: 112 for good S-boxes
    
    Args:
        sbox: S-box as list of 256 values
    
    Returns:
        Dictionary with min, max, and average nonlinearity
    """
    nonlinearities = []
    
    # For each output bit
    for bit_pos in range(8):
        # Extract Boolean function for this output bit
        truth_table = [(sbox[x] >> bit_pos) & 1 for x in range(256)]
        
        # Convert to bipolar form (-1, 1)
        bipolar = [1 - 2 * b for b in truth_table]
        
        # Compute Walsh-Hadamard spectrum
        spectrum = walsh_hadamard_transform(bipolar)
        
        # Nonlinearity = 2^(n-1) - (1/2) * max|W(f)|
        max_walsh = max(abs(s) for s in spectrum)
        nl = 128 - max_walsh // 2
        
        nonlinearities.append(nl)
    
    return {
        "min": min(nonlinearities),
        "max": max(nonlinearities),
        "average": sum(nonlinearities) / len(nonlinearities)
    }


def calculate_sac(sbox: List[int]) -> Dict[str, float]:
    """
    Calculate Strict Avalanche Criterion (SAC)
    Target: ~0.5 (ideally 0.50073 for AES)
    
    Measures how flipping one input bit affects output bits
    
    Args:
        sbox: S-box as list of 256 values
    
    Returns:
        Dictionary with SAC values
    """
    sac_matrix = np.zeros((8, 8))  # [input_bit][output_bit]
    
    # For each input value
    for x in range(256):
        # For each input bit position
        for i in range(8):
            # Flip bit i
            x_flipped = x ^ (1 << i)
            
            # Get output difference
            diff = sbox[x] ^ sbox[x_flipped]
            
            # Count which output bits changed
            for j in range(8):
                if (diff >> j) & 1:
                    sac_matrix[i][j] += 1
    
    # Normalize by number of inputs (256)
    sac_matrix /= 256.0
    
    # Calculate statistics
    sac_values = sac_matrix.flatten()
    
    return {
        "average": float(np.mean(sac_values)),
        "min": float(np.min(sac_values)),
        "max": float(np.max(sac_values)),
        "std": float(np.std(sac_values)),
        "matrix": sac_matrix.tolist()
    }


def calculate_bic_nl(sbox: List[int]) -> Dict[str, float]:
    """
    Calculate Bit Independence Criterion - Nonlinearity (BIC-NL)
    Measures independence between output bit functions
    
    Args:
        sbox: S-box as list of 256 values
    
    Returns:
        Dictionary with BIC-NL statistics
    """
    bic_nl_values = []
    
    # For each pair of output bits
    for i in range(8):
        for j in range(i + 1, 8):
            # Create combined Boolean function: f_i ⊕ f_j
            truth_table = [((sbox[x] >> i) & 1) ^ ((sbox[x] >> j) & 1) for x in range(256)]
            
            # Convert to bipolar
            bipolar = [1 - 2 * b for b in truth_table]
            
            # Compute Walsh spectrum
            spectrum = walsh_hadamard_transform(bipolar)
            
            # Calculate nonlinearity
            max_walsh = max(abs(s) for s in spectrum)
            nl = 128 - max_walsh // 2
            
            bic_nl_values.append(nl)
    
    return {
        "min": min(bic_nl_values),
        "max": max(bic_nl_values),
        "average": sum(bic_nl_values) / len(bic_nl_values)
    }


def calculate_bic_sac(sbox: List[int]) -> Dict[str, float]:
    """
    Calculate Bit Independence Criterion - SAC (BIC-SAC)
    
    Args:
        sbox: S-box as list of 256 values
    
    Returns:
        Dictionary with BIC-SAC statistics
    """
    # For each input bit and pair of output bits
    deviations = []
    
    for input_bit in range(8):
        for out_i in range(8):
            for out_j in range(out_i + 1, 8):
                count = 0
                
                for x in range(256):
                    x_flipped = x ^ (1 << input_bit)
                    
                    # Check if both output bits changed
                    diff = sbox[x] ^ sbox[x_flipped]
                    bit_i_changed = (diff >> out_i) & 1
                    bit_j_changed = (diff >> out_j) & 1
                    
                    # Both should change independently
                    if bit_i_changed and bit_j_changed:
                        count += 1
                
                prob = count / 256.0
                deviation = abs(prob - 0.25)  # Ideal is 0.25
                deviations.append(deviation)
    
    return {
        "average_deviation": sum(deviations) / len(deviations),
        "max_deviation": max(deviations),
        "min_deviation": min(deviations)
    }


def calculate_lap(sbox: List[int]) -> Dict[str, float]:
    """
    Calculate Linear Approximation Probability (LAP)
    Lower is better
    
    Args:
        sbox: S-box as list of 256 values
    
    Returns:
        Dictionary with LAP statistics
    """
    max_bias = 0
    lap_values = []
    
    # For each input mask and output mask
    for input_mask in range(1, 256):
        for output_mask in range(1, 256):
            count = 0
            
            for x in range(256):
                # Calculate input parity
                input_parity = hamming_weight(x & input_mask) % 2
                
                # Calculate output parity
                output_parity = hamming_weight(sbox[x] & output_mask) % 2
                
                if input_parity == output_parity:
                    count += 1
            
            # Bias from 0.5
            bias = abs(count / 256.0 - 0.5)
            lap_values.append(bias)
            
            if bias > max_bias:
                max_bias = bias
    
    # LAP is probability, not bias
    max_lap = 0.5 + max_bias
    
    return {
        "max_lap": max_lap,
        "max_bias": max_bias,
        "average_bias": sum(lap_values) / len(lap_values)
    }


def calculate_dap(sbox: List[int]) -> Dict[str, float]:
    """
    Calculate Differential Approximation Probability (DAP)
    Lower is better
    
    Args:
        sbox: S-box as list of 256 values
    
    Returns:
        Dictionary with DAP statistics
    """
    # Differential distribution table
    ddt = [[0 for _ in range(256)] for _ in range(256)]
    
    for x in range(256):
        for delta_in in range(256):
            x_prime = x ^ delta_in
            delta_out = sbox[x] ^ sbox[x_prime]
            ddt[delta_in][delta_out] += 1
    
    # Find maximum (excluding delta_in = 0)
    max_dap = 0
    dap_values = []
    
    for delta_in in range(1, 256):
        for delta_out in range(256):
            prob = ddt[delta_in][delta_out] / 256.0
            dap_values.append(prob)
            if prob > max_dap:
                max_dap = prob
    
    return {
        "max_dap": max_dap,
        "average_dap": sum(dap_values) / len(dap_values)
    }


def analyze_sbox(sbox: List[int]) -> Dict:
    """
    Perform complete cryptographic analysis of S-box
    
    Args:
        sbox: S-box as list of 256 values
    
    Returns:
        Dictionary with all test results
    """
    print("Analyzing S-box...")
    
    results = {
        "nonlinearity": calculate_nonlinearity(sbox),
        "sac": calculate_sac(sbox),
        "bic_nl": calculate_bic_nl(sbox),
        "bic_sac": calculate_bic_sac(sbox),
        "lap": calculate_lap(sbox),
        "dap": calculate_dap(sbox)
    }
    
    return results


def print_analysis(results: Dict, name: str = "S-box"):
    """Print analysis results in readable format"""
    print(f"\n{'=' * 60}")
    print(f"Cryptographic Analysis: {name}")
    print('=' * 60)
    
    print(f"\n1. Nonlinearity (NL) - Target: 112")
    print(f"   Min: {results['nonlinearity']['min']}")
    print(f"   Max: {results['nonlinearity']['max']}")
    print(f"   Avg: {results['nonlinearity']['average']:.2f}")
    
    print(f"\n2. Strict Avalanche Criterion (SAC) - Target: ~0.5")
    print(f"   Average: {results['sac']['average']:.5f}")
    print(f"   Std Dev: {results['sac']['std']:.5f}")
    
    print(f"\n3. BIC - Nonlinearity")
    print(f"   Min: {results['bic_nl']['min']}")
    print(f"   Max: {results['bic_nl']['max']}")
    print(f"   Avg: {results['bic_nl']['average']:.2f}")
    
    print(f"\n4. BIC - SAC")
    print(f"   Avg Deviation: {results['bic_sac']['average_deviation']:.5f}")
    print(f"   Max Deviation: {results['bic_sac']['max_deviation']:.5f}")
    
    print(f"\n5. Linear Approximation Probability (LAP)")
    print(f"   Max LAP: {results['lap']['max_lap']:.5f}")
    print(f"   Max Bias: {results['lap']['max_bias']:.5f}")
    
    print(f"\n6. Differential Approximation Probability (DAP)")
    print(f"   Max DAP: {results['dap']['max_dap']:.5f}")
    
    print('=' * 60)


if __name__ == "__main__":
    from sbox_generator import SBoxGenerator
    
    generator = SBoxGenerator()
    
    # Test K44 S-box
    k44_sbox = generator.generate_k44_sbox()
    results = analyze_sbox(k44_sbox)
    print_analysis(results, "K44 S-box")

