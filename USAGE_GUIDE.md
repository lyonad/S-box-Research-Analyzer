# 📖 Usage Guide

## Getting Started

### Prerequisites Check
- ✅ Python 3.8+ installed
- ✅ Node.js 16+ installed
- ✅ Dependencies installed (run install scripts)

## Step-by-Step Tutorial

### 1. Starting the Application

#### Windows Users
1. Double-click `start-backend.bat` - wait for "Application startup complete"
2. Double-click `start-frontend.bat` - browser will open automatically

#### Mac/Linux Users
```bash
# Terminal 1 - Backend
cd backend
python main.py

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 2. Using the Interface

#### Main Dashboard
```
┌────────────────────────────────────────────────┐
│  🔐 Advanced S-Box 44 Analyzer                │
│  Cryptographic Research Tool                  │
├────────────────────────────────────────────────┤
│                                                │
│  Control Panel                                 │
│  ┌──────────────────────────────────────────┐ │
│  │ K44 Matrix  GF(2⁸)  Poly: 0x11B         │ │
│  │                                          │ │
│  │        [⚡ Generate & Analyze]           │ │
│  └──────────────────────────────────────────┘ │
└────────────────────────────────────────────────┘
```

### 3. Generating and Analyzing S-boxes

**Step 1**: Click the "Generate & Analyze" button

**Step 2**: Wait for analysis (3-5 seconds)
- Backend generates K44 S-box
- Backend generates AES S-box
- Both are analyzed for cryptographic strength

**Step 3**: Explore the results using tabs

### 4. Understanding the Tabs

#### Tab 1: K44 S-box
```
┌─────────────────────────────────────────┐
│ K44 S-box - 16×16 Hexadecimal Grid     │
├─────────────────────────────────────────┤
│     0  1  2  3  4  5  6  7  8  9...    │
│  0│ 63 7C 77 7B F2 6B 6F C5 30 01...   │
│  1│ 67 2B FE D7 AB 76 CA 82 C9 7D...   │
│  ...                                    │
└─────────────────────────────────────────┘

Interactive Features:
- 🖱️ Hover over any cell for details
- 🖱️ Click to lock information display
- 📊 View hex, decimal, and binary values
```

**Metrics Display**:
```
┌──────────────────────┐ ┌──────────────────────┐
│ 🔢 Nonlinearity (NL) │ │ 🎯 SAC              │
│ Min: 112            │ │ Average: 0.50073    │
│ Max: 112            │ │ Std Dev: 0.00234    │
│ Avg: 112.00         │ │ Min: 0.48438        │
│ Target: 112 ✓       │ │ Max: 0.51563        │
└──────────────────────┘ └──────────────────────┘

┌──────────────────────┐ ┌──────────────────────┐
│ 🔗 BIC-NL           │ │ 📊 BIC-SAC          │
│ ...                 │ │ ...                 │
└──────────────────────┘ └──────────────────────┘

┌──────────────────────┐ ┌──────────────────────┐
│ 📐 LAP              │ │ 🎲 DAP              │
│ ...                 │ │ ...                 │
└──────────────────────┘ └──────────────────────┘
```

#### Tab 2: AES S-box
Same layout as K44 tab, but showing standard AES results

#### Tab 3: Comparison
```
┌──────────────────────────────────────────────────┐
│ 📊 Side-by-Side Comparison                      │
├──────────────┬──────────┬──────────┬────────────┤
│ Metric       │ K44      │ AES      │ Winner     │
├──────────────┼──────────┼──────────┼────────────┤
│ NL (Avg)     │ 112.00   │ 112.00   │ Equal      │
│ SAC (Avg)    │ 0.50073  │ 0.50073  │ Equal      │
│ BIC-NL (Avg) │ 103.86   │ 103.86   │ Equal      │
│ ...          │ ...      │ ...      │ ...        │
└──────────────┴──────────┴──────────┴────────────┘

Below: Side-by-side S-box grids
```

## Understanding the Metrics

### 1. Nonlinearity (NL)
**What it measures**: Resistance to linear cryptanalysis

**Values**:
- Min/Max/Average across 8 output bits
- Target: 112 (maximum for 8-bit S-boxes)

**Interpretation**:
- ✅ 112: Optimal
- ⚠️ 100-111: Good but not optimal
- ❌ <100: Weak

### 2. Strict Avalanche Criterion (SAC)
**What it measures**: Avalanche effect (bit change propagation)

**Values**:
- Average probability across all bit pairs
- Target: ~0.5

**Interpretation**:
- ✅ 0.49-0.51: Excellent
- ⚠️ 0.45-0.49 or 0.51-0.55: Good
- ❌ Outside this range: Poor

### 3. BIC-NL (Bit Independence Criterion - Nonlinearity)
**What it measures**: Independence between output bit functions

**Values**:
- Nonlinearity of XOR combinations
- Higher is better

**Interpretation**:
- ✅ >100: Good
- ⚠️ 90-100: Acceptable
- ❌ <90: Weak

### 4. BIC-SAC
**What it measures**: Independence in avalanche behavior

**Values**:
- Deviation from ideal 0.25
- Lower deviation is better

**Interpretation**:
- ✅ <0.01: Excellent
- ⚠️ 0.01-0.05: Good
- ❌ >0.05: Poor

### 5. LAP (Linear Approximation Probability)
**What it measures**: Resistance to linear attacks

**Values**:
- Maximum probability
- Lower is better

**Interpretation**:
- ✅ <0.55: Good
- ⚠️ 0.55-0.60: Acceptable
- ❌ >0.60: Weak

### 6. DAP (Differential Approximation Probability)
**What it measures**: Resistance to differential attacks

**Values**:
- Maximum probability
- Lower is better

**Interpretation**:
- ✅ <0.05: Excellent
- ⚠️ 0.05-0.10: Good
- ❌ >0.10: Weak

## Common Tasks

### Task 1: Quick Analysis
1. Start both servers
2. Open http://localhost:3000
3. Click "Generate & Analyze"
4. View results in tabs

**Time**: ~5-10 seconds

### Task 2: Compare Specific Metrics
1. Generate results
2. Go to "Comparison" tab
3. Look at the comparison table
4. Check "Winner" column

**Use case**: Determine which S-box is better for specific properties

### Task 3: Export S-box Values
1. Generate results
2. Open browser DevTools (F12)
3. Go to Console tab
4. Type: `copy(window.sboxData)`
5. Paste into text file

**Note**: This requires adding export functionality (future feature)

### Task 4: Understanding S-box Construction
1. Go to http://localhost:8000/matrix-info
2. View K44 and AES matrices
3. See the mathematical constants used

**Example Response**:
```json
{
  "k44_matrix": {
    "name": "K44 Affine Matrix",
    "rows": [
      "01010111",
      "10101011",
      "11010101",
      "11101010",
      "01110101",
      "10111010",
      "01011101",
      "10101110"
    ],
    "hex": ["0x57", "0xAB", "0xD5", ...]
  }
}
```

## Advanced Usage

### Using the API Directly

#### Generate K44 S-box
```bash
curl -X POST http://localhost:8000/generate-sbox \
  -H "Content-Type: application/json" \
  -d '{"use_k44": true}'
```

#### Analyze Custom S-box
```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"sbox": [99, 124, 119, ...], "name": "My S-box"}'
```

#### Get Comparison
```bash
curl http://localhost:8000/compare
```

### API Documentation
Visit http://localhost:8000/docs for interactive API documentation (Swagger UI)

## Troubleshooting

### Problem: "Unable to connect to backend API"
**Solution**:
1. Check if backend is running: http://localhost:8000/health
2. If not, restart backend server
3. Check firewall settings

### Problem: Results taking too long
**Explanation**: 
- LAP and DAP tests are computationally intensive
- Normal time: 3-5 seconds
- If >10 seconds, check CPU usage

### Problem: Grid not displaying correctly
**Solution**:
1. Ensure browser is modern (Chrome/Firefox/Edge)
2. Check browser console for errors (F12)
3. Try refreshing the page

### Problem: Metrics show NaN or undefined
**Solution**:
1. Check backend logs for errors
2. Restart backend server
3. Regenerate S-boxes

## Tips and Best Practices

### Performance Tips
1. **First load is slower**: Tables are generated on first run
2. **Keep backend running**: Avoids startup time
3. **Use Comparison tab**: Most efficient for research

### Research Tips
1. **Document your findings**: Take screenshots
2. **Compare multiple runs**: Results should be consistent
3. **Understand the metrics**: Read the paper for context
4. **Export data**: Use API for programmatic access

### Presentation Tips
1. **Full screen mode**: F11 in browser
2. **Dark theme**: Professional look for presentations
3. **Highlight cells**: Click to show specific values
4. **Use Comparison tab**: Best for showing differences

## Keyboard Shortcuts

- `F5` - Refresh page
- `F11` - Full screen mode
- `F12` - Developer tools
- `Ctrl + +/-` - Zoom in/out
- `Ctrl + 0` - Reset zoom

## Next Steps

1. ✅ Complete basic usage tutorial
2. 📚 Read the research paper for deeper understanding
3. 🔬 Experiment with different matrices (advanced)
4. 📊 Compare results with published data
5. 📝 Document your findings

## Support

Need help?
1. Check `SETUP.md` for installation issues
2. Check `README.md` for detailed documentation
3. Check `ARCHITECTURE.md` for technical details
4. Review backend logs for error messages

## Feedback

This is a research tool. If you find issues or have suggestions:
- Document the issue clearly
- Include screenshots if relevant
- Note your system specifications
- Check existing documentation first

