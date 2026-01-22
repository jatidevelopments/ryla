# YouTube Tools MCP Troubleshooting Guide

## Common Issues & Solutions

### 1. Error: "No transcript available" or "Subtitles disabled"

**Possible Causes:**
- Video doesn't have captions/subtitles enabled
- Auto-generated captions not available
- Language code mismatch

**Solutions:**
```bash
# Check if video has captions
python3 -m yt_dlp --list-subs "https://www.youtube.com/watch?v=VIDEO_ID"

# Try different language codes
# In MCP tool, specify language: "en", "en-US", "en-GB", etc.
```

### 2. Error: "Sign in to confirm you're not a bot" / Rate Limiting

**Possible Causes:**
- YouTube blocking requests (IP-based)
- Too many requests in short time
- Missing authentication cookies

**Solutions:**
```bash
# Update yt-dlp to latest version
pip3 install --upgrade yt-dlp

# Use browser cookies (if MCP supports it)
# Add to MCP config: --cookies-from-browser chrome
```

### 3. MCP Server Configuration Issues

**Check Configuration:**
```json
{
  "mcpServers": {
    "youtube-tools": {
      "command": "npx",
      "args": ["-y", "@fabriqa.ai/youtube-transcript-mcp"],
      // OR
      "args": ["-y", "youtube-transcript-mcp"]
    }
  }
}
```

**Common Packages:**
- `@fabriqa.ai/youtube-transcript-mcp` (v1.0.3) - Recommended
- `youtube-transcript-mcp` (v0.1.5)
- `@iflow-mcp/youtube-transcript-mcp` (v0.0.1)

### 4. Video Too Long / Token Limits

**Issue:** Videos exceeding 25,000 tokens may fail

**Solutions:**
- Request transcript without timestamps (reduces size by ~20-30%)
- Split long videos into segments
- Use `get_transcript_languages` to check available languages first

### 5. Diagnostic Steps

1. **Check Video Captions:**
   ```bash
   python3 -m yt_dlp --list-subs "https://www.youtube.com/watch?v=VIDEO_ID"
   ```

2. **Test Direct Extraction:**
   ```bash
   python3 -m yt_dlp --write-auto-sub --sub-lang en --skip-download "https://www.youtube.com/watch?v=VIDEO_ID"
   ```

3. **Check MCP Server Logs:**
   - Look for error messages in Cursor MCP output
   - Check for HTTP status codes (403, 410, etc.)

4. **Verify Package Installation:**
   ```bash
   npm list -g | grep youtube-transcript
   ```

## Recommended MCP Package

**@fabriqa.ai/youtube-transcript-mcp** (v1.0.3)
- Most actively maintained
- Better error handling
- Supports multiple languages
- Token limit handling

**Installation:**
```json
{
  "mcpServers": {
    "youtube-tools": {
      "command": "npx",
      "args": ["-y", "@fabriqa.ai/youtube-transcript-mcp"]
    }
  }
}
```

## Alternative: Manual Extraction

If MCP continues to fail, use yt-dlp directly:

```bash
# Extract transcript
python3 -m yt_dlp --write-auto-sub --sub-lang en --skip-download \
  --sub-format vtt "https://www.youtube.com/watch?v=VIDEO_ID"

# Convert VTT to text (if needed)
# VTT files are in same directory as download
```

## Related Documentation

- YouTube Videos Research: `docs/research/youtube-videos/README.md`
- MCP Configuration: `.cursor/mcp.json.example`
- MCP Setup: `.cursor/README.md`
