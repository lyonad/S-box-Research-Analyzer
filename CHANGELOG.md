# Changelog

All notable changes to the Advanced S-Box 44 Analyzer project.

## [2.0.0] - 2025-12-03

### 🎉 Major Update: Complete Cryptographic Metrics Suite

#### Added
- **4 New Cryptographic Metrics** (Total: 10 comprehensive metrics)
  - ✨ **Differential Uniformity (DU)**: Measures maximum DDT value
  - ✨ **Algebraic Degree (AD)**: Measures polynomial complexity
  - ✨ **Transparency Order (TO)**: Measures input-output correlation
  - ✨ **Correlation Immunity (CI)**: Measures statistical independence

#### Backend Changes
- Added `calculate_differential_uniformity()` function
- Added `calculate_algebraic_degree()` function with ANF transform
- Added `calculate_transparency_order()` function
- Added `calculate_correlation_immunity()` function
- Updated `analyze_sbox()` to include all 10 metrics
- Updated `print_analysis()` with new metric displays
- Enhanced API response models with new metrics

#### Frontend Changes
- Updated TypeScript types for 4 new metrics
- Enhanced `MetricsPanel.tsx` with 4 new metric cards
- Added icons for new metrics (🔀, 🔢, 🔍, 🛡️)
- Updated `ComparisonTable` with new comparison rows
- Updated `App.tsx` to handle new metrics in comparisons

#### Documentation
- Created comprehensive `CRYPTOGRAPHIC_METRICS.md` guide
- Updated main README with new metrics
- Updated backend README with complete metric list
- Added references to cryptographic literature

#### Testing
- Updated `full_project_verification.py` with 4 new tests
- All 38 verification tests passing ✅
- Verified K44 S-box: DU=4, AD=7, TO=0.06128, CI=0

#### Verification Results
```
✅ Passed: 38 tests
✗ Failed: 0
⚠️ Warnings: 0

🎉 ALL CRITICAL TESTS PASSED!
```

#### Key Metrics for K44 S-box
| Metric | Value | Status |
|--------|-------|--------|
| Nonlinearity | 112 | ✅ Maximum |
| SAC | 0.500732 | ✅ Optimal |
| BIC-NL | 112 | ✅ Maximum |
| DAP | 0.015625 | ✅ Excellent |
| **DU** | **4** | ✅ **Optimal** |
| **AD** | **7** | ✅ **Maximum** |
| **TO** | **0.06128** | ✅ **Excellent** |
| **CI** | **0** | ⚠️ **Low** |

### Performance
- Analysis time: ~2-3 seconds for complete 10-metric analysis
- No significant performance degradation
- Optimized algorithms for new metrics

### Breaking Changes
- API response structure extended (backward compatible)
- Frontend types updated (requires recompilation)

---

## [1.0.0] - 2024-12-02

### Initial Release
- Complete S-box generator with K44 and AES matrices
- 6 cryptographic metrics (NL, SAC, BIC-NL, BIC-SAC, LAP, DAP)
- Interactive web interface
- Encryption/Decryption sandbox
- Parameter customization
- Full verification suite (34 tests)
- Research paper compliance

---

## Legend
- ✨ New feature
- 🐛 Bug fix
- 🔧 Improvement
- 📝 Documentation
- ⚠️ Breaking change
- 🎉 Major milestone

---

**Note**: This project follows [Semantic Versioning](https://semver.org/).
