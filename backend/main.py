"""
FastAPI Backend for AES S-box Research Tool
Advanced S-Box 44 Analyzer
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import time

from sbox_generator import SBoxGenerator, K44_MATRIX, AES_MATRIX, C_AES, AVAILABLE_MATRICES
from cryptographic_tests import analyze_sbox
from aes_cipher import create_cipher
import base64

app = FastAPI(
    title="AES S-box Research Analyzer API",
    description="Comprehensive research platform for AES S-box analysis through affine matrices exploration, parameter optimization, and cryptographic strength evaluation",
    version="2.0.0"
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize generator
generator = SBoxGenerator()


# Request/Response Models
class SBoxGenerateRequest(BaseModel):
    """Request model for S-box generation"""
    use_k44: bool = True
    custom_matrix: Optional[List[int]] = None
    constant: Optional[int] = None


class SBoxAnalyzeRequest(BaseModel):
    """Request model for S-box analysis"""
    sbox: List[int]
    name: Optional[str] = "Custom S-box"


class SBoxResponse(BaseModel):
    """Response model for S-box generation"""
    sbox: List[int]
    matrix_used: str
    constant: int
    generation_time_ms: float


class AnalysisResponse(BaseModel):
    """Response model for S-box analysis"""
    sbox_name: str
    nonlinearity: Dict
    sac: Dict
    bic_nl: Dict
    bic_sac: Dict
    lap: Dict
    dap: Dict
    differential_uniformity: Dict
    algebraic_degree: Dict
    transparency_order: Dict
    correlation_immunity: Dict
    cycle_structure: Dict
    analysis_time_ms: float


class ComparisonRequest(BaseModel):
    """Request model for comparison"""
    custom_sbox: Optional[List[int]] = None  # Optional custom S-box to include in comparison


class ComparisonResponse(BaseModel):
    """Response model for comparison between S-boxes"""
    k44_sbox: List[int]
    aes_sbox: List[int]
    custom_sbox: Optional[List[int]] = None
    k44_analysis: Dict
    aes_analysis: Dict
    custom_analysis: Optional[Dict] = None
    generation_time_ms: float
    analysis_time_ms: float


class EncryptRequest(BaseModel):
    """Request model for encryption"""
    plaintext: str
    key: str  # Will be converted to bytes, must be 16 bytes when encoded
    sbox_type: str = "k44"  # "k44", "aes", or "custom"
    custom_sbox: Optional[List[int]] = None  # Required if sbox_type is "custom"


class DecryptRequest(BaseModel):
    """Request model for decryption"""
    ciphertext: str  # Base64 encoded
    key: str  # Will be converted to bytes, must be 16 bytes when encoded
    sbox_type: str = "k44"  # "k44", "aes", or "custom"
    custom_sbox: Optional[List[int]] = None  # Required if sbox_type is "custom"


class EncryptResponse(BaseModel):
    """Response model for encryption"""
    ciphertext: str  # Base64 encoded
    sbox_type: str
    encryption_time_ms: float


class DecryptResponse(BaseModel):
    """Response model for decryption"""
    plaintext: str
    sbox_type: str
    decryption_time_ms: float


# API Endpoints

@app.get("/")
def root():
    """API root endpoint"""
    return {
        "message": "Advanced S-Box 44 Analyzer API",
        "version": "1.0.0",
            "endpoints": {
            "generate": "/generate-sbox",
            "analyze": "/analyze",
            "compare": "/compare (POST)",
            "encrypt": "/encrypt",
            "decrypt": "/decrypt",
            "matrix-info": "/matrix-info",
            "health": "/health"
        }
    }


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "S-Box Analyzer API"}


@app.post("/generate-sbox", response_model=SBoxResponse)
def generate_sbox(request: SBoxGenerateRequest = None):
    """
    Generate S-box using affine transformation
    
    Default: Uses K44 matrix with C_AES constant
    Custom: Provide custom matrix and constant
    """
    try:
        start_time = time.time()
        
        if request is None:
            request = SBoxGenerateRequest()
        
        # Determine which matrix to use
        # Priority: custom_matrix > use_k44 flag > default AES
        if request.custom_matrix:
            if len(request.custom_matrix) != 8:
                raise HTTPException(
                    status_code=400,
                    detail="Custom matrix must have exactly 8 rows"
                )
            # Check if it matches known matrices
            matrix = request.custom_matrix
            matrix_name = "Custom Matrix"
            
            # Compare with known matrices
            if matrix == K44_MATRIX:
                matrix_name = "K44 Matrix"
            elif matrix == AES_MATRIX:
                matrix_name = "AES Matrix"
            else:
                # Check against other known matrices
                for key, (name, known_matrix) in AVAILABLE_MATRICES.items():
                    if list(matrix) == list(known_matrix):  # Convert both to lists for comparison
                        matrix_name = name
                        break
        elif request.use_k44:
            matrix = K44_MATRIX
            matrix_name = "K44 Matrix"
        else:
            matrix = AES_MATRIX
            matrix_name = "AES Matrix"
        
        constant = request.constant if request.constant is not None else C_AES
        
        # Generate S-box
        sbox = generator.generate_sbox(matrix, constant)
        
        generation_time = (time.time() - start_time) * 1000  # Convert to ms
        
        return SBoxResponse(
            sbox=sbox,
            matrix_used=matrix_name,
            constant=constant,
            generation_time_ms=round(generation_time, 2)
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze", response_model=AnalysisResponse)
def analyze(request: SBoxAnalyzeRequest):
    """
    Analyze S-box cryptographic strength
    
    Performs comprehensive tests:
    - Nonlinearity (NL)
    - Strict Avalanche Criterion (SAC)
    - BIC-NL & BIC-SAC
    - Linear Approximation Probability (LAP)
    - Differential Approximation Probability (DAP)
    """
    try:
        if len(request.sbox) != 256:
            raise HTTPException(
                status_code=400,
                detail="S-box must contain exactly 256 values"
            )
        
        # Validate S-box values
        if not all(0 <= val <= 255 for val in request.sbox):
            raise HTTPException(
                status_code=400,
                detail="All S-box values must be in range 0-255"
            )
        
        start_time = time.time()
        
        # Perform analysis
        results = analyze_sbox(request.sbox)
        
        analysis_time = (time.time() - start_time) * 1000
        
        return AnalysisResponse(
            sbox_name=request.name,
            nonlinearity=results["nonlinearity"],
            sac=results["sac"],
            bic_nl=results["bic_nl"],
            bic_sac=results["bic_sac"],
            lap=results["lap"],
            dap=results["dap"],
            differential_uniformity=results["differential_uniformity"],
            algebraic_degree=results["algebraic_degree"],
            transparency_order=results["transparency_order"],
            correlation_immunity=results["correlation_immunity"],
            cycle_structure=results["cycle_structure"],
            analysis_time_ms=round(analysis_time, 2)
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/compare", response_model=ComparisonResponse)
def compare(request: ComparisonRequest = None):
    """
    Compare K44 S-box with standard AES S-box, optionally including custom S-box
    
    Generates both S-boxes and performs complete analysis
    Returns side-by-side comparison of all metrics
    
    Args:
        custom_sbox: Optional custom S-box (256 values) to include in comparison
    
    Returns:
        Comparison of K44, AES, and optionally custom S-boxes
    """
    try:
        if request is None:
            request = ComparisonRequest()
        
        start_time = time.time()
        
        # Generate both standard S-boxes
        k44_sbox = generator.generate_k44_sbox()
        aes_sbox = generator.generate_aes_sbox()
        
        # Validate custom S-box if provided
        custom_sbox = None
        if request.custom_sbox:
            if len(request.custom_sbox) != 256:
                raise HTTPException(
                    status_code=400,
                    detail="Custom S-box must contain exactly 256 values"
                )
            if not all(0 <= val <= 255 for val in request.custom_sbox):
                raise HTTPException(
                    status_code=400,
                    detail="All S-box values must be in range 0-255"
                )
            custom_sbox = request.custom_sbox
        
        generation_time = (time.time() - start_time) * 1000
        
        # Analyze all S-boxes
        analysis_start = time.time()
        k44_analysis = analyze_sbox(k44_sbox)
        aes_analysis = analyze_sbox(aes_sbox)
        custom_analysis = analyze_sbox(custom_sbox) if custom_sbox else None
        analysis_time = (time.time() - analysis_start) * 1000
        
        return ComparisonResponse(
            k44_sbox=k44_sbox,
            aes_sbox=aes_sbox,
            custom_sbox=custom_sbox,
            k44_analysis=k44_analysis,
            aes_analysis=aes_analysis,
            custom_analysis=custom_analysis,
            generation_time_ms=round(generation_time, 2),
            analysis_time_ms=round(analysis_time, 2)
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/matrix-info")
def get_matrix_info():
    """Get information about the K44 and AES matrices"""
    return {
        "k44_matrix": {
            "name": "K44 Affine Matrix",
            "description": "Modified affine matrix from research paper",
            "rows": [f"{row:08b}" for row in K44_MATRIX],
            "hex": [f"0x{row:02X}" for row in K44_MATRIX]
        },
        "aes_matrix": {
            "name": "Standard AES Affine Matrix",
            "description": "Original AES Rijndael affine matrix",
            "rows": [f"{row:08b}" for row in AES_MATRIX],
            "hex": [f"0x{row:02X}" for row in AES_MATRIX]
        },
        "constant": {
            "value": C_AES,
            "hex": f"0x{C_AES:02X}",
            "binary": f"{C_AES:08b}",
            "description": "AES affine transformation constant"
        }
    }


def _prepare_key(key_str: str) -> bytes:
    """
    Prepare encryption key from string
    Key will be padded or truncated to exactly 16 bytes
    """
    key_bytes = key_str.encode('utf-8')
    
    if len(key_bytes) < 16:
        # Pad with zeros
        key_bytes = key_bytes + b'\x00' * (16 - len(key_bytes))
    elif len(key_bytes) > 16:
        # Truncate to 16 bytes
        key_bytes = key_bytes[:16]
    
    return key_bytes


@app.post("/encrypt", response_model=EncryptResponse)
def encrypt(request: EncryptRequest):
    """
    Encrypt plaintext using AES-128 with K44, AES, or custom S-box
    
    Args:
        plaintext: Text to encrypt
        key: Encryption key (will be padded/truncated to 16 bytes)
        sbox_type: "k44" for K44 S-box, "aes" for standard AES S-box, "custom" for custom S-box
        custom_sbox: Custom S-box (256 values) - required if sbox_type is "custom"
    
    Returns:
        Base64 encoded ciphertext (IV + encrypted data)
    """
    try:
        if request.sbox_type.lower() not in ['k44', 'aes', 'custom']:
            raise HTTPException(
                status_code=400,
                detail="sbox_type must be 'k44', 'aes', or 'custom'"
            )
        
        if request.sbox_type.lower() == 'custom':
            if request.custom_sbox is None:
                raise HTTPException(
                    status_code=400,
                    detail="custom_sbox is required when sbox_type is 'custom'"
                )
            if len(request.custom_sbox) != 256:
                raise HTTPException(
                    status_code=400,
                    detail="Custom S-box must contain exactly 256 values"
                )
        
        start_time = time.time()
        
        # Prepare key
        key = _prepare_key(request.key)
        
        # Prepare plaintext
        plaintext_bytes = request.plaintext.encode('utf-8')
        
        # Create cipher with specified S-box
        cipher = create_cipher(
            request.sbox_type.lower(),
            request.custom_sbox if request.sbox_type.lower() == 'custom' else None
        )
        
        # Encrypt
        ciphertext_bytes = cipher.encrypt(plaintext_bytes, key)
        
        # Encode to base64 for safe transmission
        ciphertext_b64 = base64.b64encode(ciphertext_bytes).decode('utf-8')
        
        encryption_time = (time.time() - start_time) * 1000
        
        return EncryptResponse(
            ciphertext=ciphertext_b64,
            sbox_type=request.sbox_type.lower(),
            encryption_time_ms=round(encryption_time, 2)
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/decrypt", response_model=DecryptResponse)
def decrypt(request: DecryptRequest):
    """
    Decrypt ciphertext using AES-128 with K44, AES, or custom S-box
    
    Args:
        ciphertext: Base64 encoded ciphertext (IV + encrypted data)
        key: Decryption key (must match encryption key)
        sbox_type: "k44" for K44 S-box, "aes" for standard AES S-box, "custom" for custom S-box
        custom_sbox: Custom S-box (256 values) - required if sbox_type is "custom"
    
    Returns:
        Decrypted plaintext
    """
    try:
        if request.sbox_type.lower() not in ['k44', 'aes', 'custom']:
            raise HTTPException(
                status_code=400,
                detail="sbox_type must be 'k44', 'aes', or 'custom'"
            )
        
        if request.sbox_type.lower() == 'custom':
            if request.custom_sbox is None:
                raise HTTPException(
                    status_code=400,
                    detail="custom_sbox is required when sbox_type is 'custom'"
                )
            if len(request.custom_sbox) != 256:
                raise HTTPException(
                    status_code=400,
                    detail="Custom S-box must contain exactly 256 values"
                )
        
        start_time = time.time()
        
        # Prepare key
        key = _prepare_key(request.key)
        
        # Decode base64 ciphertext
        try:
            ciphertext_bytes = base64.b64decode(request.ciphertext)
        except Exception:
            raise HTTPException(
                status_code=400,
                detail="Invalid base64 ciphertext"
            )
        
        # Create cipher with specified S-box
        cipher = create_cipher(
            request.sbox_type.lower(),
            request.custom_sbox if request.sbox_type.lower() == 'custom' else None
        )
        
        # Decrypt
        plaintext_bytes = cipher.decrypt(ciphertext_bytes, key)
        
        # Decode to string
        plaintext = plaintext_bytes.decode('utf-8')
        
        decryption_time = (time.time() - start_time) * 1000
        
        return DecryptResponse(
            plaintext=plaintext,
            sbox_type=request.sbox_type.lower(),
            decryption_time_ms=round(decryption_time, 2)
        )
    
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    
    print("=" * 60)
    print("Advanced S-Box 44 Analyzer API")
    print("=" * 60)
    print("\nStarting server on http://localhost:8000")
    print("API Documentation: http://localhost:8000/docs")
    print("=" * 60)
    
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

