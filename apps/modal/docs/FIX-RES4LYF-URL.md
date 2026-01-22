# Fix: Update RES4LYF Repository URL

## Issue
The repository URL is incorrect. It should be:
- **Wrong**: `https://github.com/res4lyf/res4lyf.git`
- **Correct**: `https://github.com/ClownsharkBatwing/RES4LYF.git`

## Changes Needed

### 1. Update Image Build (lines ~49-53)
Replace:
```python
"cd /root/ComfyUI/custom_nodes && echo 'Custom nodes will be installed at runtime via ComfyUI Manager'",
```

With:
```python
# Install RES4LYF during image build (correct repository: ClownsharkBatwing/RES4LYF)
"cd /root/ComfyUI/custom_nodes && git clone https://github.com/ClownsharkBatwing/RES4LYF.git RES4LYF || echo 'RES4LYF: will install at runtime'",
"cd /root/ComfyUI/custom_nodes/RES4LYF && (pip install -r requirements.txt || true) || echo 'RES4LYF requirements: skipped'",
```

### 2. Update Runtime Installation (lines ~101-120)
Replace:
```python
# Install res4lyf
res4lyf_dir = custom_nodes_dir / "res4lyf"
if not res4lyf_dir.exists():
    try:
        subprocess.run(
            ["git", "clone", "https://github.com/res4lyf/res4lyf.git", str(res4lyf_dir)],
            ...
```

With:
```python
# Install RES4LYF (correct repository: ClownsharkBatwing/RES4LYF)
# See: https://github.com/ClownsharkBatwing/RES4LYF
res4lyf_dir = custom_nodes_dir / "RES4LYF"
if not res4lyf_dir.exists():
    try:
        result = subprocess.run(
            ["git", "clone", "https://github.com/ClownsharkBatwing/RES4LYF.git", str(res4lyf_dir)],
            check=False,
            capture_output=True,
            timeout=120,
        )
        if res4lyf_dir.exists() and result.returncode == 0:
            print("✅ RES4LYF cloned successfully")
            req_file = res4lyf_dir / "requirements.txt"
            if req_file.exists():
                subprocess.run(
                    ["pip", "install", "-r", str(req_file)],
                    check=False,
                    capture_output=True,
                )
        else:
            error_msg = result.stderr.decode("utf-8") if result.stderr else "Unknown error"
            print(f"⚠️ RES4LYF clone failed: {error_msg[:200]}")
    except Exception as e:
        print(f"⚠️ Error cloning RES4LYF: {e}")

# Also check for lowercase res4lyf (fallback)
if not res4lyf_dir.exists():
    res4lyf_lower = custom_nodes_dir / "res4lyf"
    if res4lyf_lower.exists():
        res4lyf_dir = res4lyf_lower
```

## Reference
- Repository: https://github.com/ClownsharkBatwing/RES4LYF
- Contains: ClownsharKSampler_Beta, Sigmas Rescale, BetaSamplingScheduler
