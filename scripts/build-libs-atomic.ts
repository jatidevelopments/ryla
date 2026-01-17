#!/usr/bin/env tsx
/**
 * Atomic Library Build Script
 *
 * Builds libraries using nx (with caching), then atomically swaps the dist/libs folder.
 * This prevents race conditions where apps crash because dist/ is temporarily empty.
 *
 * How it works:
 * 1. Build all libs normally (nx handles parallelization and caching)
 * 2. Copy built libs to tmp/.libs-build-temp (staging, cleaner location)
 * 3. Copy from staging to dist/.libs-build-temp (prepare for atomic swap)
 * 4. Atomically swap: rename current dist/libs to backup, rename temp to dist/libs
 * 5. Clean up staging and backup folders
 *
 * Usage: tsx scripts/build-libs-atomic.ts
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, rmSync, renameSync, cpSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();
const DIST_LIBS = join(ROOT, 'dist/libs');
const TEMP_STAGING = join(ROOT, 'tmp/.libs-build-temp'); // Staging in tmp/
const TEMP_LIBS = join(ROOT, 'dist/.libs-build-temp'); // For atomic swap (must be in dist/)
const BACKUP_LIBS = join(ROOT, 'dist/.libs-backup');

const LIBS = ['shared', 'data', 'business', 'trpc', 'payments', 'analytics', 'ui', 'email'];

function log(msg: string) {
  console.log(`[atomic-build] ${msg}`);
}

function ensureDir(dir: string) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function removeDir(dir: string) {
  if (existsSync(dir)) {
    rmSync(dir, { recursive: true, force: true });
  }
}

async function main() {
  const startTime = Date.now();

  try {
    // Step 1: Build all libs using nx (parallel, with caching)
    log('Building libraries with nx...');
    execSync(
      `pnpm nx run-many --target=build --projects=${LIBS.join(',')} --nx-bail`,
      {
        stdio: 'inherit',
        cwd: ROOT,
        env: { ...process.env, FORCE_COLOR: '1' },
      }
    );

    // Step 2: Copy to staging directory in tmp/ (cleaner, already gitignored)
    log('Copying to staging directory...');
    removeDir(TEMP_STAGING);
    ensureDir(TEMP_STAGING);

    for (const lib of LIBS) {
      const srcDir = join(DIST_LIBS, lib);
      const destDir = join(TEMP_STAGING, lib);
      if (existsSync(srcDir)) {
        cpSync(srcDir, destDir, { recursive: true });
      }
    }

    // Step 2b: Copy from staging to dist/.libs-build-temp for atomic swap
    // (atomic rename only works within same filesystem/directory)
    log('Preparing for atomic swap...');
    removeDir(TEMP_LIBS);
    cpSync(TEMP_STAGING, TEMP_LIBS, { recursive: true });

    // Step 3: Atomic swap
    log('Performing atomic swap...');

    // Backup current dist/libs
    removeDir(BACKUP_LIBS);
    if (existsSync(DIST_LIBS)) {
      renameSync(DIST_LIBS, BACKUP_LIBS);
    }

    // Move temp to dist/libs
    renameSync(TEMP_LIBS, DIST_LIBS);

    // Clean up backup
    removeDir(BACKUP_LIBS);

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    log(`✓ Build complete in ${duration}s`);
  } catch (error) {
    // Restore from backup if something went wrong
    if (existsSync(BACKUP_LIBS) && !existsSync(DIST_LIBS)) {
      log('Restoring from backup...');
      renameSync(BACKUP_LIBS, DIST_LIBS);
    }
    console.error('[atomic-build] Build failed:', error);
    process.exit(1);
  } finally {
    // Cleanup temp directories (both staging and swap temp)
    removeDir(TEMP_STAGING);
    removeDir(TEMP_LIBS);
    removeDir(BACKUP_LIBS);
  }
}

main();
