"""
Cost tracking utility for Modal endpoints.

Tracks execution time and calculates costs based on Modal's pricing.
"""

import time
from typing import Dict, Optional
from dataclasses import dataclass


# Modal GPU pricing (per second) - updated 2026-01-21
# Source: https://modal.com/pricing
MODAL_GPU_PRICING = {
    "T4": 0.000164,    # $0.000164/sec (~$0.59/hr) - Lightweight inference
    "L4": 0.000222,    # $0.000222/sec (~$0.80/hr) - Medium inference
    "A10": 0.000306,   # $0.000306/sec (~$1.10/hr) - Medium inference, good performance
    "L40S": 0.000542,  # $0.000542/sec (~$1.95/hr) - Large models, high-res generation
    "A100-40GB": 0.000556,  # $0.000556/sec (~$2.00/hr) - Large models, high throughput
    "A100": 0.000694,  # $0.000694/sec (~$2.50/hr) - A100 80GB, very large models
    "A100-80GB": 0.000694,  # $0.000694/sec (~$2.50/hr) - Very large models, batch processing
    "H100": 0.001097,  # $0.001097/sec (~$3.95/hr) - Maximum performance, training
}

# CPU and memory pricing (per second)
CPU_CORE_PRICE = 0.0000131  # per core per second
MEMORY_PRICE = 0.00000222   # per GiB per second


@dataclass
class CostMetrics:
    """Cost metrics for a single endpoint execution."""
    endpoint: str
    execution_time_seconds: float
    gpu_type: str
    gpu_cost: float
    cpu_cores: Optional[int] = None
    memory_gib: Optional[float] = None
    cpu_cost: float = 0.0
    memory_cost: float = 0.0
    total_cost: float = 0.0
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for JSON serialization."""
        return {
            "endpoint": self.endpoint,
            "execution_time_seconds": round(self.execution_time_seconds, 3),
            "gpu_type": self.gpu_type,
            "gpu_cost": round(self.gpu_cost, 6),
            "cpu_cores": self.cpu_cores,
            "memory_gib": self.memory_gib,
            "cpu_cost": round(self.cpu_cost, 6),
            "memory_cost": round(self.memory_cost, 6),
            "total_cost": round(self.total_cost, 6),
            "total_cost_formatted": f"${self.total_cost:.6f}",
        }


class CostTracker:
    """Tracks execution time and calculates costs for Modal endpoints."""
    
    def __init__(self, gpu_type: str = "L40S", cpu_cores: Optional[int] = None, memory_gib: Optional[float] = None):
        """
        Initialize cost tracker.
        
        Args:
            gpu_type: GPU type (L40S, A100, A10, etc.)
            cpu_cores: Number of CPU cores used (optional, for CPU-only tasks)
            memory_gib: Memory used in GiB (optional, typically included in GPU cost)
        """
        self.gpu_type = gpu_type
        self.cpu_cores = cpu_cores
        self.memory_gib = memory_gib
        self.start_time: Optional[float] = None
        self.end_time: Optional[float] = None
        
    def start(self):
        """Start timing."""
        self.start_time = time.time()
        
    def stop(self) -> float:
        """Stop timing and return elapsed seconds."""
        self.end_time = time.time()
        if self.start_time is None:
            raise ValueError("CostTracker.start() must be called before stop()")
        return self.end_time - self.start_time
    
    def calculate_cost(self, endpoint: str, execution_time: Optional[float] = None) -> CostMetrics:
        """
        Calculate cost for the execution.
        
        Args:
            endpoint: Endpoint name (e.g., "flux", "flux-dev", "wan2")
            execution_time: Execution time in seconds (if None, uses stop() time)
            
        Returns:
            CostMetrics object with cost breakdown
        """
        if execution_time is None:
            if self.end_time is None or self.start_time is None:
                raise ValueError("Must call stop() first or provide execution_time")
            execution_time = self.end_time - self.start_time
        
        # Get GPU pricing
        gpu_price_per_sec = MODAL_GPU_PRICING.get(self.gpu_type, MODAL_GPU_PRICING["L40S"])
        gpu_cost = execution_time * gpu_price_per_sec
        
        # Calculate CPU cost (if specified)
        cpu_cost = 0.0
        if self.cpu_cores:
            cpu_cost = execution_time * self.cpu_cores * CPU_CORE_PRICE
        
        # Calculate memory cost (if specified, typically included in GPU)
        memory_cost = 0.0
        if self.memory_gib:
            memory_cost = execution_time * self.memory_gib * MEMORY_PRICE
        
        total_cost = gpu_cost + cpu_cost + memory_cost
        
        return CostMetrics(
            endpoint=endpoint,
            execution_time_seconds=execution_time,
            gpu_type=self.gpu_type,
            gpu_cost=gpu_cost,
            cpu_cores=self.cpu_cores,
            memory_gib=self.memory_gib,
            cpu_cost=cpu_cost,
            memory_cost=memory_cost,
            total_cost=total_cost,
        )


def get_cost_summary(metrics: CostMetrics) -> str:
    """Get a human-readable cost summary."""
    return (
        f"Cost: ${metrics.total_cost:.6f} | "
        f"Time: {metrics.execution_time_seconds:.2f}s | "
        f"GPU: {metrics.gpu_type} @ ${metrics.gpu_cost:.6f}"
    )
