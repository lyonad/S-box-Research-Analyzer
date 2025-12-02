# Paper Matrices - Research Parameters

## Overview

Based on the research paper ["AES S-box modification uses affine matrices exploration"](https://link.springer.com/article/10.1007/s11071-024-10414-3), the application now includes multiple matrix options organized by category.

---

## 📄 Paper Matrices

These matrices are from the research paper's exploration of affine matrices.

### K44 Matrix (Best Performer) ⭐
**Results from Paper:**
- Nonlinearity: **112** (maximum)
- SAC: **0.50073** (excellent, closer to ideal than AES)
- BIC-NL: **112** (maximum)
- BIC-SAC: **0.50237**
- LAP: **0.0625**
- DAP: **0.015625**

**Matrix:**
```
Row 0: 01010111 (0x57)
Row 1: 10101011 (0xAB)
Row 2: 11010101 (0xD5)
Row 3: 11101010 (0xEA)
Row 4: 01110101 (0x75)
Row 5: 10111010 (0xBA)
Row 6: 01011101 (0x5D)
Row 7: 10101110 (0xAE)
```

**Status:** ✅ **Best performing matrix from the paper**

### K43 Matrix
Alternative matrix from the paper's exploration. Results may vary.

### K45 Matrix
Alternative matrix from the paper's exploration. Results may vary.

---

## ⭐ Standard Matrices

### AES Matrix (Rijndael)
The standard AES S-box affine transformation matrix.

**Results:**
- Nonlinearity: 112
- SAC: ~0.50488
- Standard reference for comparison

---

## 🔄 Variation Matrices

### Identity Matrix
For testing and comparison purposes. Not recommended for production use.

### K44 Rotated
A rotated version of K44 for experimental comparison.

---

## ✏️ Custom Matrix

Use this option to input your own 8×8 binary matrix for experimentation.

**Format:**
- Binary: `01010111` (8 bits)
- Hex: `0x57` or `57`
- Decimal: `87`

---

## How to Use

1. **Select Category**: Choose Paper, Standard, Variations, or Custom
2. **Select Matrix**: Click on a matrix from the selected category
3. **Set Constant**: Enter constant value (default: 0x63)
4. **Generate**: Click "Generate Custom S-box" to test

---

## Adding More Paper Matrices

If you have access to the full paper and find additional matrices, you can add them to:

**Backend:** `backend/sbox_generator.py`
```python
# Add new matrix
K46_MATRIX = [
    0b...,  # Row 0
    # ... rows 1-7
]

# Add to AVAILABLE_MATRICES
AVAILABLE_MATRICES = {
    ...
    'k46': ('K46 Matrix (Paper)', K46_MATRIX),
}
```

**Frontend:** `frontend/src/components/ParameterPanel.tsx`
```typescript
const PAPER_MATRICES = {
    ...
    k46: {
        name: 'K46 Matrix',
        description: 'From paper exploration',
        matrix: [0b..., ...],
    },
};
```

---

## Research Notes

According to the paper:
- Multiple affine matrices were explored
- S-box44 (K44) was identified as the best performer
- The exploration involved testing various matrix configurations
- Results were evaluated using multiple cryptographic criteria

**Reference:**
Alamsyah, et al. "AES S-box modification uses affine matrices exploration for increased S-box strength." *Nonlinear Dynamics* 113, 3869–3890 (2025). https://doi.org/10.1007/s11071-024-10414-3

---

## Matrix Categories

### Paper Matrices 📄
- Matrices from the research paper
- Tested and evaluated in the study
- K44 is the recommended best performer

### Standard Matrices ⭐
- Industry-standard matrices
- Used for comparison
- Well-documented properties

### Variation Matrices 🔄
- Experimental variations
- For testing and comparison
- Useful for understanding matrix effects

### Custom Matrix ✏️
- User-defined matrices
- For original research
- Full control over parameters

---

**The application now supports multiple matrix options from the research paper, making it easy to compare different configurations!** 🔬✨

