"""
Rate limiting middleware for FastAPI
Protects endpoints from abuse
"""

from collections import defaultdict
from datetime import datetime, timedelta
from typing import Dict, Tuple
import logging

logger = logging.getLogger(__name__)


class RateLimiter:
    """
    Simple in-memory rate limiter
    For production, consider using Redis or similar
    """
    
    def __init__(self, requests_per_minute: int = 60):
        self.requests_per_minute = requests_per_minute
        self.requests: Dict[str, list] = defaultdict(list)
        self.window = timedelta(minutes=1)
    
    def is_allowed(self, client_id: str) -> Tuple[bool, int]:
        """
        Check if request is allowed for client
        
        Args:
            client_id: Unique identifier for client (usually IP address)
            
        Returns:
            Tuple of (is_allowed, remaining_requests)
        """
        now = datetime.now()
        
        # Clean old requests
        self.requests[client_id] = [
            req_time for req_time in self.requests[client_id]
            if now - req_time < self.window
        ]
        
        # Check rate limit
        current_requests = len(self.requests[client_id])
        
        if current_requests >= self.requests_per_minute:
            remaining = 0
            return False, remaining
        
        # Add current request
        self.requests[client_id].append(now)
        remaining = self.requests_per_minute - current_requests - 1
        
        return True, remaining
    
    def get_remaining(self, client_id: str) -> int:
        """Get remaining requests for client"""
        now = datetime.now()
        self.requests[client_id] = [
            req_time for req_time in self.requests[client_id]
            if now - req_time < self.window
        ]
        current_requests = len(self.requests[client_id])
        return max(0, self.requests_per_minute - current_requests)
