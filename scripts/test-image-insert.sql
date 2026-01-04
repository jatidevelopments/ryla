-- Test script to verify image insertion with enum values
-- Run this against your database to test if the issue is with enum values

-- First, check what enum values are valid
SELECT unnest(enum_range(NULL::scene_preset)) as valid_scene_presets;
SELECT unnest(enum_range(NULL::environment_preset)) as valid_environment_presets;
SELECT unnest(enum_range(NULL::aspect_ratio)) as valid_aspect_ratios;
SELECT unnest(enum_range(NULL::quality_mode)) as valid_quality_modes;
SELECT unnest(enum_range(NULL::image_status)) as valid_image_statuses;

-- Test insert with known good values
-- Replace the UUIDs with actual user and character IDs from your database
INSERT INTO images (
    character_id,
    user_id,
    s3_key,
    thumbnail_key,
    prompt,
    negative_prompt,
    status,
    nsfw,
    width,
    height,
    environment,
    outfit,
    aspect_ratio,
    quality_mode
) VALUES (
    '1ab327af-485a-4239-90d1-02f3a7b70d74'::uuid,  -- character_id
    'af794a10-eb22-486c-bc30-7aa663268a8c'::uuid,  -- user_id
    'test/test-image.png',                          -- s3_key
    'test/test-image.png',                          -- thumbnail_key
    'Test prompt',                                  -- prompt
    'Test negative prompt',                         -- negative_prompt
    'completed'::image_status,                      -- status (enum)
    false,                                          -- nsfw (boolean)
    512,                                            -- width
    512,                                            -- height
    'studio'::environment_preset,                   -- environment (enum)
    'casual',                                       -- outfit (text)
    '1:1'::aspect_ratio,                            -- aspect_ratio (enum)
    'draft'::quality_mode                           -- quality_mode (enum)
) RETURNING id;

-- If the above fails, try with NULLs for optional enum fields
INSERT INTO images (
    character_id,
    user_id,
    s3_key,
    thumbnail_key,
    prompt,
    status,
    nsfw,
    width,
    height
) VALUES (
    '1ab327af-485a-4239-90d1-02f3a7b70d74'::uuid,
    'af794a10-eb22-486c-bc30-7aa663268a8c'::uuid,
    'test/test-image-2.png',
    'test/test-image-2.png',
    'Test prompt minimal',
    'completed'::image_status,
    false,
    512,
    512
) RETURNING id;

-- Clean up test data
-- DELETE FROM images WHERE s3_key LIKE 'test/%';

