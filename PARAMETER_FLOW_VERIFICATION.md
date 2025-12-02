# Parameter Flow Verification

## Fixed Issues

### 1. API Logic Fix ✅
**Problem**: When selecting predefined matrices (K43, K45, etc.) with custom constants, the API wasn't sending the matrix correctly.

**Fix**: Updated `api.ts` to always send `custom_matrix` if provided, regardless of `useCustom` flag.

### 2. Backend Matrix Recognition ✅
**Problem**: Backend didn't recognize predefined matrices when sent as `custom_matrix`.

**Fix**: Added matrix comparison logic to identify K44, AES, and other known matrices from `AVAILABLE_MATRICES`.

### 3. Matrix Validation ✅
**Problem**: Custom matrix parsing could fail silently.

**Fix**: Added proper validation in `getCurrentMatrix()` to ensure all values are valid (0-255) and exactly 8 rows.

### 4. Constant Handling ✅
**Problem**: Constant changes weren't properly validated before applying.

**Fix**: Added validation to ensure constant is in valid range (0-255) before applying parameters.

## Parameter Flow

### Flow 1: Select Paper/Standard/Variation Matrix
1. User selects category (Paper/Standard/Variations)
2. User clicks on a matrix (e.g., K43)
3. `handleMatrixSelect()` → `applyParameters(matrix, constant)`
4. `applyParameters()` → `onParametersChange({matrix, constant, useCustom: false})`
5. `App.tsx` → `handleParametersChange()` stores in `customParams`
6. User clicks "Generate Custom S-box"
7. `handleGenerateCustom()` → `apiService.generateSBox(false, matrix, constant)`
8. `api.ts` → Sends `{custom_matrix: matrix, constant: constant, use_k44: false}`
9. Backend → Recognizes matrix, generates S-box

### Flow 2: Custom Matrix Input
1. User selects "Custom" category
2. User enters 8 rows (binary/hex/decimal)
3. `handleMatrixRowChange()` → Validates and calls `applyParameters()`
4. `applyParameters()` → `onParametersChange({matrix, constant, useCustom: true})`
5. User clicks "Generate Custom S-box"
6. Same flow as Flow 1, but with truly custom matrix

### Flow 3: Change Constant Only
1. User changes constant value
2. `handleConstantChange()` → Validates constant
3. Gets current matrix via `getCurrentMatrix()`
4. Calls `applyParameters(currentMatrix, newConstant)`
5. Same generation flow

## Validation Points

### Frontend Validation
- ✅ Matrix must have exactly 8 rows
- ✅ Each row must be 0-255 (8 bits)
- ✅ Constant must be 0-255
- ✅ Matrix parsing handles binary, hex, and decimal

### Backend Validation
- ✅ `custom_matrix` must have exactly 8 rows
- ✅ Constant defaults to 0x63 if not provided
- ✅ Matrix recognition for known matrices
- ✅ Proper error handling

## Test Cases

### Test 1: K44 with Default Constant
- Select: Paper → K44
- Constant: 0x63 (default)
- Expected: K44 S-box with standard constant

### Test 2: K43 with Custom Constant
- Select: Paper → K43
- Constant: 0xAA
- Expected: K43 S-box with constant 0xAA

### Test 3: Custom Matrix
- Select: Custom
- Enter: 8 custom rows
- Constant: 0xFF
- Expected: Custom S-box with entered matrix and constant

### Test 4: AES with Different Constant
- Select: Standard → AES
- Constant: 0x00
- Expected: AES matrix with constant 0x00

## Status: ✅ ALL FIXED

All parameter tweaking flows now work correctly!

