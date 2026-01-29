/**
 * Git SSH Configuration Setup
 * Configures Git SSH key for repository access
 */

import { writeFile, mkdir, chmod } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';

/**
 * Set up Git SSH key for repository access
 * Writes SSH key to ~/.ssh/id_ed25519 and configures Git
 */
export async function setupGitSSH(sshKey: string): Promise<void> {
  const sshDir = join(homedir(), '.ssh');
  const keyFile = join(sshDir, 'id_ed25519');

  try {
    // Create .ssh directory if it doesn't exist
    await mkdir(sshDir, { recursive: true });

    // Write SSH key
    await writeFile(keyFile, sshKey, {
      mode: 0o600, // Read/write for owner only
    });

    // Set correct permissions
    await chmod(keyFile, 0o600);

    console.log(`✅ Git SSH key written to ${keyFile}`);

    // Configure SSH to use this key
    const sshConfig = join(sshDir, 'config');
    const configContent = `Host github.com
  HostName github.com
  User git
  IdentityFile ${keyFile}
  StrictHostKeyChecking no
`;

    await writeFile(sshConfig, configContent, {
      mode: 0o600,
    });

    console.log(`✅ Git SSH config written to ${sshConfig}`);
  } catch (error) {
    console.error(`❌ Failed to set up Git SSH key: ${error}`);
    throw error;
  }
}
