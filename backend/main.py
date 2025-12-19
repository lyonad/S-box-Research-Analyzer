"""
FastAPI Backend for AES S-box Research Tool
Advanced S-Box 44 Analyzer with Request Caching
"""

from fastapi import FastAPI, HTTPException, File, UploadFile, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import PlainTextResponse, Response
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
import time
import base64
import io
import math
import json
import asyncio
import hashlib
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor
import numpy as np
from PIL import Image
from datetime import datetime, timedelta
import os
import gc
import ipaddress
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import internal modules
from sbox_generator import SBoxGenerator, K44_MATRIX, AES_MATRIX, C_AES, AVAILABLE_MATRICES
from cryptographic_tests import analyze_sbox
from aes_cipher import create_cipher
from report_exporter import generate_analysis_csv
from sbox_validations import validate_sbox
from rate_limiter import RateLimiter
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AES S-box Research Analyzer API",
    description="Comprehensive research platform for AES S-box analysis",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ==========================================
# CONCURRENT PROCESSING CONFIGURATION
# ==========================================

# Thread pool for I/O-bound operations (image reading/saving)
thread_pool = ThreadPoolExecutor(max_workers=int(os.getenv('MAX_NUM_THREADS', 16)))

# Semaphore to limit concurrent heavy image operations
# Prevents server overload when multiple users upload large images
MAX_CONCURRENT_IMAGE_OPS = int(os.getenv('MAX_CONCURRENT_IMAGE_OPS', 4))
image_processing_semaphore = asyncio.Semaphore(MAX_CONCURRENT_IMAGE_OPS)

logger.info(f"Thread pool initialized with {thread_pool._max_workers} workers")
logger.info(f"Max concurrent image operations: {MAX_CONCURRENT_IMAGE_OPS}")

# ==========================================
# REQUEST CACHING & DEDUPLICATION
# ==========================================

# In-memory cache for S-box analysis results
# Key: hash of (matrix, constant, sbox_type)
# Value: (result, timestamp)
analysis_cache: Dict[str, tuple[Dict[str, Any], datetime]] = {}
CACHE_TTL_MINUTES = int(os.getenv('CACHE_TTL_MINUTES', 30))  # Cache expires after 30 minutes

# Pending requests tracker (for deduplication)
# When multiple concurrent requests have same parameters, they share the same result
pending_requests: Dict[str, asyncio.Event] = {}
pending_results: Dict[str, Dict[str, Any]] = {}

def generate_cache_key(data: Dict[str, Any]) -> str:
    """Generate a unique cache key from request parameters"""
    # Sort keys for consistent hashing
    sorted_data = json.dumps(data, sort_keys=True)
    return hashlib.sha256(sorted_data.encode()).hexdigest()

def get_from_cache(cache_key: str) -> Optional[Dict[str, Any]]:
    """Get result from cache if exists and not expired"""
    if cache_key in analysis_cache:
        result, timestamp = analysis_cache[cache_key]
        age = datetime.now() - timestamp
        if age < timedelta(minutes=CACHE_TTL_MINUTES):
            logger.info(f"✅ Cache HIT (age: {age.seconds}s)")
            return result
        else:
            # Expired, remove from cache
            del analysis_cache[cache_key]
            logger.info(f"⏰ Cache EXPIRED (age: {age.seconds}s)")
    return None

def save_to_cache(cache_key: str, result: Dict[str, Any]):
    """Save result to cache with timestamp"""
    analysis_cache[cache_key] = (result, datetime.now())
    # Cleanup old entries (keep only last 100)
    if len(analysis_cache) > 100:
        # Remove oldest entry
        oldest_key = min(analysis_cache.keys(), key=lambda k: analysis_cache[k][1])
        del analysis_cache[oldest_key]
        logger.info(f"🧹 Cache cleanup: removed oldest entry")

logger.info(f"Request caching enabled (TTL: {CACHE_TTL_MINUTES} minutes)")
logger.info(f"Request deduplication enabled")

# ==========================================
# SECURITY CONFIGURATION
# ==========================================

# Get allowed origins from environment variable
ALLOWED_ORIGINS_ENV = os.getenv('ALLOWED_ORIGINS', '')
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:5173",  # Vite Local Dev
    "http://localhost:80",    # Production Local
    "http://127.0.0.1",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

# Add custom origins from environment variable
if ALLOWED_ORIGINS_ENV:
    custom_origins = [origin.strip() for origin in ALLOWED_ORIGINS_ENV.split(',') if origin.strip()]
    origins.extend(custom_origins)
    logger.info(f"Added custom origins: {custom_origins}")

# Default production domains (keep for backward compatibility)
default_prod_origins = [
    "https://try-sboxanalyzer.greepzid.com",
    "https://analyzer.greepzid.com",
    "https://api-kripto.greepzid.com",
    "https://aml-s9xx-box.tail31204e.ts.net",
    "https://greepzid.tail31204e.ts.net"
]
origins.extend(default_prod_origins)

logger.info(f"CORS enabled for origins: {origins}")

# Request logging middleware (FIRST - logs all incoming requests)
# Set REQUEST_LOGGING=false in .env to disable (for production performance)
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log every incoming request for debugging connectivity issues"""
    request_logging = os.getenv('REQUEST_LOGGING', 'true').lower() in ('1', 'true', 'yes')
    
    if request_logging:
        client_host = request.client.host if request.client else "unknown"
        logger.info(f"🔵 INCOMING REQUEST: {request.method} {request.url.path} from {client_host}")
        logger.info(f"   Headers: {dict(request.headers)}")
    
    try:
        response = await call_next(request)
        if request_logging:
            logger.info(f"✅ RESPONSE: {response.status_code} for {request.method} {request.url.path}")
        return response
    except Exception as e:
        import traceback
        logger.error(f"❌ ERROR processing {request.method} {request.url.path}: {e}")
        logger.error(f"   Traceback: {traceback.format_exc()}")
        # Return 500 error instead of crashing
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=500,
            content={"detail": f"Internal server error: {str(e)}"}
        )

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],  # Be specific about allowed methods
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
    expose_headers=["X-Sbox-Type", "X-Encryption-Time", "X-Decryption-Time", "X-Histogram-Data", "Content-Disposition"],
    max_age=3600,  # Cache preflight requests for 1 hour
)

# Add security headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    
    # Security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    
    return response

# Initialize generator
generator = SBoxGenerator()

# Configuration from environment or defaults
MAX_UPLOAD_SIZE = int(os.getenv('MAX_UPLOAD_SIZE', 8 * 1024 * 1024))  # 8 MB default
RATE_LIMIT_PER_MINUTE = int(os.getenv('RATE_LIMIT_PER_MINUTE', 60))

logger.info(f"Max upload size: {MAX_UPLOAD_SIZE} bytes")
logger.info(f"Rate limit: {RATE_LIMIT_PER_MINUTE} requests per minute")

# Initialize rate limiter
rate_limiter = RateLimiter(requests_per_minute=RATE_LIMIT_PER_MINUTE)

# Rate limiting middleware
@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    """Apply rate limiting to all requests.

    This middleware supports proxied/tunneled requests (Cloudflare, Tailscale Funnel)
    by extracting the real client IP from headers such as `CF-Connecting-IP` or
    `X-Forwarded-For` when the immediate peer is a trusted proxy.
    """

    # Skip rate limiting for OPTIONS (CORS preflight), docs and static files
    if request.method == "OPTIONS" or request.url.path in ["/docs", "/redoc", "/openapi.json"]:
        return await call_next(request)

    # Helper: parse first IP from X-Forwarded-For
    def parse_x_forwarded_for(value: str) -> Optional[str]:
        if not value:
            return None
        parts = [p.strip() for p in value.split(',') if p.strip()]
        return parts[0] if parts else None

    # Load trusted proxy CIDRs from env (comma separated)
    trusted_cidrs = os.getenv('RATE_LIMIT_TRUSTED_PROXIES', '100.64.0.0/10,127.0.0.1/8,::1/128')
    trusted_networks = []
    for cidr in [c.strip() for c in trusted_cidrs.split(',') if c.strip()]:
        try:
            trusted_networks.append(ipaddress.ip_network(cidr))
        except Exception:
            logger.warning(f"Invalid trusted proxy CIDR in RATE_LIMIT_TRUSTED_PROXIES: {cidr}")

    # Determine immediate peer IP seen by server
    peer_ip = None
    try:
        peer_ip = request.client.host if request.client else None
    except Exception:
        peer_ip = None

    real_ip = None

    # Priority: Cloudflare header, X-Real-IP, then X-Forwarded-For (first entry)
    cf_ip = request.headers.get('cf-connecting-ip') or request.headers.get('CF-Connecting-IP')
    x_real = request.headers.get('x-real-ip')
    xff = request.headers.get('x-forwarded-for') or request.headers.get('X-Forwarded-For')

    if cf_ip:
        real_ip = cf_ip.strip()
    elif x_real:
        real_ip = x_real.strip()
    elif xff:
        parsed = parse_x_forwarded_for(xff)
        if parsed:
            real_ip = parsed

    # If the immediate peer is a trusted proxy, prefer the real_ip extracted from headers
    def is_trusted(peer: Optional[str]) -> bool:
        if not peer:
            return False
        try:
            addr = ipaddress.ip_address(peer)
            for net in trusted_networks:
                if addr in net:
                    return True
        except Exception:
            return False
        return False

    if is_trusted(peer_ip) and real_ip:
        client_identifier = real_ip
    else:
        # Fall back to peer IP or unknown
        client_identifier = real_ip or peer_ip or 'unknown'

    # Optional debug logging for tunneling issues (enable via RATE_LIMIT_DEBUG=true)
    try:
        if os.getenv('RATE_LIMIT_DEBUG', 'false').lower() in ('1', 'true', 'yes'):
            debug_fields = {
                'peer_ip': peer_ip,
                'client_identifier': client_identifier,
                'cf_connecting_ip': cf_ip,
                'x_real_ip': x_real,
                'x_forwarded_for': xff,
                'host': request.headers.get('host'),
                'forwarded': request.headers.get('forwarded')
            }
            # Only log for health endpoint to reduce noise
            if request.url.path in ['/health', '/']:
                logger.info(f"RATE_LIMIT_DEBUG: {json.dumps(debug_fields)}")
    except Exception:
        logger.exception("Failed to log RATE_LIMIT_DEBUG info")
    # Check rate limit
    is_allowed, remaining = rate_limiter.is_allowed(client_identifier)

    if not is_allowed:
        logger.warning(f"Rate limit exceeded for client: {client_identifier} (peer={peer_ip})")
        raise HTTPException(
            status_code=429,
            detail="Too many requests. Please wait a moment before trying again.",
            headers={"Retry-After": "60"}
        )

    # Process request
    response = await call_next(request)

    # Add rate limit and client info headers
    response.headers["X-RateLimit-Limit"] = str(RATE_LIMIT_PER_MINUTE)
    response.headers["X-RateLimit-Remaining"] = str(remaining)
    if client_identifier:
        response.headers["X-Real-Client-IP"] = client_identifier

    return response


# ==========================================
# MODELS (Tidak Berubah)
# ==========================================

class SBoxGenerateRequest(BaseModel):
    use_k44: bool = True
    custom_matrix: Optional[List[int]] = None
    constant: Optional[int] = None
    require_valid: bool = False

class SBoxAnalyzeRequest(BaseModel):
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
    sbox: List[int]
    matrix_used: str
    constant: int
    generation_time_ms: float
    validation: SBoxValidationModel

# Metrics Models
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
    sbox_name: str
    analysis_time_ms: float

class ComparisonRequest(BaseModel):
    custom_sbox: Optional[List[int]] = None

class ComparisonResponse(BaseModel):
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
    plaintext: str
    key: str
    sbox_type: str = "k44"
    custom_sbox: Optional[List[int]] = None

class DecryptRequest(BaseModel):
    ciphertext: str
    key: str
    sbox_type: str = "k44"
    custom_sbox: Optional[List[int]] = None

class EncryptResponse(BaseModel):
    ciphertext: str
    sbox_type: str
    encryption_time_ms: float

class DecryptResponse(BaseModel):
    plaintext: str
    sbox_type: str
    decryption_time_ms: float

class ImageEncryptResponse(BaseModel):
    sbox_type: str
    encryption_time_ms: float
    image_format: str

class ImageDecryptResponse(BaseModel):
    sbox_type: str
    decryption_time_ms: float
    image_format: str

class ExportAnalysisRequest(BaseModel):
    sbox: List[int]
    name: Optional[str] = "Custom S-box"
    format: str = "csv"


# ==========================================
# HELPER FUNCTIONS
# ==========================================

def validate_sbox_values(sbox: List[int]):
    if len(sbox) != 256:
        raise HTTPException(status_code=400, detail="S-box must contain exactly 256 values")
    if not all(isinstance(val, int) and 0 <= val <= 255 for val in sbox):
        raise HTTPException(status_code=400, detail="All S-box values must be integers in range 0-255")

def build_analysis_metrics(raw_results: Dict[str, Any]) -> AnalysisMetrics:
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
    sanitized = "".join(ch if ch.isalnum() or ch in ("-", "_") else "_" for ch in (name or "").strip().lower())
    sanitized = sanitized or "analysis_report"
    return f"{sanitized}.{extension}"

def _prepare_key(key_str: str) -> bytes:
    key_bytes = key_str.encode('utf-8')
    if len(key_bytes) < 16:
        key_bytes = key_bytes + b'\x00' * (16 - len(key_bytes))
    elif len(key_bytes) > 16:
        key_bytes = key_bytes[:16]
    return key_bytes


async def _read_upload_file_limited(upload_file, max_bytes: int = MAX_UPLOAD_SIZE) -> bytes:
    """
    Read an UploadFile in chunks and abort if size exceeds `max_bytes`.
    Raises HTTPException 413 if file is too large.
    """
    total = 0
    chunks = []
    # read in 1MiB chunks
    chunk_size = 1024 * 1024
    while True:
        chunk = await upload_file.read(chunk_size)
        if not chunk:
            break
        total += len(chunk)
        if total > max_bytes:
            raise HTTPException(status_code=413, detail=f"File too large (limit {max_bytes} bytes)")
        chunks.append(chunk)
    return b"".join(chunks)


# ==========================================
# API ENDPOINTS
# ==========================================

@app.get("/")
def root():
    return {
        "message": "Advanced S-Box 44 Analyzer API",
        "version": "2.0.0",
        "endpoints": {
            "generate": "/generate-sbox",
            "analyze": "/analyze",
            "compare": "/compare",
            "encrypt": "/encrypt",
            "decrypt": "/decrypt",
            "matrix-info": "/matrix-info",
            "health": "/health"
        }
    }

@app.get("/health")
def health_check():
    """Health check endpoint with cache statistics"""
    cache_stats = {
        "cached_analyses": len(analysis_cache),
        "pending_requests": len(pending_requests),
        "cache_ttl_minutes": CACHE_TTL_MINUTES
    }
    return {
        "status": "healthy", 
        "service": "S-Box Analyzer API",
        "cache": cache_stats
    }

@app.get("/cache/clear")
def clear_cache():
    """Clear all cached analysis results"""
    global analysis_cache, pending_results
    count = len(analysis_cache)
    analysis_cache.clear()
    pending_results.clear()
    logger.info(f"🧹 Cache cleared: removed {count} entries")
    return {"message": f"Cache cleared ({count} entries removed)", "cache_size": 0}

@app.post("/generate-sbox", response_model=SBoxResponse)
def generate_sbox(request: SBoxGenerateRequest = None):
    """
    Generate S-box with specified parameters
    
    Args:
        request: Generation parameters (matrix, constant, validation)
        
    Returns:
        Generated S-box with validation results
        
    Raises:
        HTTPException 400: Invalid parameters
        HTTPException 500: Generation error
    """
    try:
        start_time = time.time()
        if request is None:
            request = SBoxGenerateRequest()
        
        # Validate custom matrix
        if request.custom_matrix:
            if len(request.custom_matrix) != 8:
                raise HTTPException(
                    status_code=400, 
                    detail="Custom matrix must have exactly 8 rows"
                )
            
            # Validate matrix values
            for i, row in enumerate(request.custom_matrix):
                if not isinstance(row, int) or not (0 <= row <= 255):
                    raise HTTPException(
                        status_code=400,
                        detail=f"Matrix row {i} must be an integer between 0 and 255"
                    )
            
            matrix = request.custom_matrix
            matrix_name = "Custom Matrix"
            
            # Check if it matches known matrices
            if matrix == K44_MATRIX:
                matrix_name = "K44 Matrix"
            elif matrix == AES_MATRIX:
                matrix_name = "AES Matrix"
            else:
                for key, (name, known_matrix) in AVAILABLE_MATRICES.items():
                    if list(matrix) == list(known_matrix):
                        matrix_name = name
                        break
        elif request.use_k44:
            matrix = K44_MATRIX
            matrix_name = "K44 Matrix"
        else:
            matrix = AES_MATRIX
            matrix_name = "AES Matrix"
        
        # Validate constant
        constant = request.constant if request.constant is not None else C_AES
        if not isinstance(constant, int) or not (0 <= constant <= 255):
            raise HTTPException(
                status_code=400,
                detail="Constant must be an integer between 0 and 255"
            )
        
        # Generate S-box
        sbox = generator.generate_sbox(matrix, constant)
        validation_data = validate_sbox(sbox)
        
        # Check if validation required
        if request.require_valid and not validation_data.get("is_valid"):
            raise HTTPException(
                status_code=400, 
                detail="Generated S-box failed balance/bijective criteria"
            )
        
        validation = SBoxValidationModel(**validation_data)
        generation_time = (time.time() - start_time) * 1000
        
        logger.info(f"Generated S-box with {matrix_name}, constant={constant}, time={generation_time:.2f}ms")
        
        return SBoxResponse(
            sbox=sbox,
            matrix_used=matrix_name,
            constant=constant,
            generation_time_ms=round(generation_time, 2),
            validation=validation
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating S-box: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to generate S-box: {str(e)}"
        )

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze(request: SBoxAnalyzeRequest):
    """
    Analyze cryptographic properties of S-box with caching & deduplication
    
    Args:
        request: S-box data and name
        
    Returns:
        Comprehensive analysis results (cached if available)
        
    Raises:
        HTTPException 400: Invalid S-box format
        HTTPException 500: Analysis error
    """
    try:
        validate_sbox_values(request.sbox)
        
        # Generate cache key from S-box values
        cache_key = generate_cache_key({"sbox": request.sbox, "name": request.name})
        
        # Check cache first
        cached_result = get_from_cache(cache_key)
        if cached_result:
            logger.info(f"✅ Returning cached result for {request.name}")
            return AnalysisResponse(**cached_result)
        
        # Check if another request is already processing the same S-box
        if cache_key in pending_requests:
            logger.info(f"⏳ Request DEDUPLICATED for {request.name} - waiting for in-progress analysis...")
            # Wait for the other request to finish
            event = pending_requests[cache_key]
            await event.wait()
            # Return the shared result
            result = pending_results.get(cache_key)
            if result:
                logger.info(f"✅ Returning deduplicated result for {request.name}")
                return AnalysisResponse(**result)
        
        # Create event for request deduplication
        event = asyncio.Event()
        pending_requests[cache_key] = event
        
        try:
            start_time = time.time()
            logger.info(f"🔬 Analyzing S-box: {request.name}")
            
            # Run analysis in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            raw_results = await loop.run_in_executor(thread_pool, analyze_sbox, request.sbox)
            metrics = build_analysis_metrics(raw_results)
            analysis_time = (time.time() - start_time) * 1000
            
            logger.info(f"✅ Analysis completed for {request.name} in {analysis_time:.2f}ms")
            
            result_dict = {
                "sbox_name": request.name,
                "analysis_time_ms": round(analysis_time, 2),
                **metrics.dict()
            }
            
            # Save to cache
            save_to_cache(cache_key, result_dict)
            
            # Save for deduplication
            pending_results[cache_key] = result_dict
            
            # Notify waiting requests
            event.set()
            
            return AnalysisResponse(**result_dict)
        finally:
            # Cleanup
            if cache_key in pending_requests:
                del pending_requests[cache_key]
            # Keep result for a short time for deduplication
            asyncio.create_task(cleanup_pending_result(cache_key))
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing S-box: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to analyze S-box: {str(e)}"
        )

async def cleanup_pending_result(cache_key: str):
    """Remove pending result after 5 seconds"""
    await asyncio.sleep(5)
    if cache_key in pending_results:
        del pending_results[cache_key]

@app.post("/compare", response_model=ComparisonResponse)
async def compare(request: ComparisonRequest = None):
    """
    Compare K44, AES, and optionally custom S-box with caching & deduplication
    """
    try:
        if request is None:
            request = ComparisonRequest()
        
        # Generate cache key
        cache_data = {
            "custom_sbox": request.custom_sbox if request.custom_sbox else None
        }
        cache_key = generate_cache_key(cache_data)
        
        # Check cache first
        cached_result = get_from_cache(cache_key)
        if cached_result:
            logger.info(f"✅ Returning cached comparison result")
            return ComparisonResponse(**cached_result)
        
        # Check if another request is already processing
        if cache_key in pending_requests:
            logger.info(f"⏳ Comparison DEDUPLICATED - waiting for in-progress analysis...")
            event = pending_requests[cache_key]
            await event.wait()
            result = pending_results.get(cache_key)
            if result:
                logger.info(f"✅ Returning deduplicated comparison result")
                return ComparisonResponse(**result)
        
        # Create event for deduplication
        event = asyncio.Event()
        pending_requests[cache_key] = event
        
        try:
            start_time = time.time()
            k44_sbox = generator.generate_k44_sbox()
            aes_sbox = generator.generate_aes_sbox()
            custom_sbox = None
            if request.custom_sbox:
                validate_sbox_values(request.custom_sbox)
                custom_sbox = request.custom_sbox
            generation_time = (time.time() - start_time) * 1000
            
            analysis_start = time.time()
            
            # Run analyses in thread pool
            loop = asyncio.get_event_loop()
            k44_raw, aes_raw = await asyncio.gather(
                loop.run_in_executor(thread_pool, analyze_sbox, k44_sbox),
                loop.run_in_executor(thread_pool, analyze_sbox, aes_sbox)
            )
            
            k44_analysis = build_analysis_metrics(k44_raw)
            aes_analysis = build_analysis_metrics(aes_raw)
            
            # Custom S-box analysis if provided
            custom_analysis = None
            custom_validation = None
            if custom_sbox:
                custom_raw = await loop.run_in_executor(thread_pool, analyze_sbox, custom_sbox)
                custom_analysis = build_analysis_metrics(custom_raw)
                custom_validation = SBoxValidationModel(**validate_sbox(custom_sbox))
            
            k44_validation = SBoxValidationModel(**validate_sbox(k44_sbox))
            aes_validation = SBoxValidationModel(**validate_sbox(aes_sbox))
            
            analysis_time = (time.time() - analysis_start) * 1000
            
            result_dict = {
                "k44_sbox": k44_sbox,
                "aes_sbox": aes_sbox,
                "custom_sbox": custom_sbox,
                "k44_analysis": k44_analysis.dict(),
                "aes_analysis": aes_analysis.dict(),
                "custom_analysis": custom_analysis.dict() if custom_analysis else None,
                "k44_validation": k44_validation.dict(),
                "aes_validation": aes_validation.dict(),
                "custom_validation": custom_validation.dict() if custom_validation else None,
                "generation_time_ms": round(generation_time, 2),
                "analysis_time_ms": round(analysis_time, 2)
            }
            
            # Save to cache
            save_to_cache(cache_key, result_dict)
            pending_results[cache_key] = result_dict
            event.set()
            
            logger.info(f"✅ Comparison completed in {analysis_time:.2f}ms")
            return ComparisonResponse(**result_dict)
        finally:
            if cache_key in pending_requests:
                del pending_requests[cache_key]
            asyncio.create_task(cleanup_pending_result(cache_key))
            
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        raise HTTPException(status_code=500, detail=f"{str(e)}\n{traceback.format_exc()}")

@app.post("/export-analysis")
def export_analysis(request: ExportAnalysisRequest):
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
        raise HTTPException(status_code=400, detail="Unsupported export format")
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        raise HTTPException(status_code=500, detail=f"{str(e)}\n{traceback.format_exc()}")

@app.get("/matrix-info")
def get_matrix_info():
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

@app.post("/encrypt", response_model=EncryptResponse)
def encrypt(request: EncryptRequest):
    try:
        if request.sbox_type.lower() not in ['k44', 'aes', 'custom']:
            raise HTTPException(status_code=400, detail="sbox_type must be 'k44', 'aes', or 'custom'")
        if request.sbox_type.lower() == 'custom':
            if request.custom_sbox is None or len(request.custom_sbox) != 256:
                raise HTTPException(status_code=400, detail="Valid custom_sbox required")
        
        start_time = time.time()
        key = _prepare_key(request.key)
        plaintext_bytes = request.plaintext.encode('utf-8')
        cipher = create_cipher(
            request.sbox_type.lower(),
            request.custom_sbox if request.sbox_type.lower() == 'custom' else None
        )
        ciphertext_bytes = cipher.encrypt(plaintext_bytes, key)
        ciphertext_b64 = base64.b64encode(ciphertext_bytes).decode('utf-8')
        encryption_time = (time.time() - start_time) * 1000
        
        return EncryptResponse(
            ciphertext=ciphertext_b64,
            sbox_type=request.sbox_type.lower(),
            encryption_time_ms=round(encryption_time, 2)
        )
    except Exception as e:
        import traceback
        raise HTTPException(status_code=500, detail=f"{str(e)}\n{traceback.format_exc()}")

@app.post("/decrypt", response_model=DecryptResponse)
def decrypt(request: DecryptRequest):
    try:
        if request.sbox_type.lower() not in ['k44', 'aes', 'custom']:
            raise HTTPException(status_code=400, detail="sbox_type must be 'k44', 'aes', or 'custom'")
        if request.sbox_type.lower() == 'custom':
            if request.custom_sbox is None or len(request.custom_sbox) != 256:
                raise HTTPException(status_code=400, detail="Valid custom_sbox required")
        
        start_time = time.time()
        key = _prepare_key(request.key)
        try:
            ciphertext_bytes = base64.b64decode(request.ciphertext)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid base64 ciphertext")
            
        cipher = create_cipher(
            request.sbox_type.lower(),
            request.custom_sbox if request.sbox_type.lower() == 'custom' else None
        )
        plaintext_bytes = cipher.decrypt(ciphertext_bytes, key)
        plaintext = plaintext_bytes.decode('utf-8')
        decryption_time = (time.time() - start_time) * 1000
        
        return DecryptResponse(
            plaintext=plaintext,
            sbox_type=request.sbox_type.lower(),
            decryption_time_ms=round(decryption_time, 2)
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        import traceback
        raise HTTPException(status_code=500, detail=f"{str(e)}\n{traceback.format_exc()}")

# ==========================================
# ASYNC HELPER FUNCTIONS FOR CPU-INTENSIVE OPS
# ==========================================

def _process_image_histogram(img_array: np.ndarray) -> Dict[str, list]:
    """CPU-intensive: Calculate histogram in thread pool"""
    return {
        'red': np.histogram(img_array[:, :, 0].flatten(), bins=256, range=(0, 256))[0].tolist(),
        'green': np.histogram(img_array[:, :, 1].flatten(), bins=256, range=(0, 256))[0].tolist(),
        'blue': np.histogram(img_array[:, :, 2].flatten(), bins=256, range=(0, 256))[0].tolist(),
    }

def _encrypt_image_data(image_data: bytes, key_bytes: bytes, sbox_type: str, custom_sbox_list: Optional[list]) -> bytes:
    """CPU-intensive: Encrypt image data in thread pool"""
    cipher = create_cipher(sbox_type.lower(), custom_sbox_list)
    return cipher.encrypt(image_data, key_bytes)

@app.post("/encrypt-image")
async def encrypt_image(
    file: UploadFile = File(...),
    key: str = Form(...),
    sbox_type: str = Form("k44"),
    custom_sbox: Optional[str] = Form(None)
):
    # Use semaphore to limit concurrent heavy operations
    async with image_processing_semaphore:
        try:
            logger.info(f"🎨 Starting image encryption - sbox_type: {sbox_type} (Queue: {MAX_CONCURRENT_IMAGE_OPS - image_processing_semaphore._value}/{MAX_CONCURRENT_IMAGE_OPS})")
            
            custom_sbox_list = None
            if sbox_type.lower() == 'custom':
                if custom_sbox:
                    custom_sbox_list = json.loads(custom_sbox)
            
            start_time = time.time()
            # read upload with limit to avoid OOM/timeouts
            logger.info(f"📥 Reading uploaded file: {file.filename}")
            image_bytes = await _read_upload_file_limited(file)
            logger.info(f"✅ File read complete: {len(image_bytes) / 1024 / 1024:.2f}MB")
            
            logger.info("🖼️  Opening image...")
            img = Image.open(io.BytesIO(image_bytes))
            original_size = img.size
            logger.info(f"📐 Original image size: {original_size[0]}x{original_size[1]}")
            
            if img.mode not in ('RGB', 'RGBA'):
                img = img.convert('RGB')
                logger.info(f"🔄 Converted image mode to RGB")
            
            # Support up to 8K resolution (8192x4320)
            max_dimension = 8192  # Max 8K resolution - user request!
            if max(img.size) > max_dimension:
                logger.warning(f"⚠️  Image exceeds 8K resolution ({img.size}), resizing to max {max_dimension}px...")
                img.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)
                logger.info(f"✅ Resized to {img.size}")
            else:
                logger.info(f"✅ Image size OK: {img.size[0]}x{img.size[1]} (within 8K limit)")
            
            # Calculate histogram with memory-efficient method
            logger.info("📊 Converting to NumPy array...")
            img_array = np.array(img)
            array_size_mb = img_array.nbytes / 1024 / 1024
            logger.info(f"📊 Array shape: {img_array.shape}, size: {array_size_mb:.2f}MB")
            
            # Safety check: reject if array is too large (8K RGB ~ 100MB)
            if array_size_mb > 200:
                logger.error(f"❌ Image array too large: {array_size_mb:.2f}MB > 200MB limit")
                raise HTTPException(status_code=413, detail=f"Image too large to process ({array_size_mb:.1f}MB). Maximum supported: 8K resolution (8192x4320).")
            elif array_size_mb > 100:
                logger.warning(f"⚠️ Processing large image: {array_size_mb:.2f}MB - this may take a while...")
            
            try:
                logger.info("📈 Calculating original histogram (async in thread pool)...")
                # Run CPU-intensive histogram calculation in thread pool to avoid blocking
                original_histogram = await asyncio.get_event_loop().run_in_executor(
                    thread_pool, 
                    _process_image_histogram, 
                    img_array
                )
                logger.info("✅ Original histogram calculated")
            except MemoryError:
                logger.error("❌ Memory error during histogram calculation")
                raise HTTPException(status_code=413, detail="Image too large to process. Please use a smaller image.")
            except Exception as e:
                logger.error(f"❌ Histogram error: {e}")
                raise
            
            # Clean up array to free memory
            logger.info("🧹 Cleaning up NumPy array...")
            del img_array
            if array_size_mb > 50:
                gc.collect()  # Force garbage collection for large images
                logger.info("🧹 Forced garbage collection")
            
            logger.info("💾 Converting image to PNG bytes...")
            img_buffer = io.BytesIO()
            img.save(img_buffer, format='PNG')
            image_data = img_buffer.getvalue()
            img_buffer.close()
            logger.info(f"✅ Image data ready: {len(image_data) / 1024 / 1024:.2f}MB")

            logger.info("🔐 Preparing encryption...")
            key_bytes = _prepare_key(key)
            logger.info(f"🔒 Encrypting {len(image_data) / 1024:.2f}KB of image data (async in thread pool)...")
            
            # Run CPU-intensive encryption in thread pool to avoid blocking
            ciphertext_bytes = await asyncio.get_event_loop().run_in_executor(
                thread_pool,
                _encrypt_image_data,
                image_data, key_bytes, sbox_type, custom_sbox_list
            )
            logger.info(f"✅ Encryption complete: {len(ciphertext_bytes) / 1024:.2f}KB")
            
            # Header length + data
            logger.info("📦 Preparing encrypted image data...")
            data_len = len(ciphertext_bytes)
            length_header = data_len.to_bytes(4, byteorder='big')
            data_with_length = length_header + ciphertext_bytes
            total_data_len = len(data_with_length)
            
            # Calculate image size
            pixels_needed = math.ceil(total_data_len / 3)
            side = int(math.ceil(math.sqrt(pixels_needed)))
            total_pixels = side * side
            total_bytes_needed = total_pixels * 3
            logger.info(f"📐 Creating encrypted image: {side}x{side} pixels")
            
            padded_data = data_with_length + b'\\x00' * (total_bytes_needed - total_data_len)
            encrypted_img = Image.frombytes('RGB', (side, side), padded_data[:total_bytes_needed])
            logger.info("✅ Encrypted image created")
            
            # Encrypted histogram - with memory protection
            logger.info("📈 Calculating encrypted histogram (async in thread pool)...")
            try:
                encrypted_array = np.array(encrypted_img)
                enc_size_mb = encrypted_array.nbytes / 1024 / 1024
                logger.info(f"📊 Encrypted array shape: {encrypted_array.shape}, size: {enc_size_mb:.2f}MB")
                
                # Run histogram calculation in thread pool
                encrypted_histogram = await asyncio.get_event_loop().run_in_executor(
                    thread_pool,
                    _process_image_histogram,
                    encrypted_array
                )
                logger.info("✅ Encrypted histogram calculated")
                # Clean up encrypted array
                del encrypted_array
            except MemoryError:
                logger.error("❌ Memory error during encrypted histogram calculation")
                # Continue without histogram data
                encrypted_histogram = {'red': [], 'green': [], 'blue': []}
            except Exception as e:
                logger.error(f"❌ Error calculating encrypted histogram: {e}")
                encrypted_histogram = {'red': [], 'green': [], 'blue': []}
            
            logger.info("💾 Saving encrypted image to buffer...")
            output_buffer = io.BytesIO()
            encrypted_img.save(output_buffer, format='PNG')
            encrypted_image_bytes = output_buffer.getvalue()
            output_buffer.close()
            logger.info(f"✅ Encrypted image ready: {len(encrypted_image_bytes) / 1024:.2f}KB")
            
            encryption_time = (time.time() - start_time) * 1000
            logger.info(f"⏱️  Total encryption time: {encryption_time:.2f}ms")
            
            histogram_data = {'original': original_histogram, 'encrypted': encrypted_histogram}
            histogram_b64 = base64.b64encode(json.dumps(histogram_data).encode('utf-8')).decode('utf-8')
            
            logger.info("🎉 Image encryption successful! Sending response...")
            return Response(
                content=encrypted_image_bytes,
                media_type="image/png",
                headers={
                    "X-Sbox-Type": sbox_type.lower(),
                    "X-Encryption-Time": f"{encryption_time:.2f}",
                    "X-Histogram-Data": histogram_b64,
                    "Content-Disposition": 'attachment; filename="encrypted_image.png"'
                }
            )
        except HTTPException:
            raise
        except Exception as e:
            import traceback
        logger.error(f"❌ FATAL ERROR in encrypt_image: {e}")
        logger.error(f"   Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"{str(e)}\n{traceback.format_exc()}")

@app.post("/decrypt-image")
async def decrypt_image(
    file: UploadFile = File(...),
    key: str = Form(...),
    sbox_type: str = Form("k44"),
    custom_sbox: Optional[str] = Form(None)
):
    try:
        custom_sbox_list = None
        if sbox_type.lower() == 'custom' and custom_sbox:
            custom_sbox_list = json.loads(custom_sbox)
            
        start_time = time.time()
        # read upload with limit to avoid OOM/timeouts
        encrypted_image_bytes = await _read_upload_file_limited(file)
        
        try:
            encrypted_img = Image.open(io.BytesIO(encrypted_image_bytes))
            if encrypted_img.mode != 'RGB':
                encrypted_img = encrypted_img.convert('RGB')
            all_bytes = encrypted_img.tobytes()
            
            if len(all_bytes) < 4:
                raise HTTPException(status_code=400, detail="Data too short")
                
            data_len = int.from_bytes(all_bytes[:4], byteorder='big')
            if len(all_bytes) < 4 + data_len:
                raise HTTPException(status_code=400, detail="Corrupted data")
                
            encrypted_data = all_bytes[4:4+data_len]
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid image: {str(e)}")
            
        key_bytes = _prepare_key(key)
        cipher = create_cipher(sbox_type.lower(), custom_sbox_list)
        decrypted_bytes = cipher.decrypt(encrypted_data, key_bytes)
        
        try:
            decrypted_img = Image.open(io.BytesIO(decrypted_bytes))
            output_buffer = io.BytesIO()
            decrypted_img.save(output_buffer, format='PNG')
            decrypted_image_bytes = output_buffer.getvalue()
        except Exception:
            decrypted_image_bytes = decrypted_bytes
            
        decryption_time = (time.time() - start_time) * 1000
        
        return Response(
            content=decrypted_image_bytes,
            media_type="image/png",
            headers={
                "X-Sbox-Type": sbox_type.lower(),
                "X-Decryption-Time": f"{decryption_time:.2f}",
                "Content-Disposition": 'attachment; filename="decrypted_image.png"'
            }
        )
    except Exception as e:
        import traceback
        raise HTTPException(status_code=500, detail=f"{str(e)}\n{traceback.format_exc()}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)