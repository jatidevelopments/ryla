#!/usr/bin/env npx tsx
/**
 * Test Profile Picture Workflow Directly
 * 
 * Tests the PuLID workflow directly via ComfyUI API without NestJS.
 * This helps debug workflow issues like the 'latent_shapes' error.
 * 
 * Usage:
 *   pnpm tsx scripts/test-profile-picture-workflow.ts
 * 
 * Environment Variables:
 *   COMFYUI_POD_URL - ComfyUI pod URL (required)
 *   TEST_BASE_IMAGE_URL - URL to a test base image (required)
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import {
    buildZImagePuLIDWorkflow,
    getProfilePictureSet,
    buildProfilePicturePrompt,
} from '../libs/business/src';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const COMFYUI_URL = process.env.COFMYUI_POD_URL || process.env.COMFYUI_POD_URL;
const TEST_BASE_IMAGE_URL = process.env.TEST_BASE_IMAGE_URL;

if (!COMFYUI_URL) {
    console.error('❌ COMFYUI_POD_URL not set');
    process.exit(1);
}

if (!TEST_BASE_IMAGE_URL) {
    console.error('❌ TEST_BASE_IMAGE_URL not set');
    console.error('   Please set TEST_BASE_IMAGE_URL to a valid image URL');
    console.error('   Example: TEST_BASE_IMAGE_URL=https://example.com/image.jpg pnpm test:profile-pictures');
    process.exit(1);
}

async function testProfilePictureWorkflow() {
    console.log('🚀 Testing Profile Picture Workflow Directly...\n');
    console.log(`📡 ComfyUI: ${COMFYUI_URL}`);
    console.log(`🖼️  Base Image: ${TEST_BASE_IMAGE_URL}\n`);

    try {
        // Get profile picture set
        const set = getProfilePictureSet('classic-influencer');
        if (!set) {
            throw new Error('Profile picture set not found');
        }

        console.log(`📋 Using set: ${set.name}`);
        console.log(`   Positions: ${set.positions.length}\n`);

        // Test with first position
        const position = set.positions[0];
        console.log(`🎯 Testing position: ${position.name}\n`);

        // Build prompt
        const { prompt, negativePrompt } = buildProfilePicturePrompt(set, position);
        console.log('📝 Prompt:');
        console.log(`   Positive: ${prompt.substring(0, 100)}...`);
        console.log(`   Negative: ${negativePrompt.substring(0, 100)}...\n`);

        // First, upload the reference image to ComfyUI
        console.log('📤 Uploading reference image to ComfyUI...');
        const imageResponse = await fetch(TEST_BASE_IMAGE_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://ibb.co/',
            },
        });
        if (!imageResponse.ok) {
            throw new Error(`Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}`);
        }
        const imageBuffer = await imageResponse.arrayBuffer();
        const imageBlob = new Blob([imageBuffer]);

        // Upload to ComfyUI
        const formData = new FormData();
        formData.append('image', imageBlob, 'reference.png');
        const uploadResponse = await fetch(`${COMFYUI_URL}/upload/image`, {
            method: 'POST',
            body: formData,
        });

        if (!uploadResponse.ok) {
            throw new Error(`Failed to upload image: ${uploadResponse.statusText}`);
        }

        const uploadResult = await uploadResponse.json();
        const referenceImageFilename = uploadResult.name || 'reference.png';
        console.log(`✅ Image uploaded: ${referenceImageFilename}\n`);

        // Build workflow
        console.log('🔨 Building PuLID workflow...');
        const workflow = buildZImagePuLIDWorkflow({
            prompt,
            negativePrompt,
            referenceImage: referenceImageFilename, // Use filename
            width: 1024,
            height: 1024,
            seed: -1,
            pulidStrength: 0.8,
            pulidStart: 0.0,
            pulidEnd: 0.8,
        });

        console.log(`✅ Workflow built with ${Object.keys(workflow).length} nodes\n`);

        // Submit workflow
        console.log('📤 Submitting workflow to ComfyUI...');
        const submitResponse = await fetch(`${COMFYUI_URL}/prompt`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: workflow }),
        });

        if (!submitResponse.ok) {
            const errorText = await submitResponse.text();
            console.error('❌ Failed to submit workflow:');
            console.error(`   Status: ${submitResponse.status}`);
            console.error(`   Error: ${errorText}`);
            process.exit(1);
        }

        const submitResult = await submitResponse.json();
        const promptId = submitResult.prompt_id;
        console.log(`✅ Workflow submitted! Prompt ID: ${promptId}\n`);

        // Poll for completion - check immediately and then periodically
        console.log('⏳ Polling for completion...');
        let attempts = 0;
        const maxAttempts = 60; // 5 minutes max

        while (attempts < maxAttempts) {
            // Check immediately on first attempt, then wait
            if (attempts > 0) {
                await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
            }

            const historyResponse = await fetch(`${COMFYUI_URL}/history/${promptId}`);
            if (!historyResponse.ok) {
                console.error(`❌ Failed to check history: ${historyResponse.statusText}`);
                break;
            }

            const history = await historyResponse.json();
            const status = history[promptId];

            if (status) {
                // Check for errors first - ComfyUI returns errors in status object
                if (status.status?.failed || status.status?.error) {
                    console.error('\n❌ Workflow failed!');
                    if (status.status.exception_type) {
                        console.error(`   Exception Type: ${status.status.exception_type}`);
                    }
                    if (status.status.exception_message) {
                        console.error(`   Error Message: ${status.status.exception_message}`);
                    }
                    if (status.status.error) {
                        console.error(`   Error: ${status.status.error}`);
                    }
                    // Check node errors
                    if (status.status.node_errors) {
                        console.error('   Node Errors:');
                        Object.entries(status.status.node_errors).forEach(([nodeId, error]: [string, any]) => {
                            console.error(`     Node ${nodeId}: ${error.message || error}`);
                        });
                    }
                    process.exit(1);
                } else if (status.status?.completed) {
                    console.log('\n✅ Workflow completed!\n');

                    // Get output images
                    if (status.outputs && status.outputs['12']) {
                        const output = status.outputs['12'];
                        if (output.images && output.images.length > 0) {
                            const image = output.images[0];
                            const imageUrl = `${COMFYUI_URL}/view?filename=${image.filename}&subfolder=${image.subfolder || ''}&type=${image.type || 'output'}`;
                            console.log(`🖼️  Generated image: ${imageUrl}`);
                        }
                    }
                    break;
                } else if (status.status?.status_str) {
                    // Show current status
                    process.stdout.write(`\r   Status: ${status.status.status_str} (${attempts + 1}/${maxAttempts})...`);
                } else {
                    process.stdout.write(`\r   Attempt ${attempts + 1}/${maxAttempts}...`);
                }
            } else {
                process.stdout.write(`\r   Waiting for status... (${attempts + 1}/${maxAttempts})`);
            }

            attempts++;
        }

        if (attempts >= maxAttempts) {
            console.log('\n⚠️  Timeout waiting for completion');
        }

        console.log('\n✅ Test completed!');
    } catch (error) {
        console.error('\n❌ Test failed:', error);
        if (error instanceof Error) {
            console.error('   Message:', error.message);
            console.error('   Stack:', error.stack);
        }
        process.exit(1);
    }
}

// Run the test
testProfilePictureWorkflow().catch(console.error);

