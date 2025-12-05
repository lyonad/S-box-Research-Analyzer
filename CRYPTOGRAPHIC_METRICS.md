# 📊 Comprehensive Cryptographic Metrics Documentation

## Overview

This document provides detailed information about all 10 cryptographic strength metrics implemented in the Advanced S-Box 44 Analyzer.

---

## 1. Nonlinearity (NL) ✅

**Definition**: Measures the minimum distance between the Boolean function and all affine functions.

**Calculation Method**: Uses Walsh-Hadamard Transform (WHT)
```
NL = 2^(n-1) - (1/2) × max|W(f)|
```

**Target Values**:
- **AES S-box**: 112 (maximum for 8-bit S-box)
- **K44 S-box**: 112 ✅

**Interpretation**:
- Higher values indicate better resistance to linear cryptanalysis
- Maximum possible for 8-bit S-box: 112
- Values below 100 are considered weak

**Security Implication**: Essential for protection against linear cryptanalysis attacks.

---

## 2. Strict Avalanche Criterion (SAC) ✅

**Definition**: Measures how flipping a single input bit affects output bits.

**Calculation Method**: 
```
SAC = (1/n×m) × Σ Σ P(output_bit_j changes | input_bit_i flipped)
```

**Target Values**:
- **Ideal**: 0.5 (50% probability)
- **AES S-box**: 0.50073
- **K44 S-box**: 0.500732 ✅

**Interpretation**:
- Values close to 0.5 indicate good avalanche effect
- Deviation from 0.5 indicates bias
- Standard deviation should be low (< 0.05)

**Security Implication**: Good SAC ensures small input changes cause significant output changes.

---

## 3. Bit Independence Criterion - Nonlinearity (BIC-NL) ✅

**Definition**: Measures independence between output bit functions using nonlinearity.

**Calculation Method**: For each pair of output bits (i, j), calculate NL of combined function:
```
f_i ⊕ f_j
```

**Target Values**:
- **AES S-box**: 112
- **K44 S-box**: 112 ✅

**Interpretation**:
- Higher values indicate better bit independence
- Should be close to overall nonlinearity
- Maximum: 112

**Security Implication**: Ensures output bits are independently influenced by input.

---

## 4. Bit Independence Criterion - SAC (BIC-SAC) ✅

**Definition**: Measures independence between output bits using SAC criterion.

**Calculation Method**: For each input bit and each pair of output bits, measure correlation.

**Target Values**:
- **Ideal deviation**: < 0.01 (from 0.25)
- **Acceptable**: < 0.05

**Interpretation**:
- Lower deviation from ideal (0.25) is better
- Measures how independently output bits change together
- Max deviation indicates worst-case correlation

**Security Implication**: Prevents attackers from exploiting bit correlations.

---

## 5. Linear Approximation Probability (LAP) ✅

**Definition**: Maximum probability that a linear approximation holds.

**Calculation Method**:
```
LAP = max{P(input_mask · x = output_mask · S(x))}
```

**Target Values**:
- **Lower is better**
- **AES S-box**: ~0.5625
- **Acceptable**: < 0.6

**Interpretation**:
- Probability of best linear approximation
- LAP = 0.5 would be ideal (random)
- Values > 0.6 indicate weakness

**Security Implication**: Directly impacts resistance to linear cryptanalysis.

---

## 6. Differential Approximation Probability (DAP) ✅

**Definition**: Maximum probability in the Difference Distribution Table.

**Calculation Method**:
```
DAP = max{P(S(x) ⊕ S(x ⊕ Δin) = Δout)}
```

**Target Values**:
- **AES S-box**: 0.015625 (4/256)
- **K44 S-box**: 0.015625 ✅
- **Acceptable**: < 0.02

**Interpretation**:
- Probability of best differential characteristic
- Lower values mean better resistance
- Related to Differential Uniformity

**Security Implication**: Critical for resistance to differential cryptanalysis.

---

## 7. Differential Uniformity (DU) 🆕

**Definition**: The maximum value in the Difference Distribution Table (DDT), excluding input difference = 0.

**Calculation Method**:
```
DU = max{|{x : S(x) ⊕ S(x ⊕ Δin) = Δout}|} for Δin ≠ 0
```

**Target Values**:
- **AES S-box**: 4 (optimal for 8-bit S-box)
- **K44 S-box**: 4 ✅
- **Perfect**: 2 (impossible for 8-bit)

**Interpretation**:
- Lower values indicate better differential properties
- DU = 4 is considered excellent for 8-bit S-boxes
- Values > 6 are considered weak

**Security Implication**: Determines the probability of differential characteristics. Lower DU makes differential cryptanalysis harder.

**Related to**: DAP = DU/256

---

## 8. Algebraic Degree (AD) 🆕

**Definition**: The degree of the highest degree term in the Algebraic Normal Form (ANF) polynomial representation.

**Calculation Method**:
1. Convert Boolean function to ANF using Möbius transform
2. Find maximum Hamming weight of monomials with non-zero coefficients

**Target Values**:
- **AES S-box**: 7 (maximum - 1 for 8-bit)
- **K44 S-box**: 7 ✅
- **Weak**: < 5

**Interpretation**:
- Higher degree means more complex polynomial
- Degree n-1 is optimal (n = number of input bits)
- Low degree makes algebraic attacks easier

**Security Implication**: High algebraic degree provides resistance to:
- Algebraic attacks
- Higher-order differential attacks
- Cube attacks

**Note**: Maximum possible degree for n-bit Boolean function is n-1.

---

## 9. Transparency Order (TO) 🆕

**Definition**: Measures the average correlation between input and output bits. Lower values indicate better confusion.

**Calculation Method**:
```
TO = (1/64) × Σ Σ |correlation(input_bit_i, output_bit_j)|
```

**Target Values**:
- **Lower is better**
- **Good**: < 0.3
- **Weak**: > 0.5

**Interpretation**:
- Measures confusion property
- Low TO means input-output relationship is well hidden
- High correlation indicates transparency (bad)

**Security Implication**: Lower transparency order means:
- Better confusion property
- Harder to trace input influence on output
- More secure against correlation attacks

**Calculation Details**:
- For each input bit and output bit pair
- Calculate correlation coefficient
- Average absolute values
- Normalize by total pairs (64)

---

## 10. Correlation Immunity (CI) 🆕

**Definition**: A Boolean function is m-th order correlation immune if its output is statistically independent of any m input variables.

**Calculation Method**: Using Walsh-Hadamard spectrum:
```
CI order m if W(α) = 0 for all α with wt(α) ≤ m
```

**Target Values**:
- **Higher order is better**
- **Perfect**: Order 3-4 for 8-bit
- **Acceptable**: Order ≥ 1

**Interpretation**:
- Order 0: No correlation immunity
- Order m: Output independent of any m inputs
- Higher order means better independence

**Security Implication**: Correlation immunity provides resistance to:
- Correlation attacks
- Fast correlation attacks on stream ciphers
- Divide-and-conquer attacks

**Trade-off**: High CI often conflicts with high nonlinearity (impossible to achieve both perfectly).

**Related Concepts**:
- Resiliency: CI + balanced function
- Annihilator immunity
- Algebraic immunity

---

## Summary Table

| Metric | Target | K44 Result | Status | Priority |
|--------|--------|------------|--------|----------|
| Nonlinearity (NL) | 112 | 112 | ✅ Excellent | Critical |
| SAC | ~0.5 | 0.500732 | ✅ Excellent | Critical |
| BIC-NL | 112 | 112 | ✅ Excellent | High |
| BIC-SAC | <0.01 dev | 0.02159 | ✅ Good | High |
| LAP | <0.6 | 0.5625 | ✅ Good | Critical |
| DAP | <0.02 | 0.015625 | ✅ Excellent | Critical |
| DU | 4 | 4 | ✅ Excellent | Critical |
| AD | 7 | 7 | ✅ Excellent | Critical |
| TO | <0.3 | 0.06128 | ✅ Excellent | Medium |
| CI | ≥1 | 0 | ⚠️ Low | Medium |

---

## Metric Relationships

### Strong Dependencies:
1. **DAP ↔ DU**: DAP = DU/256
2. **NL ↔ LAP**: Higher NL → Lower LAP
3. **AD ↔ Algebraic Attacks**: Higher AD → Better resistance

### Trade-offs:
1. **CI ↔ NL**: Cannot maximize both simultaneously
2. **Balancedness ↔ CI**: Resiliency requires both
3. **TO ↔ Confusion**: Lower TO requires higher complexity

---

## Attack Resistance Map

| Attack Type | Primary Metrics | Secondary Metrics |
|-------------|-----------------|-------------------|
| Linear Cryptanalysis | NL, LAP | BIC-NL |
| Differential Cryptanalysis | DAP, DU | SAC, BIC-SAC |
| Algebraic Attacks | AD | NL |
| Correlation Attacks | CI | TO |
| Higher-order Differential | AD, SAC | BIC-SAC |
| Side-channel Analysis | TO, SAC | CI |

---

## Implementation Notes

### Computational Complexity:
- **NL, CI**: O(n × 2^n) - Uses WHT
- **SAC, BIC-SAC**: O(n² × 2^n)
- **LAP**: O(2^2n)
- **DAP, DU**: O(2^2n)
- **AD**: O(2^n × n)
- **TO**: O(n² × 2^n)

### Optimization Techniques:
1. Use lookup tables for repeated calculations
2. Parallel computation for independent metrics
3. Early termination for DU/DAP when threshold exceeded
4. Bit manipulation tricks for Hamming weight

---

## References

1. **Carlet, C.** (2010). "Boolean Functions for Cryptography and Error Correcting Codes"
2. **Daemen, J., & Rijmen, V.** (2002). "The Design of Rijndael: AES"
3. **Nyberg, K.** (1994). "Differentially Uniform Mappings for Cryptography"
4. **Siegenthaler, T.** (1984). "Correlation-Immunity of Nonlinear Combining Functions"
5. **Webster, A. F., & Tavares, S. E.** (1985). "On the Design of S-Boxes"
6. **Alamsyah et al.** (2024). "AES S-box modification uses affine matrices exploration"

---

## Testing Your S-box

To ensure your custom S-box is cryptographically strong, verify:

### Minimum Requirements:
- ✅ NL ≥ 100
- ✅ SAC ∈ [0.45, 0.55]
- ✅ DU ≤ 6
- ✅ AD ≥ 6
- ✅ DAP < 0.03

### Optimal Values:
- 🌟 NL = 112
- 🌟 SAC ≈ 0.5
- 🌟 DU = 4
- 🌟 AD = 7
- 🌟 TO < 0.1

### Red Flags:
- ❌ NL < 100
- ❌ SAC deviation > 0.1
- ❌ DU > 8
- ❌ AD < 5
- ❌ TO > 0.5

---

**Last Updated**: December 3, 2025
**Version**: 2.0.0
**Status**: Complete Implementation ✅
