const NODE_TO_PACKAGE_MAP: Record<string, string | null> = {
  // res4lyf custom nodes
  ClownsharKSampler_Beta: 'res4lyf',
  'Sigmas Rescale': 'res4lyf',
  BetaSamplingScheduler: 'res4lyf',

  // controlaltai-nodes
  FluxResolutionNode: 'controlaltai-nodes',

  // ComfyUI_PuLID
  PulidFluxModelLoader: 'ComfyUI_PuLID',
  PulidFluxInsightFaceLoader: 'ComfyUI_PuLID',
  PulidFluxEvaClipLoader: 'ComfyUI_PuLID',
  ApplyPulidFlux: 'ComfyUI_PuLID',
  FixPulidFluxPatch: 'ComfyUI_PuLID',

  // ComfyUI_InstantID
  InsightFaceLoader: 'ComfyUI_InstantID',
  InstantIDModelLoader: 'ComfyUI_InstantID',
  InstantIDControlNetLoader: 'ComfyUI_InstantID',
  ApplyInstantID: 'ComfyUI_InstantID',

  // LoadImageBase64-ComfyUI
  ETN_LoadImageBase64: 'LoadImageBase64-ComfyUI',
};

export function mapNodeToPackage(nodeType: string): string | null {
  return NODE_TO_PACKAGE_MAP[nodeType] ?? null;
}

export function listKnownNodeMappings(): string[] {
  return Object.keys(NODE_TO_PACKAGE_MAP);
}

export { NODE_TO_PACKAGE_MAP };
