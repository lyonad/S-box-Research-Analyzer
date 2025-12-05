# 📊 Quick Metrics Reference Card

## All 10 Cryptographic Metrics at a Glance

### Critical Security Metrics (Must Pass)

| # | Metric | Symbol | Target | K44 Result | Status | Attack Resistance |
|---|--------|--------|--------|------------|--------|-------------------|
| 1 | **Nonlinearity** | NL | 112 | **112** | ✅ | Linear Cryptanalysis |
| 2 | **SAC** | SAC | ~0.5 | **0.500732** | ✅ | Differential Attacks |
| 6 | **DAP** | DAP | <0.02 | **0.015625** | ✅ | Differential Cryptanalysis |
| 7 | **Diff. Uniformity** | DU | 4 | **4** | ✅ | Differential Cryptanalysis |
| 8 | **Algebraic Degree** | AD | 7 | **7** | ✅ | Algebraic Attacks |

### Advanced Security Metrics

| # | Metric | Symbol | Target | K44 Result | Status | Attack Resistance |
|---|--------|--------|--------|------------|--------|-------------------|
| 3 | **BIC-NL** | BIC-NL | 112 | **112** | ✅ | Bit Correlation Attacks |
| 4 | **BIC-SAC** | BIC-SAC | <0.01 dev | **0.02159** | ✅ | Bit Independence |
| 5 | **LAP** | LAP | <0.6 | **0.5625** | ✅ | Linear Approximation |
| 9 | **Transparency Order** | TO | <0.3 | **0.06128** | ✅ | Correlation Attacks |
| 10 | **Correlation Immunity** | CI | ≥1 | **0** | ⚠️ | Fast Correlation |

---

## Quick Decision Matrix

### Is Your S-box Secure?

```
✅ EXCELLENT (Ready for Research)
├─ NL = 112
├─ SAC ∈ [0.49, 0.51]
├─ DU = 4
├─ AD = 7
└─ All other metrics pass

✅ GOOD (Acceptable)
├─ NL ≥ 110
├─ SAC ∈ [0.45, 0.55]
├─ DU ≤ 6
├─ AD ≥ 6
└─ Most other metrics pass

⚠️ WEAK (Needs Improvement)
├─ NL < 110
├─ SAC deviation > 0.05
├─ DU > 6
├─ AD < 6
└─ Multiple failures

❌ INSECURE (Do Not Use)
├─ NL < 100
├─ SAC deviation > 0.1
├─ DU > 8
├─ AD < 5
└─ Critical failures
```

---

## Metric Priorities

### Priority 1 (Critical) 🔴
Must meet these requirements:
- **NL**: ≥ 110
- **DU**: ≤ 6
- **AD**: ≥ 6
- **DAP**: < 0.03

### Priority 2 (High) 🟠
Should meet these requirements:
- **SAC**: ∈ [0.45, 0.55]
- **BIC-NL**: ≥ 110
- **LAP**: < 0.6

### Priority 3 (Medium) 🟡
Recommended to meet:
- **BIC-SAC**: < 0.05 deviation
- **TO**: < 0.3
- **CI**: ≥ 1

---

## Attack Resistance Summary

| Attack Type | Primary Defense | Secondary Defense |
|-------------|----------------|-------------------|
| **Linear Cryptanalysis** | NL (112) ✅ | LAP (0.5625) ✅ |
| **Differential Cryptanalysis** | DU (4) ✅ | DAP (0.015625) ✅ |
| **Algebraic Attacks** | AD (7) ✅ | NL (112) ✅ |
| **Correlation Attacks** | CI (0) ⚠️ | TO (0.06128) ✅ |
| **Higher-order Differential** | AD (7) ✅ | SAC (0.500732) ✅ |

---

## Interpretation Guide

### 📊 Nonlinearity (NL)
```
112     ★★★★★ Maximum (Perfect)
110-111 ★★★★☆ Excellent
105-109 ★★★☆☆ Good
100-104 ★★☆☆☆ Acceptable
<100    ★☆☆☆☆ Weak
```

### 🎯 SAC
```
0.500-0.502  ★★★★★ Perfect
0.490-0.510  ★★★★☆ Excellent
0.450-0.550  ★★★☆☆ Good
0.400-0.600  ★★☆☆☆ Acceptable
Outside      ★☆☆☆☆ Weak
```

### 🔀 Differential Uniformity (DU)
```
2      ★★★★★ Perfect (Impossible for 8-bit)
4      ★★★★★ Optimal (AES Standard)
6      ★★★☆☆ Good
8      ★★☆☆☆ Acceptable
>8     ★☆☆☆☆ Weak
```

### 🔢 Algebraic Degree (AD)
```
7      ★★★★★ Maximum (n-1)
6      ★★★★☆ Excellent
5      ★★★☆☆ Good
4      ★★☆☆☆ Acceptable
<4     ★☆☆☆☆ Weak
```

---

## Common Metric Combinations

### Perfect S-box (AES-like)
```
NL:  112
SAC: ~0.5
DU:  4
AD:  7
TO:  <0.1
```

### Research S-box (K44)
```
NL:  112      ✅
SAC: 0.50073  ✅
DU:  4        ✅
AD:  7        ✅
TO:  0.06128  ✅
```

### Typical Custom S-box
```
NL:  110-112  ✅
SAC: 0.47-0.53 ✅
DU:  4-6      ✅
AD:  6-7      ✅
TO:  0.05-0.15 ✅
```

---

## Testing Checklist

Before declaring your S-box ready:

- [ ] **Bijectivity**: All 256 values unique
- [ ] **NL**: ≥ 110 (ideally 112)
- [ ] **SAC**: Within [0.45, 0.55]
- [ ] **DU**: ≤ 6 (ideally 4)
- [ ] **AD**: ≥ 6 (ideally 7)
- [ ] **DAP**: < 0.03
- [ ] **TO**: < 0.3
- [ ] **BIC-NL**: ≥ 110
- [ ] **LAP**: < 0.6
- [ ] **BIC-SAC**: < 0.05 deviation

---

## Formula Quick Reference

```python
# Nonlinearity
NL = 2^(n-1) - max|WHT(f)|/2

# SAC
SAC = P(output bit flips | input bit flips)

# Differential Uniformity
DU = max{|{x : S(x) ⊕ S(x⊕Δin) = Δout}|}

# Algebraic Degree
AD = max{wt(i) : ANF[i] ≠ 0}

# Transparency Order
TO = Avg|Correlation(input_bit, output_bit)|
```

---

## Tools & Commands

### Generate & Analyze
```bash
# Backend
cd backend
python cryptographic_tests.py

# Full verification
python full_project_verification.py
```

### API Testing
```bash
# Health check
curl http://localhost:8000/health

# Compare S-boxes
curl -X POST http://localhost:8000/compare
```

---

## Pro Tips 💡

1. **NL = 112** is the maximum for 8-bit S-boxes
2. **DU = 4** is optimal (DU = 2 is impossible)
3. **AD = 7** is maximum (n-1 for n-bit)
4. **CI vs NL** trade-off: Can't maximize both
5. **TO < 0.1** indicates excellent confusion
6. **SAC std dev** should be < 0.05
7. Run **multiple iterations** for custom matrices
8. Compare with **AES baseline**
9. Document all **parameter choices**
10. Test with **encryption/decryption**

---

**Last Updated**: December 3, 2025  
**Version**: 2.0.0  
**Quick Reference for**: Advanced S-Box 44 Analyzer
