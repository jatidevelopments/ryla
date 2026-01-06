#!/usr/bin/env npx ts-node
/**
 * Test script to verify database image insertion works
 * 
 * Usage: npx ts-node scripts/test-db-insert.ts
 */

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { pgTable, text, boolean, integer, uuid, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { Pool } from 'pg';

// Recreate the minimal schema needed for testing
const imageStatusEnum = pgEnum('image_status', ['pending', 'generating', 'completed', 'failed']);
const environmentPresetEnum = pgEnum('environment_preset', ['beach', 'home_bedroom', 'home_living_room', 'office', 'cafe', 'urban_street', 'studio']);
const aspectRatioEnum = pgEnum('aspect_ratio', ['1:1', '9:16', '2:3']);
const qualityModeEnum = pgEnum('quality_mode', ['draft', 'hq']);

const images = pgTable('images', {
  id: uuid('id').primaryKey().defaultRandom(),
  characterId: uuid('character_id'),
  userId: uuid('user_id').notNull(),
  s3Key: text('s3_key').notNull(),
  thumbnailKey: text('thumbnail_key'),
  prompt: text('prompt'),
  negativePrompt: text('negative_prompt'),
  seed: text('seed'),
  width: integer('width'),
  height: integer('height'),
  status: imageStatusEnum('status').default('pending'),
  nsfw: boolean('nsfw').default(false),
  environment: environmentPresetEnum('environment'),
  outfit: text('outfit'),
  aspectRatio: aspectRatioEnum('aspect_ratio'),
  qualityMode: qualityModeEnum('quality_mode'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

async function main() {
  // Use the same config as the API app (defaults match docker-compose.yml)
  const host = process.env.POSTGRES_HOST || 'localhost';
  const port = Number(process.env.POSTGRES_PORT) || 5432;
  const user = process.env.POSTGRES_USER || 'ryla';
  const password = process.env.POSTGRES_PASSWORD || 'ryla_local_dev';
  const database = process.env.POSTGRES_DB || 'ryla';
  
  console.log('Connecting to database...');
  console.log(`  Host: ${host}:${port}`);
  console.log(`  User: ${user}`);
  console.log(`  Database: ${database}`);
  
  const pool = new Pool({ host, port, user, password, database });
  
  // Test user and character IDs - replace with actual values from your DB
  const TEST_USER_ID = process.env.TEST_USER_ID || 'af794a10-eb22-486c-bc30-7aa663268a8c';
  const TEST_CHARACTER_ID = process.env.TEST_CHARACTER_ID || '1ab327af-485a-4239-90d1-02f3a7b70d74';
  
  console.log('\n=== Testing Database Connection ===');
  
  try {
    // First, verify the user exists
    const userResult = await pool.query('SELECT id, email FROM users WHERE id = $1', [TEST_USER_ID]);
    console.log('User found:', userResult.rows.length > 0 ? userResult.rows[0] : 'NOT FOUND');
    
    if (userResult.rows.length === 0) {
      console.error('User not found! Please set TEST_USER_ID to a valid user ID.');
      await pool.end();
      return;
    }
    
    // Verify the character exists
    const charResult = await pool.query('SELECT id, name FROM characters WHERE id = $1', [TEST_CHARACTER_ID]);
    console.log('Character found:', charResult.rows.length > 0 ? charResult.rows[0] : 'NOT FOUND');
    
    if (charResult.rows.length === 0) {
      console.error('Character not found! Please set TEST_CHARACTER_ID to a valid character ID.');
      await pool.end();
      return;
    }
    
    // Check enum values in database
    console.log('\n=== Checking Enum Values in Database ===');
    const enumQueries = [
      "SELECT unnest(enum_range(NULL::environment_preset)) as value",
      "SELECT unnest(enum_range(NULL::aspect_ratio)) as value",
      "SELECT unnest(enum_range(NULL::quality_mode)) as value",
      "SELECT unnest(enum_range(NULL::image_status)) as value",
    ];
    
    for (const query of enumQueries) {
      const enumName = query.match(/NULL::(\w+)/)?.[1];
      try {
        const result = await pool.query(query);
        console.log(`${enumName}:`, result.rows.map(r => r.value).join(', '));
      } catch (e: any) {
        console.log(`${enumName}: ERROR - ${e.message}`);
      }
    }
    
    // Test 1: Raw SQL insert
    console.log('\n=== Test 1: Raw SQL Insert ===');
    const testKey = `test/test-image-${Date.now()}.png`;
    
    try {
      const insertResult = await pool.query(`
        INSERT INTO images (
          character_id,
          user_id,
          s3_key,
          thumbnail_key,
          status,
          nsfw,
          width,
          height,
          environment,
          outfit,
          aspect_ratio,
          quality_mode
        ) VALUES (
          $1, $2, $3, $4, 'completed'::image_status, false, 512, 512,
          'studio'::environment_preset, 'casual', '1:1'::aspect_ratio, 'draft'::quality_mode
        ) RETURNING id
      `, [TEST_CHARACTER_ID, TEST_USER_ID, testKey, testKey]);
      
      console.log('✅ Raw SQL insert succeeded! ID:', insertResult.rows[0].id);
      
      // Clean up
      await pool.query('DELETE FROM images WHERE id = $1', [insertResult.rows[0].id]);
      console.log('Cleaned up test record');
    } catch (e: any) {
      console.error('❌ Raw SQL insert failed!');
      console.error('Error code:', e.code);
      console.error('Error message:', e.message);
      console.error('Error detail:', e.detail);
      console.error('Error constraint:', e.constraint);
    }
    
    // Test 2: Test with the exact values from the error (using raw SQL)
    console.log('\n=== Test 2: Exact Values from Error (Raw SQL) ===');
    const testKey2 = `test/test-image-exact-${Date.now()}.png`;
    
    try {
      const exactResult = await pool.query(`
        INSERT INTO images (
          character_id,
          user_id,
          s3_key,
          thumbnail_key,
          status,
          nsfw,
          prompt,
          negative_prompt,
          width,
          height,
          environment,
          outfit,
          aspect_ratio,
          quality_mode
        ) VALUES (
          $1, $2, $3, $4, 'completed'::image_status, true,
          '22-year-old latina woman, blonde braids hair, green eyes',
          'deformed, bad anatomy',
          832, 1472,
          'studio'::environment_preset, 'nurse', '9:16'::aspect_ratio, 'hq'::quality_mode
        ) RETURNING id
      `, [TEST_CHARACTER_ID, TEST_USER_ID, testKey2, testKey2]);
      
      console.log('✅ Exact values insert succeeded! ID:', exactResult.rows[0].id);
      
      // Clean up
      await pool.query('DELETE FROM images WHERE id = $1', [exactResult.rows[0].id]);
      console.log('Cleaned up test record');
    } catch (e: any) {
      console.error('❌ Exact values insert failed!');
      console.error('Error code:', e.code);
      console.error('Error message:', e.message);
      console.error('Error detail:', e.detail);
    }
    
    // Test 3: Drizzle ORM Insert
    console.log('\n=== Test 3: Drizzle ORM Insert ===');
    const db = drizzle(pool);
    const testKey3 = `test/test-image-drizzle-${Date.now()}.png`;
    
    try {
      const drizzleResult = await db
        .insert(images)
        .values({
          characterId: TEST_CHARACTER_ID,
          userId: TEST_USER_ID,
          s3Key: testKey3,
          thumbnailKey: testKey3,
          status: 'completed',
          nsfw: false,
          width: 512,
          height: 512,
          environment: 'studio',
          outfit: 'casual',
          aspectRatio: '1:1',
          qualityMode: 'draft',
        })
        .returning();
      
      console.log('✅ Drizzle ORM insert succeeded! ID:', drizzleResult[0].id);
      
      // Clean up
      await pool.query('DELETE FROM images WHERE id = $1', [drizzleResult[0].id]);
      console.log('Cleaned up test record');
    } catch (e: any) {
      console.error('❌ Drizzle ORM insert failed!');
      console.error('Error name:', e.name);
      console.error('Error message:', e.message);
      console.error('Error code:', e.code);
      console.error('Error cause:', e.cause);
      if (e.cause) {
        console.error('Cause name:', e.cause.name);
        console.error('Cause message:', e.cause.message);
        console.error('Cause code:', e.cause.code);
        console.error('Cause detail:', e.cause.detail);
      }
    }
    
    // Test 4: Drizzle ORM Insert with exact error values
    console.log('\n=== Test 4: Drizzle ORM with Error Values ===');
    const testKey4 = `test/test-image-drizzle-exact-${Date.now()}.png`;
    
    try {
      const drizzleResult = await db
        .insert(images)
        .values({
          characterId: TEST_CHARACTER_ID,
          userId: TEST_USER_ID,
          s3Key: testKey4,
          thumbnailKey: testKey4,
          status: 'completed',
          nsfw: true,
          prompt: '22-year-old latina woman, blonde braids hair, green eyes',
          negativePrompt: 'deformed, bad anatomy',
          width: 832,
          height: 1472,
          environment: 'studio',
          outfit: 'nurse',
          aspectRatio: '9:16',
          qualityMode: 'hq',
        })
        .returning();
      
      console.log('✅ Drizzle ORM with error values succeeded! ID:', drizzleResult[0].id);
      
      // Clean up
      await pool.query('DELETE FROM images WHERE id = $1', [drizzleResult[0].id]);
      console.log('Cleaned up test record');
    } catch (e: any) {
      console.error('❌ Drizzle ORM with error values failed!');
      console.error('Error name:', e.name);
      console.error('Error message:', e.message);
      console.error('Error code:', e.code);
      console.error('Error cause:', e.cause);
      console.error('Full error:', JSON.stringify(e, Object.getOwnPropertyNames(e), 2));
    }
    
  } catch (error: any) {
    console.error('Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
    console.log('\nDatabase connection closed.');
  }
}

main().catch(console.error);

