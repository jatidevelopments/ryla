# Modal.com Endpoint Testing

> **Last Updated**: 2026-01-27

---

## ⚠️ Important: Host Header Requirement

**Modal.com endpoints require the correct Host header.** Direct `curl` requests may fail with:

```
modal-http: invalid host header
```

This is **expected behavior** - Modal's security layer rejects requests without proper Host headers.

**Solution**: Use HTTP clients that automatically set the Host header:
- ✅ `requests` (Python) - **RECOMMENDED**
- ✅ `fetch()` (JavaScript/Node.js) - May need explicit Host header
- ✅ `curl` with `-H "Host: <correct-host>"` (manual)

**Note**: Some HTTP clients (including `node-fetch`) may not set the Host header correctly. Python's `requests` library is the most reliable option.

---

## Testing Endpoints

### Method 1: Using Test Script

```bash
# Test all endpoints
tsx scripts/workflow-deployer/test-endpoint.ts <endpoint-url>
```

**Example**:
```bash
tsx scripts/workflow-deployer/test-endpoint.ts \
  "https://ryla--ryla-z-image-danrisi-z_image_danrisi-fastapi-app.modal.run"
```

### Method 2: Using Node.js

```javascript
const fetch = require('node-fetch');

// Test health endpoint
const response = await fetch('https://<endpoint>/health', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
});

const data = await response.json();
console.log(data);
```

### Method 3: Using Python

```python
import requests

# Test health endpoint
response = requests.get('https://<endpoint>/health')
print(response.json())
```

### Method 4: Using curl (with Host header)

```bash
# Get the correct host from the URL
ENDPOINT="https://ryla--ryla-z-image-danrisi-z_image_danrisi-fastapi-app.modal.run"
HOST=$(echo $ENDPOINT | sed 's|https://||')

# Test with explicit Host header
curl -H "Host: $HOST" "$ENDPOINT/health"
```

---

## Expected Endpoints

### Root Endpoint
```
GET /
```

**Response**:
```json
{
  "status": "ok",
  "app": "Workflow Name"
}
```

### Health Endpoint
```
GET /health
```

**Response**:
```json
{
  "status": "healthy",
  "app": "Workflow Name"
}
```

### Generate Endpoint
```
POST /generate
Content-Type: application/json

{
  "workflow": {
    "1": {
      "class_type": "SaveImage",
      "inputs": {
        "filename_prefix": "test"
      }
    }
  }
}
```

**Response**:
```json
{
  "images": ["<base64-encoded-image>"],
  "count": 1,
  "format": "base64"
}
```

---

## Common Issues

### Issue: "invalid host header"

**Cause**: Direct curl without Host header

**Solution**: Use proper HTTP client or set Host header manually

### Issue: 400 Bad Request

**Possible Causes**:
1. Missing CORS middleware (should be fixed in generated code)
2. Invalid request format
3. FastAPI app not fully initialized

**Solution**:
1. Check generated code includes CORS middleware
2. Verify request format matches expected schema
3. Wait for app initialization (cold start)

### Issue: 404 Not Found

**Possible Causes**:
1. Wrong endpoint URL
2. App not deployed
3. Route not registered

**Solution**:
1. Verify endpoint URL pattern
2. Check deployment: `modal app list`
3. Review generated code for route registration

### Issue: Timeout

**Possible Causes**:
1. Cold start in progress (2-5 minutes)
2. Workflow execution taking too long
3. Network issues

**Solution**:
1. Wait for cold start to complete
2. Increase timeout for long workflows
3. Check Modal logs for errors

---

## Testing Checklist

- [ ] Root endpoint (`/`) returns 200
- [ ] Health endpoint (`/health`) returns 200
- [ ] Generate endpoint (`/generate`) accepts POST requests
- [ ] Generate endpoint returns valid JSON
- [ ] CORS headers are present (if needed)
- [ ] Error responses are properly formatted
- [ ] Cold start completes within 5 minutes

---

## Related Documentation

- [Endpoint URL Patterns](./ENDPOINT-URL-PATTERNS.md)
- [Best Practices](./BEST-PRACTICES.md)
- [Troubleshooting](./TROUBLESHOOTING.md)

---

**Last Updated**: 2026-01-27
