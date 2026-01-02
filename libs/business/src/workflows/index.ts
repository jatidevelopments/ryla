/**
 * ComfyUI Workflow Factory
 *
 * Central registry of all ComfyUI workflows used by RYLA.
 * Each workflow is a JSON-serializable object ready to send to ComfyUI API.
 *
 * Usage:
 *   import { workflows, buildWorkflow } from '@ryla/business/workflows';
 *
 *   // Get a specific workflow
 *   const workflow = workflows.zImageDanrisi;
 *
 *   // Build with custom prompt
 *   const customized = buildWorkflow('z-image-danrisi', { prompt: 'my prompt' });
 */

export * from './types';
export * from './z-image-danrisi';
export * from './z-image-simple';
export * from './z-image-pulid';
export * from './flux-inpaint';
export * from './registry';

