/**
 * Modal CLI Configuration Setup
 * Configures Modal CLI with credentials from Infisical
 */

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';

export interface ModalCredentials {
  tokenId: string;
  tokenSecret: string;
}

/**
 * Set up Modal CLI configuration
 * Modal CLI can read from:
 * 1. Environment variables (MODAL_TOKEN_ID, MODAL_TOKEN_ID_SECRET)
 * 2. ~/.modal/token.json file
 * 
 * We'll set both for maximum compatibility
 */
export async function setupModalConfig(credentials: ModalCredentials): Promise<void> {
  // Set environment variables (already done in index.ts, but ensure they're set)
  process.env.MODAL_TOKEN_ID = credentials.tokenId;
  process.env.MODAL_TOKEN_ID_SECRET = credentials.tokenSecret;

  // Also write to Modal config file for CLI access
  const modalDir = join(homedir(), '.modal');
  const tokenFile = join(modalDir, 'token.json');

  try {
    // Create .modal directory if it doesn't exist
    await mkdir(modalDir, { recursive: true });

    // Write token file
    const tokenData = {
      token_id: credentials.tokenId,
      token_secret: credentials.tokenSecret,
    };

    await writeFile(tokenFile, JSON.stringify(tokenData, null, 2), {
      mode: 0o600, // Read/write for owner only
    });

    console.log(`✅ Modal token file written to ${tokenFile}`);
  } catch (error) {
    console.warn(`⚠️  Failed to write Modal token file: ${error}`);
    console.warn('   Modal CLI will use environment variables instead');
  }

  // Verify Modal CLI is accessible (non-blocking)
  // Note: Modal CLI verification happens asynchronously to not block startup
  import('child_process')
    .then(({ exec }) => import('util').then(({ promisify }) => {
      const execAsync = promisify(exec);
      return execAsync('modal --version', { env: { ...process.env } })
        .then(({ stdout }) => {
          console.log(`✅ Modal CLI available: ${stdout.toString().trim()}`);
        })
        .catch(() => {
          console.warn('⚠️  Modal CLI not accessible (will use environment variables)');
        });
    }))
    .catch(() => {
      // Ignore if child_process import fails
    });
}
