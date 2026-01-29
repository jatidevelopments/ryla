# Clawdbot Gateway Setup for Container

**Status**: OAuth working ✅, Gateway needs to be started.

---

## ✅ Current Status

- ✅ **OAuth**: Working perfectly (`openai-codex:default ok expires in 10d`)
- ✅ **Model**: `openai-codex/gpt-5.2` configured
- ✅ **Plugins**: 2 loaded, 26 disabled (normal)
- ⏳ **Gateway**: Not running (needs to be started)

---

## 🚀 Start Gateway in Container

**In Fly.io containers, the gateway must run in the foreground** (not as a systemd service).

### Option 1: Run Gateway in Foreground (Recommended)

```bash
flyctl ssh console -a ryla-workflow-agent
clawdbot gateway
```

This will:
- Start the gateway in foreground
- Listen on `ws://127.0.0.1:18789`
- Keep running until you exit

**Note**: This blocks the terminal. For production, run it as part of the container's main process.

### Option 2: Run Gateway in Background (via screen/tmux)

```bash
flyctl ssh console -a ryla-workflow-agent

# Install screen if needed
apt-get update && apt-get install -y screen

# Start gateway in screen session
screen -S clawdbot-gateway
clawdbot gateway
# Press Ctrl+A then D to detach
```

### Option 3: Integrate into Container Startup

Update the container's startup command to run both the workflow agent and Clawdbot gateway.

---

## 🔧 Fix Doctor Issues (Optional)

```bash
# Fix permissions and create OAuth dir
clawdbot doctor --fix
```

This will:
- Tighten permissions on `~/.clawdbot` to 700
- Create OAuth dir if missing
- Fix other minor issues

---

## 📋 Gateway Configuration

**Current config**:
- **Target**: `ws://127.0.0.1:18789`
- **Bind**: `loopback` (localhost only)
- **Config**: `/root/.clawdbot/clawdbot.json`

**For Slack integration**, the gateway needs to be accessible. Options:

1. **Keep loopback** - Gateway only accessible from within container
2. **Bind to all interfaces** - Gateway accessible from outside (requires auth)
3. **Use reverse proxy** - Expose gateway through the workflow agent app

---

## 🔗 Integration with Workflow Agent

The workflow agent (`apps/workflow-agent/src/index.ts`) should:

1. **Start Clawdbot gateway** as part of the main process
2. **Connect to gateway** via WebSocket
3. **Route Slack messages** to Clawdbot
4. **Handle workflow deployment** via Clawdbot commands

**Example integration**:
```typescript
// In apps/workflow-agent/src/index.ts
import { spawn } from 'child_process';

// Start Clawdbot gateway
const gateway = spawn('clawdbot', ['gateway'], {
  stdio: 'inherit',
  cwd: '/app'
});

// Handle gateway lifecycle
gateway.on('exit', (code) => {
  console.error(`Clawdbot gateway exited with code ${code}`);
  process.exit(1);
});
```

---

## ✅ Verification

After starting the gateway:

```bash
# Check gateway is running
clawdbot status

# Test connection
clawdbot health

# Check gateway logs
# (if running in foreground, logs appear in terminal)
```

---

## 🎯 Next Steps

1. **Start gateway** (Option 1 or 2 above)
2. **Integrate gateway** into workflow agent startup (Option 3)
3. **Test Slack integration** - Send a message to Clawdbot
4. **Test workflow deployment** - Upload a workflow.json file

---

**Status**: OAuth working! Gateway needs to be started for full functionality.
