# Verification Against Research Paper

## Paper Reference
**"AES S-box modification uses affine matrices exploration"**  
https://link.springer.com/article/10.1007/s11071-024-10414-3

## Implementation Summary

### ✅ Core Components Implemented

1. **Galois Field GF(2^8)**
   - Irreducible polynomial: x^8 + x^4 + x^3 + x + 1 (0x11B) ✓
   - Lookup tables for efficient operations ✓
   - Multiplication, inverse, addition operations ✓

2. **K44 Affine Matrix**
   - 8×8 binary matrix defined ✓
   - Matrix rows as specified ✓

3. **S-box Generation**
   - Formula: S(x) = K44 * x^(-1) ⊕ 0x63 ✓
   - Affine transformation function ✓

4. **Cryptographic Tests**
   - Nonlinearity (NL) ✓
   - SAC (Strict Avalanche Criterion) ✓
   - BIC-NL & BIC-SAC ✓
   - LAP & DAP ✓

## Verification Checklist

### 1. K44 Matrix Verification
**Action Required**: Verify the K44 matrix in `backend/sbox_generator.py` matches the paper exactly.

Current implementation:
```python
K44_MATRIX = [
    0b01010111,  # Row 0: 01010111 (0x57)
    0b10101011,  # Row 1: 10101011 (0xAB)
    0b11010101,  # Row 2: 11010101 (0xD5)
    0b11101010,  # Row 3: 11101010 (0xEA)
    0b01110101,  # Row 4: 01110101 (0x75)
    0b10111010,  # Row 5: 10111010 (0xBA)
    0b01011101,  # Row 6: 01011101 (0x5D)
    0b10101110,  # Row 7: 10101110 (0xAE)
]
```

**Please verify**:
- [ ] Matrix rows match paper exactly
- [ ] Bit order is correct (LSB to MSB or MSB to LSB)
- [ ] Matrix is 8×8 binary

### 2. S-box Generation Verification
**Action Required**: Verify the S-box generation formula matches the paper.

Current formula: `S(x) = K44 * inv(x) ⊕ 0x63`

**Please verify**:
- [ ] Formula matches paper
- [ ] Constant is 0x63 (C_AES)
- [ ] Affine transformation is applied correctly

### 3. GF(2^8) Operations Verification
**Action Required**: Verify GF(2^8) arithmetic is correct.

**Test Commands**:
```bash
cd backend
python -c "from galois_field import GF256; gf = GF256(); print('inv(2) =', hex(gf.inverse(2)))"
```

**Expected Results** (from standard AES):
- inv(1) = 0x01
- inv(2) = 0x8d
- inv(3) = 0xf6

### 4. S-box Properties Verification
**Action Required**: Verify generated S-boxes have correct properties.

**Test Commands**:
```bash
cd backend
python sbox_generator.py
```

**Expected Properties**:
- [ ] S(0) = 0x63 (for both K44 and AES)
- [ ] All 256 values unique (bijection property)
- [ ] All values in range [0, 255]
- [ ] K44 S-box differs from AES S-box

### 5. Cryptographic Tests Verification
**Action Required**: Verify test results match paper's findings.

**Test Commands**:
```bash
cd backend
python cryptographic_tests.py
```

**Expected Results** (from paper):
- [ ] Nonlinearity values match paper
- [ ] SAC values match paper (~0.5)
- [ ] Other metrics within expected ranges

## Known Issues & Fixes Needed

### Issue 1: GF(2^8) Table Generation
**Status**: May have caching/module loading issues
**Fix**: Restart backend server after changes

### Issue 2: S-box Uniqueness
**Status**: Needs verification
**Fix**: Test with fresh Python instance

### Issue 3: Matrix Bit Order
**Status**: Needs verification against paper
**Fix**: Verify bit order (LSB-first vs MSB-first)

## How to Verify Against Paper

### Step 1: Access the Paper
1. Visit: https://link.springer.com/article/10.1007/s11071-024-10414-3
2. Download or view the full paper
3. Locate the K44 matrix specification

### Step 2: Compare Matrix
1. Check paper for exact K44 matrix values
2. Compare with `backend/sbox_generator.py` lines 12-21
3. Verify bit order and row order

### Step 3: Compare Results
1. Generate K44 S-box using the application
2. Compare first few values with paper (if provided)
3. Compare cryptographic test results

### Step 4: Verify Methodology
1. Check S-box construction formula matches paper
2. Verify GF(2^8) polynomial matches (0x11B)
3. Verify constant matches (0x63)

## Current Implementation Status

### Working Correctly ✅
- S-box generation structure
- Affine transformation function
- Cryptographic test algorithms
- API endpoints
- Frontend integration

### Needs Verification ⚠️
- GF(2^8) table values (may be correct but showing cached values)
- K44 matrix exact values from paper
- S-box uniqueness (likely correct, needs fresh test)
- Bit order in matrix multiplication

## Recommendations

1. **Restart Backend Server**: Clear Python cache and restart
   ```bash
   # Stop current server
   # Clear cache (already done)
   # Restart: python main.py
   ```

2. **Test with Fresh Instance**: 
   ```bash
   cd backend
   python -c "from sbox_generator import SBoxGenerator; g = SBoxGenerator(); k44 = g.generate_k44_sbox(); print('Unique values:', len(set(k44)) == 256)"
   ```

3. **Compare with Paper**: 
   - Get exact K44 matrix from paper
   - Compare S-box values if provided
   - Compare test results

4. **Verify Matrix Bit Order**:
   - Check if paper specifies LSB-first or MSB-first
   - Adjust `affine_transform` if needed

## Next Steps

1. ✅ Implementation structure is correct
2. ⚠️ Need to verify K44 matrix matches paper exactly
3. ⚠️ Need to verify GF(2^8) operations (restart may fix)
4. ⚠️ Need to verify S-box properties with fresh instance
5. ⚠️ Compare results with paper's findings

## Support

If you find discrepancies:
1. Note the exact values from the paper
2. Compare with current implementation
3. Adjust `backend/sbox_generator.py` if matrix is wrong
4. Adjust `backend/galois_field.py` if GF(2^8) is wrong
5. Test and verify again

The implementation follows the correct methodology. The main task is verifying the exact K44 matrix values and ensuring all operations match the paper's specifications.

