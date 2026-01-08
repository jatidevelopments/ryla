#!/usr/bin/env tsx
/**
 * Get detailed job information from RunPod API
 * 
 * Usage:
 *   pnpm tsx scripts/utils/get-runpod-job-details.ts <job_id> [endpoint_id]
 * 
 * Example:
 *   pnpm tsx scripts/utils/get-runpod-job-details.ts adb44c79-598b-4b29-9968-cec9445c9a70-e2 pwqwwai0hlhtw9
 */

import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config({ path: resolve(process.cwd(), '.env') });

const API_KEY = process.env.RUNPOD_API_KEY;
const ENDPOINT_ID = process.argv[3] || process.env.RUNPOD_ENDPOINT_COMFYUI || 'pwqwwai0hlhtw9';
const JOB_ID = process.argv[2];

if (!JOB_ID) {
  console.error('❌ Job ID required');
  console.error('Usage: pnpm tsx scripts/utils/get-runpod-job-details.ts <job_id> [endpoint_id]');
  process.exit(1);
}

if (!API_KEY) {
  console.error('❌ RUNPOD_API_KEY required');
  process.exit(1);
}

async function getJobDetails() {
  console.log('🔍 Fetching job details...');
  console.log(`   Job ID: ${JOB_ID}`);
  console.log(`   Endpoint ID: ${ENDPOINT_ID}\n`);

  try {
    const response = await fetch(
      `https://api.runpod.ai/v2/${ENDPOINT_ID}/status/${JOB_ID}`,
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const job = await response.json();
    
    console.log('='.repeat(60));
    console.log('Job Details');
    console.log('='.repeat(60));
    console.log(`Status: ${job.status}`);
    console.log(`ID: ${job.id}`);
    console.log();

    if (job.output) {
      console.log('Output:');
      console.log(JSON.stringify(job.output, null, 2));
      console.log();
    }

    if (job.error) {
      console.log('Error:');
      console.log(job.error);
      console.log();
    }

    // Try to get more details from the job output
    if (job.output && typeof job.output === 'object') {
      const output = job.output as any;
      
      if (output.error) {
        console.log('='.repeat(60));
        console.log('Error Details:');
        console.log('='.repeat(60));
        console.log(output.error);
        console.log();
      }

      if (output.logs) {
        console.log('='.repeat(60));
        console.log('Logs:');
        console.log('='.repeat(60));
        console.log(output.logs);
        console.log();
      }

      if (output.stderr) {
        console.log('='.repeat(60));
        console.log('Stderr:');
        console.log('='.repeat(60));
        console.log(output.stderr);
        console.log();
      }
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

getJobDetails();

