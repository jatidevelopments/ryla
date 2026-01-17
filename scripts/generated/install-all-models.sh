#!/bin/bash
set -e

COMFYUI_PATH="${COMFYUI_PATH:-/workspace/ComfyUI}"
MODELS_PATH="${MODELS_PATH:-/runpod-volume/models}"

echo "== RYLA ComfyUI Dependency Installer =="

download_model() {
  local url="$1"
  local target="$2"
  if [ -f "$target" ]; then
    echo "✅ Found $target"
    return 0
  fi
  echo "📥 Downloading $url -> $target"
  mkdir -p "$(dirname "$target")"
  wget -q --show-progress "$url" -O "$target"
}

echo "Installing ComfyUI Manager nodes..."
comfy-node-install res4lyf controlaltai-nodes

echo "Installing GitHub custom nodes..."
mkdir -p "${COMFYUI_PATH}/custom_nodes"
cd "${COMFYUI_PATH}/custom_nodes"
if [ ! -d "ComfyUI_PuLID" ]; then
  git clone https://github.com/cubiq/ComfyUI_PuLID.git ComfyUI_PuLID
fi
cd "ComfyUI_PuLID"
git fetch --all --tags
git checkout main
if [ -f "requirements.txt" ]; then
  pip install -r requirements.txt
fi
cd "${COMFYUI_PATH}/custom_nodes"
if [ ! -d "ComfyUI_InstantID" ]; then
  git clone https://github.com/cubiq/ComfyUI_InstantID.git ComfyUI_InstantID
fi
cd "ComfyUI_InstantID"
git fetch --all --tags
git checkout main
if [ -f "requirements.txt" ]; then
  pip install -r requirements.txt
fi
cd "${COMFYUI_PATH}/custom_nodes"
if [ ! -d "LoadImageBase64-ComfyUI" ]; then
  git clone https://github.com/Extraltodeus/LoadImageBase64-ComfyUI.git LoadImageBase64-ComfyUI
fi
cd "LoadImageBase64-ComfyUI"
git fetch --all --tags
git checkout main
if [ -f "requirements.txt" ]; then
  pip install -r requirements.txt
fi
cd "${COMFYUI_PATH}/custom_nodes"

echo "Downloading models..."
download_model "https://huggingface.co/Comfy-Org/z_image_turbo/resolve//split_files/diffusion_models/z_image_turbo_bf16.safetensors" "${MODELS_PATH}/diffusion_models/z_image_turbo_bf16.safetensors"
download_model "https://huggingface.co/Comfy-Org/z_image_turbo/resolve//split_files/text_encoders/qwen_3_4b.safetensors" "${MODELS_PATH}/text_encoders/qwen_3_4b.safetensors"
download_model "https://huggingface.co/Comfy-Org/z_image_turbo/resolve//split_files/vae/z-image-turbo-vae.safetensors" "${MODELS_PATH}/vae/z-image-turbo-vae.safetensors"
download_model "https://huggingface.co/black-forest-labs/FLUX.1-dev/resolve/19debd50d8f431809f22ec7c20cafdda4a861e78/flux1-dev.safetensors" "${MODELS_PATH}/diffusion_models/flux1-dev.safetensors"
download_model "https://huggingface.co/black-forest-labs/FLUX.1-schnell/resolve/a91e3eb2eef4318d354cdf34c0f93e0a8468be7c/flux1-schnell.safetensors" "${MODELS_PATH}/diffusion_models/flux1-schnell.safetensors"
download_model "https://huggingface.co/black-forest-labs/FLUX.1-dev/resolve//text_encoder/clip_l.safetensors" "${MODELS_PATH}/text_encoders/clip_l.safetensors"
download_model "https://huggingface.co/black-forest-labs/FLUX.1-dev/resolve//text_encoder/t5xxl_fp16.safetensors" "${MODELS_PATH}/text_encoders/t5xxl_fp16.safetensors"
download_model "https://huggingface.co/black-forest-labs/FLUX.1-dev/resolve//vae/ae.safetensors" "${MODELS_PATH}/vae/ae.safetensors"
download_model "https://huggingface.co/huchenlei/PuLID/resolve//pulid_flux_v0.9.1.safetensors" "${MODELS_PATH}/pulid/pulid_flux_v0.9.1.safetensors"
download_model "https://huggingface.co/QuanSun/EVA-CLIP/resolve/ea0ba9075b54a7fec1ee6ebb5eff0557c511d347/EVA02_CLIP_L_336_psz14_s6B.pt" "${MODELS_PATH}/clip/eva02_clip_l_14_plus.safetensors"
download_model "https://huggingface.co/InstantX/InstantID/resolve/55c98e90c7047768538ad83e8f06f44c017fc329/ip-adapter.bin" "${MODELS_PATH}/instantid/ip-adapter.bin"
download_model "https://huggingface.co/InstantX/InstantID/resolve//diffusion_pytorch_model.safetensors" "${MODELS_PATH}/controlnet/diffusion_pytorch_model.safetensors"

echo "✅ Dependency setup complete!"