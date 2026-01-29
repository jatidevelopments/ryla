/**
 * Workflow JSON Analyzer
 * 
 * Analyzes raw ComfyUI workflow JSON (API format or full export) to extract:
 * - Custom nodes (class_type values)
 * - Required models
 * - Workflow type
 * - Dependencies
 */

import { promises as fs } from 'fs';
import path from 'path';
import { mapNodeToPackage } from '../setup/node-package-mapper';
import { COMFYUI_NODE_REGISTRY, COMFYUI_MODEL_REGISTRY } from '../setup/comfyui-registry';

export interface ComfyUINode {
  class_type: string;
  inputs?: Record<string, any>;
  [key: string]: any;
}

export interface ComfyUIWorkflow {
  [nodeId: string]: ComfyUINode;
}

export interface CustomNodeInfo {
  classType: string;
  managerPackage?: string;
  gitRepo?: {
    url: string;
    version?: string;
  };
  source: 'manager' | 'github' | 'unknown';
}

export interface ModelInfo {
  filename: string;
  type: 'checkpoint' | 'vae' | 'lora' | 'text_encoder' | 'controlnet' | 'pulid' | 'instantid' | 'clip' | 'unknown';
  source?: 'huggingface' | 'civitai' | 'manual';
  path?: string;
}

export type WorkflowType = 'image' | 'video' | 'face-swap' | 'upscale' | 'other';

export interface WorkflowAnalysis {
  workflowId: string;
  workflowName: string;
  customNodes: CustomNodeInfo[];
  models: ModelInfo[];
  workflowType: WorkflowType;
  nodeCount: number;
  modelCount: number;
  missingNodes: string[]; // Nodes not in registry
  missingModels: string[]; // Models not in registry
}

const MODEL_FILE_REGEX = /([A-Za-z0-9._-]+\.(safetensors|bin|pt|ckpt|onnx|pth|zip))/gi;

// Built-in ComfyUI nodes (not custom)
// These are standard ComfyUI nodes that come with the base installation
const BUILTIN_NODES = new Set([
  // Core sampling
  'KSampler',
  'KSamplerAdvanced',
  'DiffusionSampler',
  
  // Model loaders
  'CheckpointLoaderSimple',
  'CheckpointLoader',
  'VAELoader',
  'CLIPLoader',
  'DualCLIPLoader',
  'UNetLoader',
  'UNETLoader', // Alternative casing
  'CLIPVisionLoader',
  'CLIPVisionEncode',
  
  // Text encoding
  'CLIPTextEncode',
  
  // Latent/image operations
  'EmptyLatentImage',
  'EmptySD3LatentImage',
  'VAEDecode',
  'VAEEncode',
  'ImageToLatent',
  'LatentToImage',
  'LatentUpscale',
  'LatentUpscaleBy',
  'LatentComposite',
  'LatentBlur',
  'LatentNoise',
  'LatentFromBatch',
  'LatentToBatch',
  'LatentCrop',
  'LatentRotate',
  'LatentFlip',
  
  // Image operations
  'SaveImage',
  'LoadImage',
  'ImageScale',
  'ImageInvert',
  'ImageRotate',
  'ImageFlip',
  'ImageBlur',
  'ImageSharpen',
  'ImageQuantize',
  'ImageColorMatch',
  'ImageComposite',
  'ImageBatch',
  'ImageFromBatch',
  'ImagePadForOutpaint',
  'ImageCrop',
  
  // Upscaling
  'UpscaleModelLoader',
  'ImageUpscaleWithModel',
  
  // ControlNet
  'ControlNetLoader',
  'ControlNetApply',
  'ControlNetApplyAdvanced',
  
  // LoRA
  'LoraLoader',
  
  // Conditioning
  'ConditioningCombine',
  'ConditioningConcat',
  'ConditioningSetArea',
  'ConditioningSetAreaPercentage',
  'ConditioningSetMask',
  'ConditioningSetTimestepRange',
  'ConditioningSetWeight',
  'ConditioningAverage',
  'ConditioningZeroOut',
  'ConditioningSetAreaStrength',
  'ConditioningSetArea',
  
  // Model merging
  'ModelMergeSimple',
  'ModelMergeBlocks',
  
  // Other built-ins
  'PreviewImage',
  'ShowText',
  'Note',
  'Reroute',
]);

// Model type detection patterns
const MODEL_TYPE_PATTERNS = {
  checkpoint: /\.(safetensors|ckpt|pt)$/i,
  vae: /vae|ae\.(safetensors|pt)$/i,
  lora: /lora|\.(safetensors|pt)$/i,
  text_encoder: /clip|t5|text.*encoder|qwen/i,
  controlnet: /controlnet|control.*net/i,
  pulid: /pulid/i,
  instantid: /instantid|ip-adapter/i,
  clip: /clip|eva.*clip/i,
};

/**
 * Parse workflow JSON (handles both API format and full export)
 */
export function parseWorkflowJSON(workflowJSON: string | object): ComfyUIWorkflow {
  const parsed = typeof workflowJSON === 'string' ? JSON.parse(workflowJSON) : workflowJSON;
  
  // Handle full export format (has "workflow" key)
  if (parsed.workflow && typeof parsed.workflow === 'object') {
    return parsed.workflow;
  }
  
  // Handle API format (direct workflow object)
  if (typeof parsed === 'object' && !Array.isArray(parsed)) {
    return parsed as ComfyUIWorkflow;
  }
  
  throw new Error('Invalid workflow JSON format');
}

/**
 * Extract all custom node types from workflow
 */
export function extractCustomNodes(workflow: ComfyUIWorkflow): string[] {
  const nodeTypes = new Set<string>();
  
  // Create case-insensitive lookup for built-in nodes
  const builtinNodesLower = new Set(Array.from(BUILTIN_NODES).map(n => n.toLowerCase()));
  
  for (const node of Object.values(workflow)) {
    if (node.class_type) {
      // Check case-insensitive match
      const nodeTypeLower = node.class_type.toLowerCase();
      if (!builtinNodesLower.has(nodeTypeLower)) {
        nodeTypes.add(node.class_type);
      }
    }
  }
  
  return Array.from(nodeTypes);
}

/**
 * Extract model filenames from workflow
 */
export function extractModels(workflow: ComfyUIWorkflow): string[] {
  const models = new Set<string>();
  
  // Search through all node inputs for model filenames
  for (const node of Object.values(workflow)) {
    if (node.inputs) {
      const inputsStr = JSON.stringify(node.inputs);
      let match = MODEL_FILE_REGEX.exec(inputsStr);
      while (match) {
        models.add(match[1]);
        match = MODEL_FILE_REGEX.exec(inputsStr);
      }
    }
  }
  
  return Array.from(models);
}

/**
 * Detect workflow type based on node types
 */
export function detectWorkflowType(workflow: ComfyUIWorkflow): WorkflowType {
  const nodeTypes = Object.values(workflow).map(n => n.class_type);
  const nodeTypesStr = nodeTypes.join(' ').toLowerCase();
  
  // Video generation indicators
  if (nodeTypesStr.includes('video') || nodeTypesStr.includes('svd') || nodeTypesStr.includes('wan')) {
    return 'video';
  }
  
  // Face swap indicators
  if (nodeTypesStr.includes('faceswap') || nodeTypesStr.includes('instantid') || nodeTypesStr.includes('pulid')) {
    return 'face-swap';
  }
  
  // Upscale indicators
  if (nodeTypesStr.includes('upscale') || nodeTypesStr.includes('esrgan') || nodeTypesStr.includes('real-esrgan')) {
    return 'upscale';
  }
  
  // Default to image generation
  return 'image';
}

/**
 * Map custom nodes to packages (Manager or GitHub)
 */
export function mapNodesToPackages(nodeTypes: string[]): CustomNodeInfo[] {
  const nodeInfo: CustomNodeInfo[] = [];
  
  for (const nodeType of nodeTypes) {
    const managerPackage = mapNodeToPackage(nodeType);
    
    if (managerPackage) {
      const registryEntry = COMFYUI_NODE_REGISTRY[managerPackage];
      
      if (registryEntry?.managerPackage) {
        nodeInfo.push({
          classType: nodeType,
          managerPackage: managerPackage,
          source: 'manager',
        });
      } else if (registryEntry?.gitRepo) {
        nodeInfo.push({
          classType: nodeType,
          gitRepo: {
            url: registryEntry.gitRepo.url,
            version: registryEntry.gitRepo.version || 'main',
          },
          source: 'github',
        });
      } else {
        nodeInfo.push({
          classType: nodeType,
          source: 'unknown',
        });
      }
    } else {
      nodeInfo.push({
        classType: nodeType,
        source: 'unknown',
      });
    }
  }
  
  return nodeInfo;
}

/**
 * Detect model type from filename
 */
export function detectModelType(filename: string): ModelInfo['type'] {
  const lower = filename.toLowerCase();
  
  for (const [type, pattern] of Object.entries(MODEL_TYPE_PATTERNS)) {
    if (pattern.test(lower)) {
      return type as ModelInfo['type'];
    }
  }
  
  return 'unknown';
}

/**
 * Map models to registry entries
 */
export function mapModelsToRegistry(modelFilenames: string[]): ModelInfo[] {
  const modelInfo: ModelInfo[] = [];
  
  for (const filename of modelFilenames) {
    const registryEntry = COMFYUI_MODEL_REGISTRY[filename];
    const type = detectModelType(filename);
    
    if (registryEntry?.huggingface) {
      modelInfo.push({
        filename,
        type,
        source: 'huggingface',
        path: registryEntry.huggingface.path,
      });
    } else {
      modelInfo.push({
        filename,
        type,
        source: 'manual', // Not in registry, needs manual setup
      });
    }
  }
  
  return modelInfo;
}

/**
 * Generate workflow ID from workflow content
 */
export function generateWorkflowId(workflow: ComfyUIWorkflow): string {
  // Use hash of workflow structure as ID
  const workflowStr = JSON.stringify(workflow);
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < workflowStr.length; i++) {
    const char = workflowStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `workflow_${Math.abs(hash).toString(36)}`;
}

/**
 * Extract workflow name from workflow (if available)
 */
export function extractWorkflowName(workflow: ComfyUIWorkflow): string {
  // Look for SaveImage node with filename_prefix
  for (const node of Object.values(workflow)) {
    if (node.class_type === 'SaveImage' && node.inputs?.filename_prefix) {
      return String(node.inputs.filename_prefix);
    }
  }
  
  // Fallback to generated ID
  return generateWorkflowId(workflow);
}

/**
 * Main analysis function
 */
export async function analyzeWorkflowJSON(
  workflowJSON: string | object,
  workflowName?: string,
  options?: {
    discoverUnknown?: boolean; // Auto-discover unknown nodes
  }
): Promise<WorkflowAnalysis> {
  // Parse workflow
  const workflow = parseWorkflowJSON(workflowJSON);
  
  // Extract dependencies
  const customNodeTypes = extractCustomNodes(workflow);
  const modelFilenames = extractModels(workflow);
  
  // Map to packages
  let customNodes = mapNodesToPackages(customNodeTypes);
  
  // Auto-discover unknown nodes if requested
  if (options?.discoverUnknown) {
    const unknownNodes = customNodes.filter(n => n.source === 'unknown');
    if (unknownNodes.length > 0) {
      const { discoverUnknownNodes } = await import('./discover-unknown-nodes');
      const discoveries = await discoverUnknownNodes(
        unknownNodes.map(n => n.classType)
      );
      
      // Update custom nodes with discoveries
      customNodes = customNodes.map(node => {
        if (node.source === 'unknown') {
          const discovery = discoveries.find(d => d.nodeType === node.classType);
          if (discovery?.found) {
            if (discovery.source === 'manager' && discovery.managerPackage) {
              return {
                ...node,
                managerPackage: discovery.managerPackage,
                source: 'manager' as const,
              };
            } else if (discovery.source === 'github' && discovery.gitRepo) {
              return {
                ...node,
                gitRepo: discovery.gitRepo,
                source: 'github' as const,
              };
            }
          }
        }
        return node;
      });
    }
  }
  
  const models = mapModelsToRegistry(modelFilenames);
  
  // Detect workflow type
  const workflowType = detectWorkflowType(workflow);
  
  // Generate ID and name
  const workflowId = generateWorkflowId(workflow);
  const name = workflowName || extractWorkflowName(workflow);
  
  // Find missing dependencies
  const missingNodes = customNodes
    .filter(n => n.source === 'unknown')
    .map(n => n.classType);
  
  const missingModels = models
    .filter(m => m.source === 'manual')
    .map(m => m.filename);
  
  return {
    workflowId,
    workflowName: name,
    customNodes,
    models,
    workflowType,
    nodeCount: customNodeTypes.length,
    modelCount: modelFilenames.length,
    missingNodes,
    missingModels,
  };
}

/**
 * Analyze workflow from file
 */
export async function analyzeWorkflowFromFile(
  filePath: string,
  workflowName?: string,
  options?: {
    discoverUnknown?: boolean;
  }
): Promise<WorkflowAnalysis> {
  const content = await fs.readFile(filePath, 'utf-8');
  const workflowJSON = JSON.parse(content);
  return analyzeWorkflowJSON(workflowJSON, workflowName, options);
}

/**
 * CLI entry point
 */
if (require.main === module) {
  const args = process.argv.slice(2);
  const filePath = args[0];
  const workflowName = args[1];
  
  if (!filePath) {
    console.error('Usage: analyze-workflow-json <workflow-file> [workflow-name]');
    process.exit(1);
  }
  
  analyzeWorkflowFromFile(filePath, workflowName)
    .then((analysis) => {
      console.log(JSON.stringify(analysis, null, 2));
    })
    .catch((error) => {
      console.error('Error analyzing workflow:', error);
      process.exit(1);
    });
}
