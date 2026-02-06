/**
 * Preset prompts for character / influencer / realistic use cases.
 */
export const PRESET_PROMPTS = [
  {
    id: 'character',
    name: 'Character portrait',
    prompt:
      'Portrait of a young woman, soft studio lighting, photorealistic, 8k, neutral expression, shallow depth of field',
  },
  {
    id: 'influencer',
    name: 'Influencer / social',
    prompt:
      'Lifestyle photo of a person in a modern café, natural daylight, candid, high quality, Instagram style',
  },
  {
    id: 'realistic',
    name: 'Realistic product',
    prompt:
      'Product shot on clean white background, studio lighting, sharp focus, professional photography',
  },
] as const;

export type EndpointMeta = {
  path: string;
  label: string;
  category: string;
  needsRefImage?: boolean;
  needsLora?: boolean;
  needsImage?: boolean;
  /** Video endpoints (wan2.6) use length/fps; upscale (seedvr2) uses image only */
  isVideo?: boolean;
  isUpscale?: boolean;
};

export const MODAL_ENDPOINTS: EndpointMeta[] = [
  { path: '/flux', label: 'Flux Schnell', category: 'Text-to-image' },
  { path: '/flux-dev', label: 'Flux Dev', category: 'Text-to-image' },
  { path: '/sdxl-turbo', label: 'SDXL Turbo', category: 'Text-to-image' },
  { path: '/sdxl-lightning', label: 'SDXL Lightning', category: 'Text-to-image' },
  { path: '/qwen-image-2512', label: 'Qwen Image 2512', category: 'Text-to-image' },
  { path: '/qwen-image-2512-fast', label: 'Qwen Image 2512 Fast', category: 'Text-to-image' },
  { path: '/z-image-simple', label: 'Z-Image Simple', category: 'Text-to-image' },
  { path: '/z-image-danrisi', label: 'Z-Image Danrisi', category: 'Text-to-image' },
  { path: '/sdxl-instantid', label: 'SDXL InstantID', category: 'Face', needsRefImage: true },
  { path: '/flux-pulid', label: 'Flux PuLID', category: 'Face', needsRefImage: true },
  { path: '/flux-ipadapter-faceid', label: 'Flux IP-Adapter FaceID', category: 'Face', needsRefImage: true },
  { path: '/flux-dev-lora', label: 'Flux Dev LoRA', category: 'LoRA', needsLora: true },
  { path: '/qwen-image-2512-lora', label: 'Qwen Image 2512 LoRA', category: 'LoRA', needsLora: true },
  { path: '/z-image-lora', label: 'Z-Image LoRA', category: 'LoRA', needsLora: true },
  { path: '/wan2.6', label: 'Wan 2.6', category: 'Video', isVideo: true },
  { path: '/wan2.6-lora', label: 'Wan 2.6 LoRA', category: 'Video', needsLora: true, isVideo: true },
  { path: '/seedvr2', label: 'SeedVR2 Upscale', category: 'Upscale', needsImage: true, isUpscale: true },
];

const CATEGORY_ORDER = ['Text-to-image', 'Face', 'LoRA', 'Video', 'Upscale'];

export function getEndpointsByCategory(): { category: string; endpoints: EndpointMeta[] }[] {
  const byCat = new Map<string, EndpointMeta[]>();
  for (const e of MODAL_ENDPOINTS) {
    const list = byCat.get(e.category) ?? [];
    list.push(e);
    byCat.set(e.category, list);
  }
  return CATEGORY_ORDER.map((category) => ({
    category,
    endpoints: byCat.get(category) ?? [],
  })).filter((g) => g.endpoints.length > 0);
}

export function getEndpointLabel(path: string): string {
  return MODAL_ENDPOINTS.find((e) => e.path === path)?.label ?? path;
}

export function getEndpointMeta(path: string): EndpointMeta | undefined {
  return MODAL_ENDPOINTS.find((e) => e.path === path);
}
