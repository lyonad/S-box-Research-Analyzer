# Parameter Flow Test

## Current Flow Issues

1. **ParameterPanel** → `applyParameters(matrix, constant)` with `useCustom: matrixCategory === 'custom'`
2. **App.tsx** → `handleGenerateCustom()` calls `apiService.generateSBox(useCustom, matrix, constant)`
3. **api.ts** → Logic issue: When `useCustom=false` but we have a custom matrix (like K43, K45), it might not send correctly
4. **Backend** → Should accept custom_matrix regardless of use_k44 flag

## Issues Found:

1. API logic doesn't handle predefined matrices (K43, K45, etc.) with custom constants
2. When useCustom=false, we still need to send the matrix if it's not K44 or AES
3. Backend needs to handle all cases properly

