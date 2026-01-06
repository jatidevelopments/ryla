# RunPod Team Context Configuration

> **Issue**: Resources are being created on personal account instead of Dream Companion team  
> **Last Updated**: 2025-12-10

## Problem

When creating resources via API/MCP, they're being created on the **personal account** instead of the **Dream Companion team account**.

## Solution Options

### Option 1: Use Team-Specific API Key (Recommended)

1. **Switch to Team Account in Console**:
   - Go to RunPod Console: https://www.runpod.io/console
   - Click account selector (top-left)
   - Select "Dream Companion" team

2. **Generate Team API Key**:
   - While in team account context
   - Go to Settings → API Keys
   - Generate new API key
   - This key will be associated with the team account

3. **Update Environment Variable**:
   ```bash
   # Update RUNPOD_API_KEY in .env.local
   RUNPOD_API_KEY=<team-api-key>
   ```

4. **Restart MCP Server**:
   - Restart Cursor to reload MCP with new API key
   - Resources will now be created under team account

### Option 2: Transfer Credits to Team Account

If credits are on personal account:

1. **Generate Credit Code** (in personal account):
   - Go to Billing → Credit Codes
   - Generate code for amount needed
   - Note: 2-5% transfer fee applies

2. **Redeem in Team Account**:
   - Switch to Dream Companion team
   - Go to Billing → Redeem Code
   - Enter credit code

3. **Deploy Resources**:
   - Resources will use team account credits

### Option 3: Switch Active Account (Console Only)

For manual deployment via Console:

1. **Switch Account**:
   - Click account selector → Select "Dream Companion"
   - All console actions will use team account

2. **Deploy via Console**:
   - Create Network Volume
   - Create ComfyUI Pod
   - Create Serverless Endpoint

## Current API Key Context

**Current API Key**: Associated with personal account
- User ID: `user_36ZQzKqNNydabyrpPDlVCV3oHtl`
- Email: `janistirtey1@gmail.com`

**Team Account**:
- Team ID: `cm03tl0ve0002l408rxwspxk7`
- Team Name: Dream Companion

## Verification

After switching to team API key:

```bash
# Check which account context is active
# Resources created should show under Dream Companion team
List all my RunPod network volumes
List all my RunPod pods
```

## Next Steps

1. **Get Team API Key**:
   - Switch to Dream Companion team in console
   - Generate new API key
   - Update `RUNPOD_API_KEY` environment variable

2. **Restart MCP**:
   - Restart Cursor
   - Verify team context

3. **Deploy Resources**:
   - Create Network Volume
   - Create ComfyUI Pod
   - Create Serverless Endpoint

## References

- [RunPod Team Accounts](https://docs.runpod.io/get-started/manage-accounts)
- [Transfer Credits Between Accounts](https://contact.runpod.io/hc/en-us/articles/41318533385875)

