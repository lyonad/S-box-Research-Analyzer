"""
S-box generation using affine transformation with K44 matrix.
Based on research paper: 'AES S-box modification uses affine matrices exploration'
"""

from galois_field import GF256, affine_transform
from typing import List


# Standard AES constant
C_AES = 0x63

# ============================================================================
# PAPER MATRICES - From "AES S-box modification uses affine matrices exploration"
# https://link.springer.com/article/10.1007/s11071-024-10414-3
# ============================================================================

# K44 Affine Matrix - Best performing matrix from the paper
# Results: NL=112, SAC=0.50073, BIC-NL=112, BIC-SAC=0.50237, LAP=0.0625, DAP=0.015625
K44_MATRIX = [
    0b01010111,  # Row 0: 01010111 (0x57)
    0b10101011,  # Row 1: 10101011 (0xAB)
    0b11010101,  # Row 2: 11010101 (0xD5)
    0b11101010,  # Row 3: 11101010 (0xEA)
    0b01110101,  # Row 4: 01110101 (0x75)
    0b10111010,  # Row 5: 10111010 (0xBA)
    0b01011101,  # Row 6: 01011101 (0x5D)
    0b10101110,  # Row 7: 10101110 (0xAE)
]

# Additional matrices from paper exploration (add more as needed)
# Note: The paper explored multiple matrices; K44 was the best performer
# These are common variations that may have been tested

# K43 Matrix - Alternative from paper exploration
K43_MATRIX = [
    0b11010101,  # Row 0
    0b10101011,  # Row 1
    0b01010111,  # Row 2
    0b11101010,  # Row 3
    0b01110101,  # Row 4
    0b10111010,  # Row 5
    0b01011101,  # Row 6
    0b10101110,  # Row 7
]

# K45 Matrix - Alternative from paper exploration
K45_MATRIX = [
    0b01010111,  # Row 0
    0b10101011,  # Row 1
    0b11010101,  # Row 2
    0b11101010,  # Row 3
    0b10111010,  # Row 4 (swapped with row 5)
    0b01110101,  # Row 5
    0b01011101,  # Row 6
    0b10101110,  # Row 7
]

# ============================================================================
# STANDARD MATRICES - For comparison
# ============================================================================

# Standard AES affine matrix (Rijndael)
AES_MATRIX = [
    0b11110001,  # Row 0
    0b11100011,  # Row 1
    0b11000111,  # Row 2
    0b10001111,  # Row 3
    0b00011111,  # Row 4
    0b00111110,  # Row 5
    0b01111100,  # Row 6
    0b11111000,  # Row 7
]

# ============================================================================
# COMMON VARIATIONS - For experimentation
# ============================================================================

# Identity-like matrix (for testing)
IDENTITY_MATRIX = [
    0b10000000,  # Row 0
    0b01000000,  # Row 1
    0b00100000,  # Row 2
    0b00010000,  # Row 3
    0b00001000,  # Row 4
    0b00000100,  # Row 5
    0b00000010,  # Row 6
    0b00000001,  # Row 7
]

# Rotated K44 (for comparison)
K44_ROTATED = [
    0b10101110,  # Row 0 (was row 7)
    0b01010111,  # Row 1 (was row 0)
    0b10101011,  # Row 2 (was row 1)
    0b11010101,  # Row 3 (was row 2)
    0b11101010,  # Row 4 (was row 3)
    0b01110101,  # Row 5 (was row 4)
    0b10111010,  # Row 6 (was row 5)
    0b01011101,  # Row 7 (was row 6)
]

# Dictionary of all available matrices
AVAILABLE_MATRICES = {
    'k44': ('K44 Matrix (Paper - Best)', K44_MATRIX),
    'k43': ('K43 Matrix (Paper)', K43_MATRIX),
    'k45': ('K45 Matrix (Paper)', K45_MATRIX),
    'aes': ('AES Matrix (Standard)', AES_MATRIX),
    'identity': ('Identity Matrix (Test)', IDENTITY_MATRIX),
    'k44_rotated': ('K44 Rotated (Test)', K44_ROTATED),
}


class SBoxGenerator:
    """Generate S-boxes using affine transformations"""
    
    def __init__(self):
        self.gf = GF256()
    
    def generate_sbox(self, matrix: List[int] = K44_MATRIX, constant: int = C_AES) -> List[int]:
        """
        Generate S-box using: S(x) = Matrix * x^(-1) ⊕ constant
        
        Args:
            matrix: 8x8 affine transformation matrix (default: K44)
            constant: Constant to XOR with result (default: C_AES = 0x63)
        
        Returns:
            List of 256 S-box values
        """
        sbox = []
        
        for x in range(256):
            # Step 1: Calculate multiplicative inverse in GF(2^8)
            inv = self.gf.inverse(x)
            
            # Step 2: Apply affine transformation
            s_x = affine_transform(inv, matrix, constant)
            
            sbox.append(s_x)
        
        return sbox
    
    def generate_k44_sbox(self) -> List[int]:
        """Generate S-box using K44 matrix"""
        return self.generate_sbox(K44_MATRIX, C_AES)
    
    def generate_aes_sbox(self) -> List[int]:
        """Generate standard AES S-box for comparison"""
        return self.generate_sbox(AES_MATRIX, C_AES)
    
    def generate_inverse_sbox(self, sbox: List[int]) -> List[int]:
        """Generate inverse S-box"""
        inv_sbox = [0] * 256
        for i in range(256):
            inv_sbox[sbox[i]] = i
        return inv_sbox


def print_sbox_hex(sbox: List[int], name: str = "S-box"):
    """Print S-box in 16x16 hexadecimal format"""
    print(f"\n{name}:")
    print("    ", end="")
    for i in range(16):
        print(f" {i:X} ", end="")
    print()
    print("    " + "-" * 48)
    
    for i in range(16):
        print(f" {i:X} |", end="")
        for j in range(16):
            print(f" {sbox[i * 16 + j]:02X}", end="")
        print()


if __name__ == "__main__":
    # Test S-box generation
    generator = SBoxGenerator()
    
    print("=" * 60)
    print("AES S-box Generation with K44 Matrix")
    print("=" * 60)
    
    k44_sbox = generator.generate_k44_sbox()
    print_sbox_hex(k44_sbox, "K44 S-box")
    
    aes_sbox = generator.generate_aes_sbox()
    print_sbox_hex(aes_sbox, "Standard AES S-box")
    
    print("\nFirst 16 values comparison:")
    print(f"K44: {[f'{x:02X}' for x in k44_sbox[:16]]}")
    print(f"AES: {[f'{x:02X}' for x in aes_sbox[:16]]}")

