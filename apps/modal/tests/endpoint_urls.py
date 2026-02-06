"""
Shared endpoint URL helpers for Modal tests.

Uses split-app layout. Must stay in sync with apps/modal/ENDPOINT-APP-MAPPING.md.
"""

# Endpoint path -> Modal app name (split apps)
ENDPOINT_APP_MAP = {
    "/flux": "ryla-flux",
    "/flux-dev": "ryla-flux",
    "/flux-dev-lora": "ryla-flux",
    "/sdxl-instantid": "ryla-instantid",
    "/sdxl-turbo": "ryla-instantid",
    "/sdxl-lightning": "ryla-instantid",
    "/flux-pulid": "ryla-instantid",
    "/flux-ipadapter-faceid": "ryla-instantid",
    "/qwen-image-2512": "ryla-qwen-image",
    "/qwen-image-2512-fast": "ryla-qwen-image",
    "/qwen-image-2512-lora": "ryla-qwen-image",
    "/video-faceswap": "ryla-qwen-image",
    "/qwen-image-edit-2511": "ryla-qwen-edit",
    "/qwen-image-inpaint-2511": "ryla-qwen-edit",
    "/z-image-simple": "ryla-z-image",
    "/z-image-danrisi": "ryla-z-image",
    "/z-image-lora": "ryla-z-image",
    "/wan2.6": "ryla-wan26",
    "/wan2.6-r2v": "ryla-wan26",
    "/wan2.6-lora": "ryla-wan26",
    "/seedvr2": "ryla-seedvr2",
}


def get_base_url(workspace: str, app_name: str) -> str:
    """Return base URL for a Modal app (split-app layout)."""
    return f"https://{workspace}--{app_name}-comfyui-fastapi-app.modal.run"


def get_endpoint_url(workspace: str, path: str) -> str:
    """Return full URL for an endpoint path. Path must start with /."""
    path = path if path.startswith("/") else f"/{path}"
    app_name = ENDPOINT_APP_MAP.get(path, "ryla-flux")
    return f"{get_base_url(workspace, app_name)}{path}"
