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

- `POST /generate-sbox`: Generate S-box using K44 or AES matrix
- `POST /analyze`: Analyze S-box cryptographic strength
- `GET /compare`: Compare K44 and AES S-boxes
- `GET /matrix-info`: Get matrix information

## Testing

Run tests:

```bash
# Test S-box generation
python sbox_generator.py

# Test cryptographic analysis
python cryptographic_tests.py
```

