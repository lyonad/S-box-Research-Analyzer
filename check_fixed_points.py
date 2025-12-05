import sys
import os

sys.path.append(os.path.join(os.getcwd(), 'backend'))

from backend.sbox_generator import SBoxGenerator, K44_MATRIX, K45_MATRIX, C_AES

def check_points():
    gen = SBoxGenerator()
    k44 = gen.generate_sbox(K44_MATRIX, C_AES)
    k45 = gen.generate_sbox(K45_MATRIX, C_AES)
    
    def count_fixed(sbox):
        return sum(1 for x in range(256) if sbox[x] == x)
        
    def count_opposite_fixed(sbox):
        return sum(1 for x in range(256) if sbox[x] == (x ^ 0xFF))
        
    def count_cycles(sbox):
        visited = [False] * 256
        cycles = []
        for i in range(256):
            if not visited[i]:
                curr = i
                cycle = []
                while not visited[curr]:
                    visited[curr] = True
                    cycle.append(curr)
                    curr = sbox[curr]
                cycles.append(len(cycle))
        return sorted(cycles)

    k44_cycles = count_cycles(k44)
    k45_cycles = count_cycles(k45)
    
    print(f"K44 Cycles: {k44_cycles} (Total {len(k44_cycles)})")
    print(f"K45 Cycles: {k45_cycles} (Total {len(k45_cycles)})")


if __name__ == "__main__":
    check_points()
