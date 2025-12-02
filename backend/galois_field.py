"""
Galois Field GF(2^8) arithmetic operations for AES cryptography.
Uses irreducible polynomial: x^8 + x^4 + x^3 + x + 1 (0x11B)
"""

class GF256:
    """Galois Field GF(2^8) operations"""
    
    # Irreducible polynomial: x^8 + x^4 + x^3 + x + 1
    IRREDUCIBLE_POLY = 0x11B
    
    def __init__(self):
        """Initialize lookup tables for efficient computation"""
        self.exp_table = [0] * 512  # Extended for easier computation
        self.log_table = [0] * 256
        self._generate_tables()
    
    def _generate_tables(self):
        """
        Generate exponential and logarithm lookup tables for GF(2^8).
        Uses irreducible polynomial: x^8 + x^4 + x^3 + x + 1 (0x11B)
        
        Note: Generator 3 is used instead of 2 because 2 is not primitive
        in this field representation (only generates 51 elements).
        Generator 3 correctly generates all 255 non-zero elements.
        """
        # Reduction polynomial: lower 8 bits of 0x11B = 0x1B
        # This represents x^4 + x^3 + x + 1
        REDUCTION_POLY = 0x1B
        
        # Initialize tables
        exp_table_new = [0] * 512
        log_table_new = [0] * 256
        
        # Start with α^0 = 1
        # Using generator 3 (verified to be primitive and generate all 255 elements)
        val = 1
        exp_table_new[0] = 1
        log_table_new[1] = 0  # log(1) = 0 since α^0 = 1
        
        # Generate all 255 non-zero field elements
        # Multiply by 3: multiply by 2 (shift left), then add original (XOR in GF(2))
        for i in range(1, 255):
            # Step 1: Multiply by 2 (shift left)
            temp = val << 1
            
            # Reduce if overflow
            if temp & 0x100:
                temp ^= REDUCTION_POLY
            temp = temp & 0xFF
            
            # Step 2: Add original (XOR) to get multiply by 3
            # In GF(2), 3*x = 2*x + x = (x << 1) ^ x
            val = temp ^ val
            
            # Store in exponential table
            exp_table_new[i] = val
            
            # Store in logarithm table (only if not already set)
            # Preserve log[1] = 0 from initialization
            if val != 0 and val != 1:
                if log_table_new[val] == 0:
                    log_table_new[val] = i
        
        # Complete the cycle: α^255 = 1
        exp_table_new[255] = 1
        # log[1] remains 0 from initialization
        
        # Extend exponential table for easier multiplication
        for i in range(256, 512):
            exp_table_new[i] = exp_table_new[i - 255]
        
        # Assign tables to instance
        self.exp_table = exp_table_new
        self.log_table = log_table_new
    
    def multiply(self, a: int, b: int) -> int:
        """Multiply two elements in GF(2^8)"""
        if a == 0 or b == 0:
            return 0
        return self.exp_table[(self.log_table[a] + self.log_table[b]) % 255]
    
    def inverse(self, a: int) -> int:
        """Find multiplicative inverse in GF(2^8)"""
        if a == 0:
            return 0
        return self.exp_table[255 - self.log_table[a]]
    
    def add(self, a: int, b: int) -> int:
        """Add two elements in GF(2^8) (XOR operation)"""
        return a ^ b
    
    def power(self, a: int, n: int) -> int:
        """Raise element to power n in GF(2^8)"""
        if a == 0:
            return 0
        if n == 0:
            return 1
        return self.exp_table[(self.log_table[a] * n) % 255]


def affine_transform(byte: int, matrix: list, constant: int) -> int:
    """
    Apply affine transformation: result = matrix * byte ⊕ constant
    
    Args:
        byte: Input byte (0-255)
        matrix: 8x8 binary matrix (list of 8 integers, each representing a row)
        constant: Constant vector to XOR with result
    
    Returns:
        Transformed byte
    """
    result = 0
    
    for i in range(8):
        # Calculate bit i of result
        bit = 0
        for j in range(8):
            # Extract bit j from input byte and bit j from matrix row i
            input_bit = (byte >> j) & 1
            matrix_bit = (matrix[i] >> j) & 1
            bit ^= (input_bit & matrix_bit)
        
        result |= (bit << i)
    
    # XOR with constant
    result ^= constant
    
    return result


def matrix_vector_mult_gf2(matrix: list, vector: int) -> int:
    """
    Multiply 8x8 binary matrix with 8-bit vector in GF(2)
    
    Args:
        matrix: List of 8 integers, each representing a row of the matrix
        vector: 8-bit vector
    
    Returns:
        Result of matrix * vector in GF(2)
    """
    result = 0
    
    for i in range(8):
        bit = 0
        for j in range(8):
            bit ^= ((matrix[i] >> j) & 1) & ((vector >> j) & 1)
        result |= (bit << i)
    
    return result

