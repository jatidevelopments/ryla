# Clawdbot Provider Plugin Setup

**Issue**: "No provider plugins found" when trying to use OAuth.

---

## Solution: Use Onboarding Wizard

Clawdbot needs to be initialized via the onboarding wizard first. This sets up the provider plugins automatically.

---

## Step 1: Run Onboarding Wizard

```bash
flyctl ssh console -a ryla-workflow-agent
clawdbot onboard
```

**Or non-interactive**:
```bash
clawdbot onboard --auth-choice openai-codex
```

---

## Step 2: Complete OAuth Flow

The wizard will:
1. Guide you through setup
2. Install required provider plugins
3. Start OAuth flow for OpenAI Codex
4. Store credentials automatically

---

## Alternative: Install Provider Plugin Manually

If the wizard doesn't work, try installing the provider plugin directly:

```bash
# Check available plugins
clawdbot plugins list

# Install OpenAI provider plugin (if available)
clawdbot plugins install @clawdbot/provider-openai

# Or try the Codex provider
clawdbot plugins install @clawdbot/provider-opencode
```

---

## Verify Setup

After onboarding:

```bash
# Check plugins
clawdbot plugins list

# Check models
clawdbot models status

# Verify OAuth
clawdbot models auth login --provider openai-codex
```

---

## Troubleshooting

### Still "No provider plugins found"

1. **Check if plugins directory exists**:
   ```bash
   ls -la ~/.clawdbot/plugins/
   ```

2. **Try manual plugin installation**:
   ```bash
   clawdbot plugins install <plugin-name>
   ```

3. **Check Clawdbot configuration**:
   ```bash
   clawdbot doctor
   clawdbot doctor --fix
   ```

### Plugin Installation Fails

1. **Check network access** (plugins may need npm registry)
2. **Check Node.js version** (must be 22+)
3. **Check disk space**:
   ```bash
   df -h
   ```

---

**Next Step**: Run `clawdbot onboard` to set up provider plugins and OAuth.
