"""
Validation helpers for S-box candidates.

Implements the paper requirements:
1. Balanced output bits (each bit position has 128 zeros and 128 ones for 8-bit S-boxes)
2. Bijective mapping (permutation of 0..255 with no duplicates/missing values)
"""

from typing import List, Dict, Any


def _compute_bit_balance(sbox: List[int]) -> List[Dict[str, int]]:
    """Count zeros/ones for each output bit."""
    total_entries = len(sbox)
    bit_balances: List[Dict[str, int]] = []

    for bit in range(8):
        ones = sum((value >> bit) & 1 for value in sbox)
        zeros = total_entries - ones
        bit_balances.append({
            "bit": bit,
            "ones": ones,
            "zeros": zeros,
            "expected": total_entries // 2
        })

    return bit_balances


def _compute_bijectivity_details(sbox: List[int]) -> Dict[str, Any]:
    """Collect duplicate/missing value information."""
    counts: Dict[int, int] = {}
    for value in sbox:
        counts[value] = counts.get(value, 0) + 1

    duplicates = [
        {"value": value, "count": count}
        for value, count in counts.items()
        if count > 1
    ]

    missing = [value for value in range(256) if value not in counts]

    return {
        "duplicates": duplicates,
        "missing": missing,
        "unique_values": len(counts)
    }


def validate_sbox(sbox: List[int]) -> Dict[str, Any]:
    """
    Validate S-box balance and bijectivity requirements.

    Returns:
        {
            "is_balanced": bool,
            "is_bijective": bool,
            "bit_balance": [...],
            "duplicate_values": [...],
            "missing_values": [...],
            "is_valid": bool
        }
    """
    bit_balances = _compute_bit_balance(sbox)
    balance_ok = all(entry["ones"] == entry["expected"] for entry in bit_balances)

    bijectivity_stats = _compute_bijectivity_details(sbox)
    duplicates = bijectivity_stats["duplicates"]
    missing = bijectivity_stats["missing"]
    bijective_ok = len(duplicates) == 0 and len(missing) == 0

    return {
        "is_balanced": balance_ok,
        "is_bijective": bijective_ok,
        "bit_balance": bit_balances,
        "duplicate_values": duplicates,
        "missing_values": missing,
        "unique_values": bijectivity_stats["unique_values"],
        "is_valid": balance_ok and bijective_ok
    }


