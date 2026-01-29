#!/usr/bin/env node
/**
 * Workflow Deployment CLI
 * 
 * One-command deployment tool for ComfyUI workflows to Modal/RunPod serverless
 * 
 * Usage:
 *   pnpm workflow-deploy analyze workflow.json --name my-workflow
 *   pnpm workflow-deploy generate workflow.json --platform modal --name my-workflow
 *   pnpm workflow-deploy deploy workflow.json --platform modal --name my-workflow
 */

import { promises as fs } from 'fs';
import path from 'path';
import { analyzeWorkflowJSON, analyzeWorkflowFromFile } from '../workflow-analyzer/analyze-workflow-json';
import { generateModalCode, writeModalFile, DeploymentOptions as ModalOptions } from './generate-modal-code';
import { generateRunPodDockerfile, writeDockerfile, RunPodOptions } from './generate-runpod-dockerfile';
import { getModalLogs, checkModalAppDeployed, getModalAppEndpoint, testModalEndpoint } from './modal-utils';

function parseArgs() {
  const args = process.argv.slice(2);
  const command = args[0];
  const options: Record<string, string | boolean> = {};

  for (let i = 1; i < args.length; i += 1) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const [key, value] = arg.replace('--', '').split('=');
      options[key] = value ?? true;
    } else if (!options._file && !arg.startsWith('-')) {
      // First non-option arg is the file
      options._file = arg;
    }
  }

  return { command, options };
}

async function main() {
  const { command, options } = parseArgs();
  const workflowFile = options._file as string;

  if (!workflowFile && command !== 'help') {
    console.error('❌ Error: Workflow file required');
    console.error('\nUsage:');
    console.error('  pnpm workflow:deploy analyze <workflow-file> [--name=<name>] [--discover]');
    console.error('  pnpm workflow:deploy generate <workflow-file> [--platform=modal|runpod] [--name=<name>]');
    console.error('  pnpm workflow:deploy deploy <workflow-file> [--platform=modal] [--name=<name>]');
    console.error('  pnpm workflow:deploy logs <app-name> [--timeout=30]');
    console.error('  pnpm workflow:deploy status <app-name>');
    process.exit(1);
  }

  if (command === 'analyze' || !command) {
    // Analyze command
    try {
      console.log(`📊 Analyzing workflow: ${workflowFile}`);
      const discoverUnknown = options.discover === true || options.discover === 'true';
      if (discoverUnknown) {
        console.log('🔍 Auto-discovering unknown nodes...');
      }
      const analysis = await analyzeWorkflowFromFile(
        workflowFile,
        options.name as string | undefined,
        { discoverUnknown }
      );
      
      console.log('\n✅ Workflow Analysis:');
      console.log(`   ID: ${analysis.workflowId}`);
      console.log(`   Name: ${analysis.workflowName}`);
      console.log(`   Type: ${analysis.workflowType}`);
      console.log(`   Custom Nodes: ${analysis.nodeCount}`);
      console.log(`   Models: ${analysis.modelCount}`);
      
      if (analysis.customNodes.length > 0) {
        console.log('\n📦 Custom Nodes:');
        for (const node of analysis.customNodes) {
          if (node.managerPackage) {
            console.log(`   ✅ ${node.classType} → Manager: ${node.managerPackage}`);
          } else if (node.gitRepo) {
            console.log(`   ✅ ${node.classType} → GitHub: ${node.gitRepo.url} (${node.gitRepo.version})`);
          } else {
            console.log(`   ⚠️  ${node.classType} → Unknown (not in registry)`);
          }
        }
      }
      
      if (analysis.models.length > 0) {
        console.log('\n🖼️  Models:');
        for (const model of analysis.models) {
          if (model.source === 'huggingface') {
            console.log(`   ✅ ${model.filename} → HuggingFace (${model.type})`);
          } else {
            console.log(`   ⚠️  ${model.filename} → Manual setup required (${model.type})`);
          }
        }
      }
      
      if (analysis.missingNodes.length > 0) {
        console.log('\n⚠️  Missing Nodes (not in registry):');
        for (const node of analysis.missingNodes) {
          console.log(`   - ${node}`);
        }
        console.log('\n💡 Tip: Use --discover flag to auto-discover unknown nodes');
      }
      
      if (analysis.missingModels.length > 0) {
        console.log('\n⚠️  Missing Models (not in registry):');
        for (const model of analysis.missingModels) {
          console.log(`   - ${model}`);
        }
        console.log('\n💡 Tip: Models not in registry need manual download and setup');
      }
      
      // Summary
      const allNodesFound = analysis.missingNodes.length === 0;
      const allModelsFound = analysis.missingModels.length === 0;
      
      if (allNodesFound && allModelsFound) {
        console.log('\n✅ All dependencies found! Ready to generate deployment code.');
      } else {
        console.log('\n⚠️  Some dependencies missing. Deployment code will be generated but may need manual fixes.');
      }
      
      // Save analysis JSON
      const outputPath = path.join(
        path.dirname(workflowFile),
        `${path.basename(workflowFile, path.extname(workflowFile))}_analysis.json`
      );
      await fs.writeFile(outputPath, JSON.stringify(analysis, null, 2), 'utf-8');
      console.log(`\n💾 Analysis saved to: ${outputPath}`);
      
    } catch (error) {
      console.error('❌ Error analyzing workflow:', error);
      process.exit(1);
    }
  } else if (command === 'generate') {
    // Generate command
    try {
      console.log(`📊 Analyzing workflow: ${workflowFile}`);
      const analysis = await analyzeWorkflowFromFile(workflowFile, options.name as string | undefined);
      
      const workflowName = (options.name as string | undefined) || analysis.workflowName;
      const safeName = workflowName.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const outputDir = path.resolve((options.output as string | undefined) || './scripts/generated/workflows');
      await fs.mkdir(outputDir, { recursive: true });
      
      const platform = (options.platform as string | undefined) || 'modal';
      
      if (platform === 'modal') {
        console.log('\n🔧 Generating Modal Python code...');
        const modalOptions: ModalOptions = {
          appName: `ryla-${safeName}`,
          functionName: safeName,
          gpu: (options.gpu as string | undefined) || 'A100',
          timeout: parseInt((options.timeout as string | undefined) || '1800'),
          volumeName: (options.volume as string | undefined) || 'ryla-models',
        };
        
        const outputPath = path.join(outputDir, `${safeName}_modal.py`);
        await writeModalFile(analysis, modalOptions, outputPath);
        console.log(`✅ Modal code generated: ${outputPath}`);
        console.log(`\n📝 To deploy:`);
        console.log(`   modal deploy ${outputPath}`);
        
      } else if (platform === 'runpod') {
        console.log('\n🔧 Generating RunPod Dockerfile...');
        const runpodOptions: RunPodOptions = {};
        const outputPath = path.join(outputDir, `${safeName}_Dockerfile`);
        await writeDockerfile(analysis, runpodOptions, outputPath);
        console.log(`✅ Dockerfile generated: ${outputPath}`);
        console.log(`\n📝 To deploy:`);
        console.log(`   1. Build image: docker build -f ${outputPath} -t your-registry/${safeName}:latest .`);
        console.log(`   2. Push image: docker push your-registry/${safeName}:latest`);
        console.log(`   3. Create RunPod endpoint with image: your-registry/${safeName}:latest`);
        
      } else {
        console.error(`❌ Unknown platform: ${platform}`);
        console.error('   Supported platforms: modal, runpod');
        process.exit(1);
      }
      
    } catch (error) {
      console.error('❌ Error generating deployment code:', error);
      process.exit(1);
    }
  } else if (command === 'deploy') {
    // Deploy command
    try {
      console.log(`🚀 Deploying workflow: ${workflowFile}`);
      
      const platform = (options.platform as string | undefined) || 'modal';
      
      if (platform === 'modal') {
        console.log('\n📊 Step 1: Analyzing workflow...');
        const analysis = await analyzeWorkflowFromFile(
          workflowFile,
          options.name as string | undefined,
          { discoverUnknown: false } // Don't auto-discover during deploy (too slow)
        );
        
        // Warn about missing dependencies
        if (analysis.missingNodes.length > 0 || analysis.missingModels.length > 0) {
          console.log('\n⚠️  Warning: Some dependencies are missing:');
          if (analysis.missingNodes.length > 0) {
            console.log(`   Missing nodes: ${analysis.missingNodes.join(', ')}`);
          }
          if (analysis.missingModels.length > 0) {
            console.log(`   Missing models: ${analysis.missingModels.join(', ')}`);
          }
          console.log('   Generated code may need manual fixes.');
        }
        
        const workflowName = (options.name as string | undefined) || analysis.workflowName;
        const safeName = workflowName.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const outputDir = path.join(process.cwd(), 'scripts/generated/workflows');
        await fs.mkdir(outputDir, { recursive: true });
        
        console.log('\n🔧 Step 2: Generating Modal code...');
        const modalOptions: ModalOptions = {
          appName: `ryla-${safeName}`,
          functionName: safeName,
          gpu: (options.gpu as string | undefined) || 'A100',
          timeout: parseInt((options.timeout as string | undefined) || '1800'),
          volumeName: 'ryla-models',
        };
        
        const outputPath = path.join(outputDir, `${safeName}_modal.py`);
        await writeModalFile(analysis, modalOptions, outputPath);
        console.log(`✅ Code generated: ${outputPath}`);
        
        console.log('\n🚀 Step 3: Deploying to Modal...');
        console.log('   (Run this command manually for now:)');
        console.log(`   modal deploy ${outputPath}`);
        console.log('\n💡 Note: Automatic deployment coming soon!');
        console.log('\n📋 After deployment, check status:');
        console.log(`   # Check if deployed:`);
        console.log(`   modal app list | grep ${modalOptions.appName}`);
        console.log(`   # View logs (with timeout):`);
        console.log(`   timeout 30 modal app logs ${modalOptions.appName} || echo "Timeout"`);
        console.log(`   # Or use the utility:`);
        console.log(`   pnpm workflow:deploy logs ${modalOptions.appName}`);
        
      } else {
        console.error(`❌ Automatic deployment for ${platform} not yet implemented`);
        console.error('   Use "generate" command to create deployment code');
        process.exit(1);
      }
      
    } catch (error) {
      console.error('❌ Error deploying workflow:', error);
      process.exit(1);
    }
  } else if (command === 'logs') {
    // Logs command - view Modal app logs with timeout
    const appName = workflowFile || (options.app as string);
    if (!appName) {
      console.error('❌ Error: App name required');
      console.error('\nUsage:');
      console.error('  pnpm workflow:deploy logs <app-name> [--timeout=30]');
      process.exit(1);
    }
    
    try {
      const timeoutSeconds = parseInt((options.timeout as string | undefined) || '30');
      console.log(`📋 Fetching logs for: ${appName} (timeout: ${timeoutSeconds}s)...`);
      
      const logs = await getModalLogs({
        appName,
        timeoutSeconds,
        maxRetries: 3,
        retryDelay: 5,
      });
      
      console.log('\n' + logs);
    } catch (error) {
      console.error('❌ Error fetching logs:', error);
      process.exit(1);
    }
  } else if (command === 'status') {
    // Status command - check Modal app status
    const appName = workflowFile || (options.app as string);
    if (!appName) {
      console.error('❌ Error: App name required');
      console.error('\nUsage:');
      console.error('  pnpm workflow:deploy status <app-name>');
      process.exit(1);
    }
    
    try {
      console.log(`📊 Checking status for: ${appName}...`);
      
      const deployed = await checkModalAppDeployed(appName);
      if (!deployed) {
        console.log(`\n❌ App "${appName}" not found in deployed apps`);
        console.log('   Run: modal app list');
        process.exit(1);
      }
      
      console.log(`\n✅ App "${appName}" is deployed`);
      
      // Try to get endpoint URL
      // For generated workflows, class name is typically the function name (PascalCase)
      const functionName = appName.replace(/^ryla-/, '').replace(/-/g, '_');
      const className = functionName
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('_');
      
      const endpoint = await getModalAppEndpoint(appName, undefined, className);
      if (endpoint) {
        console.log(`\n🌐 Endpoint: ${endpoint}`);
        console.log(`   Health: ${endpoint}/health`);
        console.log(`   Generate: ${endpoint}/generate`);
        
        console.log('\n🏥 Testing health endpoint...');
        const health = await testModalEndpoint(endpoint, 30);
        if (health.healthy) {
          console.log('✅ Health check: PASSED');
          if (health.response) {
            console.log(`   Response: ${JSON.stringify(health.response)}`);
          }
        } else {
          console.log('⚠️  Health check: FAILED');
          if (health.error) {
            console.log(`   Error: ${health.error}`);
            console.log('\n💡 Possible reasons:');
            console.log('   1. Cold start in progress (wait 2-5 minutes)');
            console.log('   2. Endpoint path mismatch (check Modal dashboard)');
            console.log('   3. FastAPI app not properly configured');
            console.log(`\n   Check Modal dashboard: https://modal.com/apps`);
            console.log(`   Or view logs: pnpm workflow:deploy logs ${appName}`);
          }
        }
      } else {
        console.log('\n⚠️  Could not determine endpoint URL');
        console.log('   Check Modal dashboard: https://modal.com/apps');
        console.log('   Modal endpoint pattern: https://{workspace}--{app-name}-{class-name}-fastapi-app.modal.run');
      }
    } catch (error) {
      console.error('❌ Error checking status:', error);
      process.exit(1);
    }
  } else {
    console.error(`❌ Unknown command: ${command}`);
    console.error('\nAvailable commands:');
    console.error('  analyze  - Analyze workflow JSON and show dependencies');
    console.error('  generate - Generate deployment code without deploying');
    console.error('  deploy   - Analyze, generate, and deploy workflow');
    console.error('  logs     - View Modal app logs (with timeout)');
    console.error('  status   - Check Modal app deployment status');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
