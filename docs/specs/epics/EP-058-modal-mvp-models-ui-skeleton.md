# EP-058: Modal.com MVP Model Implementation - UI Skeleton

**Initiative**: [IN-020](../../initiatives/IN-020-modal-mvp-models.md)  
**Epic**: [EP-058](../../requirements/epics/mvp/EP-058-modal-mvp-models-requirements.md)  
**Status**: P4 - UI Skeleton  
**Created**: 2025-01-21

---

## Note: Backend-Only Epic

This epic is **backend-only** (no frontend UI components). This document focuses on:
- API contracts and usage patterns
- Client script interactions
- Future frontend integration points
- API response handling

---

## API Endpoints Overview

### Endpoint List

| Endpoint | Method | Purpose | Response Type |
|----------|--------|---------|---------------|
| `/flux-dev` | POST | Flux Dev text-to-image | `image/jpeg` |
| `/flux-instantid` | POST | Flux Dev + InstantID face consistency | `image/jpeg` |
| `/flux-lora` | POST | Flux Dev + LoRA character generation | `image/jpeg` |
| `/workflow` | POST | Custom ComfyUI workflow | `image/jpeg` or `image/webp` |

---

## Client Interaction Patterns

### Pattern 1: Flux Dev Text-to-Image

**Use Case**: Generate base image without face consistency

**Client Script Flow**:
```
1. User/script calls ryla_client.py flux-dev
2. Client constructs request:
   {
     "prompt": "A beautiful landscape",
     "width": 1024,
     "height": 1024,
     "steps": 20,
     "cfg": 1.0
   }
3. Client sends POST to /flux-dev endpoint
4. Client waits for response (polling or async)
5. Client receives image/jpeg bytes
6. Client saves to file
```

**Success State**:
- HTTP 200 OK
- Content-Type: image/jpeg
- Image bytes received
- File saved successfully

**Failure States**:
- HTTP 400: Invalid parameters (prompt missing, invalid dimensions)
- HTTP 500: Generation failed (model error, timeout)
- Network error: Connection failed, retry logic needed

**Analytics Events**:
- `modal_flux_dev_generation_requested` - On request
- `modal_flux_dev_generation_completed` - On success
- `modal_flux_dev_generation_failed` - On failure

---

### Pattern 2: InstantID Face Consistency

**Use Case**: Generate image with face consistency (85-90% match)

**Client Script Flow**:
```
1. User/script calls ryla_client.py flux-instantid
2. Client loads reference image (base64 encode)
3. Client constructs request:
   {
     "prompt": "A portrait in a studio",
     "reference_image": "data:image/jpeg;base64,...",
     "instantid_strength": 0.8,
     "controlnet_strength": 0.8
   }
4. Client sends POST to /flux-instantid endpoint
5. Client waits for response
6. Client receives image/jpeg bytes
7. Client saves to file
```

**Success State**:
- HTTP 200 OK
- Content-Type: image/jpeg
- Image bytes received
- Face consistency ~85-90% (validated separately)

**Failure States**:
- HTTP 400: Missing reference_image, invalid strength values
- HTTP 500: InstantID model error, face detection failed
- Network error: Connection failed

**Analytics Events**:
- `modal_instantid_generation_requested` - On request
- `modal_instantid_generation_completed` - On success
- `modal_instantid_face_consistency_measured` - On completion (optional)

---

### Pattern 3: LoRA Character Generation

**Use Case**: Generate image with character-specific LoRA (>95% consistency)

**Client Script Flow**:
```
1. User/script calls ryla_client.py flux-lora
2. Client constructs request:
   {
     "prompt": "A character in a fantasy setting",
     "lora_id": "character-123",
     "lora_strength": 1.0,
     "trigger_word": "ryla_character"
   }
3. Client sends POST to /flux-lora endpoint
4. Client waits for response
5. Client receives image/jpeg bytes
6. Client saves to file
```

**Success State**:
- HTTP 200 OK
- Content-Type: image/jpeg
- Image bytes received
- LoRA loaded successfully
- Character consistency >95%

**Failure States**:
- HTTP 400: Missing lora_id, invalid lora_strength
- HTTP 404: LoRA not found on volume
- HTTP 500: LoRA load error, generation failed

**Analytics Events**:
- `modal_lora_loaded` - On LoRA load
- `modal_lora_generation_completed` - On success
- `modal_lora_load_failed` - On LoRA load failure

---

### Pattern 4: Custom Workflow

**Use Case**: Execute any ComfyUI workflow JSON

**Client Script Flow**:
```
1. User/script calls ryla_client.py workflow
2. Client loads workflow JSON file
3. Client constructs request:
   {
     "workflow": {...},
     "prompt": "Optional prompt to inject"
   }
4. Client sends POST to /workflow endpoint
5. Client waits for response
6. Client receives image bytes (type depends on workflow)
7. Client saves to file
```

**Success State**:
- HTTP 200 OK
- Content-Type: image/jpeg or image/webp
- Output bytes received
- Workflow executed successfully

**Failure States**:
- HTTP 400: Invalid workflow JSON, missing nodes
- HTTP 500: Workflow execution error, node not found

**Analytics Events**:
- `modal_workflow_executed` - On request
- `modal_workflow_completed` - On success
- `modal_workflow_failed` - On failure

---

## Client Script Components

### Component: `ryla_client.py`

**Purpose**: Unified client script for all Modal endpoints

**Structure**:
```python
# apps/modal/ryla_client.py

import argparse
import requests
import base64
from pathlib import Path

def flux_dev(args):
    """Flux Dev text-to-image generation"""
    # Construct request
    # Send to /flux-dev
    # Save image

def flux_instantid(args):
    """Flux Dev + InstantID face consistency"""
    # Load reference image
    # Construct request
    # Send to /flux-instantid
    # Save image

def flux_lora(args):
    """Flux Dev + LoRA generation"""
    # Construct request
    # Send to /flux-lora
    # Save image

def workflow(args):
    """Custom workflow execution"""
    # Load workflow JSON
    # Construct request
    # Send to /workflow
    # Save output

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers()
    
    # Add subcommands
    # Parse args
    # Call appropriate function
```

**Interactions**:
- Reads command-line arguments
- Constructs HTTP requests
- Handles responses (success/failure)
- Saves output files
- Logs errors

---

## Future Frontend Integration Points

### Integration Point 1: Content Studio (EP-005)

**Location**: `apps/web/app/influencer/[id]/studio/page.tsx`

**Integration Pattern**:
```typescript
// When user clicks "Generate" button
async function handleGenerate() {
  // 1. Check if LoRA is ready
  if (character.loraStatus === 'ready') {
    // Use /flux-lora endpoint
    const response = await fetch('/api/modal/flux-lora', {
      method: 'POST',
      body: JSON.stringify({
        prompt: generatedPrompt,
        lora_id: `character-${character.id}`,
        lora_strength: 1.0
      })
    });
  } else {
    // Use /flux-instantid endpoint (face swap mode)
    const response = await fetch('/api/modal/flux-instantid', {
      method: 'POST',
      body: JSON.stringify({
        prompt: generatedPrompt,
        reference_image: character.baseImageUrl,
        instantid_strength: 0.8
      })
    });
  }
  
  // 2. Handle response
  if (response.ok) {
    const imageBlob = await response.blob();
    // Display image in gallery
  } else {
    // Show error message
  }
}
```

**UI States**:
- **Loading**: Show spinner, disable generate button
- **Success**: Display generated image in gallery
- **Error**: Show error message, allow retry

**Analytics Events**:
- Frontend events (studio_generation_started, studio_generation_completed)
- Backend events (modal_* events) - fired by Modal app

---

### Integration Point 2: Character Sheet Generation

**Location**: Background job (character creation wizard)

**Integration Pattern**:
```typescript
// Background job: Generate character sheet
async function generateCharacterSheet(baseImageId: string) {
  // Use /flux-instantid endpoint to generate 7-10 variations
  for (let i = 0; i < 10; i++) {
    const response = await fetch('/api/modal/flux-instantid', {
      method: 'POST',
      body: JSON.stringify({
        prompt: generateVariationPrompt(i),
        reference_image: baseImageUrl,
        instantid_strength: 0.8
      })
    });
    
    // Save image to storage
    // Add to character sheet collection
  }
}
```

**UI States**:
- **Progress**: Show "Generating character sheet..." with progress indicator
- **Complete**: Character sheet ready, LoRA training can start
- **Error**: Show error, allow retry

---

## Error Handling Patterns

### Client-Side Error Handling

**Network Errors**:
```python
try:
    response = requests.post(endpoint_url, json=payload, timeout=120)
    response.raise_for_status()
except requests.exceptions.Timeout:
    # Handle timeout (generation took too long)
    print("Generation timeout - try again")
except requests.exceptions.HTTPError as e:
    if e.response.status_code == 400:
        # Invalid parameters
        print(f"Invalid request: {e.response.text}")
    elif e.response.status_code == 500:
        # Server error
        print("Server error - try again later")
except requests.exceptions.RequestException as e:
    # Network error
    print(f"Network error: {e}")
```

**Response Validation**:
```python
if response.status_code == 200:
    content_type = response.headers.get('Content-Type', '')
    if 'image/jpeg' in content_type or 'image/webp' in content_type:
        # Valid image response
        with open(output_path, 'wb') as f:
            f.write(response.content)
    else:
        # Unexpected content type
        print(f"Unexpected content type: {content_type}")
```

---

## State Management (Future Frontend)

### State: Generation Request

```typescript
interface GenerationRequest {
  status: 'idle' | 'loading' | 'success' | 'error';
  imageUrl?: string;
  error?: string;
  progress?: number; // 0-100
}
```

### State Transitions

```
idle → loading → success
idle → loading → error
loading → success (with imageUrl)
loading → error (with error message)
```

---

## Interaction → Event Mapping

### Client Script Interactions

| Interaction | Event | Properties |
|------------|-------|------------|
| Script starts generation | `modal_{workflow}_generation_requested` | workflow_type, prompt_length, params |
| Generation succeeds | `modal_{workflow}_generation_completed` | workflow_type, generation_time_ms |
| Generation fails | `modal_{workflow}_generation_failed` | workflow_type, error_type, error_message |
| LoRA loaded | `modal_lora_loaded` | lora_id, lora_size_mb, load_time_ms |

### Future Frontend Interactions

| Interaction | Event | Properties |
|------------|-------|------------|
| User clicks "Generate" | `studio_generation_started` | character_id, workflow_type |
| Generation completes | `studio_generation_completed` | character_id, workflow_type, image_id |
| Generation fails | `studio_generation_failed` | character_id, workflow_type, error |

---

## API Response Handling

### Success Response

**Structure**:
```
HTTP/1.1 200 OK
Content-Type: image/jpeg
Content-Length: 123456

[Image bytes]
```

**Client Handling**:
1. Check status code (200)
2. Verify Content-Type (image/jpeg or image/webp)
3. Read response body as bytes
4. Save to file
5. Fire success analytics event

---

### Error Response

**Structure**:
```
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": "Invalid request parameters",
  "details": "prompt is required"
}
```

**Client Handling**:
1. Check status code (400, 500, etc.)
2. Parse JSON error response
3. Display error message
4. Fire failure analytics event
5. Allow retry (if appropriate)

---

## Testing Interactions

### Manual Testing Flow

1. **Test Flux Dev**:
   ```bash
   python apps/modal/ryla_client.py flux-dev \
     --prompt "A beautiful landscape" \
     --output test_flux.jpg
   ```

2. **Test InstantID**:
   ```bash
   python apps/modal/ryla_client.py flux-instantid \
     --prompt "A portrait" \
     --reference-image reference.jpg \
     --output test_instantid.jpg
   ```

3. **Test LoRA**:
   ```bash
   python apps/modal/ryla_client.py flux-lora \
     --prompt "A character" \
     --lora-id character-123 \
     --output test_lora.jpg
   ```

---

## Phase 4 Completion Checklist

- [x] API endpoints documented
- [x] Client interaction patterns defined
- [x] Success/failure states documented
- [x] Error handling patterns defined
- [x] Future frontend integration points identified
- [x] Analytics event mapping defined
- [x] Testing interactions documented

**Phase 4 Status**: ✅ Complete

**Ready for Phase 5**: Technical Spec & File Plan

---

## References

- Architecture: `docs/architecture/epics/EP-058-modal-mvp-models-architecture.md`
- Requirements: `docs/requirements/epics/mvp/EP-058-modal-mvp-models-requirements.md`
- Initiative: `docs/initiatives/IN-020-modal-mvp-models.md`
