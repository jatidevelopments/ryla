# RunPod Deployment Commands

> Quick reference for deploying RunPod infrastructure via MCP or Console

## Network Volume

```bash
# Create Network Volume (requires $5+ balance)
Name: ryla-models-dream-companion
Size: 200GB
Data Center: US-OR-1
```

## ComfyUI Pod

```bash
# Create ComfyUI Pod
Name: ryla-comfyui-dream-companion
Image: runpod/pytorch:2.1.0-py3.10-cuda11.8.0-devel
GPU: NVIDIA GeForce RTX 3090
Container Disk: 50GB
Network Volume: ryla-models-dream-companion (mount)
Ports: 8188/http
Cloud Type: SECURE
```

## Serverless Endpoint Template

```bash
# Create Template (for Serverless Endpoint)
Name: ryla-image-generation-handler
Image: python:3.10 (with diffusers, torch, transformers)
```

## Serverless Endpoint

```bash
# Create Serverless Endpoint
Name: ryla-image-generation
Template: ryla-image-generation-handler
GPU: NVIDIA GeForce RTX 3090
Network Volume: ryla-models-dream-companion
Workers: Min 0, Max 2
```

## MCP Commands

Once account is funded, use these MCP commands:

```bash
# Create Network Volume
Create a 200GB network volume named ryla-models-dream-companion in US-OR-1

# Create ComfyUI Pod
Create a RunPod pod named ryla-comfyui-dream-companion with GPU type NVIDIA GeForce RTX 3090

# List resources
List all my RunPod network volumes
List all my RunPod pods
List all my RunPod serverless endpoints
```

## Status Check

After deployment, verify:

```bash
# Check Network Volume
Get network volume: ryla-models-dream-companion

# Check Pod
Get pod: <pod-id>
# Check HTTP link for ComfyUI access

# Check Endpoint
Get endpoint: <endpoint-id>
```

