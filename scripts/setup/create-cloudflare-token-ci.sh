#!/usr/bin/env bash
# Create a Cloudflare API token for CI/CD with minimal permissions (Pages Read + Write only).
# Requires: a token that can create API tokens (use CLOUDFLARE_API_TOKEN_CAN_CREATE from /logins),
# and CLOUDFLARE_ACCOUNT_ID. Store the new token in Infisical /ci and GitHub Secrets.
#
# Usage:
#   infisical run --path=/logins --env=dev -- scripts/setup/create-cloudflare-token-ci.sh
#
# Add CLOUDFLARE_API_TOKEN_CAN_CREATE in /logins (token with "Create additional tokens") to create tokens via this script.

set -euo pipefail

# Use token that can create API tokens if set; otherwise fall back to CLOUDFLARE_API_TOKEN
TOKEN="${CLOUDFLARE_API_TOKEN_CAN_CREATE:-${CLOUDFLARE_API_TOKEN:-}}"
if [ -z "$TOKEN" ] || [ -z "${CLOUDFLARE_ACCOUNT_ID:-}" ]; then
  echo "Error: CLOUDFLARE_ACCOUNT_ID and one of CLOUDFLARE_API_TOKEN_CAN_CREATE or CLOUDFLARE_API_TOKEN must be set (e.g. infisical run --path=/logins --env=dev -- $0)" >&2
  echo "  CLOUDFLARE_API_TOKEN_CAN_CREATE = token with 'Create additional tokens' (required for this script)" >&2
  exit 1
fi

if ! command -v jq &>/dev/null; then
  echo "Error: jq is required. Install with: brew install jq" >&2
  exit 1
fi

BASE_URL="https://api.cloudflare.com/client/v4"
ACCOUNT_ID="$CLOUDFLARE_ACCOUNT_ID"

# Pages Read + Pages Write (account-scoped); IDs from Cloudflare API permission_groups
# Account-owned tokens cannot list permission_groups, so we use stable IDs.
PAGES_GROUPS='[{"id":"e247aedd66bd41cc9193af0213416666","name":"Pages Read"},{"id":"8d28297797f24fb8a0c332fe0866ec89","name":"Pages Write"}]'
echo "Using permission groups: Pages Read, Pages Write"

ACCOUNT_RESOURCE_KEY="com.cloudflare.api.account.${ACCOUNT_ID}"
BODY=$(jq -n \
  --arg name "RYLA CI/CD (Pages deploy only)" \
  --arg key "$ACCOUNT_RESOURCE_KEY" \
  --argjson groups "$PAGES_GROUPS" \
  '{
    name: $name,
    policies: [
      {
        effect: "allow",
        resources: { ($key): "*" },
        permission_groups: $groups
      }
    ]
  }')

echo "Creating token..."
RESPONSE=$(curl -s -X POST "${BASE_URL}/accounts/${ACCOUNT_ID}/tokens" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$BODY")

if ! echo "$RESPONSE" | jq -e '.success == true' &>/dev/null; then
  echo "Failed to create token:" >&2
  echo "$RESPONSE" | jq '.' >&2
  exit 1
fi

NEW_TOKEN=$(echo "$RESPONSE" | jq -r '.result.value')
TOKEN_ID=$(echo "$RESPONSE" | jq -r '.result.id')

echo ""
echo "Token created successfully."
echo "Token ID: $TOKEN_ID"
echo ""
echo "--- NEW TOKEN (save this; it is only shown once) ---"
echo "$NEW_TOKEN"
echo "---"
echo ""
echo "Store in Infisical /ci:"
echo "  infisical secrets set CLOUDFLARE_API_TOKEN=<paste_above> --path=/ci --env=dev"
echo "  infisical secrets set CLOUDFLARE_ACCOUNT_ID=$ACCOUNT_ID --path=/ci --env=dev"
echo ""
echo "Add to GitHub Secrets (for deploy-auto.yml):"
echo "  CLOUDFLARE_API_TOKEN = <paste above>"
echo "  CLOUDFLARE_ACCOUNT_ID = $ACCOUNT_ID"
