/**
 * Workflow Deployment Orchestrator
 * Coordinates the full workflow deployment process
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import path from 'path';
import { WorkflowSubmission } from './slack-handler.js';

const execAsync = promisify(exec);

export interface DeploymentResult {
  success: boolean;
  endpointUrl?: string;
  cost: number;
  iterations: number;
  errors?: string[];
  workflowName: string;
}

export interface DeploymentOptions {
  costLimit?: number;
  maxIterations?: number;
  workflowName?: string;
}

/**
 * Orchestrate workflow deployment
 * Uses existing workflow-deployer tools
 */
export async function deployWorkflow(
  submission: WorkflowSubmission,
  options: DeploymentOptions = {}
): Promise<DeploymentResult> {
  const {
    costLimit = 20,
    maxIterations = 10,
    workflowName = submission.workflowName || 'workflow',
  } = options;

  let cost = 0;
  let iteration = 0;
  const errors: string[] = [];

  // Save workflow JSON to temp file
  const tempDir = path.join('/tmp', 'workflows');
  await fs.mkdir(tempDir, { recursive: true });
  const workflowFile = path.join(tempDir, `${workflowName}.json`);

  // Convert workflow JSON to string if needed
  const workflowJson =
    typeof submission.workflowJson === 'string'
      ? submission.workflowJson
      : JSON.stringify(submission.workflowJson, null, 2);

  await fs.writeFile(workflowFile, workflowJson);

  try {
    // Step 1: Analyze workflow
    // Use workflow-deployer CLI via pnpm from monorepo root
    console.log('📊 Analyzing workflow...');
    const analysisResult = await execAsync(
      `pnpm workflow:analyze "${workflowFile}" --name="${workflowName}"`,
      { 
        cwd: '/app',
        env: { ...process.env, NODE_ENV: 'production' }
      }
    );
    console.log('✅ Analysis complete');

    // Step 2: Generate Modal code
    console.log('🔧 Generating Modal code...');
    const generateResult = await execAsync(
      `pnpm workflow:generate "${workflowFile}" --platform=modal --name="${workflowName}"`,
      { 
        cwd: '/app',
        env: { ...process.env, NODE_ENV: 'production' }
      }
    );
    console.log('✅ Code generation complete');

    // Find generated file
    const generatedFile = path.join(
      '/app/scripts/generated/workflows',
      `${workflowName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_modal.py`
    );

    if (!(await fs.access(generatedFile).then(() => true).catch(() => false))) {
      throw new Error(`Generated file not found: ${generatedFile}`);
    }

    // Step 3: Deploy to Modal
    console.log('🚀 Deploying to Modal...');
    const deployResult = await execAsync(`modal deploy "${generatedFile}"`, {
      cwd: '/app',
      env: {
        ...process.env,
        MODAL_TOKEN_ID: process.env.MODAL_TOKEN_ID,
        MODAL_TOKEN_ID_SECRET: process.env.MODAL_TOKEN_ID_SECRET,
      },
    });

    // Extract endpoint URL from deployment output
    const endpointUrl = extractEndpointUrl(deployResult.stdout);
    if (!endpointUrl) {
      throw new Error('Failed to extract endpoint URL from deployment');
    }

    console.log(`✅ Deployment complete: ${endpointUrl}`);

    // Step 4: Test endpoint
    console.log('🧪 Testing endpoint...');
    const testResult = await testEndpoint(endpointUrl);
    if (!testResult.success) {
      throw new Error(`Endpoint test failed: ${testResult.error}`);
    }

    console.log('✅ Endpoint test passed');

    // Estimate cost (simplified - should track actual costs)
    cost = 2.5; // Estimated deployment cost

    return {
      success: true,
      endpointUrl,
      cost,
      iterations: 1,
      workflowName,
    };
  } catch (error: any) {
    errors.push(error.message || String(error));
    cost = 1.0; // Estimated cost for failed attempt

    return {
      success: false,
      cost,
      iterations: iteration + 1,
      errors,
      workflowName,
    };
  } finally {
    // Cleanup temp file
    try {
      await fs.unlink(workflowFile);
    } catch {
      // Ignore cleanup errors
    }
  }
}

/**
 * Extract endpoint URL from Modal deployment output
 */
function extractEndpointUrl(output: string): string | null {
  // Modal deployment output typically contains:
  // "https://{workspace}--{app}-{function}.modal.run"
  const urlMatch = output.match(
    /https:\/\/[a-zA-Z0-9-]+--[a-zA-Z0-9-]+-[a-zA-Z0-9-]+\.modal\.run/
  );
  return urlMatch ? urlMatch[0] : null;
}

/**
 * Test deployed endpoint
 */
async function testEndpoint(endpointUrl: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Health check
    const healthResponse = await fetch(`${endpointUrl}/health`);
    if (!healthResponse.ok) {
      return {
        success: false,
        error: `Health check failed: ${healthResponse.status}`,
      };
    }

    // Basic generation test (optional - can be skipped for MVP)
    // const testResponse = await fetch(`${endpointUrl}/generate`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ workflow_json: {} }),
    // });

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || String(error),
    };
  }
}
