#!/usr/bin/env npx tsx
/**
 * EP-044: Serverless Test CLI
 *
 * Command-line interface for testing ComfyUI workflows on RunPod serverless endpoints.
 *
 * Usage:
 *   npx tsx scripts/tests/serverless/cli.ts <command> [options]
 *
 * Commands:
 *   endpoint   - Validate endpoint health
 *   deps       - Verify dependencies (nodes and models)
 *   workflow   - Test a workflow
 *   benchmark  - Run performance benchmark
 *   denrisi    - Validate Denrisi workflow
 *
 * Environment variables:
 *   RUNPOD_ENDPOINT_ID - The RunPod endpoint ID (required)
 *                        Use the ComfyUI endpoint (pwqwwai0hlhtw9), not z-image-turbo
 *   RUNPOD_API_KEY     - Your RunPod API key (required)
 *
 * @module scripts/tests/serverless/cli
 */

import type { CLIOptions, CLIResult, WorkflowTestDefinition } from './types';
import { ServerlessTestFramework, createFrameworkFromEnv } from './framework';
import { buildZImageDanrisiWorkflow } from '../../../libs/business/src/workflows/z-image-danrisi';

// ComfyUI endpoint (NOT the z-image-turbo handler endpoint)
const _COMFYUI_ENDPOINT_ID = 'pwqwwai0hlhtw9';

// =============================================================================
// CLI Argument Parsing
// =============================================================================

function parseArgs(args: string[]): { command: string; options: CLIOptions } {
  let command = '';
  const options: CLIOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--mock' || arg === '-m') {
      options.mock = true;
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg === '--full' || arg === '-f') {
      options.full = true;
    } else if (!arg.startsWith('-') && !command) {
      command = arg;
    } else if (arg.startsWith('--endpoint-id=')) {
      options.endpointId = arg.split('=')[1];
    } else if (arg === '--endpoint-id' && args[i + 1]) {
      options.endpointId = args[++i];
    } else if (arg.startsWith('--workflow=')) {
      options.workflow = arg.split('=')[1];
    } else if (arg === '--workflow' && args[i + 1]) {
      options.workflow = args[++i];
    } else if (arg.startsWith('--prompt=')) {
      options.prompt = arg.split('=')[1];
    } else if (arg === '--prompt' && args[i + 1]) {
      options.prompt = args[++i];
    } else if (arg.startsWith('--iterations=')) {
      options.iterations = parseInt(arg.split('=')[1], 10);
    } else if (arg === '--iterations' && args[i + 1]) {
      options.iterations = parseInt(args[++i], 10);
    } else if (arg.startsWith('--samples=')) {
      options.samples = parseInt(arg.split('=')[1], 10);
    } else if (arg === '--samples' && args[i + 1]) {
      options.samples = parseInt(args[++i], 10);
    } else if (arg.startsWith('--timeout=')) {
      options.timeout = parseInt(arg.split('=')[1], 10);
    } else if (arg === '--timeout' && args[i + 1]) {
      options.timeout = parseInt(args[++i], 10);
    } else if (arg.startsWith('--format=')) {
      options.format = arg.split('=')[1] as CLIOptions['format'];
    } else if (arg === '--format' && args[i + 1]) {
      options.format = args[++i] as CLIOptions['format'];
    } else if (arg.startsWith('--output=')) {
      options.output = arg.split('=')[1];
    } else if (arg === '--output' && args[i + 1]) {
      options.output = args[++i];
    }
  }

  if (!command) {
    command = options.mock ? 'denrisi' : 'help';
  }

  return { command, options };
}

// =============================================================================
// Help
// =============================================================================

function printHelp(): void {
  console.log(`
EP-044: Serverless Test CLI

Usage:
  npx tsx scripts/tests/serverless/cli.ts <command> [options]

Commands:
  endpoint    Validate endpoint health
  diagnostics Comprehensive endpoint diagnostics (health + workers + job processing)
  deps        Verify dependencies (nodes and models)
  workflow    Test a workflow
  benchmark   Run performance benchmark
  denrisi     Validate Denrisi workflow
  help        Show this help message

Global Options:
  --mock, -m              Enable mock mode (no real API calls)
  --verbose, -v           Enable verbose output
  --endpoint-id <id>      RunPod endpoint ID (overrides env var)
  --timeout <ms>          Timeout in milliseconds (default: 600000)
  --format <format>       Output format: console, json, markdown
  --output <file>         Output file path

Workflow Options:
  --workflow <id>         Workflow ID to test
  --prompt <text>         Test prompt
  --iterations <n>        Number of test iterations (default: 1)

Denrisi Options:
  --samples <n>           Number of test samples (default: 10)
  --full, -f              Run full validation

Environment Variables:
  RUNPOD_ENDPOINT_ID      RunPod endpoint ID
  RUNPOD_API_KEY          RunPod API key
  RUNPOD_ENDPOINT_URL     Optional: ComfyUI API URL

Examples:
  # Validate endpoint health (mock mode)
  npx tsx scripts/tests/serverless/cli.ts endpoint --mock

  # Verify dependencies
  npx tsx scripts/tests/serverless/cli.ts deps --mock

  # Test Denrisi workflow
  npx tsx scripts/tests/serverless/cli.ts denrisi --mock --samples=5

  # Run with real endpoint
  npx tsx scripts/tests/serverless/cli.ts endpoint --endpoint-id=abc123
`);
}

// =============================================================================
// Commands
// =============================================================================

async function cmdEndpoint(
  framework: ServerlessTestFramework,
  _options: CLIOptions
): Promise<CLIResult> {
  console.log('\n🔍 Validating endpoint health...\n');

  const health = await framework.validateEndpoint();

  console.log('Endpoint Health Check:');
  console.log('  Accessible:', health.accessible ? '✅ Yes' : '❌ No');
  console.log('  Exists:', health.endpointExists ? '✅ Yes' : '❌ No');
  console.log(
    '  Config Valid:',
    health.configurationValid ? '✅ Yes' : '❌ No'
  );
  if (health.responseTime) {
    console.log('  Response Time:', `${health.responseTime}ms`);
  }
  if (health.errors && health.errors.length > 0) {
    console.log('  Errors:');
    for (const error of health.errors) {
      console.log(`    - ${error}`);
    }
  }

  return {
    success: health.accessible,
    data: health,
    exitCode: health.accessible ? 0 : 1,
  };
}

async function cmdDiagnostics(
  framework: ServerlessTestFramework,
  _options: CLIOptions
): Promise<CLIResult> {
  console.log('\n🔬 Running comprehensive endpoint diagnostics...\n');
  console.log('This will check:');
  console.log('  1. Endpoint accessibility');
  console.log('  2. Worker availability');
  console.log('  3. Job processing capability');
  console.log('');

  // Create a minimal test workflow for diagnostics
  const testWorkflow = createSimpleTestWorkflow('test diagnostic');

  const diagnostics = await framework.getDiagnostics(testWorkflow);

  console.log('═══════════════════════════════════════════════════════════');
  console.log('ENDPOINT DIAGNOSTICS REPORT');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Health Check
  console.log('📊 Health Check:');
  console.log(
    '  Accessible:',
    diagnostics.health.accessible ? '✅ Yes' : '❌ No'
  );
  console.log(
    '  Endpoint Exists:',
    diagnostics.health.endpointExists ? '✅ Yes' : '❌ No'
  );
  console.log(
    '  Config Valid:',
    diagnostics.health.configurationValid ? '✅ Yes' : '❌ No'
  );
  if (diagnostics.health.responseTime) {
    console.log('  Response Time:', `${diagnostics.health.responseTime}ms`);
  }
  if (diagnostics.health.errors && diagnostics.health.errors.length > 0) {
    console.log('  Errors:');
    for (const error of diagnostics.health.errors) {
      console.log(`    - ${error}`);
    }
  }

  // Worker Diagnostics
  console.log('\n👷 Worker Diagnostics:');
  console.log(
    '  Available:',
    diagnostics.workers.available ? '✅ Yes' : '❌ No'
  );
  console.log(
    '  Can Spin Up:',
    diagnostics.workers.canSpinUp ? '✅ Yes' : '❌ No'
  );
  if (diagnostics.workers.spinUpTime) {
    console.log('  Spin Up Time:', `${diagnostics.workers.spinUpTime}ms`);
  }
  if (diagnostics.workers.activeWorkers !== undefined) {
    console.log('  Active Workers:', diagnostics.workers.activeWorkers);
  }
  if (diagnostics.workers.issues.length > 0) {
    console.log('  Issues:');
    for (const issue of diagnostics.workers.issues) {
      console.log(`    - ${issue}`);
    }
  }

  // Job Processing Diagnostics
  console.log('\n⚙️  Job Processing:');
  console.log(
    '  Can Accept Jobs:',
    diagnostics.jobProcessing.canAcceptJobs ? '✅ Yes' : '❌ No'
  );
  console.log(
    '  Processing Jobs:',
    diagnostics.jobProcessing.processingJobs ? '✅ Yes' : '❌ No'
  );
  if (diagnostics.jobProcessing.testJobId) {
    console.log('  Test Job ID:', diagnostics.jobProcessing.testJobId);
  }
  if (diagnostics.jobProcessing.testJobStatus) {
    console.log('  Test Job Status:', diagnostics.jobProcessing.testJobStatus);
  }
  if (diagnostics.jobProcessing.queueTime) {
    console.log('  Queue Time:', `${diagnostics.jobProcessing.queueTime}ms`);
  }
  if (diagnostics.jobProcessing.issues.length > 0) {
    console.log('  Issues:');
    for (const issue of diagnostics.jobProcessing.issues) {
      console.log(`    - ${issue}`);
    }
  }

  // Overall Status
  console.log('\n📈 Overall Status:');
  const statusEmoji = {
    operational: '✅',
    degraded: '⚠️',
    unavailable: '❌',
  };
  console.log(
    `  Status: ${
      statusEmoji[diagnostics.overallStatus]
    } ${diagnostics.overallStatus.toUpperCase()}`
  );

  // Issues
  if (diagnostics.issues.length > 0) {
    console.log('\n⚠️  Issues Found:');
    for (const issue of diagnostics.issues) {
      console.log(`  - ${issue}`);
    }
  }

  // Recommendations
  if (diagnostics.recommendations.length > 0) {
    console.log('\n💡 Recommendations:');
    for (const rec of diagnostics.recommendations) {
      console.log(`  - ${rec}`);
    }
  }

  console.log(
    '\n═══════════════════════════════════════════════════════════\n'
  );

  return {
    success: diagnostics.overallStatus === 'operational',
    data: diagnostics,
    exitCode: diagnostics.overallStatus === 'operational' ? 0 : 1,
  };
}

async function cmdDeps(
  framework: ServerlessTestFramework,
  _options: CLIOptions
): Promise<CLIResult> {
  console.log('\n🔍 Verifying dependencies...\n');

  // Default Denrisi dependencies
  const expectedNodes = [
    'ClownsharKSampler_Beta',
    'Sigmas Rescale',
    'BetaSamplingScheduler',
    'CheckpointLoaderSimple',
    'CLIPTextEncode',
    'VAEDecode',
    'SaveImage',
  ];

  const expectedModels = [
    { name: 'z_image_turbo_bf16.safetensors' },
    { name: 'qwen_3_4b.safetensors' },
    { name: 'z-image-turbo-vae.safetensors', type: 'vae' },
  ];

  const result = await framework.verifyDependencies(
    expectedNodes,
    expectedModels
  );

  console.log('Node Verification:');
  for (const node of result.nodes) {
    const status = node.installed ? '✅' : '❌';
    console.log(
      `  ${status} ${node.name}${node.error ? ` (${node.error})` : ''}`
    );
  }

  console.log('\nModel Verification:');
  for (const model of result.models) {
    const status = model.exists ? '✅' : '❌';
    console.log(
      `  ${status} ${model.name}${model.error ? ` (${model.error})` : ''}`
    );
  }

  console.log('\nSummary:');
  console.log(
    `  Nodes: ${result.summary.nodesVerified}/${result.summary.nodesTotal}`
  );
  console.log(
    `  Models: ${result.summary.modelsVerified}/${result.summary.modelsTotal}`
  );
  console.log(`  All Verified: ${result.allVerified ? '✅ Yes' : '❌ No'}`);

  return {
    success: result.allVerified,
    data: result,
    exitCode: result.allVerified ? 0 : 1,
  };
}

async function cmdWorkflow(
  framework: ServerlessTestFramework,
  options: CLIOptions
): Promise<CLIResult> {
  console.log('\n🧪 Testing workflow...\n');

  // For now, use a simple test workflow
  const testWorkflow: WorkflowTestDefinition = {
    id: options.workflow ?? 'test-workflow',
    name: 'Test Workflow',
    workflow: createSimpleTestWorkflow(options.prompt ?? 'a beautiful sunset'),
    testCases: [
      {
        id: 'basic-test',
        name: 'Basic Generation Test',
        expected: {
          status: 'success',
          imageCount: 1,
        },
      },
    ],
  };

  const results = await framework.runTest(testWorkflow);

  console.log('\nTest Results:');
  for (const result of results) {
    const status = result.passed ? '✅' : '❌';
    const jobIdStr = result.jobId ? ` [Job: ${result.jobId}]` : '';
    console.log(
      `  ${status} ${result.testName} (${result.duration}ms)${jobIdStr}${
        result.error ? ` - ${result.error}` : ''
      }`
    );
  }

  const passed = results.filter((r) => r.passed).length;
  const total = results.length;

  console.log(`\nSummary: ${passed}/${total} tests passed`);

  return {
    success: passed === total,
    data: results,
    exitCode: passed === total ? 0 : 1,
  };
}

async function cmdBenchmark(
  framework: ServerlessTestFramework,
  options: CLIOptions
): Promise<CLIResult> {
  console.log('\n⏱️ Running performance benchmark...\n');

  const iterations = options.iterations ?? 3;
  console.log(`Running ${iterations} iterations...`);

  const testWorkflow: WorkflowTestDefinition = {
    id: 'benchmark-workflow',
    name: 'Benchmark Workflow',
    workflow: createSimpleTestWorkflow('a beautiful mountain landscape'),
    testCases: Array.from({ length: iterations }, (_, i) => ({
      id: `benchmark-${i + 1}`,
      name: `Iteration ${i + 1}`,
      expected: {
        status: 'success' as const,
        imageCount: 1,
      },
    })),
  };

  const report = await framework.runValidation(testWorkflow);

  console.log('\nPerformance Results:');
  console.log(
    `  Avg Generation Time: ${report.performance.avgGenerationTime.toFixed(
      0
    )}ms`
  );
  console.log(
    `  Min Generation Time: ${report.performance.minGenerationTime.toFixed(
      0
    )}ms`
  );
  console.log(
    `  Max Generation Time: ${report.performance.maxGenerationTime.toFixed(
      0
    )}ms`
  );
  console.log(
    `  Avg Cost Per Image: $${report.performance.avgCostPerImage.toFixed(6)}`
  );
  console.log(`  Total Cost: $${report.performance.totalCost.toFixed(6)}`);

  console.log('\nTargets:');
  console.log(
    `  Cold Start < 60s: ${
      report.performance.targetsMet.coldStart ? '✅' : '❌'
    }`
  );
  console.log(
    `  Generation < 30s: ${
      report.performance.targetsMet.generationTime ? '✅' : '❌'
    }`
  );
  console.log(
    `  Cost < $0.01: ${
      report.performance.targetsMet.costPerImage ? '✅' : '❌'
    }`
  );

  return {
    success: report.overallStatus === 'passed',
    data: report.performance,
    exitCode: report.overallStatus === 'passed' ? 0 : 1,
  };
}

async function cmdDenrisi(
  framework: ServerlessTestFramework,
  options: CLIOptions
): Promise<CLIResult> {
  console.log('\n🎨 Validating Denrisi workflow...\n');

  const samples = options.samples ?? 5;

  // Create Denrisi test definition
  const denrisiWorkflow: WorkflowTestDefinition = {
    id: 'z-image-danrisi',
    name: 'Z-Image Denrisi Workflow',
    workflow: createDenrisiWorkflow(),
    expectedNodes: [
      'UNETLoader',
      'CLIPLoader',
      'VAELoader',
      'CLIPTextEncode',
      'ConditioningZeroOut',
      'EmptySD3LatentImage',
      'BetaSamplingScheduler',
      'Sigmas Rescale',
      'ClownsharKSampler_Beta',
      'VAEDecode',
      'SaveImage',
    ],
    expectedModels: [
      'z_image_turbo_bf16.safetensors',
      'qwen_3_4b.safetensors',
      'z-image-turbo-vae.safetensors',
    ],
    testCases: Array.from({ length: samples }, (_, i) => ({
      id: `denrisi-test-${i + 1}`,
      name: `Denrisi Test ${i + 1}`,
      inputs: {
        text: getTestPrompt(i),
      },
      expected: {
        status: 'success' as const,
        imageCount: 1,
        minWidth: 512,
        minHeight: 512,
      },
    })),
  };

  if (options.full) {
    console.log('Running full validation...');
    const report = await framework.runValidation(denrisiWorkflow);

    console.log('\n=== Validation Report ===');
    console.log(`\nEndpoint: ${report.endpointId}`);
    console.log(`Status: ${report.overallStatus.toUpperCase()}`);

    console.log('\nHealth:');
    console.log(`  Accessible: ${report.health.accessible ? '✅' : '❌'}`);

    console.log('\nDependencies:');
    console.log(
      `  Nodes: ${report.dependencies.summary.nodesVerified}/${report.dependencies.summary.nodesTotal}`
    );
    console.log(
      `  Models: ${report.dependencies.summary.modelsVerified}/${report.dependencies.summary.modelsTotal}`
    );

    console.log('\nTest Results:');
    console.log(
      `  Passed: ${report.summary.passedTests}/${report.summary.totalTests}`
    );
    console.log(`  Pass Rate: ${report.summary.passRate.toFixed(1)}%`);

    console.log('\nPerformance:');
    console.log(
      `  Avg Generation: ${report.performance.avgGenerationTime.toFixed(0)}ms`
    );
    console.log(`  Targets Met:`);
    console.log(
      `    Cold Start: ${report.performance.targetsMet.coldStart ? '✅' : '❌'}`
    );
    console.log(
      `    Generation: ${
        report.performance.targetsMet.generationTime ? '✅' : '❌'
      }`
    );

    return {
      success: report.overallStatus === 'passed',
      data: report,
      exitCode: report.overallStatus === 'passed' ? 0 : 1,
    };
  } else {
    // Just run tests
    const results = await framework.runTest(denrisiWorkflow);

    const passed = results.filter((r) => r.passed).length;
    console.log(`\nResults: ${passed}/${results.length} tests passed`);

    if (passed < results.length) {
      console.log('\nFailed Tests:');
      for (const result of results.filter((r) => !r.passed)) {
        console.log(
          `  - ${result.testName}${
            result.jobId ? ` [Job: ${result.jobId}]` : ''
          }: ${result.error}`
        );
      }
    }

    return {
      success: passed === results.length,
      data: results,
      exitCode: passed === results.length ? 0 : 1,
    };
  }
}

// =============================================================================
// Helpers
// =============================================================================

function createSimpleTestWorkflow(
  prompt: string
): import('./types').ComfyUIWorkflow {
  // Simplified workflow for testing
  return {
    '1': {
      inputs: {
        ckpt_name: 'z_image_turbo_bf16.safetensors',
      },
      class_type: 'CheckpointLoaderSimple',
    },
    '2': {
      inputs: {
        text: prompt,
        clip: ['1', 1],
      },
      class_type: 'CLIPTextEncode',
    },
    '3': {
      inputs: {
        text: '',
        clip: ['1', 1],
      },
      class_type: 'CLIPTextEncode',
    },
    '4': {
      inputs: {
        width: 512,
        height: 512,
        batch_size: 1,
      },
      class_type: 'EmptyLatentImage',
    },
    '5': {
      inputs: {
        seed: Math.floor(Math.random() * 1000000),
        steps: 4,
        cfg: 1.5,
        sampler_name: 'euler',
        scheduler: 'normal',
        denoise: 1,
        model: ['1', 0],
        positive: ['2', 0],
        negative: ['3', 0],
        latent_image: ['4', 0],
      },
      class_type: 'KSampler',
    },
    '6': {
      inputs: {
        samples: ['5', 0],
        vae: ['1', 2],
      },
      class_type: 'VAEDecode',
    },
    '7': {
      inputs: {
        filename_prefix: 'test',
        images: ['6', 0],
      },
      class_type: 'SaveImage',
    },
  };
}

function createDenrisiWorkflow(
  prompt?: string
): import('./types').ComfyUIWorkflow {
  // Use the real Z-Image Danrisi workflow from the business lib
  return buildZImageDanrisiWorkflow({
    prompt:
      prompt ??
      'a professional portrait of a young woman with blonde hair, studio lighting, high quality',
    negativePrompt: '',
    width: 768,
    height: 1024,
    steps: 20,
    cfg: 1.0,
    seed: Math.floor(Math.random() * 1000000),
  });
}

function getTestPrompt(index: number): string {
  const prompts = [
    'a professional portrait of a young woman with blonde hair',
    'a confident businessman in a modern office',
    'a casual portrait of a person in a coffee shop',
    'an elegant portrait with soft lighting',
    'a dynamic portrait with urban background',
    'a warm and friendly portrait with natural lighting',
    'a stylish portrait with minimalist background',
    'a creative portrait with artistic lighting',
    'a professional headshot with neutral background',
    'a lifestyle portrait in natural environment',
  ];
  return prompts[index % prompts.length];
}

// =============================================================================
// Main Entry Point
// =============================================================================

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const { command, options } = parseArgs(args);

  if (command === 'help' || command === '--help' || command === '-h') {
    printHelp();
    process.exit(0);
  }

  // Log mode
  if (options.mock) {
    console.log('🔧 Running in MOCK MODE (no real API calls)');
  }

  // Create framework
  let framework: ServerlessTestFramework;
  try {
    framework = createFrameworkFromEnv(options.mock ?? false);
  } catch (error) {
    console.error('Failed to create framework:', error);
    process.exit(1);
  }

  // Run command
  let result: CLIResult;
  try {
    switch (command) {
      case 'endpoint':
        result = await cmdEndpoint(framework, options);
        break;
      case 'diagnostics':
      case 'diag':
        result = await cmdDiagnostics(framework, options);
        break;
      case 'deps':
      case 'dependencies':
        result = await cmdDeps(framework, options);
        break;
      case 'workflow':
        result = await cmdWorkflow(framework, options);
        break;
      case 'benchmark':
        result = await cmdBenchmark(framework, options);
        break;
      case 'denrisi':
        result = await cmdDenrisi(framework, options);
        break;
      default:
        console.error(`Unknown command: ${command}`);
        printHelp();
        process.exit(1);
    }
  } catch (error) {
    console.error('Command failed:', error);
    process.exit(1);
  }

  // Output JSON if requested
  if (options.format === 'json') {
    console.log(JSON.stringify(result.data, null, 2));
  }

  // Save to file if requested
  if (options.output && result.data) {
    const fs = await import('fs/promises');
    await fs.writeFile(options.output, JSON.stringify(result.data, null, 2));
    console.log(`\nResults saved to: ${options.output}`);
  }

  process.exit(result.exitCode);
}

// Run main
main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
