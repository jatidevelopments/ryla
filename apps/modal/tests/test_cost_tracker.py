"""
Test cost tracking utilities.

This test verifies that cost tracking works correctly.
"""

import sys
from pathlib import Path

# Add modal directory to path
modal_dir = Path(__file__).parent.parent
sys.path.insert(0, str(modal_dir))

from utils.cost_tracker import CostTracker, get_cost_summary


def test_cost_tracker():
    """Test CostTracker class."""
    tracker = CostTracker(gpu_type="L40S")
    
    # Start tracking
    tracker.start()
    
    # Simulate some work
    import time
    time.sleep(0.1)  # 100ms
    
    # Stop tracking
    execution_time = tracker.stop()
    
    assert execution_time > 0
    assert execution_time < 1.0  # Should be less than 1 second
    
    # Calculate cost
    cost_metrics = tracker.calculate_cost("test", execution_time)
    
    assert cost_metrics.total_cost > 0
    assert cost_metrics.gpu_type == "L40S"
    
    print(f"✅ CostTracker works: {execution_time:.3f}s, ${cost_metrics.total_cost:.6f}")


def test_cost_summary():
    """Test cost summary formatting."""
    tracker = CostTracker(gpu_type="L40S")
    tracker.start()
    
    import time
    time.sleep(0.1)
    
    execution_time = tracker.stop()
    cost_metrics = tracker.calculate_cost("test", execution_time)
    
    summary = get_cost_summary(cost_metrics)
    
    assert "test" in summary.lower() or "cost" in summary.lower()
    assert "$" in summary or "USD" in summary.upper()
    
    print(f"✅ Cost summary: {summary}")


def test_different_gpus():
    """Test cost tracking with different GPU types."""
    gpus = ["T4", "A10", "L40S", "A100-80GB"]
    
    for gpu in gpus:
        tracker = CostTracker(gpu_type=gpu)
        tracker.start()
        
        import time
        time.sleep(0.01)  # 10ms
        
        execution_time = tracker.stop()
        cost_metrics = tracker.calculate_cost("test", execution_time)
        
        assert cost_metrics.gpu_type == gpu
        assert cost_metrics.total_cost > 0
    
    print("✅ Cost tracking works for all GPU types")


if __name__ == "__main__":
    print("Running cost tracker tests...\n")
    
    test_cost_tracker()
    test_cost_summary()
    test_different_gpus()
    
    print("\n✅ All cost tracker tests passed!")
