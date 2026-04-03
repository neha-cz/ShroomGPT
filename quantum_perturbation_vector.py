import math
import torch
import requests
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

API_BASE = "https://api.tsotchke.net"

def fetch_qrng_bytes(count: int) -> bytes:
    if not (1 <= count <= 1024):
        raise ValueError("count must be between 1 and 1024")
    url = f"{API_BASE}/v1/qrng/bytes/{count}"
    r = requests.get(url, timeout=20)
    r.raise_for_status()
    data = r.json()

    raw = data.get("bytes") or data.get("data")
    if raw is None:
        raise ValueError(f"Unexpected API response: {data}")

    return bytes.fromhex(raw)

def u8_to_unit_interval(x: int) -> float:
    return x / 255.0

def pair_to_angle(b1: int, b2: int) -> float:
    # 16-bit value mapped to [0, 2pi)
    val = (b1 << 8) | b2
    return (val / 65535.0) * (2.0 * math.pi)

def build_qrng_circuit(n_qubits,
    depth,
    qrng_count: int = 256,
) -> QuantumCircuit:
    qrng = fetch_qrng_bytes(qrng_count)
    ints = list(qrng)

    def next_byte() -> int:
        nonlocal i
        if i >= len(ints):
            raise RuntimeError("Ran out of QRNG bytes; request more.")
        b = ints[i]
        i += 1
        return b

    qc = QuantumCircuit(n_qubits, n_qubits)

    for q in range(n_qubits):
        qc.h(q)

    i = 0

    for _ in range(depth):
        # Pick a gate family from one byte
        gate_selector = next_byte() % 6

        if gate_selector == 0:
            q = next_byte() % n_qubits
            theta = pair_to_angle(next_byte(), next_byte())
            qc.rx(theta, q)

        elif gate_selector == 1:
            q = next_byte() % n_qubits
            theta = pair_to_angle(next_byte(), next_byte())
            qc.ry(theta, q)

        elif gate_selector == 2:
            q = next_byte() % n_qubits
            theta = pair_to_angle(next_byte(), next_byte())
            qc.rz(theta, q)

        elif gate_selector == 3:
            q = next_byte() % n_qubits
            qc.x(q)

        elif gate_selector == 4:
            q1 = next_byte() % n_qubits
            q2 = next_byte() % n_qubits
            while q2 == q1:
                q2 = next_byte() % n_qubits
            qc.cx(q1, q2)

        elif gate_selector == 5:
            q1 = next_byte() % n_qubits
            q2 = next_byte() % n_qubits
            while q2 == q1:
                q2 = next_byte() % n_qubits
            theta = pair_to_angle(next_byte(), next_byte())
            qc.crz(theta, q1, q2)

    qc.measure(range(n_qubits), range(n_qubits))
    return qc

def run_circuit_and_get_probabilities(qc: QuantumCircuit, shots: int = 4096):
    sim = AerSimulator()
    job = sim.run(qc, shots=shots)
    result = job.result()
    counts = result.get_counts(qc)

    n_qubits = qc.num_qubits
    dim = 2 ** n_qubits

    probs = torch.zeros(dim, dtype=torch.float32)

    for bitstring, count in counts.items():
        # Qiskit bitstrings are typically big-endian strings like "0110"
        idx = int(bitstring, 2)
        probs[idx] = count / shots

    return counts, probs

if __name__ == "__main__":
    qc = build_qrng_circuit(n_qubits=12, depth=16, qrng_count=256)
    _, probs = run_circuit_and_get_probabilities(qc, shots=4096)
    print(qc.draw(output="text"))
    print(probs)
