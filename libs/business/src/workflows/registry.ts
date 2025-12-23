/**
 * Workflow Registry
 *
 * Central registry for all ComfyUI workflows.
 * Provides type-safe access to workflow definitions and builders.
 */

import { ComfyUIWorkflow, WorkflowDefinition, WorkflowBuildOptions } from './types';
import {
  zImageDanrisiDefinition,
  buildZImageDanrisiWorkflow,
} from './z-image-danrisi';
import {
  zImageSimpleDefinition,
  buildZImageSimpleWorkflow,
} from './z-image-simple';
import {
  zImagePuLIDDefinition,
  buildZImagePuLIDWorkflow,
  PuLIDWorkflowBuildOptions,
  PULID_REQUIRED_MODELS,
} from './z-image-pulid';

/** All registered workflow IDs */
export type WorkflowId = 'z-image-danrisi' | 'z-image-simple' | 'z-image-pulid';

/** Workflows that require reference images */
export const REFERENCE_IMAGE_WORKFLOWS: WorkflowId[] = ['z-image-pulid'];

/** Map of workflow ID to its definition */
export const workflowDefinitions: Record<WorkflowId, WorkflowDefinition> = {
  'z-image-danrisi': zImageDanrisiDefinition,
  'z-image-simple': zImageSimpleDefinition,
  'z-image-pulid': zImagePuLIDDefinition,
};

/** Map of workflow ID to its builder function */
export const workflowBuilders: Record<
  WorkflowId,
  (options: WorkflowBuildOptions) => ComfyUIWorkflow
> = {
  'z-image-danrisi': buildZImageDanrisiWorkflow,
  'z-image-simple': buildZImageSimpleWorkflow,
  'z-image-pulid': buildZImagePuLIDWorkflow as (options: WorkflowBuildOptions) => ComfyUIWorkflow,
};

/** Export PuLID-specific types and constants */
export { PuLIDWorkflowBuildOptions, PULID_REQUIRED_MODELS };

/**
 * Get a workflow definition by ID
 */
export function getWorkflowDefinition(id: WorkflowId): WorkflowDefinition {
  const definition = workflowDefinitions[id];
  if (!definition) {
    throw new Error(`Unknown workflow: ${id}`);
  }
  return definition;
}

/**
 * Build a workflow with custom options
 */
export function buildWorkflow(
  id: WorkflowId,
  options: WorkflowBuildOptions
): ComfyUIWorkflow {
  const builder = workflowBuilders[id];
  if (!builder) {
    throw new Error(`Unknown workflow: ${id}`);
  }
  return builder(options);
}

/**
 * List all available workflows
 */
export function listWorkflows(): WorkflowDefinition[] {
  return Object.values(workflowDefinitions);
}

/**
 * Check if a workflow's required custom nodes are available
 * (Must be called with ComfyUI object_info response)
 */
export function checkWorkflowCompatibility(
  id: WorkflowId,
  availableNodes: string[]
): { compatible: boolean; missingNodes: string[] } {
  const definition = getWorkflowDefinition(id);
  const missingNodes: string[] = [];

  // Check required node types from the workflow
  const workflow = definition.workflow;
  const requiredNodeTypes = Array.from(
    new Set(Object.values(workflow).map((node) => node.class_type))
  );

  for (const nodeType of requiredNodeTypes) {
    if (!availableNodes.includes(nodeType)) {
      missingNodes.push(nodeType);
    }
  }

  return {
    compatible: missingNodes.length === 0,
    missingNodes,
  };
}

/**
 * Get the recommended workflow based on available nodes
 *
 * Prefers z-image-danrisi (optimized with custom samplers) when nodes are available,
 * falls back to z-image-simple (built-in nodes only) otherwise.
 */
export function getRecommendedWorkflow(availableNodes: string[]): WorkflowId {
  // Check if z-image-danrisi is compatible (requires res4lyf nodes)
  const { compatible } = checkWorkflowCompatibility('z-image-danrisi', availableNodes);

  if (compatible) {
    return 'z-image-danrisi';
  }

  // Fallback to simple workflow (no custom nodes required)
  return 'z-image-simple';
}

