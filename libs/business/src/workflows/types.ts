/**
 * ComfyUI Workflow Types
 */

/** A node input that references another node's output */
export type NodeRef = [string, number];

/** A ComfyUI node definition */
export interface ComfyUINode {
  class_type: string;
  inputs: Record<string, unknown>;
  _meta?: {
    title?: string;
  };
}

/** A complete ComfyUI workflow (API format) */
export type ComfyUIWorkflow = Record<string, ComfyUINode>;

/** Workflow metadata */
export interface WorkflowDefinition {
  /** Unique identifier */
  id: string;
  /** Human-readable name */
  name: string;
  /** Description */
  description: string;
  /** Required models */
  requiredModels: {
    diffusion?: string;
    textEncoder?: string;
    vae?: string;
    lora?: string[];
  };
  /** Required custom nodes (ComfyUI Manager package names) */
  requiredNodes: string[];
  /** Default generation parameters */
  defaults: {
    width: number;
    height: number;
    steps: number;
    cfg: number;
    seed?: number;
  };
  /** The workflow template */
  workflow: ComfyUIWorkflow;
}

/** Options for building a workflow */
export interface WorkflowBuildOptions {
  /** Positive prompt */
  prompt: string;
  /** Negative prompt (optional) */
  negativePrompt?: string;
  /** Image width */
  width?: number;
  /** Image height */
  height?: number;
  /** Number of inference steps */
  steps?: number;
  /** CFG scale (guidance) */
  cfg?: number;
  /** Random seed (or random if not provided) */
  seed?: number;
  /** LoRA to apply (model name and strength) */
  lora?: {
    name: string;
    strength: number;
  };
  /** Output filename prefix */
  filenamePrefix?: string;
}

