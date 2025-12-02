"""Test GF(2^8) implementation"""

REDUCTION_POLY = 0x1B

def generate_tables():
    exp_table = [0] * 256
    log_table = [0] * 256
    
    x = 1
    print("Generating tables...")
    print(f"i=0: x={hex(x)}, setting exp[0]={hex(x)}, log[{hex(x)}]=0")
    for i in range(255):
        exp_table[i] = x
        log_table[x] = i  # Set log BEFORE we modify x
        
        print(f"i={i}: x={hex(x)}, exp[{i}]={hex(exp_table[i])}, log[{hex(x)}]={log_table[x]}")
        
        # Multiply by 2
        x = x << 1
        if x & 0x100:
            x ^= REDUCTION_POLY
        x &= 0xFF
        
        if i >= 10:  # Only print first 10
            break
    
    exp_table[255] = 1
    return exp_table, log_table

exp, log = generate_tables()

print(f"\nDirect checks:")
print(f"log[1] = {log[1]} (should be 0)")
print(f"log[2] = {log[2]} (should be 1)")
print(f"log[4] = {log[4]} (should be 2)")

