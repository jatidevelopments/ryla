/**
 * Modal Workflow Detector
 *
 * Detects workflow type from ComfyUI workflow JSON and extracts parameters
 * for routing to appropriate Modal endpoints.
 */

import type { ComfyUIWorkflow } from '../workflows/types';

export interface DetectedWorkflow {
  type:
    | 'z-image-simple'
    | 'z-image-danrisi'
    | 'z-image-instantid'
    | 'z-image-pulid'
    | 'flux-dev'
    | 'flux-ipadapter-faceid'
    | 'sdxl-instantid'
    | 'unknown';
  parameters: {
    prompt?: string;
    negativePrompt?: string;
    width?: number;
    height?: number;
    steps?: number;
    cfg?: number;
    seed?: number;
    referenceImage?: string; // filename or base64
    instantidStrength?: number;
    controlnetStrength?: number;
    pulidStrength?: number;
    pulidStart?: number;
    pulidEnd?: number;
    ipadapterStrength?: number;
    faceProvider?: 'CPU' | 'GPU';
  };
}

/**
 * Detect workflow type and extract parameters from ComfyUI workflow JSON
 */
export function detectWorkflowType(
  workflow: ComfyUIWorkflow
): DetectedWorkflow {
  const nodeTypes = Object.values(workflow).map((n) => n.class_type);
  const nodeTypesStr = nodeTypes.join(' ').toLowerCase();
  const allInputs = Object.values(workflow).flatMap((n) =>
    Object.entries(n.inputs || {})
  );

  // Extract common parameters
  const parameters: DetectedWorkflow['parameters'] = {};

  // Find CLIPTextEncode nodes for prompt extraction
  for (const [_nodeId, node] of Object.entries(workflow)) {
    if (node.class_type === 'CLIPTextEncode') {
      const text = node.inputs?.['text'] as string | undefined;
      if (text && !text.includes('negative') && !text.includes('deformed')) {
        parameters.prompt = text;
      } else if (
        text &&
        (text.includes('negative') || text.includes('deformed'))
      ) {
        parameters.negativePrompt = text;
      }
    }

    // Extract dimensions from EmptySD3LatentImage or EmptyLatentImage
    if (
      node.class_type === 'EmptySD3LatentImage' ||
      node.class_type === 'EmptyLatentImage'
    ) {
      parameters.width = node.inputs?.['width'] as number | undefined;
      parameters.height = node.inputs?.['height'] as number | undefined;
    }

    // Extract sampling parameters from KSampler
    if (
      node.class_type === 'KSampler' ||
      node.class_type === 'ClownsharKSampler_Beta'
    ) {
      parameters.steps = node.inputs?.['steps'] as number | undefined;
      parameters.cfg = node.inputs?.['cfg'] as number | undefined;
      parameters.seed = node.inputs?.['seed'] as number | undefined;
    }

    // Extract reference image from LoadImage
    if (node.class_type === 'LoadImage') {
      const image = node.inputs?.['image'] as string | undefined;
      if (image) {
        parameters.referenceImage = image;
      }
    }

    // Extract InstantID parameters
    if (node.class_type === 'ApplyInstantID') {
      parameters.instantidStrength = node.inputs?.['weight'] as
        | number
        | undefined;
      parameters.controlnetStrength = node.inputs?.[
        'controlnet_conditioning_scale'
      ] as number | undefined;
    }

    // Extract PuLID parameters
    if (node.class_type === 'ApplyPuLID') {
      parameters.pulidStrength = node.inputs?.['strength'] as
        | number
        | undefined;
      parameters.pulidStart = node.inputs?.['start_percent'] as
        | number
        | undefined;
      parameters.pulidEnd = node.inputs?.['end_percent'] as number | undefined;
    }

    // Extract IP-Adapter parameters
    if (node.class_type === 'ApplyFluxIPAdapter') {
      parameters.ipadapterStrength = node.inputs?.['ip_scale'] as
        | number
        | undefined;
    }

    // Extract face provider
    if (
      node.class_type === 'InsightFaceLoader' ||
      node.class_type === 'InstantIDFaceAnalysis'
    ) {
      parameters.faceProvider =
        (node.inputs?.['provider'] as 'CPU' | 'GPU') || 'CPU';
    }
  }

  // Detect workflow type based on node types and model names
  // Check model file names in workflow inputs
  const modelNames = allInputs
    .map(([key, value]) => {
      if (
        typeof value === 'string' &&
        (key.includes('unet') ||
          key.includes('checkpoint') ||
          key.includes('model'))
      ) {
        return value.toLowerCase();
      }
      return '';
    })
    .filter(Boolean)
    .join(' ');

  const allIndicators = (nodeTypesStr + ' ' + modelNames).toLowerCase();

  // Z-Image workflows - check for Z-Image model names
  if (
    allIndicators.includes('z_image_turbo') ||
    allIndicators.includes('z-image-turbo') ||
    allIndicators.includes('z_image_turbo_bf16')
  ) {
    if (
      allIndicators.includes('instantid') ||
      allIndicators.includes('applyinstantid')
    ) {
      return { type: 'z-image-instantid', parameters };
    }
    if (
      allIndicators.includes('pulid') ||
      allIndicators.includes('applypulid')
    ) {
      return { type: 'z-image-pulid', parameters };
    }
    if (
      allIndicators.includes('clownsharksampler') ||
      allIndicators.includes('betasamplingscheduler') ||
      allIndicators.includes('sigmas rescale')
    ) {
      return { type: 'z-image-danrisi', parameters };
    }
    return { type: 'z-image-simple', parameters };
  }

  // Flux Dev workflows
  if (nodeTypesStr.includes('flux1-dev') || nodeTypesStr.includes('flux_dev')) {
    if (
      nodeTypesStr.includes('loadfluxipadapter') ||
      nodeTypesStr.includes('applyfluxipadapter')
    ) {
      return { type: 'flux-ipadapter-faceid', parameters };
    }
    return { type: 'flux-dev', parameters };
  }

  // SDXL InstantID
  if (
    nodeTypesStr.includes('sdxl') &&
    (nodeTypesStr.includes('instantid') ||
      nodeTypesStr.includes('applyinstantid'))
  ) {
    return { type: 'sdxl-instantid', parameters };
  }

  return { type: 'unknown', parameters };
}
