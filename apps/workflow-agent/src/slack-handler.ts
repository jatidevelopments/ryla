/**
 * Slack Webhook Handler
 * Handles incoming Slack webhooks for workflow submissions
 */

import { IncomingWebhook } from '@slack/webhook';
import { WebClient } from '@slack/web-api';
import { Express, Request, Response } from 'express';

export interface SlackConfig {
  botToken: string;
  signingSecret: string;
  webhookUrl?: string;
}

export interface WorkflowSubmission {
  workflowJson: string | object;
  workflowName?: string;
  userId?: string;
  channelId?: string;
  messageTs?: string;
}

/**
 * Initialize Slack clients
 */
export function initializeSlack(config: SlackConfig) {
  const webClient = new WebClient(config.botToken);
  const webhook = config.webhookUrl
    ? new IncomingWebhook(config.webhookUrl)
    : null;

  return { webClient, webhook };
}

/**
 * Send status update to Slack
 */
export async function sendSlackUpdate(
  webhook: IncomingWebhook | null,
  webClient: WebClient,
  channelId: string,
  messageTs: string | undefined,
  message: string,
  blocks?: any[]
): Promise<void> {
  if (webhook) {
    await webhook.send({
      text: message,
      blocks,
    });
  } else if (channelId && messageTs) {
    // Update existing message
    await webClient.chat.update({
      channel: channelId,
      ts: messageTs,
      text: message,
      blocks,
    });
  } else if (channelId) {
    // Send new message
    await webClient.chat.postMessage({
      channel: channelId,
      text: message,
      blocks,
    });
  }
}

/**
 * Create Slack status update blocks
 */
export function createStatusBlocks(
  workflowName: string,
  status: string,
  cost?: number,
  costLimit?: number,
  iteration?: number,
  maxIterations?: number
): any[] {
  const blocks: any[] = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Workflow:* ${workflowName}\n*Status:* ${status}`,
      },
    },
  ];

  if (cost !== undefined && costLimit !== undefined) {
    blocks[0].text.text += `\n*Cost:* $${cost.toFixed(2)} / $${costLimit.toFixed(2)}`;
  }

  if (iteration !== undefined && maxIterations !== undefined) {
    blocks[0].text.text += `\n*Iteration:* ${iteration}/${maxIterations}`;
  }

  return blocks;
}

/**
 * Create success notification blocks
 */
export function createSuccessBlocks(
  workflowName: string,
  endpointUrl: string,
  cost: number,
  costLimit: number
): any[] {
  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*✅ Deployment Complete*\n*Workflow:* ${workflowName}\n*Endpoint:* ${endpointUrl}\n*Cost:* $${cost.toFixed(2)} / $${costLimit.toFixed(2)}\n*Status:* ✅ All tests passed`,
      },
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Test Endpoint',
          },
          url: `${endpointUrl}/health`,
          style: 'primary',
        },
      ],
    },
  ];
}

/**
 * Create error notification blocks
 */
export function createErrorBlocks(
  workflowName: string,
  error: string,
  iteration: number,
  maxIterations: number,
  cost: number
): any[] {
  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*❌ Deployment Failed*\n*Workflow:* ${workflowName}\n*Error:* ${error}\n*Iteration:* ${iteration}/${maxIterations}\n*Cost:* $${cost.toFixed(2)}`,
      },
    },
  ];
}

/**
 * Extract workflow JSON from Slack message or file
 */
export function extractWorkflowFromSlack(
  body: any
): WorkflowSubmission | null {
  // Handle file upload
  if (body.event?.files && body.event.files.length > 0) {
    const file = body.event.files[0];
    if (file.name?.endsWith('.json')) {
      // File URL needs to be downloaded
      return {
        workflowJson: file.url, // Will need to download
        workflowName: file.name.replace('.json', ''),
        userId: body.event.user,
        channelId: body.event.channel,
        messageTs: body.event.ts,
      };
    }
  }

  // Handle JSON in message text
  if (body.event?.text) {
    const text = body.event.text;
    try {
      // Try to parse as JSON
      const json = JSON.parse(text);
      return {
        workflowJson: json,
        workflowName: body.event.text.substring(0, 50),
        userId: body.event.user,
        channelId: body.event.channel,
        messageTs: body.event.ts,
      };
    } catch {
      // Not JSON, check if it contains JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const json = JSON.parse(jsonMatch[0]);
          return {
            workflowJson: json,
            workflowName: 'workflow',
            userId: body.event.user,
            channelId: body.event.channel,
            messageTs: body.event.ts,
          };
        } catch {
          // Invalid JSON
        }
      }
    }
  }

  return null;
}

/**
 * Set up Slack webhook routes
 */
export function setupSlackRoutes(
  app: Express,
  config: SlackConfig,
  onWorkflowSubmission: (submission: WorkflowSubmission) => Promise<void>
) {
  const { webClient } = initializeSlack(config);

  // Slack webhook endpoint
  app.post('/slack/webhook', async (req: Request, res: Response) => {
    // Verify Slack signature (simplified - should use proper verification)
    // TODO: Add proper Slack signature verification

    // Handle URL verification challenge
    if (req.body.type === 'url_verification') {
      return res.json({ challenge: req.body.challenge });
    }

    // Handle events
    if (req.body.type === 'event_callback') {
      const submission = extractWorkflowFromSlack(req.body);
      if (submission) {
        // Acknowledge immediately
        res.json({ ok: true });

        // Process asynchronously
        onWorkflowSubmission(submission).catch((error) => {
          console.error('Error processing workflow submission:', error);
        });

        return;
      }
    }

    res.json({ ok: true });
  });

  return { webClient };
}
