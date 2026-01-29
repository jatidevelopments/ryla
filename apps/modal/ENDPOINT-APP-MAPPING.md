# Endpoint to App Mapping

**Date**: 2026-01-28  
**Purpose**: Map endpoints to their corresponding Modal apps after splitting

---

## App URLs

| App | App Name | Base URL |
|-----|----------|----------|
| **Flux** | `ryla-flux` | `https://ryla--ryla-flux-comfyui-fastapi-app.modal.run` |
| **Wan2** | `ryla-wan2` | `https://ryla--ryla-wan2-comfyui-fastapi-app.modal.run` |
| **SeedVR2** | `ryla-seedvr2` | `https://ryla--ryla-seedvr2-comfyui-fastapi-app.modal.run` |
| **InstantID** | `ryla-instantid` | `https://ryla--ryla-instantid-comfyui-fastapi-app.modal.run` |
| **Z-Image** | `ryla-z-image` | `https://ryla--ryla-z-image-comfyui-fastapi-app.modal.run` |

---

## Endpoint Mapping

| Endpoint | App | Full URL |
|----------|-----|----------|
| `/flux` | `ryla-flux` | `https://ryla--ryla-flux-comfyui-fastapi-app.modal.run/flux` |
| `/flux-dev` | `ryla-flux` | `https://ryla--ryla-flux-comfyui-fastapi-app.modal.run/flux-dev` |
| `/wan2` | `ryla-wan2` | `https://ryla--ryla-wan2-comfyui-fastapi-app.modal.run/wan2` |
| `/seedvr2` | `ryla-seedvr2` | `https://ryla--ryla-seedvr2-comfyui-fastapi-app.modal.run/seedvr2` |
| `/flux-instantid` | `ryla-instantid` | `https://ryla--ryla-instantid-comfyui-fastapi-app.modal.run/flux-instantid` |
| `/sdxl-instantid` | `ryla-instantid` | `https://ryla--ryla-instantid-comfyui-fastapi-app.modal.run/sdxl-instantid` |
| `/flux-ipadapter-faceid` | `ryla-instantid` | `https://ryla--ryla-instantid-comfyui-fastapi-app.modal.run/flux-ipadapter-faceid` |
| `/z-image-simple` | `ryla-z-image` | `https://ryla--ryla-z-image-comfyui-fastapi-app.modal.run/z-image-simple` |
| `/z-image-danrisi` | `ryla-z-image` | `https://ryla--ryla-z-image-comfyui-fastapi-app.modal.run/z-image-danrisi` |
| `/z-image-instantid` | `ryla-z-image` | `https://ryla--ryla-z-image-comfyui-fastapi-app.modal.run/z-image-instantid` |
| `/z-image-pulid` | `ryla-z-image` | `https://ryla--ryla-z-image-comfyui-fastapi-app.modal.run/z-image-pulid` |

---

## Helper Function

```python
def get_endpoint_url(endpoint: str, workspace: str = "ryla") -> str:
    """Get the full URL for an endpoint."""
    endpoint_app_map = {
        "/flux": "ryla-flux",
        "/flux-dev": "ryla-flux",
        "/wan2": "ryla-wan2",
        "/seedvr2": "ryla-seedvr2",
        "/flux-instantid": "ryla-instantid",
        "/sdxl-instantid": "ryla-instantid",
        "/flux-ipadapter-faceid": "ryla-instantid",
        "/z-image-simple": "ryla-z-image",
        "/z-image-danrisi": "ryla-z-image",
        "/z-image-instantid": "ryla-z-image",
        "/z-image-pulid": "ryla-z-image",
    }
    
    app_name = endpoint_app_map.get(endpoint)
    if not app_name:
        raise ValueError(f"Unknown endpoint: {endpoint}")
    
    base_url = f"https://{workspace}--{app_name}-comfyui-fastapi-app.modal.run"
    return f"{base_url}{endpoint}"
```

---

**Last Updated**: 2026-01-28
