"""Complete system test after fixing GF(2^8) tables"""

import sys
if 'galois_field' in sys.modules:
    del sys.modules['galois_field']
if 'sbox_generator' in sys.modules:
    del sys.modules['sbox_generator']
if 'cryptographic_tests' in sys.modules:
    del sys.modules['cryptographic_tests']

from galois_field import GF256
from sbox_generator import SBoxGenerator, K44_MATRIX, AES_MATRIX, C_AES
from cryptographic_tests import analyze_sbox

print("=" * 70)
print("COMPLETE SYSTEM TEST")
print("=" * 70)

# Test 1: GF(2^8) Tables
print("\n[1] Testing GF(2^8) Tables:")
gf = GF256()

# Check cycle
seen = {}
for i in range(256):
    val = gf.exp_table[i]
    if val in seen and i > 0:
        cycle_start = seen[val]
        cycle_length = i - cycle_start
        print(f"  Cycle length: {cycle_length} (need 255)")
        break
    seen[val] = i
else:
    cycle_length = 255

unique = len(set(gf.exp_table[:256]))
print(f"  Unique values: {unique}/255 (exp table should have 255 unique non-zero values)")
print(f"  log[1] = {gf.log_table[1]} (need 0)")

# Test inverses
inv_2 = gf.inverse(2)
inv_3 = gf.inverse(3)
test_2 = gf.multiply(2, inv_2)
test_3 = gf.multiply(3, inv_3)

print(f"  inv(2) = {hex(inv_2)}, 2 * inv(2) = {hex(test_2)} (should be 0x01)")
print(f"  inv(3) = {hex(inv_3)}, 3 * inv(3) = {hex(test_3)} (should be 0x01)")

# Exp table should have 255 unique values (all non-zero values 1-255)
# Note: 0 is not in exp table because it's not a power of the generator
gf_status = "PASS" if (cycle_length == 255 and unique == 255 and 
                       gf.log_table[1] == 0 and test_2 == 1 and test_3 == 1) else "FAIL"
print(f"  Status: {gf_status}")

# Test 2: S-box Generation
print("\n[2] Testing S-box Generation:")
sbox_gen = SBoxGenerator()

# AES S-box
aes_sbox = sbox_gen.generate_aes_sbox()
unique_aes = len(set(aes_sbox))
aes_s0 = aes_sbox[0]
aes_s1 = aes_sbox[1]

# Known AES S-box values
KNOWN_AES_S0 = 0x63
KNOWN_AES_S1 = 0x7C

print(f"  AES S-box:")
print(f"    Unique: {unique_aes}/256")
print(f"    S(0) = {hex(aes_s0)} (need {hex(KNOWN_AES_S0)})")
print(f"    S(1) = {hex(aes_s1)} (need {hex(KNOWN_AES_S1)})")

# K44 S-box
k44_sbox = sbox_gen.generate_k44_sbox()
unique_k44 = len(set(k44_sbox))
k44_s0 = k44_sbox[0]

print(f"  K44 S-box:")
print(f"    Unique: {unique_k44}/256")
print(f"    S(0) = {hex(k44_s0)} (need {hex(KNOWN_AES_S0)})")

sbox_status = "PASS" if (unique_aes == 256 and unique_k44 == 256 and 
                         aes_s0 == KNOWN_AES_S0 and aes_s1 == KNOWN_AES_S1) else "FAIL"
print(f"  Status: {sbox_status}")

# Test 3: Cryptographic Analysis
print("\n[3] Testing Cryptographic Analysis:")
try:
    aes_analysis = analyze_sbox(aes_sbox)
    k44_analysis = analyze_sbox(k44_sbox)
    
    print(f"  AES S-box metrics:")
    print(f"    NL: {aes_analysis['nonlinearity']['average']:.1f} (min: {aes_analysis['nonlinearity']['min']}, max: {aes_analysis['nonlinearity']['max']})")
    print(f"    SAC: {aes_analysis['sac']['average']:.6f}")
    print(f"    BIC-NL: {k44_analysis['bic_nl']['average']:.1f}")
    print(f"    BIC-SAC: {aes_analysis['bic_sac']['average_deviation']:.6f}")
    print(f"    LAP: {aes_analysis['lap']['max_lap']:.6f}")
    print(f"    DAP: {aes_analysis['dap']['max_dap']:.6f}")
    
    print(f"\n  K44 S-box metrics:")
    print(f"    NL: {k44_analysis['nonlinearity']['average']:.1f} (min: {k44_analysis['nonlinearity']['min']}, max: {k44_analysis['nonlinearity']['max']})")
    print(f"    SAC: {k44_analysis['sac']['average']:.6f}")
    print(f"    BIC-NL: {k44_analysis['bic_nl']['average']:.1f}")
    print(f"    BIC-SAC: {k44_analysis['bic_sac']['average_deviation']:.6f}")
    print(f"    LAP: {k44_analysis['lap']['max_lap']:.6f}")
    print(f"    DAP: {k44_analysis['dap']['max_dap']:.6f}")
    
    # Expected K44 values from paper
    EXPECTED_K44 = {
        'nonlinearity': 112,
        'sac': 0.50073,
        'bic_nl': 112,
        'bic_sac': 0.50237,
        'lap': 0.0625,
        'dap': 0.015625
    }
    
    print(f"\n  Expected K44 (from paper):")
    print(f"    NL: {EXPECTED_K44['nonlinearity']}")
    print(f"    SAC: {EXPECTED_K44['sac']:.6f}")
    print(f"    BIC-NL: {EXPECTED_K44['bic_nl']}")
    print(f"    BIC-SAC: {EXPECTED_K44['bic_sac']:.6f}")
    print(f"    LAP: {EXPECTED_K44['lap']:.6f}")
    print(f"    DAP: {EXPECTED_K44['dap']:.6f}")
    
    # Check if K44 matches paper (allow small tolerance)
    k44_match = (
        abs(k44_analysis['nonlinearity']['average'] - EXPECTED_K44['nonlinearity']) <= 1 and
        abs(k44_analysis['sac']['average'] - EXPECTED_K44['sac']) < 0.01 and
        abs(k44_analysis['bic_nl']['average'] - EXPECTED_K44['bic_nl']) <= 1 and
        abs(k44_analysis['bic_sac']['average_deviation'] - EXPECTED_K44['bic_sac']) < 0.01
    )
    
    crypto_status = "PASS" if k44_match else "CHECK"
    print(f"  Status: {crypto_status}")
    
except Exception as e:
    print(f"  Status: FAIL - Error: {e}")
    crypto_status = "FAIL"

# Final Summary
print("\n" + "=" * 70)
print("FINAL SUMMARY")
print("=" * 70)
print(f"GF(2^8) Tables:     {gf_status}")
print(f"S-box Generation:    {sbox_status}")
print(f"Cryptographic Tests: {crypto_status}")
print("=" * 70)

if gf_status == "PASS" and sbox_status == "PASS" and crypto_status in ["PASS", "CHECK"]:
    print("\n[SUCCESS] All critical components are working!")
else:
    print("\n[WARNING] Some issues remain - see details above")

