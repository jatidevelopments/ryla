# ComfyUI Model List Extractor

Extract the complete list of all available models from ComfyUI Manager on your RunPod server.

## Quick Start

```bash
# 1. Install dependencies
pip install -r scripts/docs/requirements.txt
playwright install chromium

# 2. Run the extraction script
python scripts/models/extract-comfyui-models.py
```

## What It Does

1. **Opens ComfyUI** in a browser (Chromium)
2. **Navigates** to Settings → ComfyUI Manager → Model Manager
3. **Scrolls** through the entire model list to load all 509+ models
4. **Extracts** model data: ID, Name, Size, Type, Base
5. **Saves** to JSON, CSV, and Markdown formats

## Output Files

All files are saved to `docs/ops/runpod/` by default:

- `comfyui-models-{timestamp}.json` - Full structured data
- `comfyui-models-{timestamp}.csv` - Spreadsheet format
- `comfyui-models-{timestamp}.md` - Markdown table

## Usage Examples

### Basic Usage

```bash
python scripts/models/extract-comfyui-models.py
```

### Headless Mode (No Browser Window)

```bash
python scripts/models/extract-comfyui-models.py --headless
```

### Custom Server URL

```bash
python scripts/models/extract-comfyui-models.py --url https://your-server.com
```

### Custom Output Directory

```bash
python scripts/models/extract-comfyui-models.py --output-dir ./my-output
```

### Slow Mode (For Debugging)

```bash
python scripts/models/extract-comfyui-models.py --slow-mo 500
```

## Troubleshooting

### "playwright not found"

```bash
pip install playwright
playwright install chromium
```

### "No models extracted"

- The page structure may have changed
- Check the debug screenshot in the output directory
- Try running without `--headless` to see what's happening
- Ensure the ComfyUI server is accessible

### Browser doesn't open

- Make sure you're not using `--headless` if you want to see the browser
- Check that Playwright browsers are installed: `playwright install chromium`

### Timeout errors

- The server may be slow to respond
- Try increasing timeouts in the script
- Check your internet connection

## Output Format

### JSON Structure

```json
{
  "extracted_at": "2025-12-19T00:00:00",
  "total_models": 509,
  "models": [
    {
      "id": "1",
      "name": "Model Name",
      "size": "2.5GB",
      "type": "lora",
      "base": "SDXL"
    }
  ]
}
```

### CSV Columns

- ID
- Name
- Size
- Type
- Base

### Markdown Table

Formatted as a GitHub-compatible markdown table.

## Integration

The extracted data can be used to:

- Update `docs/ops/runpod/COMFYUI-AVAILABLE-MODELS.md`
- Generate model installation scripts
- Track model availability over time
- Create model recommendation systems

## See Also

- [ComfyUI Available Models](../docs/ops/runpod/COMFYUI-AVAILABLE-MODELS.md)
- [Model Downloader Script](../models/download-comfyui-models.py)
- [Scripts README](./README.md)
