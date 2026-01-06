/**
 * Test Profile Picture Generation
 * 
 * Tests the profile picture generation service directly without going through the frontend.
 * This helps debug workflow issues like the 'latent_shapes' error.
 * 
 * Usage:
 *   pnpm test:profile-pictures
 * 
 * Environment Variables:
 *   TEST_BASE_IMAGE_URL - URL to a test base image (optional, will use example if not set)
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../apps/api/src/modules/app.module';
import { ProfilePictureSetService } from '../apps/api/src/modules/image/services/profile-picture-set.service';
import { ConfigService } from '@nestjs/config';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function testProfilePictureGeneration() {
  console.log('🚀 Starting Profile Picture Generation Test...\n');

  // Create NestJS application context
  const app = await NestFactory.createApplicationContext(AppModule);
  const profilePictureService = app.get(ProfilePictureSetService);
  const configService = app.get(ConfigService);

  try {
    // Test configuration
    const testBaseImageUrl = process.env.TEST_BASE_IMAGE_URL || 
      configService.get<string>('TEST_BASE_IMAGE_URL') || 
      'https://example.com/test-base-image.jpg'; // Replace with actual test image URL
    
    console.log('📋 Test Configuration:');
    console.log(`   Base Image URL: ${testBaseImageUrl}`);
    console.log(`   Set ID: classic-influencer`);
    console.log(`   NSFW Enabled: false\n`);

    if (testBaseImageUrl.includes('example.com')) {
      console.warn('⚠️  WARNING: Using example.com URL. Please set TEST_BASE_IMAGE_URL to a real image URL.\n');
    }

    // Generate profile picture set
    console.log('🔄 Generating profile picture set...');
    const result = await profilePictureService.generateProfilePictureSet({
      baseImageUrl: testBaseImageUrl,
      setId: 'classic-influencer',
      nsfwEnabled: false,
    });

    console.log('\n✅ Generation started successfully!');
    console.log(`   Primary Job ID: ${result.jobId}`);
    console.log(`   Total Jobs: ${result.allJobIds.length}`);
    console.log(`   Job Positions: ${result.jobPositions.length}\n`);

    // Show job positions
    console.log('📝 Job Positions:');
    result.jobPositions.forEach((jp, idx) => {
      console.log(`   ${idx + 1}. ${jp.positionName} (${jp.jobId})`);
    });

    // Wait a bit for jobs to process
    console.log('\n⏳ Waiting 15 seconds for jobs to process...');
    await new Promise(resolve => setTimeout(resolve, 15000));

    // Check job results
    console.log('\n🔍 Checking job results...');
    let successCount = 0;
    let failedCount = 0;
    let pendingCount = 0;

    for (const jobPosition of result.jobPositions) {
      try {
        const jobResult = await profilePictureService.getJobResult(
          jobPosition.jobId,
        );
        
        console.log(`\n   Job ${jobPosition.jobId.substring(0, 8)}... (${jobPosition.positionName}):`);
        console.log(`     Status: ${jobResult.status}`);
        
        if (jobResult.status === 'completed' && jobResult.images?.length > 0) {
          console.log(`     ✅ Success! Generated ${jobResult.images.length} image(s)`);
          console.log(`     Image URL: ${jobResult.images[0].url}`);
          successCount++;
        } else if (jobResult.status === 'failed') {
          console.log(`     ❌ Failed: ${jobResult.error || 'Unknown error'}`);
          if (jobResult.error) {
            console.log(`     Error details: ${jobResult.error}`);
          }
          failedCount++;
        } else {
          console.log(`     ⏳ Still processing...`);
          pendingCount++;
        }
      } catch (error) {
        console.error(`     ❌ Error checking job ${jobPosition.jobId.substring(0, 8)}...:`, error);
        failedCount++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${failedCount}`);
    console.log(`   ⏳ Pending: ${pendingCount}`);
    console.log(`   📦 Total: ${result.jobPositions.length}`);

    if (failedCount > 0) {
      console.log('\n⚠️  Some jobs failed. Check the error messages above.');
      process.exit(1);
    } else if (pendingCount > 0) {
      console.log('\n⏳ Some jobs are still processing. You may need to wait longer.');
    } else {
      console.log('\n✅ All jobs completed successfully!');
    }
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
      console.error('   Stack:', error.stack);
    }
    process.exit(1);
  } finally {
    await app.close();
  }
}

// Run the test
testProfilePictureGeneration().catch(console.error);

