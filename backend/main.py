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
    analysis_time_ms: float


class ComparisonResponse(BaseModel):
    """Response model for comparison between S-boxes"""
    k44_sbox: List[int]
    aes_sbox: List[int]
    k44_analysis: Dict
    aes_analysis: Dict
    generation_time_ms: float
    analysis_time_ms: float


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
            "compare": "/compare",
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
            analysis_time_ms=round(analysis_time, 2)
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/compare", response_model=ComparisonResponse)
def compare():
    """
    Compare K44 S-box with standard AES S-box
    
    Generates both S-boxes and performs complete analysis
    Returns side-by-side comparison of all metrics
    """
    try:
        start_time = time.time()
        
        # Generate both S-boxes
        k44_sbox = generator.generate_k44_sbox()
        aes_sbox = generator.generate_aes_sbox()
        
        generation_time = (time.time() - start_time) * 1000
        
        # Analyze both
        analysis_start = time.time()
        k44_analysis = analyze_sbox(k44_sbox)
        aes_analysis = analyze_sbox(aes_sbox)
        analysis_time = (time.time() - analysis_start) * 1000
        
        return ComparisonResponse(
            k44_sbox=k44_sbox,
            aes_sbox=aes_sbox,
            k44_analysis=k44_analysis,
            aes_analysis=aes_analysis,
            generation_time_ms=round(generation_time, 2),
            analysis_time_ms=round(analysis_time, 2)
        )
    
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


if __name__ == "__main__":
    import uvicorn
    
    print("=" * 60)
    print("Advanced S-Box 44 Analyzer API")
    print("=" * 60)
    print("\nStarting server on http://localhost:8000")
    print("API Documentation: http://localhost:8000/docs")
    print("=" * 60)
    
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

