#!/bin/bash
# Quick check script for RunPod pod setup
# Run this on the pod to verify network volume and directory structure

echo "=== RunPod Pod Setup Check ==="
echo ""
echo "Current directory: $(pwd)"
echo "User: $(whoami)"
echo ""
echo "=== Disk Usage ==="
df -h
echo ""
echo "=== Workspace Check ==="
if [ -d "/workspace" ]; then
    echo "✓ /workspace exists"
    ls -lah /workspace/ | head -15
else
    echo "✗ /workspace not found"
    echo "Checking root for workspace..."
    ls -la / | grep -E "(workspace|models|volume)" || echo "No workspace-related directories in root"
fi
echo ""
echo "=== Models Directory Check ==="
if [ -d "/workspace/models" ]; then
    echo "✓ /workspace/models exists"
    echo "Size: $(du -sh /workspace/models 2>/dev/null || echo 'unknown')"
    ls -lah /workspace/models/ | head -10
    echo ""
    echo "=== Checkpoints Check ==="
    if [ -d "/workspace/models/checkpoints" ]; then
        echo "✓ /workspace/models/checkpoints exists"
        ls -lh /workspace/models/checkpoints/ | head -10
        echo ""
        echo "Current models:"
        find /workspace/models/checkpoints -name "*.safetensors" -o -name "*.ckpt" -o -name "*.pt" 2>/dev/null | head -10
    else
        echo "✗ /workspace/models/checkpoints not found (will be created)"
    fi
else
    echo "✗ /workspace/models not found"
    echo "Network volume may not be mounted or mounted at different location"
fi
echo ""
echo "=== Network Interfaces ==="
ip addr show | grep -E "(inet |inet6 )" | head -5
echo ""
echo "=== Environment Check ==="
echo "Python: $(which python3 2>/dev/null || which python 2>/dev/null || echo 'not found')"
echo "wget: $(which wget 2>/dev/null || echo 'not found')"
echo "curl: $(which curl 2>/dev/null || echo 'not found')"
echo "huggingface-cli: $(which huggingface-cli 2>/dev/null || echo 'not found')"

