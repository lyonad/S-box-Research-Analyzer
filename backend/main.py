"""
FastAPI Backend for AES S-box Research Tool
Advanced S-Box 44 Analyzer
"""

from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse, Response
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
import time
import base64
import io
import math
import json
import numpy as np
from PIL import Image

from sbox_generator import SBoxGenerator, K44_MATRIX, AES_MATRIX, C_AES, AVAILABLE_MATRICES
from cryptographic_tests import analyze_sbox
from aes_cipher import create_cipher
from report_exporter import generate_analysis_csv
from sbox_validations import validate_sbox

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
    expose_headers=["X-Sbox-Type", "X-Encryption-Time", "X-Decryption-Time", "X-Histogram-Data", "Content-Disposition"],
)

# Initialize generator
generator = SBoxGenerator()


# Request/Response Models
class SBoxGenerateRequest(BaseModel):
    """Request model for S-box generation"""
    use_k44: bool = True
    custom_matrix: Optional[List[int]] = None
    constant: Optional[int] = None
    require_valid: bool = False


class SBoxAnalyzeRequest(BaseModel):
    """Request model for S-box analysis"""
    sbox: List[int]
    name: Optional[str] = "Custom S-box"


class BitBalanceModel(BaseModel):
    bit: int
    ones: int
    zeros: int
    expected: int


class DuplicateValueModel(BaseModel):
    value: int
    count: int


class SBoxValidationModel(BaseModel):
    is_balanced: bool
    is_bijective: bool
    is_valid: bool
    unique_values: int
    bit_balance: List[BitBalanceModel]
    duplicate_values: List[DuplicateValueModel]
    missing_values: List[int]


class SBoxResponse(BaseModel):
    """Response model for S-box generation"""
    sbox: List[int]
    matrix_used: str
    constant: int
    generation_time_ms: float
    validation: SBoxValidationModel


class NonlinearityMetricsModel(BaseModel):
    min: int
    max: int
    average: float


class SACMetricsModel(BaseModel):
    average: float
    min: float
    max: float
    std: float
    matrix: Optional[List[List[float]]] = None


class BICNLMetricsModel(BaseModel):
    min: int
    max: int
    average: float


class BICSACMetricsModel(BaseModel):
    average_sac: float
    min_sac: float
    max_sac: float
    std_sac: float


class LAPMetricsModel(BaseModel):
    max_lap: float
    max_bias: float
    average_bias: float


class DAPMetricsModel(BaseModel):
    max_dap: float
    average_dap: float


class DifferentialUniformityMetricsModel(BaseModel):
    max_du: int
    average_du: float


class AlgebraicDegreeMetricsModel(BaseModel):
    min: int
    max: int
    average: float
    degrees: List[int]


class TransparencyOrderMetricsModel(BaseModel):
    transparency_order: float
    max_correlation: float
    min_correlation: float


class CorrelationImmunityMetricsModel(BaseModel):
    min: int
    max: int
    average: float
    orders: List[int]


class CycleStructureMetricsModel(BaseModel):
    count: int
    max_length: int
    min_length: int
    fixed_points: int


class AnalysisMetrics(BaseModel):
    nonlinearity: NonlinearityMetricsModel
    sac: SACMetricsModel
    bic_nl: BICNLMetricsModel
    bic_sac: BICSACMetricsModel
    lap: LAPMetricsModel
    dap: DAPMetricsModel
    differential_uniformity: DifferentialUniformityMetricsModel
    algebraic_degree: AlgebraicDegreeMetricsModel
    transparency_order: TransparencyOrderMetricsModel
    correlation_immunity: CorrelationImmunityMetricsModel
    cycle_structure: CycleStructureMetricsModel


class AnalysisResponse(AnalysisMetrics):
    """Response model for S-box analysis"""
    sbox_name: str
    analysis_time_ms: float


class ComparisonRequest(BaseModel):
    """Request model for comparison"""
    custom_sbox: Optional[List[int]] = None  # Optional custom S-box to include in comparison


class ComparisonResponse(BaseModel):
    """Response model for comparison between S-boxes"""
    k44_sbox: List[int]
    aes_sbox: List[int]
    custom_sbox: Optional[List[int]] = None
    k44_analysis: AnalysisMetrics
    aes_analysis: AnalysisMetrics
    custom_analysis: Optional[AnalysisMetrics] = None
    k44_validation: SBoxValidationModel
    aes_validation: SBoxValidationModel
    custom_validation: Optional[SBoxValidationModel] = None
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


class ImageEncryptResponse(BaseModel):
    """Response model for image encryption"""
    sbox_type: str
    encryption_time_ms: float
    image_format: str


class ImageDecryptResponse(BaseModel):
    """Response model for image decryption"""
    sbox_type: str
    decryption_time_ms: float
    image_format: str


class ExportAnalysisRequest(BaseModel):
    """Request model for analysis export"""
    sbox: List[int]
    name: Optional[str] = "Custom S-box"
    format: str = "csv"


def validate_sbox_values(sbox: List[int]):
    """Ensure provided S-box has valid length and range."""
    if len(sbox) != 256:
        raise HTTPException(
            status_code=400,
            detail="S-box must contain exactly 256 values"
        )
    if not all(isinstance(val, int) and 0 <= val <= 255 for val in sbox):
        raise HTTPException(
            status_code=400,
            detail="All S-box values must be integers in range 0-255"
        )


def build_analysis_metrics(raw_results: Dict[str, Any]) -> AnalysisMetrics:
    """Convert raw analysis dictionary to typed metrics."""
    nonlinearity = raw_results.get("nonlinearity", {})
    sac = raw_results.get("sac", {})
    bic_nl = raw_results.get("bic_nl", {})
    bic_sac = raw_results.get("bic_sac", {})
    lap = raw_results.get("lap", {})
    dap = raw_results.get("dap", {})
    diff_uniformity = raw_results.get("differential_uniformity", {})
    algebraic_degree = raw_results.get("algebraic_degree", {})
    transparency_order = raw_results.get("transparency_order", {})
    correlation_immunity = raw_results.get("correlation_immunity", {})
    cycle_structure = raw_results.get("cycle_structure", {})

    return AnalysisMetrics(
        nonlinearity=NonlinearityMetricsModel(
            min=int(nonlinearity.get("min", 0)),
            max=int(nonlinearity.get("max", 0)),
            average=float(nonlinearity.get("average", 0.0))
        ),
        sac=SACMetricsModel(
            average=float(sac.get("average", 0.0)),
            min=float(sac.get("min", 0.0)),
            max=float(sac.get("max", 0.0)),
            std=float(sac.get("std", 0.0)),
            matrix=sac.get("matrix")
        ),
        bic_nl=BICNLMetricsModel(
            min=int(bic_nl.get("min", 0)),
            max=int(bic_nl.get("max", 0)),
            average=float(bic_nl.get("average", 0.0))
        ),
        bic_sac=BICSACMetricsModel(
            average_sac=float(bic_sac.get("average_sac", 0.0)),
            min_sac=float(bic_sac.get("min_sac", 0.0)),
            max_sac=float(bic_sac.get("max_sac", 0.0)),
            std_sac=float(bic_sac.get("std_sac", 0.0))
        ),
        lap=LAPMetricsModel(
            max_lap=float(lap.get("max_lap", 0.0)),
            max_bias=float(lap.get("max_bias", 0.0)),
            average_bias=float(lap.get("average_bias", 0.0))
        ),
        dap=DAPMetricsModel(
            max_dap=float(dap.get("max_dap", 0.0)),
            average_dap=float(dap.get("average_dap", 0.0))
        ),
        differential_uniformity=DifferentialUniformityMetricsModel(
            max_du=int(diff_uniformity.get("max_du", 0)),
            average_du=float(diff_uniformity.get("average_du", 0.0))
        ),
        algebraic_degree=AlgebraicDegreeMetricsModel(
            min=int(algebraic_degree.get("min", 0)),
            max=int(algebraic_degree.get("max", 0)),
            average=float(algebraic_degree.get("average", 0.0)),
            degrees=[int(val) for val in algebraic_degree.get("degrees", [])]
        ),
        transparency_order=TransparencyOrderMetricsModel(
            transparency_order=float(transparency_order.get("transparency_order", 0.0)),
            max_correlation=float(transparency_order.get("max_correlation", 0.0)),
            min_correlation=float(transparency_order.get("min_correlation", 0.0))
        ),
        correlation_immunity=CorrelationImmunityMetricsModel(
            min=int(correlation_immunity.get("min", 0)),
            max=int(correlation_immunity.get("max", 0)),
            average=float(correlation_immunity.get("average", 0.0)),
            orders=[int(val) for val in correlation_immunity.get("orders", [])]
        ),
        cycle_structure=CycleStructureMetricsModel(
            count=int(cycle_structure.get("count", 0)),
            max_length=int(cycle_structure.get("max_length", 0)),
            min_length=int(cycle_structure.get("min_length", 0)),
            fixed_points=int(cycle_structure.get("fixed_points", 0))
        )
    )


def build_export_filename(name: str, extension: str) -> str:
    """Create filesystem-safe filename for exported reports."""
    sanitized = "".join(
        ch if ch.isalnum() or ch in ("-", "_") else "_"
        for ch in (name or "").strip().lower()
    )
    sanitized = sanitized or "analysis_report"
    return f"{sanitized}.{extension}"


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
        validation_data = validate_sbox(sbox)
        if request.require_valid and not validation_data.get("is_valid"):
            raise HTTPException(
                status_code=400,
                detail="Generated S-box failed balance/bijective criteria"
            )
        validation = SBoxValidationModel(**validation_data)
        
        generation_time = (time.time() - start_time) * 1000  # Convert to ms
        
        return SBoxResponse(
            sbox=sbox,
            matrix_used=matrix_name,
            constant=constant,
            generation_time_ms=round(generation_time, 2),
            validation=validation
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
        validate_sbox_values(request.sbox)

        start_time = time.time()

        # Perform analysis
        raw_results = analyze_sbox(request.sbox)
        metrics = build_analysis_metrics(raw_results)

        analysis_time = (time.time() - start_time) * 1000

        return AnalysisResponse(
            sbox_name=request.name,
            analysis_time_ms=round(analysis_time, 2),
            **metrics.dict()
        )

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = f"{str(e)}\n{traceback.format_exc()}"
        raise HTTPException(status_code=500, detail=error_detail)


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
            validate_sbox_values(request.custom_sbox)
            custom_sbox = request.custom_sbox
        
        generation_time = (time.time() - start_time) * 1000
        
        # Analyze all S-boxes
        analysis_start = time.time()
        k44_analysis = build_analysis_metrics(analyze_sbox(k44_sbox))
        aes_analysis = build_analysis_metrics(analyze_sbox(aes_sbox))
        custom_analysis = build_analysis_metrics(analyze_sbox(custom_sbox)) if custom_sbox else None
        k44_validation = SBoxValidationModel(**validate_sbox(k44_sbox))
        aes_validation = SBoxValidationModel(**validate_sbox(aes_sbox))
        custom_validation = SBoxValidationModel(**validate_sbox(custom_sbox)) if custom_sbox else None
        analysis_time = (time.time() - analysis_start) * 1000
        
        return ComparisonResponse(
            k44_sbox=k44_sbox,
            aes_sbox=aes_sbox,
            custom_sbox=custom_sbox,
            k44_analysis=k44_analysis,
            aes_analysis=aes_analysis,
            custom_analysis=custom_analysis,
            k44_validation=k44_validation,
            aes_validation=aes_validation,
            custom_validation=custom_validation,
            generation_time_ms=round(generation_time, 2),
            analysis_time_ms=round(analysis_time, 2)
        )
    
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = f"{str(e)}\n{traceback.format_exc()}"
        raise HTTPException(status_code=500, detail=error_detail)


@app.post("/export-analysis")
def export_analysis(request: ExportAnalysisRequest):
    """
    Export analysis results into machine-readable formats (CSV initially).
    
    Future support for PDF reporting is planned per project roadmap.
    """
    try:
        validate_sbox_values(request.sbox)

        start_time = time.time()
        raw_results = analyze_sbox(request.sbox)
        analysis_time = (time.time() - start_time) * 1000
        metrics = build_analysis_metrics(raw_results)

        export_format = (request.format or "csv").strip().lower()

        if export_format == "csv":
            csv_content = generate_analysis_csv(
                request.name or "Custom S-box",
                metrics.dict(),
                round(analysis_time, 2)
            )
            filename = build_export_filename(request.name or "custom_sbox", "csv")
            return PlainTextResponse(
                csv_content,
                media_type="text/csv",
                headers={"Content-Disposition": f'attachment; filename="{filename}"'}
            )
        if export_format == "pdf":
            raise HTTPException(
                status_code=501,
                detail="PDF export is planned but not yet implemented."
            )

        raise HTTPException(
            status_code=400,
            detail="Unsupported export format. Use 'csv' or 'pdf'."
        )

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = f"{str(e)}\n{traceback.format_exc()}"
        raise HTTPException(status_code=500, detail=error_detail)


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
        import traceback
        error_detail = f"{str(e)}\n{traceback.format_exc()}"
        raise HTTPException(status_code=500, detail=error_detail)


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


@app.post("/encrypt-image")
async def encrypt_image(
    file: UploadFile = File(...),
    key: str = Form(...),
    sbox_type: str = Form("k44"),
    custom_sbox: Optional[str] = Form(None)
):
    """
    Encrypt image using AES-128 with K44, AES, or custom S-box
    
    Args:
        file: Image file to encrypt
        key: Encryption key (will be padded/truncated to 16 bytes)
        sbox_type: "k44" for K44 S-box, "aes" for standard AES S-box, "custom" for custom S-box
        custom_sbox: JSON string of custom S-box (256 values) - required if sbox_type is "custom"
    
    Returns:
        Encrypted image (PNG format) as binary data
    """
    try:
        if sbox_type.lower() not in ['k44', 'aes', 'custom']:
            raise HTTPException(
                status_code=400,
                detail="sbox_type must be 'k44', 'aes', or 'custom'"
            )
        
        custom_sbox_list = None
        if sbox_type.lower() == 'custom':
            if custom_sbox is None:
                raise HTTPException(
                    status_code=400,
                    detail="custom_sbox is required when sbox_type is 'custom'"
                )
            try:
                custom_sbox_list = json.loads(custom_sbox)
                if len(custom_sbox_list) != 256:
                    raise HTTPException(
                        status_code=400,
                        detail="Custom S-box must contain exactly 256 values"
                    )
            except json.JSONDecodeError:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid JSON format for custom_sbox"
                )
        
        start_time = time.time()
        
        # Read image file
        image_bytes = await file.read()
        
        # Open image to get format and metadata
        try:
            img = Image.open(io.BytesIO(image_bytes))
            original_format = img.format or 'PNG'
            # Convert to RGB if necessary (to ensure consistent format)
            if img.mode not in ('RGB', 'RGBA'):
                img = img.convert('RGB')
            
            # Calculate histogram for original image
            img_array = np.array(img)
            original_histogram = {
                'red': np.histogram(img_array[:, :, 0].flatten(), bins=256, range=(0, 256))[0].tolist(),
                'green': np.histogram(img_array[:, :, 1].flatten(), bins=256, range=(0, 256))[0].tolist(),
                'blue': np.histogram(img_array[:, :, 2].flatten(), bins=256, range=(0, 256))[0].tolist(),
            }
            
            # Save to bytes buffer to get raw image data
            img_buffer = io.BytesIO()
            img.save(img_buffer, format='PNG')
            image_data = img_buffer.getvalue()
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid image file: {str(e)}"
            )
        
        # Prepare key
        key_bytes = _prepare_key(key)
        
        # Create cipher with specified S-box
        cipher = create_cipher(
            sbox_type.lower(),
            custom_sbox_list if sbox_type.lower() == 'custom' else None
        )
        
        # Encrypt image data
        ciphertext_bytes = cipher.encrypt(image_data, key_bytes)
        
        # Store original length in first 4 bytes (as 32-bit integer, big-endian)
        data_len = len(ciphertext_bytes)
        length_header = data_len.to_bytes(4, byteorder='big')
        
        # Combine length header with ciphertext
        data_with_length = length_header + ciphertext_bytes
        total_data_len = len(data_with_length)
        
        # Create encrypted image from ciphertext bytes
        # Calculate dimensions to fit the data
        # Calculate side length to fit all bytes (3 bytes per pixel for RGB)
        pixels_needed = math.ceil(total_data_len / 3)
        side = int(math.ceil(math.sqrt(pixels_needed)))
        total_pixels = side * side
        total_bytes_needed = total_pixels * 3
        
        # Pad data to fit image dimensions
        padded_data = data_with_length + b'\x00' * (total_bytes_needed - total_data_len)
        
        # Create image from encrypted bytes (RGB mode)
        encrypted_img = Image.frombytes('RGB', (side, side), padded_data[:total_bytes_needed])
        
        # Calculate histogram for encrypted image
        encrypted_array = np.array(encrypted_img)
        encrypted_histogram = {
            'red': np.histogram(encrypted_array[:, :, 0].flatten(), bins=256, range=(0, 256))[0].tolist(),
            'green': np.histogram(encrypted_array[:, :, 1].flatten(), bins=256, range=(0, 256))[0].tolist(),
            'blue': np.histogram(encrypted_array[:, :, 2].flatten(), bins=256, range=(0, 256))[0].tolist(),
        }
        
        # Save to buffer as PNG
        output_buffer = io.BytesIO()
        encrypted_img.save(output_buffer, format='PNG')
        encrypted_image_bytes = output_buffer.getvalue()
        
        encryption_time = (time.time() - start_time) * 1000
        
        # Ensure minimum precision of 2 decimal places
        time_str = f"{encryption_time:.2f}"
        
        # Encode histograms as JSON for headers (base64 encoded to avoid header size limits)
        histogram_data = {
            'original': original_histogram,
            'encrypted': encrypted_histogram
        }
        histogram_json = json.dumps(histogram_data)
        histogram_b64 = base64.b64encode(histogram_json.encode('utf-8')).decode('utf-8')
        
        return Response(
            content=encrypted_image_bytes,
            media_type="image/png",
            headers={
                "X-Sbox-Type": sbox_type.lower(),
                "X-Encryption-Time": time_str,
                "X-Histogram-Data": histogram_b64,
                "Content-Disposition": f'attachment; filename="encrypted_image.png"'
            }
        )
    
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = f"{str(e)}\n{traceback.format_exc()}"
        raise HTTPException(status_code=500, detail=error_detail)


@app.post("/decrypt-image")
async def decrypt_image(
    file: UploadFile = File(...),
    key: str = Form(...),
    sbox_type: str = Form("k44"),
    custom_sbox: Optional[str] = Form(None)
):
    """
    Decrypt image using AES-128 with K44, AES, or custom S-box
    
    Args:
        file: Encrypted image file (cipher image)
        key: Decryption key (must match encryption key)
        sbox_type: "k44" for K44 S-box, "aes" for standard AES S-box, "custom" for custom S-box
        custom_sbox: JSON string of custom S-box (256 values) - required if sbox_type is "custom"
    
    Returns:
        Decrypted image (PNG format) as binary data
    """
    try:
        if sbox_type.lower() not in ['k44', 'aes', 'custom']:
            raise HTTPException(
                status_code=400,
                detail="sbox_type must be 'k44', 'aes', or 'custom'"
            )
        
        custom_sbox_list = None
        if sbox_type.lower() == 'custom':
            if custom_sbox is None:
                raise HTTPException(
                    status_code=400,
                    detail="custom_sbox is required when sbox_type is 'custom'"
                )
            try:
                custom_sbox_list = json.loads(custom_sbox)
                if len(custom_sbox_list) != 256:
                    raise HTTPException(
                        status_code=400,
                        detail="Custom S-box must contain exactly 256 values"
                    )
            except json.JSONDecodeError:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid JSON format for custom_sbox"
                )
        
        start_time = time.time()
        
        # Read encrypted image file
        encrypted_image_bytes = await file.read()
        
        # Open encrypted image and extract bytes
        try:
            encrypted_img = Image.open(io.BytesIO(encrypted_image_bytes))
            if encrypted_img.mode != 'RGB':
                encrypted_img = encrypted_img.convert('RGB')
            
            # Extract raw bytes from image
            all_bytes = encrypted_img.tobytes()
            
            # Extract length header (first 4 bytes)
            if len(all_bytes) < 4:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid encrypted image: data too short"
                )
            
            data_len = int.from_bytes(all_bytes[:4], byteorder='big')
            
            # Extract ciphertext (skip 4-byte header)
            if len(all_bytes) < 4 + data_len:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid encrypted image: corrupted data"
                )
            
            encrypted_data = all_bytes[4:4+data_len]
            
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid encrypted image file: {str(e)}"
            )
        
        # Prepare key
        key_bytes = _prepare_key(key)
        
        # Create cipher with specified S-box
        cipher = create_cipher(
            sbox_type.lower(),
            custom_sbox_list if sbox_type.lower() == 'custom' else None
        )
        
        # Decrypt image data
        try:
            decrypted_bytes = cipher.decrypt(encrypted_data, key_bytes)
        except ValueError as e:
            raise HTTPException(
                status_code=400,
                detail=f"Decryption failed: {str(e)}. Please check your key and ensure the image was encrypted with the same S-box."
            )
        
        # Try to reconstruct original image
        try:
            decrypted_img = Image.open(io.BytesIO(decrypted_bytes))
            # Save to buffer as PNG
            output_buffer = io.BytesIO()
            decrypted_img.save(output_buffer, format='PNG')
            decrypted_image_bytes = output_buffer.getvalue()
        except Exception:
            # If image reconstruction fails, return as-is (might be valid image data)
            decrypted_image_bytes = decrypted_bytes
        
        decryption_time = (time.time() - start_time) * 1000
        
        # Ensure minimum precision of 2 decimal places
        time_str = f"{decryption_time:.2f}"
        
        return Response(
            content=decrypted_image_bytes,
            media_type="image/png",
            headers={
                "X-Sbox-Type": sbox_type.lower(),
                "X-Decryption-Time": time_str,
                "Content-Disposition": f'attachment; filename="decrypted_image.png"'
            }
        )
    
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = f"{str(e)}\n{traceback.format_exc()}"
        raise HTTPException(status_code=500, detail=error_detail)


if __name__ == "__main__":
    import uvicorn
    
    print("=" * 60)
    print("Advanced S-Box 44 Analyzer API")
    print("=" * 60)
    print("\nStarting server on http://localhost:8000")
    print("API Documentation: http://localhost:8000/docs")
    print("=" * 60)
    
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

