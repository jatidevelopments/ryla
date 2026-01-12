#!/usr/bin/env node
/**
 * RYLA MCP Server
 *
 * Local Model Context Protocol server for RYLA API integration.
 * Enables AI assistants (like Cursor) to interact with RYLA backend
 * for development automation, asset generation, and testing.
 *
 * Usage:
 *   npx tsx apps/mcp/src/main.ts
 *   # or via Cursor MCP configuration
 */

import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load local .env if it exists (for local development)
config({ path: resolve(__dirname, '../../../apps/api/.env') });

// Also load from project root if exists
config({ path: resolve(__dirname, '../../../.env') });

import { FastMCP } from 'fastmcp';
import { z } from 'zod';

// Import API config
import { API_BASE_URL, DEV_TOKEN } from './api-client.js';

// Import tool modules
import { registerCharacterTools } from './tools/character.js';
import { registerGenerationTools } from './tools/generation.js';
import { registerTemplateTools } from './tools/templates.js';
import { registerUtilityTools } from './tools/utilities.js';
import { registerGalleryTools } from './tools/gallery.js';
import { registerAuthTools } from './tools/auth.js';
import { registerNotificationTools } from './tools/notifications.js';
import { registerDebugTools } from './tools/debug.js';
import { registerCharacterGenerationTools } from './tools/character-generation.js';

// Create the MCP server
const server = new FastMCP({
  name: 'ryla-api',
  version: '1.0.0',
  instructions: `
RYLA API MCP Server - Complete Development & Debugging Toolkit

This server provides direct access to ALL RYLA backend APIs for:

**Authentication & Users:**
- Login, register, refresh tokens (ryla_auth_*)
- User profile & settings (ryla_user_*)

**Character Management:**
- CRUD operations (ryla_character_*)
- Base image generation (ryla_generate_base_images)
- Character sheets (ryla_generate_character_sheet)
- Profile picture sets (ryla_generate_profile_picture_set)

**Image Generation:**
- Studio shots (ryla_generate_studio)
- Face swaps (ryla_generate_face_swap)
- Job status tracking (ryla_job_status)

**Templates:**
- Create, apply, track templates (ryla_template_*)

**Gallery:**
- List, like, delete images (ryla_gallery_*)

**Prompts:**
- Browse, favorite prompts (ryla_prompt_*)

**Notifications:**
- List, mark read (ryla_notifications_*)

**Debug Tools:**
- Database health (ryla_debug_database)
- Redis inspection (ryla_debug_redis)
- API health (ryla_health)

**Authentication:**
- Uses RYLA_DEV_TOKEN for authenticated endpoints
- Connects to RYLA_API_URL (auto-detects: local or https://end.ryla.ai)
- Use ryla_auth_login to get a dev token if needed
- Set RYLA_ENV=production to use production API

All tools return JSON. Check 'success' field for status.
`.trim(),
});

// Register all tool modules
registerCharacterTools(server);
registerGenerationTools(server);
registerTemplateTools(server);
registerUtilityTools(server);
registerGalleryTools(server);
registerAuthTools(server);
registerNotificationTools(server);
registerDebugTools(server);
registerCharacterGenerationTools(server);

// Add a server info tool
server.addTool({
  name: 'ryla_server_info',
  description: 'Get RYLA MCP server configuration and connection info',
  parameters: z.object({}),
  execute: async () => {
    return JSON.stringify(
      {
        name: 'ryla-api',
        version: '1.0.0',
        apiUrl: API_BASE_URL,
        environment: process.env.RYLA_ENV || (API_BASE_URL.includes('localhost') ? 'local' : 'production'),
        hasToken: !!DEV_TOKEN,
        tokenPreview: DEV_TOKEN ? `${DEV_TOKEN.slice(0, 10)}...` : 'none',
      },
      null,
      2
    );
  },
});

// Start the server
const transportType = process.env.MCP_TRANSPORT || 'stdio';

if (transportType === 'stdio') {
  server.start({ transportType: 'stdio' });
  console.error('🚀 RYLA MCP Server running on stdio');
  console.error(`📡 API URL: ${API_BASE_URL}`);
  console.error(`🔑 Token: ${DEV_TOKEN ? 'configured' : 'not set'}`);
} else {
  const port = parseInt(process.env.MCP_PORT || '8787', 10);
  server.start({
    transportType: 'httpStream',
    httpStream: { port },
  });
  console.error(`🚀 RYLA MCP Server running on http://localhost:${port}/mcp`);
}
