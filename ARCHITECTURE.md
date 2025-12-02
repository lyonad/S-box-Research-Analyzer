# 🏗️ Architecture Documentation

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser (Client)                         │
│  ┌───────────────────────────────────────────────────────┐ │
│  │          React TypeScript Frontend                    │ │
│  │  Port: 3000                                          │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │ │
│  │  │  Header  │  │ Control  │  │   Visualization  │  │ │
│  │  │          │  │  Panel   │  │   Components     │  │ │
│  │  └──────────┘  └──────────┘  └──────────────────┘  │ │
│  │                                                      │ │
│  │  ┌──────────────────────────────────────────────┐  │ │
│  │  │           API Service (Axios)               │  │ │
│  │  └──────────────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ HTTP/REST API
                          │
┌─────────────────────────────────────────────────────────────┐
│                  Python Backend (FastAPI)                   │
│  Port: 8000                                                 │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                    REST API Layer                     │ │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────┐ │ │
│  │  │ /generate- │  │  /analyze  │  │   /compare     │ │ │
│  │  │    sbox    │  │            │  │                │ │ │
│  │  └────────────┘  └────────────┘  └────────────────┘ │ │
│  └───────────────────────────────────────────────────────┘ │
│                          │                                  │
│  ┌───────────────────────────────────────────────────────┐ │
│  │              Business Logic Layer                     │ │
│  │  ┌──────────────┐  ┌───────────────────────────────┐ │ │
│  │  │   S-box      │  │  Cryptographic Tests          │ │ │
│  │  │  Generator   │  │  - Nonlinearity               │ │ │
│  │  │              │  │  - SAC                        │ │ │
│  │  │  - K44       │  │  - BIC-NL, BIC-SAC           │ │ │
│  │  │  - AES       │  │  - LAP, DAP                  │ │ │
│  │  └──────────────┘  └───────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────┘ │
│                          │                                  │
│  ┌───────────────────────────────────────────────────────┐ │
│  │           Mathematical Foundation Layer               │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │         Galois Field GF(2^8) Operations          │ │ │
│  │  │  - Multiplication                                │ │ │
│  │  │  - Inverse                                       │ │ │
│  │  │  - Affine Transformation                         │ │ │
│  │  │  - Lookup Tables                                 │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. S-box Generation Flow

```
User Click "Generate & Analyze"
         │
         ▼
┌─────────────────────┐
│  Frontend Request   │
│  GET /compare       │
└─────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Backend: Generate K44 S-box        │
│  1. For x = 0 to 255:               │
│     a. Calculate x^(-1) in GF(2^8)  │
│     b. Apply K44 matrix transform   │
│     c. XOR with constant 0x63       │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Backend: Generate AES S-box        │
│  (Same process with AES matrix)     │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Backend: Analyze Both S-boxes      │
│  - Calculate Nonlinearity           │
│  - Calculate SAC                    │
│  - Calculate BIC-NL & BIC-SAC       │
│  - Calculate LAP & DAP              │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Response: JSON Data                │
│  - S-boxes (512 values)             │
│  - Analysis metrics                 │
│  - Performance data                 │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Frontend: Render Results           │
│  - S-box Grids                      │
│  - Metrics Panels                   │
│  - Comparison Table                 │
└─────────────────────────────────────┘
```

## Component Hierarchy (Frontend)

```
App.tsx
├── Header.tsx
├── ControlPanel.tsx
├── LoadingSpinner.tsx (conditional)
├── Error Display (conditional)
└── Results Container (conditional)
    ├── Performance Metrics
    ├── Tab Navigation
    └── Tab Content
        ├── K44 Tab
        │   ├── SBoxGrid.tsx (K44)
        │   └── MetricsPanel.tsx (K44)
        ├── AES Tab
        │   ├── SBoxGrid.tsx (AES)
        │   └── MetricsPanel.tsx (AES)
        └── Comparison Tab
            ├── ComparisonTable.tsx
            └── Side-by-side SBoxGrids
```

## Backend Module Structure

```
backend/
├── main.py                      # FastAPI application entry
│   ├── CORS middleware
│   ├── Route handlers
│   └── Error handling
│
├── galois_field.py              # Mathematical foundation
│   ├── GF256 class
│   │   ├── Exponential tables
│   │   ├── Logarithm tables
│   │   ├── multiply()
│   │   ├── inverse()
│   │   └── add()
│   └── Affine transformation
│
├── sbox_generator.py            # S-box construction
│   ├── K44_MATRIX constant
│   ├── AES_MATRIX constant
│   ├── C_AES constant
│   └── SBoxGenerator class
│       ├── generate_sbox()
│       ├── generate_k44_sbox()
│       └── generate_aes_sbox()
│
└── cryptographic_tests.py       # Security analysis
    ├── calculate_nonlinearity()
    ├── calculate_sac()
    ├── calculate_bic_nl()
    ├── calculate_bic_sac()
    ├── calculate_lap()
    ├── calculate_dap()
    └── analyze_sbox()
```

## Key Algorithms

### 1. Multiplicative Inverse in GF(2^8)

```python
# Using logarithm tables for efficiency
inverse(a) = exp[255 - log[a]]

# Where exp and log are precomputed lookup tables
```

### 2. Affine Transformation

```python
# Matrix-vector multiplication in GF(2)
result = 0
for i in range(8):
    bit = 0
    for j in range(8):
        bit ^= ((matrix[i] >> j) & 1) & ((vector >> j) & 1)
    result |= (bit << i)
result ^= constant
```

### 3. Nonlinearity Calculation

```python
# For each output bit:
1. Extract boolean function
2. Convert to bipolar form (-1, 1)
3. Compute Walsh-Hadamard Transform
4. NL = 128 - max|Walsh_spectrum| / 2
```

### 4. SAC (Strict Avalanche Criterion)

```python
# For each input position and each input value:
1. Flip one input bit
2. Count which output bits change
3. Calculate probability: changed_count / 256
# Ideal: ~0.5 (each output bit changes 50% of time)
```

## Performance Characteristics

### Backend Performance

| Operation | Time Complexity | Typical Time |
|-----------|----------------|--------------|
| S-box Generation | O(256) | ~0.5ms |
| Nonlinearity | O(256 × 8 × 256) | ~100ms |
| SAC | O(256 × 8 × 8) | ~50ms |
| BIC-NL | O(28 × 256) | ~150ms |
| BIC-SAC | O(8 × 28 × 256) | ~200ms |
| LAP | O(255² × 256) | ~1000ms |
| DAP | O(256² × 256) | ~1500ms |
| **Total** | | **~3-5 seconds** |

### Frontend Performance

| Component | Initial Render | Re-render |
|-----------|---------------|-----------|
| SBoxGrid (16×16) | ~50ms | ~10ms |
| MetricsPanel | ~20ms | ~5ms |
| ComparisonTable | ~15ms | ~5ms |

## Technology Stack

### Backend
- **Language**: Python 3.8+
- **Framework**: FastAPI 0.104+
- **Libraries**: 
  - NumPy (numerical operations)
  - Uvicorn (ASGI server)
  - Pydantic (data validation)

### Frontend
- **Language**: TypeScript 5.2+
- **Framework**: React 18
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 3.3
- **HTTP Client**: Axios 1.6
- **Charts**: Recharts 2.10

## Security Considerations

1. **CORS**: Currently allows all origins - should be restricted in production
2. **Input Validation**: All API inputs are validated via Pydantic models
3. **Error Handling**: Comprehensive error handling with appropriate status codes
4. **Rate Limiting**: Not implemented - consider adding for production

## Scalability

### Current Limitations
- Analysis is CPU-intensive (3-5 seconds per comparison)
- Single-threaded processing
- No caching mechanism

### Potential Improvements
1. **Caching**: Cache S-box generation and analysis results
2. **Parallelization**: Use multiprocessing for independent tests
3. **WebAssembly**: Port critical algorithms to WASM for client-side execution
4. **Worker Threads**: Background processing for long-running tasks

## Extensibility

### Adding New Matrices
1. Define matrix in `sbox_generator.py`
2. Add endpoint in `main.py`
3. Update frontend to support new option

### Adding New Tests
1. Implement test function in `cryptographic_tests.py`
2. Add to `analyze_sbox()` function
3. Update response models
4. Add display in `MetricsPanel.tsx`

## Testing Strategy

### Backend Tests
- Unit tests for GF(2^8) operations
- Integration tests for S-box generation
- Validation tests for cryptographic metrics
- Performance benchmarks

### Frontend Tests
- Component rendering tests
- API integration tests
- User interaction tests
- Responsive design tests

## Deployment

### Development
```bash
# Backend
cd backend && python main.py

# Frontend
cd frontend && npm run dev
```

### Production
```bash
# Backend
cd backend && uvicorn main:app --host 0.0.0.0 --port 8000

# Frontend
cd frontend && npm run build
# Serve dist/ with nginx or similar
```

## Documentation

- `README.md` - Main project documentation
- `SETUP.md` - Quick setup guide
- `ARCHITECTURE.md` - This file
- `backend/README.md` - Backend-specific docs
- `frontend/README.md` - Frontend-specific docs
- API Docs - Auto-generated at `/docs` endpoint

