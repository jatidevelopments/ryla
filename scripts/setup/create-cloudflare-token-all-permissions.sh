#!/usr/bin/env bash
# Create a Cloudflare API token with all available permissions (account + zone).
# Requires: a token that can create API tokens (use CLOUDFLARE_API_TOKEN_CAN_CREATE from /logins),
# and CLOUDFLARE_ACCOUNT_ID. The new token secret is printed once; store it in Infisical.
#
# Usage:
#   infisical run --path=/logins --env=dev -- scripts/setup/create-cloudflare-token-all-permissions.sh

set -euo pipefail

# Use token that can create API tokens if set; otherwise fall back to CLOUDFLARE_API_TOKEN
TOKEN="${CLOUDFLARE_API_TOKEN_CAN_CREATE:-${CLOUDFLARE_API_TOKEN:-}}"
if [ -z "$TOKEN" ] || [ -z "${CLOUDFLARE_ACCOUNT_ID:-}" ]; then
  echo "Error: CLOUDFLARE_ACCOUNT_ID and one of CLOUDFLARE_API_TOKEN_CAN_CREATE or CLOUDFLARE_API_TOKEN must be set (e.g. infisical run --path=/logins --env=dev -- $0)" >&2
  echo "  CLOUDFLARE_API_TOKEN_CAN_CREATE = token with 'Create additional tokens' (recommended for this script)" >&2
  exit 1
fi

if ! command -v jq &>/dev/null; then
  echo "Error: jq is required. Install with: brew install jq" >&2
  exit 1
fi

BASE_URL="https://api.cloudflare.com/client/v4"
ACCOUNT_ID="$CLOUDFLARE_ACCOUNT_ID"

echo "Fetching permission groups..."
GROUPS_JSON=$(curl -s -X GET "${BASE_URL}/accounts/${ACCOUNT_ID}/tokens/permission_groups" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json")

if ! echo "$GROUPS_JSON" | jq -e '.success == true' &>/dev/null; then
  echo "Failed to fetch permission groups:" >&2
  echo "$GROUPS_JSON" | jq '.' >&2
  exit 1
fi

# Account-scoped: permission groups with scope com.cloudflare.api.account (exact, not .zone)
# Zone-scoped: permission groups with scope com.cloudflare.api.account.zone or com.cloudflare.edge.r2.bucket
# Exclude "Account API Tokens" Read/Write - sub-tokens cannot manage other tokens per Cloudflare API.
ACCOUNT_GROUPS=$(echo "$GROUPS_JSON" | jq -c '[.result[] | select(any(.scopes[]?; . == "com.cloudflare.api.account")) | select(.name | test("Account API Tokens") | not) | {id: .id, name: .name}]')
ZONE_GROUPS=$(echo "$GROUPS_JSON" | jq -c '[.result[] | select(any(.scopes[]?; . == "com.cloudflare.api.account.zone" or . == "com.cloudflare.edge.r2.bucket")) | {id: .id, name: .name}]')

ACCOUNT_COUNT=$(echo "$ACCOUNT_GROUPS" | jq 'length')
ZONE_COUNT=$(echo "$ZONE_GROUPS" | jq 'length')
echo "Account-scoped permission groups: $ACCOUNT_COUNT"
echo "Zone-scoped permission groups: $ZONE_COUNT"

# Build policies: this account, all zones in this account
# Account-owned tokens must specify account; use account ID in resources.
# Resources: https://developers.cloudflare.com/fundamentals/api/how-to/create-via-api/
POLICIES="[]"
ACCOUNT_RESOURCE_KEY="com.cloudflare.api.account.${ACCOUNT_ID}"
if [ "$ACCOUNT_COUNT" -gt 0 ]; then
  POLICIES=$(echo "$POLICIES" | jq --argjson groups "$ACCOUNT_GROUPS" --arg key "$ACCOUNT_RESOURCE_KEY" \
    '. + [{effect: "allow", resources: {($key): "*"}, permission_groups: $groups}]')
fi
if [ "$ZONE_COUNT" -gt 0 ]; then
  # All zones in this account: com.cloudflare.api.account.<ID> -> zone.*
  ZONE_RESOURCES=$(jq -n --arg key "$ACCOUNT_RESOURCE_KEY" '{($key): {"com.cloudflare.api.account.zone.*": "*"}}')
  POLICIES=$(echo "$POLICIES" | jq --argjson groups "$ZONE_GROUPS" --argjson resources "$ZONE_RESOURCES" \
    '. + [{effect: "allow", resources: $resources, permission_groups: $groups}]')
fi

BODY=$(jq -n \
  --arg name "RYLA superadmin (all permissions)" \
  --argjson policies "$POLICIES" \
  '{name: $name, policies: $policies}')

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
echo "Store in Infisical:"
echo "  infisical secrets set CLOUDFLARE_API_TOKEN=<paste_above> --path=/logins --env=dev"
echo ""
echo "Optional: revoke the old token in Cloudflare Dashboard if you are replacing it."
