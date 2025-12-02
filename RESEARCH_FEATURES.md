# 🔬 Research Features - Tweaking Parameters

## Overview

The application now includes a comprehensive **Research Parameters Panel** that allows you to experiment with different S-box configurations for your research.

---

## 🎛️ Available Parameters

### 1. **Affine Transformation Matrix**

You can choose from:
- **K44 Matrix** (default from paper)
- **AES Matrix** (standard Rijndael)
- **Custom Matrix** (define your own 8×8 binary matrix)

#### Custom Matrix Input
- **Format**: Binary (8 bits) or Hexadecimal
- **Examples**:
  - Binary: `01010111`
  - Hex: `0x57` or `57`
  - Decimal: `87` (automatically converted)

Each row is an 8-bit value representing one row of the 8×8 matrix.

### 2. **Constant Vector (C)**

- **Default**: `0x63` (C_AES)
- **Input Format**: Hex (`0x63`) or Decimal (`99`)
- **Range**: 0-255 (0x00 to 0xFF)
- **Quick Presets**: 0x63, 0x00, 0xFF, 0xAA, 0x55

---

## 🚀 How to Use

### Step 1: Open Research Parameters Panel
The panel appears at the top of the main content area, above the Control Panel.

### Step 2: Select Matrix Type
- Click **"K44 Matrix"** for the paper's matrix
- Click **"AES Matrix"** for standard AES
- Click **"Custom"** to define your own

### Step 3: Enter Custom Matrix (if Custom selected)
- Enter 8 rows, each as 8-bit binary or hex
- Example:
  ```
  Row 0: 01010111  (or 0x57)
  Row 1: 10101011  (or 0xAB)
  ...
  Row 7: 10101110  (or 0xAE)
  ```

### Step 4: Set Constant
- Enter constant value in hex or decimal
- Or click a quick preset button

### Step 5: Generate Custom S-box
- Click **"Generate Custom S-box"** button
- Wait for generation and analysis (~3-5 seconds)
- View results in the **"Custom S-box"** tab

---

## 💾 Parameter Presets

### Save Presets
1. Configure your desired parameters
2. Enter a preset name (e.g., "K44-Custom-0xAA")
3. Click **"Save"**
4. Preset is saved to browser localStorage

### Load Presets
1. Scroll to "Parameter Presets" section
2. Click **"Load"** on any saved preset
3. Parameters are automatically applied
4. Click "Generate Custom S-box" to test

### Delete Presets
- Click **"Delete"** to remove unwanted presets

---

## 📊 Research Workflow

### Experiment 1: Test Different Constants
1. Keep K44 matrix
2. Change constant to 0x00, 0xFF, 0xAA, etc.
3. Generate and compare results
4. Save interesting configurations

### Experiment 2: Test Different Matrices
1. Start with K44 matrix
2. Modify one row at a time
3. Observe how changes affect cryptographic properties
4. Find optimal configurations

### Experiment 3: Systematic Exploration
1. Create multiple presets with different combinations
2. Generate S-boxes for each
3. Compare metrics (NL, SAC, etc.)
4. Document findings

---

## 🎯 Use Cases

### For Research
- **Matrix Exploration**: Test different affine matrices
- **Constant Optimization**: Find optimal constant values
- **Comparative Analysis**: Compare multiple configurations
- **Parameter Sweeping**: Systematically test parameter ranges

### For Presentation
- **Live Demonstrations**: Show how parameters affect S-box properties
- **Interactive Exploration**: Let audience suggest parameters
- **Real-time Analysis**: Instant feedback on parameter changes

### For Documentation
- **Save Configurations**: Preserve interesting parameter sets
- **Reproducible Research**: Save exact parameters used
- **Parameter Logging**: Track which configurations were tested

---

## 📋 Parameter Panel Features

### Matrix Selection
- ✅ Three options: K44, AES, Custom
- ✅ Visual display of current matrix
- ✅ Edit predefined matrices as custom
- ✅ Real-time hex conversion

### Constant Input
- ✅ Hex or decimal input
- ✅ Quick preset buttons
- ✅ Validation (0-255 range)
- ✅ Real-time preview

### Preset Management
- ✅ Save current configuration
- ✅ Load saved presets
- ✅ Delete unwanted presets
- ✅ Persistent storage (localStorage)

### Active Parameters Display
- ✅ Shows current matrix type
- ✅ Shows current constant
- ✅ Shows formula: `S(x) = Matrix × x^(-1) ⊕ Constant`

---

## 🔬 Research Tips

### 1. Start with Known Values
- Begin with K44 matrix and 0x63 constant
- Verify results match expected values
- Then experiment with variations

### 2. Change One Parameter at a Time
- Modify either matrix OR constant
- Observe individual effects
- Document changes systematically

### 3. Use Presets for Comparison
- Save baseline (K44 + 0x63)
- Save variations
- Quickly switch between configurations

### 4. Focus on Key Metrics
- **Nonlinearity**: Target 112 (maximum)
- **SAC**: Target ~0.5 (ideal)
- **LAP/DAP**: Lower is better

### 5. Document Findings
- Note which parameters produce best results
- Save successful configurations
- Compare against paper's findings

---

## 🎨 UI Features

### Visual Feedback
- ✅ Active parameter highlighting
- ✅ Real-time hex/decimal conversion
- ✅ Input validation indicators
- ✅ Matrix preview display

### User Experience
- ✅ Intuitive controls
- ✅ Clear labeling
- ✅ Helpful tooltips
- ✅ Error prevention

### Research Tools
- ✅ Preset management
- ✅ Quick parameter switching
- ✅ Formula display
- ✅ Active configuration summary

---

## 📝 Example Research Scenarios

### Scenario 1: Constant Optimization
```
Goal: Find constant that maximizes nonlinearity
Method:
1. Keep K44 matrix
2. Test constants: 0x00, 0x63, 0xFF, 0xAA, 0x55
3. Compare nonlinearity values
4. Document best constant
```

### Scenario 2: Matrix Row Analysis
```
Goal: Understand impact of individual matrix rows
Method:
1. Start with K44 matrix
2. Modify Row 0 only
3. Generate and analyze
4. Repeat for each row
5. Identify critical rows
```

### Scenario 3: Combined Optimization
```
Goal: Find best matrix + constant combination
Method:
1. Test multiple matrix variations
2. For each matrix, test multiple constants
3. Compare all combinations
4. Identify optimal pair
```

---

## 🔧 Technical Details

### Matrix Format
- **Type**: 8×8 binary matrix
- **Representation**: 8 integers (0-255)
- **Each integer**: One row as 8 bits
- **Bit order**: LSB to MSB (bit 0 = rightmost)

### Constant Format
- **Type**: 8-bit value
- **Range**: 0-255 (0x00 to 0xFF)
- **Default**: 0x63 (C_AES)

### S-box Generation
- **Formula**: `S(x) = Matrix × inv(x) ⊕ Constant`
- **GF(2^8)**: Irreducible polynomial 0x11B
- **Output**: 256 unique values (0-255)

---

## ✅ Validation

The system validates:
- ✅ Matrix has exactly 8 rows
- ✅ Each row is 0-255 (8 bits)
- ✅ Constant is 0-255
- ✅ Input formats (binary/hex/decimal)
- ✅ S-box uniqueness (bijection property)

---

## 🎓 Research Benefits

1. **Flexibility**: Test any parameter combination
2. **Speed**: Instant generation and analysis
3. **Comparison**: Easy side-by-side evaluation
4. **Documentation**: Save and reload configurations
5. **Exploration**: Systematic parameter testing

---

## 📚 Next Steps

1. **Experiment**: Try different parameter combinations
2. **Document**: Save interesting findings
3. **Compare**: Use presets to compare configurations
4. **Analyze**: Focus on metrics that matter for your research
5. **Present**: Use live demonstrations in presentations

---

**The Research Parameters Panel makes your application a powerful tool for cryptographic research and experimentation!** 🔬✨

