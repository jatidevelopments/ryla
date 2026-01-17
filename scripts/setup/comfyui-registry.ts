import { ModelSource, NodeInstallSource } from './types';

export const COMFYUI_NODE_REGISTRY: Record<string, NodeInstallSource> = {
  "res4lyf": {
    "managerPackage": "res4lyf",
    "expectedVersion": "latest",
    "verified": false,
    "error": "TypeError: registry.find is not a function",
    "lastVerified": "2026-01-15T13:41:58.026Z"
  },
  "controlaltai-nodes": {
    "managerPackage": "controlaltai-nodes",
    "expectedVersion": "latest",
    "verified": false,
    "error": "TypeError: registry.find is not a function",
    "lastVerified": "2026-01-15T13:41:58.126Z"
  },
  "ComfyUI_PuLID": {
    "gitRepo": {
      "url": "https://github.com/cubiq/ComfyUI_PuLID.git",
      "version": "main"
    },
    "verified": false,
    "error": "AxiosError: Request failed with status code 401",
    "availableVersions": [],
    "lastVerified": "2026-01-15T13:42:05.195Z"
  },
  "ComfyUI_InstantID": {
    "gitRepo": {
      "url": "https://github.com/cubiq/ComfyUI_InstantID.git",
      "version": "main"
    },
    "verified": true,
    "error": "AxiosError: Request failed with status code 401",
    "availableVersions": [],
    "lastVerified": "2026-01-15T13:42:05.195Z"
  },
  "LoadImageBase64-ComfyUI": {
    "gitRepo": {
      "url": "https://github.com/Extraltodeus/LoadImageBase64-ComfyUI.git",
      "version": "main"
    },
    "verified": false,
    "error": "AxiosError: Request failed with status code 401",
    "availableVersions": [],
    "lastVerified": "2026-01-15T13:42:12.224Z"
  }
};

export const COMFYUI_MODEL_REGISTRY: Record<string, ModelSource> = {
  "z_image_turbo_bf16.safetensors": {
    "huggingface": {
      "repo": "Comfy-Org/z_image_turbo",
      "file": "split_files/diffusion_models/z_image_turbo_bf16.safetensors",
      "path": "diffusion_models",
      "commit": ""
    },
    "verified": false,
    "fileSize": 0,
    "downloadUrl": "",
    "lastVerified": "2026-01-15T13:42:12.523Z"
  },
  "qwen_3_4b.safetensors": {
    "huggingface": {
      "repo": "Comfy-Org/z_image_turbo",
      "file": "split_files/text_encoders/qwen_3_4b.safetensors",
      "path": "text_encoders",
      "commit": ""
    },
    "verified": false,
    "fileSize": 0,
    "downloadUrl": "",
    "lastVerified": "2026-01-15T13:42:12.686Z"
  },
  "z-image-turbo-vae.safetensors": {
    "huggingface": {
      "repo": "Comfy-Org/z_image_turbo",
      "file": "split_files/vae/z-image-turbo-vae.safetensors",
      "path": "vae",
      "commit": ""
    },
    "verified": false,
    "fileSize": 0,
    "downloadUrl": "",
    "lastVerified": "2026-01-15T13:42:12.852Z"
  },
  "flux1-dev.safetensors": {
    "huggingface": {
      "repo": "black-forest-labs/FLUX.1-dev",
      "file": "flux1-dev.safetensors",
      "path": "diffusion_models",
      "commit": "19debd50d8f431809f22ec7c20cafdda4a861e78"
    },
    "verified": true,
    "fileSize": 23802932552,
    "downloadUrl": "https://huggingface.co/black-forest-labs/FLUX.1-dev/resolve/19debd50d8f431809f22ec7c20cafdda4a861e78/flux1-dev.safetensors",
    "lastVerified": "2026-01-15T13:42:12.852Z"
  },
  "flux1-schnell.safetensors": {
    "huggingface": {
      "repo": "black-forest-labs/FLUX.1-schnell",
      "file": "flux1-schnell.safetensors",
      "path": "diffusion_models",
      "commit": "a91e3eb2eef4318d354cdf34c0f93e0a8468be7c"
    },
    "verified": true,
    "fileSize": 23782506688,
    "downloadUrl": "https://huggingface.co/black-forest-labs/FLUX.1-schnell/resolve/a91e3eb2eef4318d354cdf34c0f93e0a8468be7c/flux1-schnell.safetensors",
    "lastVerified": "2026-01-15T13:42:12.853Z"
  },
  "clip_l.safetensors": {
    "huggingface": {
      "repo": "black-forest-labs/FLUX.1-dev",
      "file": "text_encoder/clip_l.safetensors",
      "path": "text_encoders",
      "commit": ""
    },
    "verified": false,
    "fileSize": 0,
    "downloadUrl": "",
    "lastVerified": "2026-01-15T13:42:13.023Z"
  },
  "t5xxl_fp16.safetensors": {
    "huggingface": {
      "repo": "black-forest-labs/FLUX.1-dev",
      "file": "text_encoder/t5xxl_fp16.safetensors",
      "path": "text_encoders",
      "commit": ""
    },
    "verified": false,
    "fileSize": 0,
    "downloadUrl": "",
    "lastVerified": "2026-01-15T13:42:13.192Z"
  },
  "ae.safetensors": {
    "huggingface": {
      "repo": "black-forest-labs/FLUX.1-dev",
      "file": "vae/ae.safetensors",
      "path": "vae",
      "commit": ""
    },
    "verified": false,
    "fileSize": 0,
    "downloadUrl": "",
    "lastVerified": "2026-01-15T13:42:13.365Z"
  },
  "pulid_flux_v0.9.1.safetensors": {
    "huggingface": {
      "repo": "huchenlei/PuLID",
      "file": "pulid_flux_v0.9.1.safetensors",
      "path": "pulid",
      "commit": ""
    },
    "verified": false,
    "error": "AxiosError: Request failed with status code 401",
    "fileSize": 0,
    "downloadUrl": "",
    "lastVerified": "2026-01-15T13:42:21.213Z"
  },
  "eva02_clip_l_14_plus.safetensors": {
    "huggingface": {
      "repo": "QuanSun/EVA-CLIP",
      "file": "EVA02_CLIP_L_336_psz14_s6B.pt",
      "path": "clip",
      "commit": "ea0ba9075b54a7fec1ee6ebb5eff0557c511d347"
    },
    "verified": true,
    "fileSize": 856461210,
    "downloadUrl": "https://huggingface.co/QuanSun/EVA-CLIP/resolve/ea0ba9075b54a7fec1ee6ebb5eff0557c511d347/EVA02_CLIP_L_336_psz14_s6B.pt",
    "lastVerified": "2026-01-15T13:42:21.214Z"
  },
  "ip-adapter.bin": {
    "huggingface": {
      "repo": "InstantX/InstantID",
      "file": "ip-adapter.bin",
      "path": "instantid",
      "commit": "55c98e90c7047768538ad83e8f06f44c017fc329"
    },
    "verified": true,
    "fileSize": 1691134141,
    "downloadUrl": "https://huggingface.co/InstantX/InstantID/resolve/55c98e90c7047768538ad83e8f06f44c017fc329/ip-adapter.bin",
    "lastVerified": "2026-01-15T13:42:21.214Z"
  },
  "diffusion_pytorch_model.safetensors": {
    "huggingface": {
      "repo": "InstantX/InstantID",
      "file": "diffusion_pytorch_model.safetensors",
      "path": "controlnet",
      "commit": ""
    },
    "verified": false,
    "fileSize": 0,
    "downloadUrl": "",
    "lastVerified": "2026-01-15T13:42:21.396Z"
  }
};
