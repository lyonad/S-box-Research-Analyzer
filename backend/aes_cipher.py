"""
AES Cipher Implementation
Supports encryption and decryption using custom S-boxes (K44 or AES)
Based on AES-128 standard (FIPS 197)
"""

from typing import List, Tuple
from sbox_generator import SBoxGenerator, K44_MATRIX, AES_MATRIX, C_AES


class AESCipher:
    """AES-128 Cipher with customizable S-box"""
    
    # AES-128 constants
    N_ROUNDS = 10
    N_BLOCK = 16  # 128 bits = 16 bytes
    N_KEY = 16    # 128 bits = 16 bytes
    
    # Rijndael S-box (for key expansion)
    RCON = [
        0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36
    ]
    
    def __init__(self, sbox: List[int], inv_sbox: List[int]):
        """
        Initialize AES cipher with custom S-box
        
        Args:
            sbox: Forward S-box (256 values)
            inv_sbox: Inverse S-box (256 values)
        """
        if len(sbox) != 256 or len(inv_sbox) != 256:
            raise ValueError("S-box must contain exactly 256 values")
        
        self.sbox = sbox
        self.inv_sbox = inv_sbox
        self.generator = SBoxGenerator()
    
    @staticmethod
    def _rot_word(word: List[int]) -> List[int]:
        """Rotate word left by one byte"""
        return word[1:] + word[:1]
    
    @staticmethod
    def _sub_word(word: List[int], sbox: List[int]) -> List[int]:
        """Apply S-box substitution to each byte in word"""
        return [sbox[b] for b in word]
    
    def _key_expansion(self, key: bytes) -> List[List[int]]:
        """
        Expand key for AES-128 (10 rounds)
        Returns list of round keys (11 keys of 16 bytes each)
        """
        if len(key) != self.N_KEY:
            raise ValueError(f"Key must be exactly {self.N_KEY} bytes")
        
        # Use standard AES S-box for key expansion (as per AES spec)
        aes_sbox = self.generator.generate_aes_sbox()
        
        # Convert key to list of words (4 bytes each)
        w = []
        for i in range(4):
            w.append([key[4*i], key[4*i+1], key[4*i+2], key[4*i+3]])
        
        # Generate remaining words
        for i in range(4, 44):  # 44 words = 11 round keys * 4 words
            temp = w[i-1].copy()
            
            if i % 4 == 0:
                # Rotate, substitute, XOR with Rcon
                temp = self._rot_word(temp)
                temp = self._sub_word(temp, aes_sbox)
                temp[0] ^= self.RCON[(i // 4) - 1]
            
            # XOR with word 4 positions back
            w.append([w[i-4][j] ^ temp[j] for j in range(4)])
        
        # Convert to round keys (16 bytes each)
        round_keys = []
        for i in range(11):
            round_key = []
            for j in range(4):
                round_key.extend(w[4*i + j])
            round_keys.append(round_key)
        
        return round_keys
    
    @staticmethod
    def _add_round_key(state: List[int], round_key: List[int]) -> List[int]:
        """XOR state with round key"""
        return [state[i] ^ round_key[i] for i in range(16)]
    
    def _sub_bytes(self, state: List[int]) -> List[int]:
        """Substitute bytes using S-box"""
        return [self.sbox[b] for b in state]
    
    def _inv_sub_bytes(self, state: List[int]) -> List[int]:
        """Inverse substitute bytes using inverse S-box"""
        return [self.inv_sbox[b] for b in state]
    
    @staticmethod
    def _shift_rows(state: List[int]) -> List[int]:
        """Shift rows of state matrix"""
        # State is stored column-major: state[0..3] = col0, state[4..7] = col1, etc.
        # But we need to work row-major for shifting
        
        # Convert to row-major representation
        matrix = [[0]*4 for _ in range(4)]
        for i in range(4):
            for j in range(4):
                matrix[i][j] = state[i + 4*j]
        
        # Shift rows
        matrix[1] = matrix[1][1:] + matrix[1][:1]  # Row 1: shift left 1
        matrix[2] = matrix[2][2:] + matrix[2][:2]  # Row 2: shift left 2
        matrix[3] = matrix[3][3:] + matrix[3][:3]  # Row 3: shift left 3
        
        # Convert back to column-major
        result = [0] * 16
        for i in range(4):
            for j in range(4):
                result[i + 4*j] = matrix[i][j]
        
        return result
    
    @staticmethod
    def _inv_shift_rows(state: List[int]) -> List[int]:
        """Inverse shift rows of state matrix"""
        # Convert to row-major
        matrix = [[0]*4 for _ in range(4)]
        for i in range(4):
            for j in range(4):
                matrix[i][j] = state[i + 4*j]
        
        # Inverse shift rows (shift right)
        matrix[1] = matrix[1][-1:] + matrix[1][:-1]  # Row 1: shift right 1
        matrix[2] = matrix[2][-2:] + matrix[2][:-2]  # Row 2: shift right 2
        matrix[3] = matrix[3][-3:] + matrix[3][:-3]  # Row 3: shift right 3
        
        # Convert back to column-major
        result = [0] * 16
        for i in range(4):
            for j in range(4):
                result[i + 4*j] = matrix[i][j]
        
        return result
    
    @staticmethod
    def _gf_multiply(a: int, b: int) -> int:
        """Multiply two bytes in GF(2^8)"""
        result = 0
        for i in range(8):
            if b & 1:
                result ^= a
            a <<= 1
            if a & 0x100:
                a ^= 0x1B  # Reduce modulo x^8 + x^4 + x^3 + x + 1
            b >>= 1
        return result & 0xFF
    
    @staticmethod
    def _mix_columns(state: List[int]) -> List[int]:
        """Mix columns transformation"""
        result = [0] * 16
        
        # MixColumns matrix
        for c in range(4):
            s0 = state[0 + 4*c]
            s1 = state[1 + 4*c]
            s2 = state[2 + 4*c]
            s3 = state[3 + 4*c]
            
            result[0 + 4*c] = AESCipher._gf_multiply(0x02, s0) ^ AESCipher._gf_multiply(0x03, s1) ^ s2 ^ s3
            result[1 + 4*c] = s0 ^ AESCipher._gf_multiply(0x02, s1) ^ AESCipher._gf_multiply(0x03, s2) ^ s3
            result[2 + 4*c] = s0 ^ s1 ^ AESCipher._gf_multiply(0x02, s2) ^ AESCipher._gf_multiply(0x03, s3)
            result[3 + 4*c] = AESCipher._gf_multiply(0x03, s0) ^ s1 ^ s2 ^ AESCipher._gf_multiply(0x02, s3)
        
        return result
    
    @staticmethod
    def _inv_mix_columns(state: List[int]) -> List[int]:
        """Inverse mix columns transformation"""
        result = [0] * 16
        
        # Inverse MixColumns matrix
        for c in range(4):
            s0 = state[0 + 4*c]
            s1 = state[1 + 4*c]
            s2 = state[2 + 4*c]
            s3 = state[3 + 4*c]
            
            result[0 + 4*c] = AESCipher._gf_multiply(0x0E, s0) ^ AESCipher._gf_multiply(0x0B, s1) ^ AESCipher._gf_multiply(0x0D, s2) ^ AESCipher._gf_multiply(0x09, s3)
            result[1 + 4*c] = AESCipher._gf_multiply(0x09, s0) ^ AESCipher._gf_multiply(0x0E, s1) ^ AESCipher._gf_multiply(0x0B, s2) ^ AESCipher._gf_multiply(0x0D, s3)
            result[2 + 4*c] = AESCipher._gf_multiply(0x0D, s0) ^ AESCipher._gf_multiply(0x09, s1) ^ AESCipher._gf_multiply(0x0E, s2) ^ AESCipher._gf_multiply(0x0B, s3)
            result[3 + 4*c] = AESCipher._gf_multiply(0x0B, s0) ^ AESCipher._gf_multiply(0x0D, s1) ^ AESCipher._gf_multiply(0x09, s2) ^ AESCipher._gf_multiply(0x0E, s3)
        
        return result
    
    def encrypt_block(self, plaintext: bytes, key: bytes) -> bytes:
        """
        Encrypt a single 16-byte block using AES-128
        
        Args:
            plaintext: 16 bytes of plaintext
            key: 16 bytes encryption key
        
        Returns:
            16 bytes of ciphertext
        """
        if len(plaintext) != self.N_BLOCK:
            raise ValueError(f"Plaintext must be exactly {self.N_BLOCK} bytes")
        
        # Convert plaintext to state (list of bytes)
        state = list(plaintext)
        
        # NOTE: This method expects that round keys are provided by caller
        # for performance. If caller passed a full key instead, expand once.
        # Expand key if caller provided `key` instead of precomputed round keys
        if isinstance(key, (bytes, bytearray)):
            round_keys = self._key_expansion(key)
        else:
            round_keys = key

        # Initial round: AddRoundKey
        state = self._add_round_key(state, round_keys[0])
        
        # Main rounds (1 to 9)
        for round_num in range(1, self.N_ROUNDS):
            state = self._sub_bytes(state)
            state = self._shift_rows(state)
            state = self._mix_columns(state)
            state = self._add_round_key(state, round_keys[round_num])
        
        # Final round (10)
        state = self._sub_bytes(state)
        state = self._shift_rows(state)
        state = self._add_round_key(state, round_keys[self.N_ROUNDS])
        
        return bytes(state)
    
    def decrypt_block(self, ciphertext: bytes, key: bytes) -> bytes:
        """
        Decrypt a single 16-byte block using AES-128
        
        Args:
            ciphertext: 16 bytes of ciphertext
            key: 16 bytes decryption key
        
        Returns:
            16 bytes of plaintext
        """
        if len(ciphertext) != self.N_BLOCK:
            raise ValueError(f"Ciphertext must be exactly {self.N_BLOCK} bytes")
        
        # Convert ciphertext to state
        state = list(ciphertext)

        # Expand key if caller passed raw key; otherwise `key` may be round_keys
        if isinstance(key, (bytes, bytearray)):
            round_keys = self._key_expansion(key)
        else:
            round_keys = key
        
        # Initial round: AddRoundKey (with last round key)
        state = self._add_round_key(state, round_keys[self.N_ROUNDS])
        
        # Main rounds (9 to 1)
        for round_num in range(self.N_ROUNDS - 1, 0, -1):
            state = self._inv_shift_rows(state)
            state = self._inv_sub_bytes(state)
            state = self._add_round_key(state, round_keys[round_num])
            state = self._inv_mix_columns(state)
        
        # Final round (0)
        state = self._inv_shift_rows(state)
        state = self._inv_sub_bytes(state)
        state = self._add_round_key(state, round_keys[0])
        
        return bytes(state)
    
    @staticmethod
    def _pkcs7_pad(data: bytes, block_size: int = 16) -> bytes:
        """Add PKCS7 padding to data"""
        pad_len = block_size - (len(data) % block_size)
        padding = bytes([pad_len] * pad_len)
        return data + padding
    
    @staticmethod
    def _pkcs7_unpad(data: bytes) -> bytes:
        """Remove PKCS7 padding from data"""
        if len(data) == 0:
            raise ValueError("Cannot unpad empty data")
        pad_len = data[-1]
        if pad_len < 1 or pad_len > 16:
            raise ValueError("Invalid padding")
        if len(data) < pad_len:
            raise ValueError("Data too short for padding")
        # Verify padding bytes are all the same
        for i in range(len(data) - pad_len, len(data)):
            if data[i] != pad_len:
                raise ValueError("Invalid padding bytes")
        return data[:-pad_len]
    
    def encrypt(self, plaintext: bytes, key: bytes, iv: bytes = None) -> bytes:
        """
        Encrypt plaintext using AES-128 in CBC mode with PKCS7 padding
        
        Args:
            plaintext: Plaintext bytes (any length)
            key: 16 bytes encryption key
            iv: Optional 16 bytes IV (random if not provided)
        
        Returns:
            Ciphertext bytes (IV + encrypted data)
        """
        import os
        
        # Generate random IV if not provided
        if iv is None:
            iv = os.urandom(16)
        elif len(iv) != 16:
            raise ValueError("IV must be exactly 16 bytes")
        
        # Pad plaintext
        padded_data = self._pkcs7_pad(plaintext, self.N_BLOCK)

        # Precompute round keys once for this encryption
        round_keys = self._key_expansion(key)

        # Encrypt in CBC mode
        ciphertext = b''
        prev_block = iv

        for i in range(0, len(padded_data), self.N_BLOCK):
            block = padded_data[i:i+self.N_BLOCK]

            # XOR with previous ciphertext (or IV for first block)
            xored = bytes([block[j] ^ prev_block[j] for j in range(self.N_BLOCK)])

            # Encrypt block using precomputed round keys
            encrypted = self.encrypt_block(xored, round_keys)
            ciphertext += encrypted
            prev_block = encrypted
        
        # Return IV + ciphertext
        return iv + ciphertext
    
    def decrypt(self, ciphertext: bytes, key: bytes) -> bytes:
        """
        Decrypt ciphertext using AES-128 in CBC mode with PKCS7 padding
        
        Args:
            ciphertext: Ciphertext bytes (IV + encrypted data)
            key: 16 bytes decryption key
        
        Returns:
            Plaintext bytes
        """
        if len(ciphertext) < 32:  # At least IV (16) + one block (16)
            raise ValueError("Ciphertext too short")
        
        # Extract IV and encrypted data
        iv = ciphertext[:16]
        encrypted_data = ciphertext[16:]

        # Precompute round keys once for this decryption
        round_keys = self._key_expansion(key)

        # Decrypt in CBC mode
        plaintext = b''
        prev_block = iv

        for i in range(0, len(encrypted_data), self.N_BLOCK):
            block = encrypted_data[i:i+self.N_BLOCK]

            # Decrypt block using precomputed round keys
            decrypted = self.decrypt_block(block, round_keys)

            # XOR with previous ciphertext (or IV for first block)
            xored = bytes([decrypted[j] ^ prev_block[j] for j in range(self.N_BLOCK)])
            plaintext += xored

            prev_block = block
        
        # Remove padding
        unpadded_data = self._pkcs7_unpad(plaintext)
        
        return unpadded_data


def create_cipher(sbox_type: str = 'k44', custom_sbox: List[int] = None) -> AESCipher:
    """
    Create AES cipher with specified S-box
    
    Args:
        sbox_type: 'k44' for K44 S-box, 'aes' for standard AES S-box, 'custom' for custom S-box
        custom_sbox: Custom S-box (256 values) - required if sbox_type is 'custom'
    
    Returns:
        AESCipher instance
    """
    generator = SBoxGenerator()
    
    if sbox_type.lower() == 'custom':
        if custom_sbox is None:
            raise ValueError("custom_sbox is required when sbox_type is 'custom'")
        if len(custom_sbox) != 256:
            raise ValueError("Custom S-box must contain exactly 256 values")
        sbox = custom_sbox
    elif sbox_type.lower() == 'k44':
        sbox = generator.generate_k44_sbox()
    elif sbox_type.lower() == 'aes':
        sbox = generator.generate_aes_sbox()
    else:
        raise ValueError(f"Unknown S-box type: {sbox_type}")
    
    inv_sbox = generator.generate_inverse_sbox(sbox)
    
    return AESCipher(sbox, inv_sbox)

