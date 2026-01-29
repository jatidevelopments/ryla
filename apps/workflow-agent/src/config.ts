/**
 * Configuration loader for workflow agent
 * Loads secrets from environment variables (injected by Infisical)
 */

export interface AgentConfig {
  modal: {
    tokenId: string;
    tokenSecret: string;
  };
  slack: {
    botToken: string;
    signingSecret: string;
  };
  openai: {
    apiKey: string;
  };
  git?: {
    sshKey?: string;
    repoUrl?: string;
  };
}

export function loadConfig(): AgentConfig {
  // Validate required environment variables
  // Modal tokens are required
  const required = [
    'MODAL_TOKEN_ID',
    'MODAL_TOKEN_ID_SECRET',
  ];

  // Slack and OpenAI are optional for now (will be provided later)
  const optional = [
    'SLACK_BOT_TOKEN',
    'SLACK_SIGNING_SECRET',
    'OPENAI_API_KEY',
  ];

  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }

  // Warn about optional missing variables
  const missingOptional = optional.filter((key) => !process.env[key]);
  if (missingOptional.length > 0) {
    console.warn(
      `⚠️  Optional environment variables not set: ${missingOptional.join(', ')}`
    );
    console.warn('   These will be required for full functionality');
  }

  return {
    modal: {
      tokenId: process.env.MODAL_TOKEN_ID!,
      tokenSecret: process.env.MODAL_TOKEN_ID_SECRET!,
    },
    slack: {
      botToken: process.env.SLACK_BOT_TOKEN || '',
      signingSecret: process.env.SLACK_SIGNING_SECRET || '',
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
    },
    git: {
      sshKey: process.env.GIT_SSH_KEY,
      repoUrl: process.env.GIT_REPO_URL,
    },
  };
}
