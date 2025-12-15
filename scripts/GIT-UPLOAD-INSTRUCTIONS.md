# Git Upload Instructions

## Option 1: Commit to Git Repository (Recommended)

### Step 1: Add Files to Git

```bash
# Add all script files
git add scripts/download-comfyui-models.py
git add scripts/requirements.txt
git add scripts/README.md
git add scripts/QUICK-START.md
git add scripts/MODEL-DOWNLOAD-SUMMARY.md
git add scripts/comfyui-model-downloader.zip

# Or add all at once
git add scripts/
```

### Step 2: Commit

```bash
git commit -m "feat(ep-005): Add ComfyUI model downloader script with verified URLs"
```

### Step 3: Push to Remote

```bash
git push origin main
```

### Step 4: Download on RunPod Pod

**Via JupyterLab Terminal:**
```bash
# Clone repository
git clone <your-repo-url>
cd RYLA

# Or if already cloned, pull latest
git pull

# Install and run
pip install -r scripts/requirements.txt
python scripts/download-comfyui-models.py
```

**Via SSH:**
```bash
# Same as above
git clone <your-repo-url>
cd RYLA
pip install -r scripts/requirements.txt
python scripts/download-comfyui-models.py
```

## Option 2: Download Zip Directly

### Step 1: Upload Zip to Git Repository

The zip file is already created: `scripts/comfyui-model-downloader.zip`

You can:
1. **Upload via GitHub Web UI**:
   - Go to your repository on GitHub
   - Click "Add file" → "Upload files"
   - Drag `scripts/comfyui-model-downloader.zip`
   - Commit

2. **Or commit via command line** (already included in Option 1)

### Step 2: Download Zip on RunPod

**Via JupyterLab:**
```bash
# Download zip
wget https://raw.githubusercontent.com/<your-username>/<repo>/main/scripts/comfyui-model-downloader.zip

# Or if using GitHub releases/tags
wget https://github.com/<your-username>/<repo>/releases/download/v1.0/comfyui-model-downloader.zip

# Extract
unzip comfyui-model-downloader.zip

# Install and run
pip install -r requirements.txt
python download-comfyui-models.py
```

**Via SSH:**
```bash
# Same commands as above
wget <zip-url>
unzip comfyui-model-downloader.zip
pip install -r requirements.txt
python download-comfyui-models.py
```

## Option 3: Direct Download from Raw GitHub URL

If you commit to GitHub, you can download individual files directly:

```bash
# Download script
wget https://raw.githubusercontent.com/<your-username>/<repo>/main/scripts/download-comfyui-models.py

# Download requirements
wget https://raw.githubusercontent.com/<your-username>/<repo>/main/scripts/requirements.txt

# Make executable
chmod +x download-comfyui-models.py

# Install and run
pip install -r requirements.txt
python download-comfyui-models.py
```

## Quick Commands Summary

### On Your Local Machine (to upload)

```bash
# Add files
git add scripts/

# Commit
git commit -m "feat(ep-005): Add ComfyUI model downloader script"

# Push
git push origin main
```

### On RunPod Pod (to download)

```bash
# Option A: Clone repository
git clone <your-repo-url>
cd RYLA/scripts
pip install -r requirements.txt
python download-comfyui-models.py

# Option B: Download zip
wget <zip-url>
unzip comfyui-model-downloader.zip
pip install -r requirements.txt
python download-comfyui-models.py

# Option C: Download individual files
wget https://raw.githubusercontent.com/<your-username>/<repo>/main/scripts/download-comfyui-models.py
wget https://raw.githubusercontent.com/<your-username>/<repo>/main/scripts/requirements.txt
chmod +x download-comfyui-models.py
pip install -r requirements.txt
python download-comfyui-models.py
```

## File Sizes

- `download-comfyui-models.py`: ~15KB
- `requirements.txt`: ~100 bytes
- `README.md`: ~8KB
- `QUICK-START.md`: ~2KB
- `MODEL-DOWNLOAD-SUMMARY.md`: ~4KB
- **Total zip**: ~10KB (compressed)

All files are small and safe to commit to git.

## Notes

- ✅ Zip file is already created: `scripts/comfyui-model-downloader.zip`
- ✅ All files are ready to commit
- ✅ No sensitive data included
- ✅ Cross-platform compatible




