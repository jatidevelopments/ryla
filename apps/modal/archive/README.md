# Archive Directory

This directory contains old/duplicate files that have been replaced by the new modular structure.

## Archived Files

### Main App Files
- `comfyui_ryla.py` (69,565 lines) - Original monolithic app, replaced by modular structure
- `comfyui_danrisi.py` (50,726 lines) - Z-Image-Turbo implementation
- `comfyui_danrisi_backup.py` - Backup of danrisi implementation
- `comfyui_danrisi_fixed.py` - Fixed version of danrisi implementation
- `comfyui_z_image_turbo.py` (43,576 lines) - Z-Image-Turbo implementation

### Client Files
- `comfyclient_flux.py` - Old Flux client
- `comfyclient_wan2.py` - Old Wan2 client

## New Structure

All functionality has been moved to:
- `app.py` - Main entry point (~100 lines)
- `config.py` - Configuration (~50 lines)
- `image.py` - Image build (~400 lines)
- `handlers/*.py` - Workflow handlers (~200-300 lines each)
- `utils/*.py` - Utilities (~100-150 lines each)

## Migration Date

2026-01-21 - EP-059 Modal Code Organization
