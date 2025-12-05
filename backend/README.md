# Advanced S-Box 44 Analyzer - Backend

Python FastAPI backend for cryptographic S-box analysis.

## Features

- **Galois Field GF(2^8) Operations**: Complete implementation of arithmetic operations
- **S-box Generation**: Using K44 affine matrix and standard AES matrix
- **Cryptographic Tests**:
  - Nonlinearity (NL)
  - Strict Avalanche Criterion (SAC)
  - Bit Independence Criterion - Nonlinearity (BIC-NL)
  - Bit Independence Criterion - SAC (BIC-SAC)
  - Linear Approximation Probability (LAP)
  - Differential Approximation Probability (DAP)
  - Differential Uniformity (DU)
  - Algebraic Degree (AD)
  - Transparency Order (TO)
  - Correlation Immunity (CI)
  - Cycle Structure (max cycle length, fixed points)
- **Report Export**: Generate CSV summaries that mirror `AnalysisResults` payloads (PDF planned)

## Installation

```bash
pip install -r requirements.txt
```

## Running the Server

```bash
python main.py
```

The API will be available at `http://localhost:8000`

## API Documentation

Visit `http://localhost:8000/docs` for interactive API documentation.

## Endpoints

- `POST /generate-sbox`: Generate S-box using K44, AES, or a custom matrix
- `POST /analyze`: Analyze S-box cryptographic strength (returns `AnalysisResults` structure)
- `POST /compare`: Compare K44, AES, and optional custom S-boxes
- `POST /export-analysis`: Export analysis results (CSV now, PDF upcoming)
- `GET /matrix-info`: Get matrix information

## Testing

Run tests:

```bash
# Test S-box generation
python sbox_generator.py

# Test cryptographic analysis
python cryptographic_tests.py
```

