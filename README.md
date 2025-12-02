# 🔐 Advanced S-Box 44 Analyzer

A professional web-based research tool demonstrating AES S-box modification using affine matrices exploration. This tool implements the findings from the research paper on cryptographic S-box construction and provides comprehensive analysis of their cryptographic properties.

## 📋 Overview

This application allows researchers to:
- Generate S-boxes using the K44 affine matrix from the research paper
- Compare with standard AES S-box
- Perform comprehensive cryptographic strength testing
- Visualize results in an academic-grade dashboard

## 🏗️ Architecture

### Backend (Python/FastAPI)
- **Galois Field GF(2^8) Arithmetic**: Complete implementation with irreducible polynomial `x^8 + x^4 + x^3 + x + 1` (0x11B)
- **S-box Generation**: Using K44 affine matrix with constant `C_AES` (0x63)
- **Cryptographic Tests**:
  - Nonlinearity (NL) - Target: 112
  - Strict Avalanche Criterion (SAC) - Target: ~0.5
  - Bit Independence Criterion - Nonlinearity (BIC-NL)
  - Bit Independence Criterion - SAC (BIC-SAC)
  - Linear Approximation Probability (LAP)
  - Differential Approximation Probability (DAP)

### Frontend (React/TypeScript)
- Modern dashboard with professional academic design
- Interactive 16×16 S-box visualization grid
- Real-time metrics display
- Side-by-side comparison functionality
- Responsive design with Tailwind CSS

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Run the FastAPI server:
```bash
python main.py
```

The API will be available at `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`
- Interactive API: `http://localhost:8000/redoc`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📊 Features

### 1. S-box Generation
- **K44 Matrix**: Modified affine matrix from research paper
  ```
  01010111
  10101011
  11010101
  11101010
  01110101
  10111010
  01011101
  10101110
  ```
- **AES Matrix**: Standard Rijndael affine matrix
- Uses Galois Field GF(2^8) arithmetic
- Multiplicative inverse followed by affine transformation

### 2. Visualization
- **Interactive Grid**: 16×16 hexadecimal display
- **Hover Effects**: Shows detailed information (hex, decimal, binary)
- **Color Coding**: Blue for K44, Purple for AES
- **Cell Selection**: Click to lock information display

### 3. Cryptographic Analysis

#### Nonlinearity (NL)
Measures resistance to linear cryptanalysis. Higher is better.
- Target: 112
- Uses Walsh-Hadamard Transform

#### Strict Avalanche Criterion (SAC)
Measures avalanche effect - how flipping one input bit affects output bits.
- Target: ~0.5 (ideally 0.50073 for AES)

#### BIC-NL & BIC-SAC
Measures independence between output bit functions.

#### LAP & DAP
- **LAP**: Linear Approximation Probability - resistance to linear attacks
- **DAP**: Differential Approximation Probability - resistance to differential attacks
- Lower values indicate better security

### 4. Comparison Dashboard
- Side-by-side metric comparison
- Winner indication for each metric
- Visual comparison of S-box grids
- Performance metrics (generation and analysis time)

## 🔬 Research Context

This tool implements the methodology from:
**"AES S-box modification uses affine matrices exploration"**
Published in: Nonlinear Dynamics (Springer)

The K44 matrix represents one of the explored modifications to the standard AES affine transformation, potentially offering different cryptographic properties while maintaining the mathematical rigor required for secure encryption.

## 📁 Project Structure

```
.
├── backend/
│   ├── main.py                 # FastAPI application
│   ├── galois_field.py         # GF(2^8) arithmetic operations
│   ├── sbox_generator.py       # S-box generation logic
│   ├── cryptographic_tests.py  # Strength testing algorithms
│   ├── requirements.txt        # Python dependencies
│   └── README.md              # Backend documentation
│
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── Header.tsx
│   │   │   ├── ControlPanel.tsx
│   │   │   ├── SBoxGrid.tsx
│   │   │   ├── MetricsPanel.tsx
│   │   │   ├── ComparisonTable.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── api.ts            # Backend API service
│   │   ├── types.ts          # TypeScript definitions
│   │   ├── App.tsx           # Main application
│   │   └── main.tsx          # Entry point
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── README.md             # Frontend documentation
│
└── README.md                  # This file
```

## 🎯 API Endpoints

- `POST /generate-sbox` - Generate S-box with specified matrix
- `POST /analyze` - Analyze S-box cryptographic strength
- `GET /compare` - Compare K44 and AES S-boxes
- `GET /matrix-info` - Get matrix information
- `GET /health` - Health check

See `http://localhost:8000/docs` for detailed API documentation.

## 🧪 Testing

### Backend Tests
```bash
cd backend

# Test S-box generation
python sbox_generator.py

# Test cryptographic analysis
python cryptographic_tests.py
```

### Frontend Build
```bash
cd frontend

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎨 Design Features

- **Dark Theme**: Professional dark mode with gradient backgrounds
- **Glass Morphism**: Modern frosted glass effect on panels
- **Typography**: Inter for UI, Fira Code for monospace
- **Color Palette**:
  - K44: Blue accent (#3b82f6)
  - AES: Purple accent (#8b5cf6)
  - Success: Green (#10b981)
  - Warning: Yellow (#f59e0b)
  - Error: Red (#ef4444)

## 📝 Mathematical Background

### S-box Construction
The S-box is constructed using:
```
S(x) = K * x^(-1) ⊕ C
```

Where:
- `K` is the 8×8 affine transformation matrix (K44 or AES)
- `x^(-1)` is the multiplicative inverse in GF(2^8)
- `C` is the constant vector (0x63)
- All operations in GF(2^8) with irreducible polynomial 0x11B

### Galois Field GF(2^8)
- **Elements**: Polynomials of degree < 8 with coefficients in GF(2)
- **Addition**: XOR operation
- **Multiplication**: Polynomial multiplication modulo irreducible polynomial
- **Inverse**: Using logarithm tables for efficiency

## 🤝 Contributing

This is a research tool. Contributions for:
- Additional cryptographic tests
- Performance optimizations
- Visualization improvements
- Documentation enhancements

are welcome!

## 📄 License

This project is for academic and research purposes.

## 🔗 References

- **Research Paper**: "AES S-box modification uses affine matrices exploration"
  - Alamsyah, Setiawan, A., Putra, A.T. et al. AES S-box modification uses affine matrices exploration for increased S-box strength. *Nonlinear Dyn* **113**, 3869–3890 (2025).
  - https://link.springer.com/article/10.1007/s11071-024-10414-3
  - Published: 08 October 2024
  - DOI: https://doi.org/10.1007/s11071-024-10414-3
- AES Standard (FIPS 197)
- Galois Field Theory in Cryptography
- The Design of Rijndael by Joan Daemen and Vincent Rijmen

## 👥 Authors

Created as a cryptographic research demonstration tool.

## 🙏 Acknowledgments

- Based on research in AES S-box modifications
- Implements standard cryptographic testing methodologies
- Uses modern web technologies for accessible research presentation

---

**Note**: This tool is for research and educational purposes. The K44 S-box is an experimental modification and should not be used in production systems without extensive peer review and cryptanalysis.

