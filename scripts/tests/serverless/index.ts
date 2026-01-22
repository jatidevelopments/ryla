/**
 * EP-044: RunPod Serverless Endpoint Testing Framework
 *
 * Main entry point for the testing framework.
 *
 * @module scripts/tests/serverless
 */

// Types
export * from './types';

// Framework
export { ServerlessTestFramework, createFrameworkFromEnv } from './framework';

// Validators
export {
  NodeValidator,
  ModelValidator,
  ImageValidator,
  summarizeNodeVerification,
  summarizeModelVerification,
  summarizeImageValidation,
  defaultImageValidator,
  type ImageValidationOptions,
  type ImageValidationResult,
} from './validators';

// Utilities
export {
  RunPodClient,
  ComfyUIClient,
  createRunPodClientFromEnv,
  createComfyUIClientFromEnv,
  decodeBase64Image,
  validateBase64Image,
  processRunPodImages,
} from './utils';

// Mock utilities (for testing)
export {
  MockRunPodClient,
  MockComfyUIClient,
  MockScenarios,
  MockComfyUIScenarios,
} from './__test-utils__';
