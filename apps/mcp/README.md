# RYLA MCP Server

A local [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server that exposes **ALL** RYLA backend APIs for AI assistant integration in Cursor and other MCP-compatible tools.

## 🎯 Purpose

Enable AI assistants to directly interact with RYLA APIs for:
- **Development Automation**: Generate test images, create templates, manage characters
- **Asset Generation**: Programmatically generate pose thumbnails, style previews, etc.
- **Testing & Debugging**: Debug auth, check job status, inspect Redis/DB state
- **Content Management**: Create and apply templates, manage gallery images

## 🚀 Quick Start

### 1. Configure Environment

Copy your API `.env` file or set the required variables:

```bash
# In apps/api/.env (will be loaded automatically)
RYLA_API_URL=http://localhost:3001
RYLA_DEV_TOKEN=your-jwt-token  # Optional, or use ryla_auth_login
```

### 2. Add to Cursor MCP Configuration

Add to your `~/.cursor/mcp.json` or `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "ryla-api": {
      "command": "npx",
      "args": ["tsx", "/path/to/RYLA/apps/mcp/src/main.ts"],
      "env": {
        "RYLA_API_URL": "http://localhost:3001",
        "RYLA_DEV_TOKEN": "your-jwt-token"
      }
    }
  }
}
```

### 3. Test the Connection

In Cursor, use the MCP tools:
- `ryla_server_info` - Check server configuration
- `ryla_health` - Verify API connectivity

## 🔧 Complete Tool Reference

### Authentication Tools (`ryla_auth_*`)
| Tool | Description |
|------|-------------|
| `ryla_auth_login` | Login and get access/refresh tokens |
| `ryla_auth_register` | Register new test accounts |
| `ryla_auth_refresh` | Refresh an access token |
| `ryla_auth_check_email` | Check if email exists |
| `ryla_auth_me` | Get current authenticated user |
| `ryla_auth_logout` | Logout current session |
| `ryla_auth_logout_all` | Logout all devices |

### Character Management (`ryla_character_*`)
| Tool | Description |
|------|-------------|
| `ryla_character_list` | List all characters with optional filters |
| `ryla_character_get` | Get character details by ID |
| `ryla_character_create` | Create a new character |
| `ryla_character_update` | Update character configuration |
| `ryla_character_delete` | Delete a character |

### Character Image Generation
| Tool | Description |
|------|-------------|
| `ryla_generate_base_images` | Generate 3 base images from wizard config |
| `ryla_get_base_image_results` | Poll base image job results |
| `ryla_generate_character_sheet` | Generate character sheet (7-10 poses) |
| `ryla_get_character_sheet_results` | Poll character sheet results |
| `ryla_generate_profile_picture_set` | Generate profile picture set |
| `ryla_get_profile_picture_results` | Poll profile set results |
| `ryla_regenerate_profile_picture` | Regenerate single profile picture |

### Studio Image Generation
| Tool | Description |
|------|-------------|
| `ryla_generate_studio` | Generate studio images for a character |
| `ryla_generate_face_swap` | Face swap generation |
| `ryla_job_status` | Check generation job status |
| `ryla_comfyui_results` | Get ComfyUI job results with URLs |
| `ryla_workflows_list` | List available generation workflows |

### Template Management (`ryla_template_*`)
| Tool | Description |
|------|-------------|
| `ryla_template_list` | List templates with filters |
| `ryla_template_create` | Create a new template |
| `ryla_template_apply` | Get template config for generation |
| `ryla_template_stats` | Get template usage statistics |

### Gallery Management (`ryla_gallery_*`)
| Tool | Description |
|------|-------------|
| `ryla_gallery_list` | List gallery images with filters |
| `ryla_gallery_get` | Get image details |
| `ryla_gallery_character_images` | Get images for a specific character |
| `ryla_gallery_favorite` | Toggle favorite status |

### Notification Tools (`ryla_notifications_*`)
| Tool | Description |
|------|-------------|
| `ryla_notifications_list` | List notifications with pagination |
| `ryla_notification_read` | Mark one as read |
| `ryla_notifications_read_all` | Mark all as read |

### Prompt Tools (`ryla_prompt_*`)
| Tool | Description |
|------|-------------|
| `ryla_prompt_get` | Get prompt by ID |
| `ryla_prompt_favorites` | Get user's favorites |
| `ryla_prompt_favorite_toggle` | Add/remove favorite |
| `ryla_prompts_top` | Get most-used prompts |
| `ryla_prompts_list` | List available poses/scenes |

### Outfit Preset Tools
| Tool | Description |
|------|-------------|
| `ryla_outfit_presets_list` | List presets for a character |
| `ryla_outfit_preset_create` | Create new outfit preset |

### User Tools (`ryla_user_*`)
| Tool | Description |
|------|-------------|
| `ryla_user_update_profile` | Update name/public name |
| `ryla_user_update_settings` | Update user settings JSON |

### Debug Tools (`ryla_debug_*`)
| Tool | Description |
|------|-------------|
| `ryla_health` | API health check |
| `ryla_debug_database` | Check database health |
| `ryla_debug_redis` | Inspect Redis keys (cache, rate limits) |
| `ryla_credits_balance` | Get user credit balance |

### Server Info
| Tool | Description |
|------|-------------|
| `ryla_server_info` | Get MCP server configuration |

## 📋 Common Workflows

### Debug Authentication Issues
```
1. ryla_auth_me (check if token is valid)
2. If invalid: ryla_auth_login(email, password)
3. Update RYLA_DEV_TOKEN with new token
```

### Generate Profile Picture Set
```
1. ryla_character_list (get character ID)
2. ryla_generate_profile_picture_set(characterId, setId)
3. ryla_get_profile_picture_results(allJobIds) (poll until complete)
```

### Generate Test Images
```
1. ryla_character_list (get character ID)
2. ryla_generate_studio (start generation)
3. ryla_job_status (poll until complete)
4. ryla_gallery_list (view results)
```

### Create a Template from Successful Generation
```
1. ryla_generate_studio (generate with good settings)
2. ryla_job_status (wait for completion)
3. ryla_gallery_list (get image ID)
4. ryla_template_create (save as template)
```

### Debug Redis Cache State
```
1. ryla_debug_redis(maxItems=100)
2. Look for rate limit keys, session data, etc.
```

### Check System Health
```
1. ryla_health (API connectivity)
2. ryla_debug_database (DB connectivity)
3. ryla_debug_redis (Cache state)
```

## 🔐 Authentication

### 1. Using MCP Login (Recommended)
```
ryla_auth_login(email, password) → returns accessToken
# Then set RYLA_DEV_TOKEN=<accessToken>
```

### 2. Dev Token from Web App
1. Login to the web app
2. Extract JWT from cookies/localStorage
3. Set as `RYLA_DEV_TOKEN`

### 3. No Token (Limited Access)
Without a token, only public endpoints (health checks) will be accessible.

## 🛠 Development

### Run Directly
```bash
# From project root
npx tsx apps/mcp/src/main.ts

# Or with Nx
pnpm nx serve mcp
```

### Test with MCP Inspector
```bash
npx fastmcp inspect apps/mcp/src/main.ts
```

### Test with MCP CLI
```bash
npx fastmcp dev apps/mcp/src/main.ts
```

## 📁 Project Structure

```
apps/mcp/
├── src/
│   ├── main.ts                    # Server entry point
│   ├── api-client.ts              # API configuration and helper
│   └── tools/
│       ├── auth.ts                # Authentication tools
│       ├── character.ts           # Character management tools
│       ├── character-generation.ts # Character image generation
│       ├── debug.ts               # Debug/diagnostics tools
│       ├── gallery.ts             # Gallery management tools
│       ├── generation.ts          # Studio image generation tools
│       ├── notifications.ts       # Notification tools
│       ├── templates.ts           # Template management tools
│       └── utilities.ts           # Utility tools
├── project.json                   # Nx project config
├── tsconfig.json
└── README.md
```

## 🔗 Related Documentation

- [MCP Protocol Specification](https://modelcontextprotocol.io/)
- [FastMCP Framework](https://github.com/punkpeye/fastmcp)
- [RYLA API Documentation](/apps/api/docs/)
- [Cursor Rules for MCP](/.cursor/rules/mcp-ryla-api.mdc)
