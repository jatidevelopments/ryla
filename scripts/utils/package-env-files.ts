#!/usr/bin/env tsx
/**
 * Package Environment Files Script
 * 
 * Finds all .env files in the project and creates a password-protected zip archive.
 * Generates a secure random password and provides extraction instructions.
 * 
 * Usage:
 *   tsx scripts/utils/package-env-files.ts
 *   pnpm package:env
 */

import { execSync } from 'child_process';
import { readdirSync, statSync, existsSync, writeFileSync, readFileSync, unlinkSync } from 'fs';
import { join, relative, resolve } from 'path';
import { randomBytes } from 'crypto';

const PROJECT_ROOT = resolve(__dirname, '../..');
const OUTPUT_DIR = join(PROJECT_ROOT, 'tmp');
const ZIP_FILENAME = 'ryla-env-files.zip';
const ZIP_PATH = join(OUTPUT_DIR, ZIP_FILENAME);

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title: string) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bright');
  console.log('='.repeat(60));
}

/**
 * Recursively find all .env files in the project
 */
function findEnvFiles(root: string, currentPath: string = root): string[] {
  const envFiles: string[] = [];
  
  try {
    const entries = readdirSync(currentPath);
    
    for (const entry of entries) {
      // Skip common directories that shouldn't contain .env files
      if (['node_modules', '.git', 'dist', 'tmp', '.next', '.nx'].includes(entry)) {
        continue;
      }
      
      const fullPath = join(currentPath, entry);
      
      try {
        const stat = statSync(fullPath);
        
        if (stat.isDirectory()) {
          // Recursively search subdirectories
          envFiles.push(...findEnvFiles(root, fullPath));
        } else if (stat.isFile() && entry.startsWith('.env')) {
          envFiles.push(fullPath);
        }
      } catch (err) {
        // Skip files/directories we can't access
        continue;
      }
    }
  } catch (err) {
    // Skip directories we can't access
  }
  
  return envFiles;
}

/**
 * Generate a secure random password
 */
function generatePassword(length: number = 32): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  const randomValues = randomBytes(length);
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += charset[randomValues[i] % charset.length];
  }
  
  return password;
}

/**
 * Check if zip command is available
 */
function checkZipAvailable(): boolean {
  try {
    execSync('which zip', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if 7zip is available (preferred for better security)
 */
function check7zipAvailable(): boolean {
  try {
    execSync('which 7z', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Create password-protected zip using 7zip (preferred - more secure)
 */
function createZipWith7zip(envFiles: string[], password: string): void {
  // Ensure output directory exists
  if (!existsSync(OUTPUT_DIR)) {
    execSync(`mkdir -p "${OUTPUT_DIR}"`, { stdio: 'inherit' });
  }
  
  // Remove existing zip if it exists
  if (existsSync(ZIP_PATH)) {
    execSync(`rm "${ZIP_PATH}"`, { stdio: 'ignore' });
  }
  
  // Change to project root to maintain relative paths
  const cwd = process.cwd();
  process.chdir(PROJECT_ROOT);
  
  try {
    // Create zip file with relative paths
    const relativeFiles = envFiles.map(file => relative(PROJECT_ROOT, file));
    
    // 7zip supports password via -p flag (more secure than zip -P)
    // Create a temporary password file for 7zip
    const tempPasswordFile = join(OUTPUT_DIR, '.7z-password-temp');
    writeFileSync(tempPasswordFile, password, 'utf-8');
    
    try {
      // Use 7zip with password file (more secure)
      const filesList = relativeFiles.map(f => `"${f}"`).join(' ');
      const zipCommand = `7z a -tzip -p"${password}" "${ZIP_PATH}" ${filesList}`;
      
      execSync(zipCommand, { 
        stdio: 'inherit',
        cwd: PROJECT_ROOT 
      });
    } finally {
      // Clean up temp password file
      if (existsSync(tempPasswordFile)) {
        execSync(`rm "${tempPasswordFile}"`, { stdio: 'ignore' });
      }
    }
  } finally {
    process.chdir(cwd);
  }
}

/**
 * Create password-protected zip using system zip command
 */
function createZipWithSystemZip(envFiles: string[], password: string): void {
  // Ensure output directory exists
  if (!existsSync(OUTPUT_DIR)) {
    execSync(`mkdir -p "${OUTPUT_DIR}"`, { stdio: 'inherit' });
  }
  
  // Remove existing zip if it exists
  if (existsSync(ZIP_PATH)) {
    execSync(`rm "${ZIP_PATH}"`, { stdio: 'ignore' });
  }
  
  // Change to project root to maintain relative paths
  const cwd = process.cwd();
  process.chdir(PROJECT_ROOT);
  
  try {
    // Create zip file with relative paths
    const relativeFiles = envFiles.map(file => relative(PROJECT_ROOT, file));
    
    // Use zip with -P flag (password visible in process list - less secure)
    // Note: zip -e requires interactive password input, so we use -P
    log('\n⚠️  Security Note: Using zip -P flag', 'yellow');
    log('   Password may be visible in process list. Consider installing 7zip for better security.', 'yellow');
    log('   Install: brew install p7zip (macOS) or apt-get install p7zip-full (Linux)\n', 'yellow');
    
    const zipCommand = `zip -r -P "${password}" "${ZIP_PATH}" ${relativeFiles.map(f => `"${f}"`).join(' ')}`;
    
    execSync(zipCommand, { 
      stdio: 'inherit',
      cwd: PROJECT_ROOT 
    });
  } finally {
    process.chdir(cwd);
  }
}


/**
 * Check if GitHub CLI is available
 */
function checkGitHubCLIAvailable(): boolean {
  try {
    execSync('which gh', { stdio: 'ignore' });
    // Also check if authenticated
    try {
      execSync('gh auth status', { stdio: 'ignore' });
      return true;
    } catch {
      return false; // CLI exists but not authenticated
    }
  } catch {
    return false;
  }
}

/**
 * Upload zip file to GitHub Gist using GitHub CLI
 * Since Gists don't support binary files, we base64 encode it first
 */
async function uploadToGitHubGist(filePath: string): Promise<string | null> {
  try {
    log('\n📤 Uploading to GitHub Gist (base64 encoded)...', 'cyan');
    
    // Read the zip file and base64 encode it
    const zipData = readFileSync(filePath);
    const base64Data = zipData.toString('base64');
    
    // Create a temporary text file with base64 content
    const tempBase64File = join(OUTPUT_DIR, `${ZIP_FILENAME}.base64.txt`);
    writeFileSync(tempBase64File, base64Data, 'utf-8');
    
    try {
      // Use GitHub CLI to create a secret gist (secret is default, no flag needed)
      // Upload the base64 encoded file
      const gistCommand = `gh gist create "${tempBase64File}" -d "RYLA Environment Files (base64 encoded zip)"`;
      
      let url: string;
      try {
        url = execSync(gistCommand, { 
          encoding: 'utf-8',
          stdio: ['ignore', 'pipe', 'pipe'],
          timeout: 30000
        }).trim();
      } catch (gistError) {
        const errorMsg = gistError instanceof Error ? gistError.message : String(gistError);
        log(`   Error: ${errorMsg}`, 'yellow');
        throw gistError;
      }
      
      // GitHub CLI returns the gist URL
      if (url && (url.startsWith('https://gist.github.com/') || url.includes('gist.github.com'))) {
        log(`✅ Upload successful`, 'green');
        
        // Try to get the raw URL for direct download
        try {
          const gistId = url.split('/').pop()?.split('#')[0];
          if (gistId) {
            // Get the filename from gist
            const gistFiles = execSync(`gh gist view ${gistId} --json files --jq '.files | keys[0]'`, {
              encoding: 'utf-8',
              stdio: ['ignore', 'pipe', 'pipe'],
              timeout: 10000
            }).trim();
            
            // Get the username from gist view
            const gistInfo = execSync(`gh gist view ${gistId} --json owner --jq '.owner.login'`, {
              encoding: 'utf-8',
              stdio: ['ignore', 'pipe', 'pipe'],
              timeout: 10000
            }).trim();
            
            if (gistInfo && gistInfo !== 'null' && gistFiles) {
              const filename = gistFiles.replace(/"/g, '');
              const rawUrl = `https://gist.githubusercontent.com/${gistInfo}/${gistId}/raw/${filename}`;
              return rawUrl;
            }
          }
        } catch {
          // If we can't get raw URL, return the gist URL
        }
        return url;
      }
      
      return null;
    } finally {
      // Clean up temp file
      if (existsSync(tempBase64File)) {
        unlinkSync(tempBase64File);
      }
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    if (errorMsg.includes('not authenticated') || errorMsg.includes('authentication')) {
      log(`⚠️  GitHub CLI not authenticated. Run: gh auth login`, 'yellow');
    } else {
      log(`⚠️  Upload failed: ${errorMsg}`, 'yellow');
    }
    return null;
  }
}


/**
 * Generate extraction instructions
 */
function generateInstructions(password: string, envFiles: string[], downloadUrl?: string): string {
  const instructions = `
${'='.repeat(60)}
EXTRACTION INSTRUCTIONS
${'='.repeat(60)}

📦 Archive Location: ${ZIP_PATH}
🔐 Password: ${password}
${downloadUrl ? `\n🌐 Download URL (base64 encoded): ${downloadUrl}\n📥 Download and decode:\n   curl -L -o ryla-env-files.zip.base64.txt "${downloadUrl}"\n   base64 -d ryla-env-files.zip.base64.txt > ryla-env-files.zip\n   rm ryla-env-files.zip.base64.txt\n` : ''}

${downloadUrl ? `${colors.bright}📥 Download and decode via curl (SSH):${colors.reset}
  # Download the base64 file
  curl -L -o ryla-env-files.zip.base64.txt "${downloadUrl}"
  
  # Decode from base64 to zip
  base64 -d ryla-env-files.zip.base64.txt > ryla-env-files.zip
  
  # Clean up
  rm ryla-env-files.zip.base64.txt

` : ''}${colors.bright}To extract on macOS/Linux (using unzip):${colors.reset}
  1. Open Terminal
  2. Navigate to the project directory
  3. Run: unzip -P "${password}" "${ZIP_PATH}" -d ./

${colors.bright}To extract on macOS/Linux (using 7zip):${colors.reset}
  1. Install 7zip if not installed: brew install p7zip (macOS) or apt-get install p7zip-full (Linux)
  2. Run: 7z x "${ZIP_PATH}" -p"${password}"

${colors.bright}To extract on Windows:${colors.reset}
  1. Install 7-Zip (https://www.7-zip.org/)
  2. Right-click the zip file
  3. Select "7-Zip" → "Extract Here"
  4. Enter password when prompted: ${password}

${colors.bright}Alternative (using zip command):${colors.reset}
  unzip -P "${password}" "${ZIP_PATH}"

${colors.bright}⚠️  Security Notes:${colors.reset}
  - Share the password through a secure channel (encrypted message, password manager)
  - Delete this zip file after sharing if it contains sensitive data
  - Never commit the zip file or password to version control
  - Consider using a password manager's secure sharing feature

${colors.bright}📋 Files included in archive:${colors.reset}
${envFiles.map(f => `  - ${relative(PROJECT_ROOT, f)}`).join('\n')}

${'='.repeat(60)}
`;

  return instructions;
}

/**
 * Main execution
 */
async function main() {
  logSection('🔒 RYLA Environment Files Packager');
  
  // Find all .env files
  log('\n📁 Searching for .env files...', 'cyan');
  const envFiles = findEnvFiles(PROJECT_ROOT);
  
  if (envFiles.length === 0) {
    log('❌ No .env files found in the project.', 'red');
    log('   Make sure you have .env files in your project directories.', 'yellow');
    process.exit(1);
  }
  
  log(`✅ Found ${envFiles.length} .env file(s):`, 'green');
  envFiles.forEach(file => {
    log(`   - ${relative(PROJECT_ROOT, file)}`, 'cyan');
  });
  
  // Generate secure password
  log('\n🔑 Generating secure password...', 'cyan');
  const password = generatePassword(32);
  log('✅ Password generated', 'green');
  
  // Check for zip tools
  log('\n🔍 Checking for zip tools...', 'cyan');
  const has7zip = check7zipAvailable();
  const hasZip = checkZipAvailable();
  
  if (!has7zip && !hasZip) {
    log('❌ No zip tools found.', 'red');
    log('   Please install one of:', 'yellow');
    log('   - 7zip (recommended): brew install p7zip (macOS) or apt-get install p7zip-full (Linux)', 'yellow');
    log('   - zip: brew install zip (macOS) or apt-get install zip (Linux)', 'yellow');
    process.exit(1);
  }
  
  if (has7zip) {
    log('✅ 7zip found (using for better security)', 'green');
  } else {
    log('✅ zip command found', 'green');
  }
  
  // Create password-protected zip
  log('\n📦 Creating password-protected zip archive...', 'cyan');
  try {
    if (has7zip) {
      createZipWith7zip(envFiles, password);
    } else {
      createZipWithSystemZip(envFiles, password);
    }
    log('✅ Zip archive created successfully', 'green');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log(`❌ Failed to create zip archive: ${errorMessage}`, 'red');
    process.exit(1);
  }
  
  // Check file size
  try {
    const stats = statSync(ZIP_PATH);
    const sizeKB = (stats.size / 1024).toFixed(2);
    log(`\n📊 Archive size: ${sizeKB} KB`, 'cyan');
  } catch (error) {
    // Ignore if we can't get stats
  }
  
  // Upload to GitHub Gist
  let downloadUrl: string | null = null;
  const hasGitHubCLI = checkGitHubCLIAvailable();
  
  if (hasGitHubCLI) {
    try {
      downloadUrl = await uploadToGitHubGist(ZIP_PATH);
      if (downloadUrl) {
        log(`\n📦 Gist created! Download and decode with:`, 'green');
        log(`   curl -L -o ryla-env-files.zip.base64.txt "${downloadUrl}"`, 'bright');
        log(`   base64 -d ryla-env-files.zip.base64.txt > ryla-env-files.zip`, 'bright');
        log(`   rm ryla-env-files.zip.base64.txt`, 'bright');
      }
    } catch (error) {
      // Upload failed, continue with alternatives
    }
  }
  
  // If upload failed, provide alternatives
  if (!downloadUrl) {
    log('\n💡 Upload alternatives:', 'cyan');
    if (!hasGitHubCLI) {
      log('   1. Install GitHub CLI: brew install gh && gh auth login', 'bright');
      log('      Then run this script again to upload to GitHub Gist', 'bright');
    } else {
      log('   1. Manual GitHub Gist upload:', 'bright');
      log('      Visit: https://gist.github.com', 'bright');
      log('      Click "New gist", upload the zip file (secret by default)', 'bright');
    }
    log('   2. Start a simple HTTP server:', 'bright');
    log('      cd tmp && python3 -m http.server 8000', 'bright');
    log('      Then download from: http://YOUR_IP:8000/ryla-env-files.zip', 'bright');
  }
  
  // Generate and display instructions
  logSection('📋 EXTRACTION INSTRUCTIONS');
  const instructions = generateInstructions(password, envFiles, downloadUrl || undefined);
  console.log(instructions);
  
  // Save instructions to file
  const instructionsPath = join(OUTPUT_DIR, 'EXTRACTION-INSTRUCTIONS.txt');
  writeFileSync(instructionsPath, instructions, 'utf-8');
  log(`\n💾 Instructions saved to: ${instructionsPath}`, 'green');
  
  logSection('✅ COMPLETE');
  log(`\n🎉 Environment files packaged successfully!`, 'green');
  log(`\n📦 Archive: ${ZIP_PATH}`, 'cyan');
  if (downloadUrl) {
    log(`🌐 Download URL: ${downloadUrl}`, 'cyan');
    log(`\n📥 Download via curl:`, 'cyan');
    log(`   curl -o ryla-env-files.zip "${downloadUrl}"`, 'bright');
  }
  log(`📄 Instructions: ${instructionsPath}`, 'cyan');
  log(`\n⚠️  Remember to share the password securely!`, 'yellow');
  if (downloadUrl) {
    log(`\n⏰ Note: transfer.sh links expire after 14 days`, 'yellow');
  }
}

// Run the script
main().catch((error) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  log(`\n❌ Error: ${errorMessage}`, 'red');
  process.exit(1);
});

