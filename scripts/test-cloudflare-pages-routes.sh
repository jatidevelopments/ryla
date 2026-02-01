#!/bin/bash
# Test script to verify Cloudflare Pages CPU time for each route
# Run this after starting: npx wrangler pages dev .vercel/output/static

BASE_URL="${1:-http://localhost:8788}"

echo "Testing routes against $BASE_URL"
echo "================================"
echo ""

# Routes to test (add authentication cookie if needed)
routes=(
  "/"
  "/login"
  "/auth"
  "/dashboard"
  "/studio"
  "/activity"
  "/buy-credits"
  "/legal"
  "/onboarding"
  "/wizard"
  "/wizard/step-0"
  "/wizard/step-1"
  "/payment/success"
  "/payment/cancel"
  "/settings"
)

echo "Route | Status | Time (ms) | Size (bytes)"
echo "----- | ------ | --------- | ------------"

for route in "${routes[@]}"; do
  # Measure response time and status
  result=$(curl -s -o /dev/null -w "%{http_code}|%{time_total}|%{size_download}" "$BASE_URL$route" 2>/dev/null)
  
  status=$(echo "$result" | cut -d'|' -f1)
  time_sec=$(echo "$result" | cut -d'|' -f2)
  size=$(echo "$result" | cut -d'|' -f3)
  
  # Convert to milliseconds
  time_ms=$(echo "$time_sec * 1000" | bc 2>/dev/null || echo "$time_sec")
  
  # Flag if slow (> 500ms response time might indicate CPU issues)
  flag=""
  if (( $(echo "$time_sec > 0.5" | bc -l 2>/dev/null || echo 0) )); then
    flag="⚠️ SLOW"
  fi
  
  echo "$route | $status | ${time_ms}ms | $size | $flag"
done

echo ""
echo "================================"
echo "Notes:"
echo "- 50ms CPU limit ≠ 50ms response time"
echo "- Response time includes network, CPU time is much smaller"
echo "- If a route returns 523, it exceeded CPU limit"
echo "- Routes > 500ms response might need investigation"
