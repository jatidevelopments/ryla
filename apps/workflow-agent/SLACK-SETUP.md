# Slack App Setup Guide

Step-by-step guide to create a Slack app and get bot token and signing secret.

---

## Step 1: Create Slack App

1. **Go to Slack API**:
   - Visit: https://api.slack.com/apps
   - Click **"Create New App"**

2. **Choose creation method**:
   - Select **"From scratch"**
   - Enter app name: `RYLA Workflow Agent` (or any name)
   - Select your workspace
   - Click **"Create App"**

---

## Step 2: Get Bot Token

1. **Go to OAuth & Permissions**:
   - In your app settings, click **"OAuth & Permissions"** in the left sidebar

2. **Add Bot Token Scopes**:
   - Scroll to **"Scopes"** → **"Bot Token Scopes"**
   - Add these scopes:
     - `chat:write` - Send messages
     - `files:read` - Read uploaded files
     - `channels:history` - Read channel messages
     - `channels:read` - View basic channel info

3. **Install App to Workspace**:
   - Scroll to top, click **"Install to Workspace"**
   - Review permissions, click **"Allow"**

4. **Copy Bot Token**:
   - After installation, you'll see **"Bot User OAuth Token"**
   - It starts with `xoxb-`
   - Copy this token (this is your `SLACK_BOT_TOKEN`)

---

## Step 3: Get Signing Secret

1. **Go to Basic Information**:
   - In your app settings, click **"Basic Information"** in the left sidebar

2. **Find Signing Secret**:
   - Scroll to **"App Credentials"** section
   - Find **"Signing Secret"**
   - Click **"Show"** and copy the secret
   - This is your `SLACK_SIGNING_SECRET`

---

## Step 4: Configure Event Subscriptions (After Deployment)

Once your app is deployed to Fly.io:

1. **Go to Event Subscriptions**:
   - In your app settings, click **"Event Subscriptions"** in the left sidebar

2. **Enable Events**:
   - Toggle **"Enable Events"** to ON

3. **Set Request URL**:
   - Enter: `https://ryla-workflow-agent.fly.dev/slack/webhook`
   - Slack will verify the URL (make sure your app is running)

4. **Subscribe to Bot Events**:
   - Scroll to **"Subscribe to bot events"**
   - Add these events:
     - `message.channels` - Receive messages in channels
     - `file_shared` - Receive file upload notifications

5. **Save Changes**:
   - Click **"Save Changes"**

---

## Step 5: Store Credentials

### In Infisical:

```bash
# Store Slack credentials
infisical secrets set SLACK_BOT_TOKEN=xoxb-your-token-here --path=/apps/workflow-agent --env=dev
infisical secrets set SLACK_SIGNING_SECRET=your-secret-here --path=/apps/workflow-agent --env=dev

# Also for production
infisical secrets set SLACK_BOT_TOKEN=xoxb-your-token-here --path=/apps/workflow-agent --env=prod
infisical secrets set SLACK_SIGNING_SECRET=your-secret-here --path=/apps/workflow-agent --env=prod
```

### In Fly.io:

```bash
# Set secrets in Fly.io
flyctl secrets set SLACK_BOT_TOKEN=xoxb-your-token-here -a ryla-workflow-agent
flyctl secrets set SLACK_SIGNING_SECRET=your-secret-here -a ryla-workflow-agent

# Restart app
flyctl apps restart ryla-workflow-agent
```

---

## Quick Reference

| Credential | Where to Find | Format |
|------------|---------------|--------|
| **SLACK_BOT_TOKEN** | OAuth & Permissions → Bot User OAuth Token | `xoxb-...` |
| **SLACK_SIGNING_SECRET** | Basic Information → App Credentials → Signing Secret | Random string |

---

## Testing

After setting up:

1. **Invite bot to channel**:
   - In Slack, type: `/invite @RYLA Workflow Agent` (or your bot name)

2. **Test file upload**:
   - Upload a `workflow.json` file to the channel
   - Bot should acknowledge receipt

3. **Test JSON message**:
   - Paste workflow JSON in a message
   - Bot should process it

---

## Troubleshooting

### Bot not responding
- Check bot is invited to channel
- Verify `SLACK_BOT_TOKEN` is correct
- Check Fly.io logs: `flyctl logs -a ryla-workflow-agent`

### Webhook verification failing
- Verify `SLACK_SIGNING_SECRET` matches
- Check webhook URL is correct: `https://ryla-workflow-agent.fly.dev/slack/webhook`
- Ensure app is running and accessible

### Events not received
- Verify Event Subscriptions are enabled
- Check subscribed events include `message.channels` and `file_shared`
- Verify bot has required scopes

---

## References

- [Slack API Documentation](https://api.slack.com/)
- [Creating a Slack App](https://api.slack.com/authentication/basics)
- [Slack Bot Token Scopes](https://api.slack.com/scopes)
