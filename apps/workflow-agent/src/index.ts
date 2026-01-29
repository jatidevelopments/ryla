/**
 * RYLA Workflow Agent
 * Autonomous AI agent for ComfyUI workflow deployment
 * 
 * This is the main entry point for the workflow agent.
 * It initializes the agent, sets up health checks, and prepares
 * for workflow deployment orchestration.
 */

import { loadConfig } from './config.js';
import { createHealthCheck } from './health.js';
import { setupModalConfig } from './modal-setup.js';
import { setupGitSSH } from './git-setup.js';
import { initializeMoltbot } from './moltbot-setup.js';
import { setupSlackRoutes, initializeSlack, sendSlackUpdate, createStatusBlocks, createSuccessBlocks, createErrorBlocks } from './slack-handler.js';
import { deployWorkflow } from './workflow-orchestrator.js';
import { WorkflowSubmission } from './slack-handler.js';

async function main() {
  console.log('🚀 Starting RYLA Workflow Agent...');

  try {
    // Load configuration from environment variables (Infisical)
    const config = loadConfig();
    console.log('✅ Configuration loaded');

    // Set up Modal CLI authentication
    // Modal CLI reads from environment variables or ~/.modal/token.json
    process.env.MODAL_TOKEN_ID = config.modal.tokenId;
    process.env.MODAL_TOKEN_ID_SECRET = config.modal.tokenSecret;
    
    // Also write to Modal config file for CLI access
    await setupModalConfig(config.modal);
    console.log('✅ Modal CLI configured');

    // Set up OpenAI API key (for GPT-4o) - Moltbot will use this
    process.env.OPENAI_API_KEY = config.openai.apiKey;
    console.log('✅ OpenAI API configured');

    // Set up Git SSH key if provided
    if (config.git?.sshKey) {
      await setupGitSSH(config.git.sshKey);
      console.log('✅ Git SSH key configured');
    }

    // Start Express server for health checks and Slack webhooks
    const express = (await import('express')).default;
    const app = express();
    
    // Middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Health check endpoint
    const healthApp = createHealthCheck();
    app.use(healthApp);

    // Initialize Slack (if credentials provided)
    let slackInitialized = false;
    if (config.slack.botToken && config.slack.signingSecret) {
      const slackConfig = {
        botToken: config.slack.botToken,
        signingSecret: config.slack.signingSecret,
      };
      const { webClient, webhook } = initializeSlack(slackConfig);
      
      // Set up Slack webhook handler
      setupSlackRoutes(app, slackConfig, async (submission: WorkflowSubmission) => {
        await handleWorkflowSubmission(submission, config, webClient, webhook);
      });
      
      slackInitialized = true;
      console.log('✅ Slack integration configured');
    } else {
      console.log('⏳ Slack integration pending (credentials not provided)');
    }

    // Initialize Moltbot agent (when available)
    await initializeMoltbot({
      openaiApiKey: config.openai.apiKey,
      model: 'gpt-4o',
      slackBotToken: config.slack.botToken,
      slackSigningSecret: config.slack.signingSecret,
    });

    // Start server
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`✅ Server running on port ${port}`);
      console.log(`   Health: http://localhost:${port}/health`);
      if (slackInitialized) {
        console.log(`   Slack webhook: http://localhost:${port}/slack/webhook`);
      }
    });

    console.log('✅ Workflow agent initialized');
    console.log('📝 Ready for workflow deployments');
    if (!slackInitialized) {
      console.log('');
      console.log('📋 Next steps:');
      console.log('   1. Provide SLACK_BOT_TOKEN and SLACK_SIGNING_SECRET');
      console.log('   2. Configure Slack webhook URL');
    }

    // Keep process alive
    process.on('SIGTERM', () => {
      console.log('🛑 Received SIGTERM, shutting down gracefully...');
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Failed to start workflow agent:', error);
    process.exit(1);
  }
}

/**
 * Handle workflow submission from Slack
 */
async function handleWorkflowSubmission(
  submission: WorkflowSubmission,
  config: any,
  webClient: any,
  webhook: any
): Promise<void> {
  const workflowName = submission.workflowName || 'workflow';
  
  try {
    // Send acknowledgment
    await sendSlackUpdate(
      webhook,
      webClient,
      submission.channelId || '',
      submission.messageTs,
      `📥 Received workflow: ${workflowName}\n📊 Starting analysis...`,
      createStatusBlocks(workflowName, '📊 Analyzing...')
    );

    // Deploy workflow
    const result = await deployWorkflow(submission, {
      costLimit: 20,
      maxIterations: 10,
      workflowName,
    });

    // Send result
    if (result.success) {
      await sendSlackUpdate(
        webhook,
        webClient,
        submission.channelId || '',
        submission.messageTs,
        `✅ Deployment complete: ${workflowName}`,
        createSuccessBlocks(workflowName, result.endpointUrl!, result.cost, 20)
      );
    } else {
      await sendSlackUpdate(
        webhook,
        webClient,
        submission.channelId || '',
        submission.messageTs,
        `❌ Deployment failed: ${workflowName}`,
        createErrorBlocks(
          workflowName,
          result.errors?.join(', ') || 'Unknown error',
          result.iterations,
          10,
          result.cost
        )
      );
    }
  } catch (error: any) {
    console.error('Error handling workflow submission:', error);
    await sendSlackUpdate(
      webhook,
      webClient,
      submission.channelId || '',
      submission.messageTs,
      `❌ Error: ${error.message || String(error)}`,
      []
    );
  }
}

main();
