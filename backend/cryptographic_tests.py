"""
Cryptographic strength tests for S-boxes:
- Nonlinearity (NL)
- Strict Avalanche Criterion (SAC)
- Bit Independence Criterion - Nonlinearity (BIC-NL)
- Bit Independence Criterion - SAC (BIC-SAC)
- Linear Approximation Probability (LAP)
- Differential Approximation Probability (DAP)
- Differential Uniformity (DU)
- Algebraic Degree (AD)
- Transparency Order (TO)
- Correlation Immunity (CI)
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
    
    Computes the Strict Avalanche Criterion for the XOR sum of all pairs 
    of output bits (f_i ⊕ f_j).
    Target: 0.5 (ideally 0.50237 as per K44 paper result)
    
    Args:
        sbox: S-box as list of 256 values
    
    Returns:
        Dictionary with BIC-SAC statistics (average SAC of XOR pairs)
    """
    sac_values = []
    
    # For each pair of output bits (j, k)
    for j in range(8):
        for k in range(j + 1, 8):
            # Calculate SAC for function h = f_j ⊕ f_k
            # For each input bit i
            for i in range(8):
                change_count = 0
                
                for x in range(256):
                    x_flipped = x ^ (1 << i)
                    
                    # Get output difference
                    diff = sbox[x] ^ sbox[x_flipped]
                    
                    # Check if (bit j) XOR (bit k) changed
                    # (d_j ⊕ d_k) == 1 iff exactly one of them changed
                    d_j = (diff >> j) & 1
                    d_k = (diff >> k) & 1
                    
                    if d_j ^ d_k:
                        change_count += 1
                
                prob = change_count / 256.0
                sac_values.append(prob)
    
    return {
        "average_sac": sum(sac_values) / len(sac_values),
        "min_sac": min(sac_values),
        "max_sac": max(sac_values),
        "std_sac": float(np.std(sac_values))
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


def calculate_differential_uniformity(sbox: List[int]) -> Dict[str, float]:
    """
    Calculate Differential Uniformity (DU)
    
    DU is the maximum value in the Difference Distribution Table (DDT),
    excluding the row where input difference is 0.
    Lower values indicate better resistance to differential cryptanalysis.
    
    For AES S-box, DU = 4
    
    Args:
        sbox: S-box as list of 256 values
    
    Returns:
        Dictionary with DU statistics
    """
    # Differential distribution table
    ddt = [[0 for _ in range(256)] for _ in range(256)]
    
    for x in range(256):
        for delta_in in range(256):
            x_prime = x ^ delta_in
            delta_out = sbox[x] ^ sbox[x_prime]
            ddt[delta_in][delta_out] += 1
    
    # Find maximum (excluding delta_in = 0)
    max_du = 0
    du_values = []
    
    for delta_in in range(1, 256):
        for delta_out in range(256):
            val = ddt[delta_in][delta_out]
            if val > 0:
                du_values.append(val)
            if val > max_du:
                max_du = val
    
    return {
        "max_du": max_du,
        "average_du": sum(du_values) / len(du_values) if du_values else 0
    }


def calculate_algebraic_degree(sbox: List[int]) -> Dict[str, int]:
    """
    Calculate Algebraic Degree (AD) of S-box
    
    The algebraic degree is the degree of the highest degree term in the
    polynomial representation of the S-box component functions.
    
    For AES S-box, AD = 7
    Higher degree means better resistance to algebraic attacks.
    
    Args:
        sbox: S-box as list of 256 values
    
    Returns:
        Dictionary with algebraic degree for each output bit
    """
    def anf_transform(truth_table: List[int]) -> List[int]:
        """Convert truth table to Algebraic Normal Form (ANF)"""
        n = len(truth_table)
        anf = list(truth_table)
        
        # Möbius transform
        h = 1
        while h < n:
            for i in range(n):
                if (i & h) == 0:
                    anf[i + h] ^= anf[i]
            h <<= 1
        
        return anf
    
    def get_degree(anf: List[int]) -> int:
        """Get degree of polynomial from ANF"""
        max_degree = 0
        for i, coeff in enumerate(anf):
            if coeff != 0:
                degree = hamming_weight(i)
                if degree > max_degree:
                    max_degree = degree
        return max_degree
    
    degrees = []
    
    # For each output bit
    for bit_pos in range(8):
        # Extract Boolean function for this output bit
        truth_table = [(sbox[x] >> bit_pos) & 1 for x in range(256)]
        
        # Convert to ANF
        anf = anf_transform(truth_table)
        
        # Get degree
        degree = get_degree(anf)
        degrees.append(degree)
    
    return {
        "min": min(degrees),
        "max": max(degrees),
        "average": sum(degrees) / len(degrees),
        "degrees": degrees
    }


def calculate_transparency_order(sbox: List[int]) -> Dict[str, float]:
    """
    Calculate Transparency Order (TO)
    
    Transparency Order measures the average correlation between input and output bits.
    Lower transparency order indicates better confusion property.
    
    TO is calculated as the sum of absolute values of autocorrelation coefficients
    divided by the number of coefficients.
    
    Args:
        sbox: S-box as list of 256 values
    
    Returns:
        Dictionary with transparency order statistics
    """
    autocorrelation_values = []
    
    # For each pair of input bit and output bit
    for input_bit in range(8):
        for output_bit in range(8):
            correlation = 0
            
            # Calculate correlation
            for x in range(256):
                input_val = (x >> input_bit) & 1
                output_val = (sbox[x] >> output_bit) & 1
                
                # Convert to bipolar (-1, 1)
                input_bipolar = 1 - 2 * input_val
                output_bipolar = 1 - 2 * output_val
                
                correlation += input_bipolar * output_bipolar
            
            # Normalize
            correlation = abs(correlation) / 256.0
            autocorrelation_values.append(correlation)
    
    # Transparency order
    to = sum(autocorrelation_values) / len(autocorrelation_values)
    
    return {
        "transparency_order": to,
        "max_correlation": max(autocorrelation_values),
        "min_correlation": min(autocorrelation_values)
    }


def calculate_correlation_immunity(sbox: List[int]) -> Dict[str, int]:
    """
    Calculate Correlation Immunity (CI)
    
    A Boolean function is m-th order correlation immune if its output is
    statistically independent of any m input variables.
    
    CI is determined by examining the Walsh-Hadamard spectrum.
    The order of correlation immunity is the maximum m such that
    W(α) = 0 for all α with Hamming weight ≤ m.
    
    Args:
        sbox: S-box as list of 256 values
    
    Returns:
        Dictionary with correlation immunity order for each output bit
    """
    ci_orders = []
    
    # For each output bit
    for bit_pos in range(8):
        # Extract Boolean function for this output bit
        truth_table = [(sbox[x] >> bit_pos) & 1 for x in range(256)]
        
        # Convert to bipolar form (-1, 1)
        bipolar = [1 - 2 * b for b in truth_table]
        
        # Compute Walsh-Hadamard spectrum
        spectrum = walsh_hadamard_transform(bipolar)
        
        # Find correlation immunity order
        ci_order = 0
        for weight in range(1, 9):  # Check weights 1 to 8
            all_zero = True
            for i in range(256):
                if hamming_weight(i) == weight:
                    if spectrum[i] != 0:
                        all_zero = False
                        break
            
            if all_zero:
                ci_order = weight
            else:
                break
        
        ci_orders.append(ci_order)
    
    return {
        "min": min(ci_orders),
        "max": max(ci_orders),
        "average": sum(ci_orders) / len(ci_orders),
        "orders": ci_orders
    }


def calculate_cycle_structure(sbox: List[int]) -> Dict[str, int]:
    """
    Calculate cycle structure of the S-box permutation
    
    Args:
        sbox: S-box as list of 256 values
    
    Returns:
        Dictionary with cycle statistics
    """
    visited = [False] * 256
    cycles = []
    
    for i in range(256):
        if not visited[i]:
            curr = i
            length = 0
            while not visited[curr]:
                visited[curr] = True
                curr = sbox[curr]
                length += 1
            cycles.append(length)
    
    return {
        "count": len(cycles),
        "max_length": max(cycles) if cycles else 0,
        "min_length": min(cycles) if cycles else 0,
        "fixed_points": sum(1 for c in cycles if c == 1)
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
        "dap": calculate_dap(sbox),
        "differential_uniformity": calculate_differential_uniformity(sbox),
        "algebraic_degree": calculate_algebraic_degree(sbox),
        "transparency_order": calculate_transparency_order(sbox),
        "correlation_immunity": calculate_correlation_immunity(sbox),
        "cycle_structure": calculate_cycle_structure(sbox)
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
    
    print(f"\n4. BIC - SAC (Target: ~0.5)")
    print(f"   Avg SAC: {results['bic_sac']['average_sac']:.5f}")
    print(f"   Min SAC: {results['bic_sac']['min_sac']:.5f}")
    
    print(f"\n5. Linear Approximation Probability (LAP)")
    print(f"   Max LAP: {results['lap']['max_lap']:.5f}")
    print(f"   Max Bias: {results['lap']['max_bias']:.5f}")
    
    print(f"\n6. Differential Approximation Probability (DAP)")
    print(f"   Max DAP: {results['dap']['max_dap']:.5f}")
    
    print(f"\n7. Differential Uniformity (DU) - Target: 4 (AES)")
    print(f"   Max DU: {results['differential_uniformity']['max_du']}")
    print(f"   Avg DU: {results['differential_uniformity']['average_du']:.2f}")
    
    print(f"\n8. Algebraic Degree (AD) - Target: 7 (AES)")
    print(f"   Min: {results['algebraic_degree']['min']}")
    print(f"   Max: {results['algebraic_degree']['max']}")
    print(f"   Avg: {results['algebraic_degree']['average']:.2f}")
    
    print(f"\n9. Transparency Order (TO) - Lower is better")
    print(f"   TO: {results['transparency_order']['transparency_order']:.5f}")
    print(f"   Max Correlation: {results['transparency_order']['max_correlation']:.5f}")
    
    print(f"\n10. Correlation Immunity (CI) - Higher is better")
    print(f"   Min Order: {results['correlation_immunity']['min']}")
    print(f"   Max Order: {results['correlation_immunity']['max']}")
    print(f"   Avg Order: {results['correlation_immunity']['average']:.2f}")
    
    print('=' * 60)


if __name__ == "__main__":
    from sbox_generator import SBoxGenerator
    
    generator = SBoxGenerator()
    
    # Test K44 S-box
    k44_sbox = generator.generate_k44_sbox()
    results = analyze_sbox(k44_sbox)
    print_analysis(results, "K44 S-box")

