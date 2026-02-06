/**
 * RYLA-fit labeling for Civit.ai items (IN-037).
 * Assigns rylaLabel from title, type, and description keywords.
 */

import type { CivitaiCrawlItem } from './types';

export type RylaLabel =
  | 'workflow_comfyui'
  | 'model_checkpoint'
  | 'model_lora'
  | 'model_controlnet'
  | 'model_workflow'
  | 'face_consistency'
  | 'image_edit'
  | 'video'
  | 'upscale'
  | 'other';

const LABEL_KEYWORDS: { label: RylaLabel; keywords: RegExp[] }[] = [
  { label: 'workflow_comfyui', keywords: [/workflow|comfyui|comfy\s*ui|\.workflow\.json/i] },
  { label: 'model_workflow', keywords: [/workflow/i] },
  { label: 'face_consistency', keywords: [/instantid|pulid|ip-?adapter|face\s*id|consistent\s*character|face\s*consistency/i] },
  { label: 'image_edit', keywords: [/inpaint|inpainting|outpaint|image\s*edit|flux\s*klein/i] },
  { label: 'video', keywords: [/video|animatediff|svd|wan\s*2|i2v|t2v|image-to-video|text-to-video/i] },
  { label: 'upscale', keywords: [/upscal|4x|ultrasharp|real-esrgan|super-?resolution/i] },
  { label: 'model_controlnet', keywords: [/controlnet|control\s*net/i] },
  { label: 'model_lora', keywords: [/lora|lycoris/i] },
  { label: 'model_checkpoint', keywords: [/checkpoint|ckpt|safetensors.*base/i] },
];

/**
 * Derive RYLA label from item name, type badge, and URL.
 */
export function labelForRyla(item: Pick<CivitaiCrawlItem, 'name' | 'typeBadge' | 'type' | 'url'>): RylaLabel {
  const text = `${item.name} ${item.typeBadge} ${item.url}`.toLowerCase();

  if (item.type === 'workflow') {
    return 'workflow_comfyui';
  }

  for (const { label, keywords } of LABEL_KEYWORDS) {
    if (keywords.some((re) => re.test(text))) return label;
  }

  return 'other';
}

/**
 * Apply rylaLabel to a crawl item (mutates item).
 */
export function applyLabel(item: CivitaiCrawlItem): void {
  item.rylaLabel = labelForRyla(item);
}
