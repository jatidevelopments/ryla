# Slack Scope Issue - Missing Scope

**Status**: ✅ All required scopes are configured! The error may be due to needing a reinstall or restart.

---

## Current Status

- ✅ **Gateway**: Running on `ws://127.0.0.1:18789`
- ✅ **Slack Socket Mode**: Connected
- ✅ **Scopes**: All required scopes are configured
- ⚠️ **Channel Resolution**: Failed - `missing_scope` error (likely needs reinstall)

---

## Error Details

```
[slack] channel resolve failed; using config entries. Error: An API error occurred: missing_scope
```

**What this means**:
- Clawdbot is connected to Slack via Socket Mode
- All required scopes are configured in Slack app settings
- But the error suggests the app may need to be reinstalled to apply scopes
- Or the gateway needs to be restarted to pick up new token permissions

---

## ✅ Configured Slack Scopes

**All required scopes are already configured!**

### Bot Token Scopes (Currently Set)

✅ **Core Scopes**:
- `app_mentions:read` - View messages that mention @Clawdbot
- `channels:history` - View messages in public channels
- `channels:read` - View basic information about public channels
- `chat:write` - Send messages as the bot
- `files:read` - View files shared in channels
- `files:write` - Upload, edit, and delete files

✅ **Additional Scopes** (also configured):
- `commands` - Slash commands
- `emoji:read` - View custom emoji
- `groups:history` - View messages in private channels
- `im:history` - View messages in direct messages
- `mpim:history` - View messages in group DMs
- `pins:read` / `pins:write` - Pin management
- `reactions:read` / `reactions:write` - Emoji reactions
- `users:read` - View people in workspace

### Socket Mode (Already Configured)

- Socket Mode is enabled ✅
- Socket Mode token is set ✅

---

## Fix: Reinstall App to Apply Scopes

**Since all scopes are already configured**, the issue is likely that the app needs to be reinstalled to apply the scopes to the current token.

### Step 1: Reinstall App to Workspace

1. Go to: https://api.slack.com/apps
2. Select your **"Clawdbot"** app
3. Go to **"OAuth & Permissions"** in the left sidebar
4. Scroll to top of the page
5. Click **"Reinstall to Workspace"** button
6. Review permissions and click **"Allow"**

**This will**:
- Generate a new Bot User OAuth Token with all scopes
- Update the token that Clawdbot uses

### Step 2: Update Clawdbot with New Token

After reinstalling, you'll get a new Bot User OAuth Token. Update it in Claw.io:

```bash
# SSH into container
flyctl ssh console -a ryla-workflow-agent

# Update Slack token (if Clawdbot config allows)
# Or restart gateway - it should pick up the new token from Slack Socket Mode
```

**Note**: If using Socket Mode, the token might be managed automatically. Check Clawdbot's Slack configuration.

### Step 3: Restart Gateway

```bash
# In the container, restart the gateway
# (Press Ctrl+C to stop current gateway, then restart)
clawdbot gateway
```

The gateway should now have access to all scopes and channel resolution should work.

---

## Verify Fix

After adding scopes and restarting:

1. **Check gateway logs** - Should not show `missing_scope` error
2. **Test channel resolution**:
   ```bash
   clawdbot channels list
   ```
3. **Test Slack message** - Send a message to the bot in Slack

---

## Current Workaround

**Even with the scope error**, Clawdbot can still:
- ✅ Receive messages via Socket Mode
- ✅ Process workflow files
- ✅ Send responses
- ⚠️ May have issues with channel auto-discovery

**To use specific channels**, configure them manually in Clawdbot config.

---

## Next Steps

1. **Add missing scopes** to Slack app (see above)
2. **Reinstall app** to workspace
3. **Restart gateway** to pick up new scopes
4. **Verify** channel resolution works

---

**Status**: Gateway running! Add Slack scopes to fix channel resolution.
