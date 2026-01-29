---
name: mcp-ryla-api
description: Uses RYLA MCP Server tools for API operations, debugging, and automation. Use when working with RYLA API, debugging issues, generating test data, creating characters, managing images, or when the user mentions MCP tools or API operations.
---

# RYLA MCP API Usage

Complete guide for using RYLA MCP Server tools to interact with the RYLA API programmatically.

## Quick Start

When using RYLA MCP tools:

1. **Check Health** - Verify API connectivity with `ryla_health`
2. **Get Auth Token** - Use `ryla_auth_login` to get access token
3. **Use Tools** - Call appropriate `ryla_*` tools for your task
4. **Poll Jobs** - For async operations, use `ryla_job_status` to poll

## When to Use RYLA MCP Tools

Use the `ryla_*` MCP tools when you need to:
- Debug authentication, sessions, or API issues
- Generate test images for development or testing
- Create or apply templates programmatically
- Manage characters and their configurations
- Check generation job status
- Automate asset generation workflows
- Inspect Redis/database state

## Complete Tool Reference

### Authentication Tools (`ryla_auth_*`)

- `ryla_auth_login` - Login and get access/refresh tokens
- `ryla_auth_register` - Register new test accounts
- `ryla_auth_refresh` - Refresh an access token
- `ryla_auth_check_email` - Check if email exists
- `ryla_auth_me` - Get current authenticated user
- `ryla_auth_logout` - Logout current session
- `ryla_auth_logout_all` - Logout all devices

### Character Tools (`ryla_character_*`)

- `ryla_character_list` - List all characters
- `ryla_character_get` - Get character by ID
- `ryla_character_create` - Create new character
- `ryla_character_update` - Update character config
- `ryla_character_delete` - Delete a character

### Character Generation (`ryla_generate_*`)

- `ryla_generate_base_images` - Generate 3 base images from wizard config
- `ryla_get_base_image_results` - Poll base image job results
- `ryla_generate_character_sheet` - Generate character sheet (7-10 poses)
- `ryla_get_character_sheet_results` - Poll character sheet results
- `ryla_generate_profile_picture_set` - Generate profile picture set
- `ryla_get_profile_picture_results` - Poll profile set results
- `ryla_regenerate_profile_picture` - Regenerate single profile picture

### Studio Generation Tools

- `ryla_generate_studio` - Generate studio images (main tool)
- `ryla_generate_face_swap` - Face swap generation
- `ryla_job_status` - Poll job status
- `ryla_comfyui_results` - Get ComfyUI results by prompt ID
- `ryla_workflows_list` - List available workflows

### Template Tools (`ryla_template_*`)

- `ryla_template_list` - List all templates
- `ryla_template_create` - Create from successful generation
- `ryla_template_apply` - Apply template to get config
- `ryla_template_stats` - Get template usage statistics

### Gallery Tools (`ryla_gallery_*`)

- `ryla_gallery_list` - List generated images
- `ryla_gallery_get` - Get image by ID
- `ryla_gallery_character_images` - Get images for a specific character
- `ryla_gallery_favorite` - Toggle favorite

### Notification Tools (`ryla_notifications_*`)

- `ryla_notifications_list` - List notifications with pagination
- `ryla_notification_read` - Mark one as read
- `ryla_notifications_read_all` - Mark all as read

### Prompt Tools (`ryla_prompt_*`)

- `ryla_prompt_get` - Get prompt by ID
- `ryla_prompt_favorites` - Get user's favorites
- `ryla_prompt_favorite_toggle` - Add/remove favorite
- `ryla_prompts_top` - Get most-used prompts
- `ryla_prompts_list` - List available poses/scenes

### Outfit Preset Tools

- `ryla_outfit_presets_list` - List presets for a character
- `ryla_outfit_preset_create` - Create new outfit preset

### Debug Tools (`ryla_debug_*`)

- `ryla_health` - API health check
- `ryla_debug_database` - Check database health
- `ryla_debug_redis` - Inspect Redis keys
- `ryla_credits_balance` - Check user credits

### User Tools (`ryla_user_*`)

- `ryla_user_update_profile` - Update name/public name
- `ryla_user_update_settings` - Update user settings JSON

### Server Info

- `ryla_server_info` - Get MCP server config and connection status

## Best Practices

### 1. Always Check Health First

Before complex operations, verify API connectivity:

```
ryla_health
```

This confirms the MCP is connected to the correct environment (local/production).

### 2. Verify Environment Configuration

Use `ryla_server_info` to confirm:
- Which API URL is being used
- Current environment (local/production)
- Token status

### 3. Get Auth Token for Testing

```
1. Ensure RYLA_ENV is set correctly (local or production)
2. ryla_auth_login(email, password) → returns accessToken
3. Set RYLA_DEV_TOKEN=<accessToken> in environment
4. Or use ryla_auth_me to verify current token
```

**For Production Testing:**
- Set `RYLA_ENV=production` in MCP config
- Use production user credentials
- Get dev token for long-term use: `ryla_auth_dev_token(email, password)`

### 4. Use Job Polling Pattern

Generation is async. Always poll for completion:

```
1. ryla_generate_studio → returns jobId
2. ryla_job_status(jobId) → poll until status="completed"
3. Access results in output field
```

### 5. Batch Operations

For multiple generations, parallelize when possible but respect rate limits.

### 6. Save Successful Configs as Templates

When a generation produces good results, save the settings:

```
ryla_template_create with the same config
```

## Common Workflows

### Debug Auth Issues

```
1. ryla_server_info → Check environment and API URL
2. ryla_health → Verify API connectivity
3. ryla_auth_me → Check if token is valid
4. If invalid: ryla_auth_login → Get new token
5. Update RYLA_DEV_TOKEN in MCP config
```

**Common Issues:**
- **401 Unauthorized**: Token expired or invalid → Use `ryla_auth_login` to get new token
- **Wrong Environment**: Check `ryla_server_info` to see which API URL is being used
- **Connection Failed**: Verify `RYLA_ENV` is set correctly (local/production)

### Generate Profile Picture Set

```
1. ryla_character_list → Get character
2. ryla_generate_profile_picture_set(characterId, setId)
3. ryla_get_profile_picture_results(allJobIds) → Poll until complete
```

### Debug Notification Delivery

```
1. ryla_notifications_list → Check recent notifications
2. ryla_notification_read(id) → Mark as read for testing
```

### Inspect Redis Cache State

```
1. ryla_debug_redis(maxItems=100) → See cached data
2. Look for rate limit keys, session data, etc.
```

## Error Handling

All tools return JSON with `success` field:
- `success: true` - Operation completed
- `success: false` - Check `error` field for details

Common errors:
- "API Error 401" - Invalid or expired token → use `ryla_auth_login`
- "API Error 404" - Resource not found
- "Insufficient credits" - Need more credits

## Configuration

### Environment Variables

- `RYLA_API_URL` - API base URL (optional, auto-detected if not set)
- `RYLA_DEV_TOKEN` - JWT access token for authenticated requests
- `RYLA_ENV` - Environment mode: `local` (default) or `production`

### Environment Detection

The MCP server automatically detects the environment:

**Local Development (Default):**
- Uses `http://localhost:3001`
- Set explicitly: `RYLA_ENV=local` or `RYLA_API_URL=http://localhost:3001`

**Production:**
- Uses `https://end.ryla.ai`
- Set: `RYLA_ENV=production` (auto-uses production URL)
- Or explicitly: `RYLA_API_URL=https://end.ryla.ai`

**Priority Order:**
1. `RYLA_API_URL` env var (explicit override)
2. Production default (`https://end.ryla.ai`) if `RYLA_ENV=production`
3. Local default (`http://localhost:3001`)

### Getting a Token

**Option 1 - MCP Login (Recommended):**
```
# For local
ryla_auth_login(email, password) → accessToken

# For production (set RYLA_ENV=production first)
ryla_auth_login(email, password) → accessToken
```

**Option 2 - Dev Token (Long-lived, 10 years):**
```
# Perfect for MCP configuration - won't expire
ryla_auth_dev_token(email, password) → accessToken
```

**Option 3 - From Web App:**
1. Login to web app (local or production)
2. Extract JWT from cookies/localStorage
3. Set as `RYLA_DEV_TOKEN` in MCP config

### Checking Current Configuration

Use `ryla_server_info` to see:
- Current API URL
- Environment (local/production)
- Token status (configured/not set)

## Related Resources

- **MCP Configuration**: `.cursor/mcp.json`
- **RYLA API**: `apps/api/`
- **MCP Server**: `apps/mcp/`
