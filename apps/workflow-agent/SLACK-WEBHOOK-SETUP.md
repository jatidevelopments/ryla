# Slack Webhook Configuration

Now that Slack credentials are set, configure the webhook URL in your Slack app.

---

## ✅ Credentials Set

- ✅ `SLACK_BOT_TOKEN` - Set in Fly.io
- ✅ `SLACK_SIGNING_SECRET` - Set in Fly.io
- ✅ App restarted and running

---

## 🔗 Configure Webhook URL

### Step 1: Go to Slack App Settings

1. Visit: https://api.slack.com/apps
2. Select your **"RYLA Workflow Agent"** app (or whatever you named it)

### Step 2: Enable Event Subscriptions

1. Click **"Event Subscriptions"** in the left sidebar
2. Toggle **"Enable Events"** to **ON**

### Step 3: Set Request URL

1. In **"Request URL"** field, enter:
   ```
   https://ryla-workflow-agent.fly.dev/slack/webhook
   ```

2. Click **"Save Changes"**

3. **Slack will verify the URL**:
   - It will send a challenge request
   - Your app should respond with the challenge value
   - If verification fails, check that:
     - App is running: `flyctl status -a ryla-workflow-agent`
     - Health check works: `curl https://ryla-workflow-agent.fly.dev/health`
     - Webhook endpoint is accessible

### Step 4: Subscribe to Bot Events

1. Scroll to **"Subscribe to bot events"**
2. Click **"Add Bot User Event"**
3. Add these events:
   - `message.channels` - Receive messages in public channels
   - `file_shared` - Receive file upload notifications

4. Click **"Save Changes"**

### Step 5: Reinstall App (if needed)

If you added new scopes or events:
1. Go to **"OAuth & Permissions"**
2. Click **"Reinstall to Workspace"**
3. Review permissions and click **"Allow"**

---

## 🧪 Testing

### Test 1: Invite Bot to Channel

1. In Slack, go to a channel
2. Type: `/invite @RYLA Workflow Agent` (or your bot's name)
3. Bot should join the channel

### Test 2: Send Test Message

1. In the channel, send a message: `Hello bot!`
2. Check Fly.io logs: `flyctl logs -a ryla-workflow-agent`
3. You should see the webhook being received

### Test 3: Upload Workflow JSON

1. Upload a `workflow.json` file to the channel
2. Bot should acknowledge: `📥 Received workflow...`
3. Bot will start processing the workflow

---

## 🔍 Verify Webhook is Working

```bash
# Check if webhook endpoint is accessible
curl -X POST https://ryla-workflow-agent.fly.dev/slack/webhook \
  -H "Content-Type: application/json" \
  -d '{"type":"url_verification","challenge":"test123"}'

# Should return: {"challenge":"test123"}
```

---

## 📋 Checklist

- [ ] Event Subscriptions enabled
- [ ] Request URL set: `https://ryla-workflow-agent.fly.dev/slack/webhook`
- [ ] URL verified by Slack (green checkmark)
- [ ] Bot events subscribed: `message.channels`, `file_shared`
- [ ] Bot invited to test channel
- [ ] Test message sent
- [ ] Webhook received (check logs)

---

## 🐛 Troubleshooting

### Webhook verification failing

**Check**:
```bash
# Verify app is running
flyctl status -a ryla-workflow-agent

# Check health
curl https://ryla-workflow-agent.fly.dev/health

# Check logs for webhook errors
flyctl logs -a ryla-workflow-agent | grep -i webhook
```

**Common issues**:
- App not running → Restart: `flyctl apps restart ryla-workflow-agent`
- Wrong URL → Verify: `https://ryla-workflow-agent.fly.dev/slack/webhook`
- Signing secret mismatch → Verify secret in Fly.io matches Slack app

### Bot not responding

**Check**:
- Bot is invited to channel
- Bot has required scopes (`chat:write`, `files:read`, etc.)
- Events are subscribed correctly
- Check logs: `flyctl logs -a ryla-workflow-agent`

### Events not received

**Check**:
- Event Subscriptions are enabled
- Correct events are subscribed
- Bot is in the channel
- Request URL is verified (green checkmark)

---

## ✅ Next Steps

Once webhook is configured:

1. **Get OpenAI API key** (if not done):
   - Visit: https://platform.openai.com/api-keys
   - See: [MOLTBOT-OPENAI-SETUP.md](./MOLTBOT-OPENAI-SETUP.md)

2. **Test workflow deployment**:
   - Upload a `workflow.json` file to Slack
   - Bot should process and deploy it

---

**Webhook URL**: `https://ryla-workflow-agent.fly.dev/slack/webhook`
