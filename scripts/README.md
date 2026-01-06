# Scripts Directory

This directory contains all utility scripts for the RYLA project, organized by category.

## Directory Structure

```
scripts/
├── setup/          # Setup and installation scripts
├── models/         # Model download and management scripts
├── tests/          # Test scripts for various components
├── generation/     # Image generation scripts
├── workflows/      # ComfyUI workflow conversion and automation
├── utils/          # Utility scripts (benchmarks, analysis, etc.)
├── git/            # Git-related scripts (LFS migration, etc.)
└── docs/           # Documentation and configuration files
```

## Quick Reference

### Setup Scripts (`setup/`)

Installation and setup utilities:

- `check-install-instantid.sh` - Check/install InstantID models
- `check-instantid-models.sh` - Verify InstantID model installation
- `check-pod-setup.sh` - Verify RunPod setup
- `install-instantid.sh` - Install InstantID models
- `setup-mcp-token.sh` - Setup MCP authentication token
- `setup-models-on-runpod.sh` - Setup models on RunPod infrastructure
- `verify-models.sh` - Verify model installations

**Usage:**
```bash
# Check InstantID installation
pnpm check:instantid

# Install InstantID if missing
pnpm install:instantid
```

### Model Scripts (`models/`)

Model download and extraction:

- `download-comfyui-models.py` - Download ComfyUI models from HuggingFace
- `download-comfyui-models.sh` - Shell wrapper for model download
- `download-instantid-controlnet.sh` - Download InstantID ControlNet models
- `extract-comfyui-models-playwright.ts` - Extract model list from ComfyUI Manager (TypeScript)
- `extract-comfyui-models.py` - Extract model list from ComfyUI Manager (Python)
- `list-instantid-files.py` - List InstantID model files

**Usage:**
```bash
# Extract ComfyUI models list
pnpm extract:comfyui-models

# Download models (Python)
python scripts/models/download-comfyui-models.py
```

### Test Scripts (`tests/`)

Testing utilities for various components:

- `test-comfyui-pod.ts` - Test ComfyUI pod functionality
- `test-consistent-mode.ts` - Test consistent mode generation
- `test-db-insert.ts` - Test database insertions
- `test-email-templates.ts` - Test email template rendering
- `test-flux-pulid.ts` - Test Flux + PuLID workflow
- `test-image-insert.sql` - SQL test for image insertion
- `test-minio-storage.ts` - Test MinIO storage operations
- `test-profile-picture-generation.ts` - Test profile picture generation
- `test-profile-picture-workflow.ts` - Test profile picture workflow
- `test-pulid-workflow.ts` - Test PuLID workflow
- `test-runpod-endpoints-manual.sh` - Manual RunPod endpoint testing
- `test-runpod-endpoints.ts` - Automated RunPod endpoint testing
- `test-seedream-4.5.ts` - Test Seedream 4.5 model
- `test-studio-generation.ts` - Test studio image generation

**Usage:**
```bash
# Test RunPod endpoints
pnpm test:runpod

# Test ComfyUI pod
pnpm test:comfyui

# Test MinIO storage
pnpm test:minio

# Test PuLID workflow
pnpm test:pulid

# Test profile pictures
pnpm test:profile-pictures
```

### Generation Scripts (`generation/`)

Image generation utilities:

- `generate-outfit-mode-images.ts` - Generate outfit mode images
- `generate-outfit-piece-thumbnails.ts` - Generate outfit piece thumbnails
- `generate-outfit-thumbnails.ts` - Generate outfit thumbnails
- `generate-pose-thumbnails.ts` - Generate pose thumbnails
- `generate-profile-picture-set.ts` - Generate profile picture sets
- `generate-profile-set-previews.ts` - Generate profile set previews
- `generate-studio-preset-thumbnails.ts` - Generate studio preset thumbnails

**Usage:**
```bash
# Generate profile picture set
pnpm generate:profile-set
```

### Workflow Scripts (`workflows/`)

ComfyUI workflow conversion and automation:

- `automate-comfyui-workflow.ts` - Automate ComfyUI workflow execution
- `convert-comfyui-workflow.ts` - Convert ComfyUI workflow format
- `convert-comfyui-workflows-batch.ts` - Batch convert multiple workflows

**Usage:**
```bash
# Convert single workflow
pnpm workflow:convert

# Convert all workflows
pnpm workflow:convert:all

# Automate workflow execution
pnpm automate:workflow
```

### Utility Scripts (`utils/`)

General utility scripts:

- `analyze-base-character.ts` - Analyze base character images
- `adult-poses-from-mdc.ts` - Extract adult poses from MDC
- `benchmark-image-generation.ts` - Benchmark image generation performance
- `compress-slider-images.py` - Compress slider images for web
- `seed-templates.ts` - Seed database with template data

**Usage:**
```bash
# Compress images
pnpm compress:images

# Benchmark image generation
pnpm benchmark:images

# Seed templates
pnpm seed:templates
```

### Git Scripts (`git/`)

Git-related utilities:

- `migrate-to-git-lfs.sh` - Migrate repository to Git LFS
- `safe-lfs-migration.sh` - Safe Git LFS migration with verification

**Usage:**
```bash
# Safe LFS migration
./scripts/git/safe-lfs-migration.sh
```

### Documentation (`docs/`)

Documentation and configuration files:

- `README.md` - ComfyUI model downloader documentation
- `AUTOMATE-WORKFLOW-README.md` - Workflow automation guide
- `EXTRACT-MODELS-README.md` - Model extraction guide
- `GENERATE-STUDIO-THUMBNAILS-README.md` - Studio thumbnail generation guide
- `GIT-UPLOAD-INSTRUCTIONS.md` - Git upload instructions
- `MODEL-DOWNLOAD-SUMMARY.md` - Model download summary
- `QUICK-START.md` - Quick start guide
- `STUDIO-PRESETS-INVENTORY.md` - Studio presets inventory
- `requirements.txt` - Python dependencies
- `tsconfig.json` - TypeScript configuration
- `benchmarks/` - Benchmark configuration files

## NPM Scripts

All scripts are accessible via npm/pnpm scripts in `package.json`:

```bash
# Setup
pnpm check:instantid
pnpm install:instantid

# Models
pnpm extract:comfyui-models

# Tests
pnpm test:runpod
pnpm test:comfyui
pnpm test:minio
pnpm test:pulid
pnpm test:flux-pulid
pnpm test:consistent-mode
pnpm test:profile-pictures
pnpm test:seedream

# Workflows
pnpm workflow:convert
pnpm workflow:convert:all
pnpm automate:workflow

# Utilities
pnpm compress:images
pnpm benchmark:images
pnpm seed:templates
pnpm generate:profile-set
```

## Running Scripts Directly

### TypeScript Scripts

```bash
# Using tsx (recommended)
tsx scripts/<category>/<script-name>.ts

# Using pnpm
pnpm tsx scripts/<category>/<script-name>.ts
```

### Python Scripts

```bash
# Using python3
python3 scripts/<category>/<script-name>.py

# With virtual environment (if needed)
source venv/bin/activate
python scripts/<category>/<script-name>.py
```

### Shell Scripts

```bash
# Make executable if needed
chmod +x scripts/<category>/<script-name>.sh

# Run
./scripts/<category>/<script-name>.sh
```

## Dependencies

### Python Dependencies

Install Python dependencies:

```bash
pip install -r scripts/docs/requirements.txt
```

### TypeScript Dependencies

TypeScript scripts use project dependencies. Ensure you've run:

```bash
pnpm install
```

## Contributing

When adding new scripts:

1. **Place in appropriate category** - Choose the most relevant subdirectory
2. **Update this README** - Add script to the relevant section
3. **Add npm script** - If commonly used, add to `package.json`
4. **Document usage** - Include usage examples in script comments
5. **Follow naming conventions**:
   - TypeScript: `kebab-case.ts`
   - Python: `kebab-case.py`
   - Shell: `kebab-case.sh`

## See Also

- [Image Optimization Guide](../../docs/technical/guides/IMAGE-OPTIMIZATION.md)
- [Git LFS Setup](../../docs/technical/guides/GIT-LFS-SETUP.md)
- [ComfyUI Testing Guide](../../docs/technical/COMFYUI-TESTING-GUIDE.md)

