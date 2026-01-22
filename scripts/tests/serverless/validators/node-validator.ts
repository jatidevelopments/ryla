/**
 * EP-044: Node Validator
 *
 * Validates that required custom nodes are installed on the ComfyUI endpoint.
 *
 * @module scripts/tests/serverless/validators/node-validator
 */

import type {
  IComfyUIClient,
  NodeVerificationResult,
  ComfyUIWorkflow,
} from '../types';

/**
 * Node Validator
 *
 * Verifies that required custom nodes are installed and accessible.
 */
export class NodeValidator {
  private readonly client: IComfyUIClient;

  constructor(client: IComfyUIClient) {
    this.client = client;
  }

  /**
   * Verify a single node exists
   */
  async verifyNode(nodeType: string): Promise<NodeVerificationResult> {
    try {
      const nodeInfo = await this.client.getNodeInfo(nodeType);

      if (nodeInfo) {
        return {
          name: nodeType,
          installed: true,
          version: nodeInfo.name, // ComfyUI doesn't expose version info directly
        };
      }

      return {
        name: nodeType,
        installed: false,
        error: `Node '${nodeType}' not found`,
      };
    } catch (error) {
      return {
        name: nodeType,
        installed: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Verify multiple nodes exist
   */
  async verifyNodes(nodeTypes: string[]): Promise<NodeVerificationResult[]> {
    const results = await Promise.all(
      nodeTypes.map((nodeType) => this.verifyNode(nodeType))
    );
    return results;
  }

  /**
   * Extract node types from a workflow
   */
  extractNodesFromWorkflow(workflow: ComfyUIWorkflow): string[] {
    const nodeTypes = new Set<string>();

    for (const node of Object.values(workflow)) {
      if (node.class_type) {
        nodeTypes.add(node.class_type);
      }
    }

    return Array.from(nodeTypes);
  }

  /**
   * Verify all nodes in a workflow are available
   */
  async verifyWorkflowNodes(
    workflow: ComfyUIWorkflow
  ): Promise<NodeVerificationResult[]> {
    const nodeTypes = this.extractNodesFromWorkflow(workflow);
    return this.verifyNodes(nodeTypes);
  }

  /**
   * Check if all required nodes are installed
   */
  async allNodesInstalled(nodeTypes: string[]): Promise<boolean> {
    const results = await this.verifyNodes(nodeTypes);
    return results.every((result) => result.installed);
  }

  /**
   * Get list of missing nodes
   */
  async getMissingNodes(nodeTypes: string[]): Promise<string[]> {
    const results = await this.verifyNodes(nodeTypes);
    return results
      .filter((result) => !result.installed)
      .map((result) => result.name);
  }

  /**
   * Verify Denrisi workflow nodes specifically
   */
  async verifyDenrisiNodes(): Promise<NodeVerificationResult[]> {
    const denrisiNodes = [
      'ClownsharKSampler_Beta',
      'Sigmas Rescale',
      'BetaSamplingScheduler',
      // Standard nodes that should also be present
      'CheckpointLoaderSimple',
      'CLIPTextEncode',
      'VAEDecode',
      'SaveImage',
    ];

    return this.verifyNodes(denrisiNodes);
  }
}

/**
 * Create a summary of node verification results
 */
export function summarizeNodeVerification(
  results: NodeVerificationResult[]
): {
  total: number;
  installed: number;
  missing: number;
  allInstalled: boolean;
  missingNodes: string[];
} {
  const installed = results.filter((r) => r.installed).length;
  const missing = results.filter((r) => !r.installed);

  return {
    total: results.length,
    installed,
    missing: missing.length,
    allInstalled: missing.length === 0,
    missingNodes: missing.map((r) => r.name),
  };
}
