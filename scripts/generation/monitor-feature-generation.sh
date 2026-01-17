#!/bin/bash
# Monitor ethnicity-specific feature image generation progress

TOTAL=406

while true; do
  clear
  echo "=========================================="
  echo "  Feature Image Generation Progress"
  echo "  $(date '+%Y-%m-%d %H:%M:%S')"
  echo "=========================================="
  echo ""
  
  hair=$(find apps/web/public/images/hair-styles -name "*.webp" 2>/dev/null | wc -l | tr -d ' ')
  eyes=$(find apps/web/public/images/eye-colors -name "*.webp" 2>/dev/null | wc -l | tr -d ' ')
  hair_color=$(find apps/web/public/images/hair-colors -name "*.webp" 2>/dev/null | wc -l | tr -d ' ')
  faces=$(find apps/web/public/images/face-shapes -name "*.webp" 2>/dev/null | wc -l | tr -d ' ')
  ages=$(find apps/web/public/images/age-ranges -name "*.webp" 2>/dev/null | wc -l | tr -d ' ')
  
  total=$((hair + eyes + hair_color + faces + ages))
  percent=$(echo "scale=1; $total*100/$TOTAL" | bc)
  remaining=$((TOTAL - total))
  
  echo "Hair Styles:    $hair/98   ($(echo "scale=1; $hair*100/98" | bc)%)"
  echo "Eye Colors:    $eyes/84   ($(echo "scale=1; $eyes*100/84" | bc)%)"
  echo "Hair Colors:   $hair_color/98   ($(echo "scale=1; $hair_color*100/98" | bc)%)"
  echo "Face Shapes:   $faces/70   ($(echo "scale=1; $faces*100/70" | bc)%)"
  echo "Age Ranges:    $ages/56   ($(echo "scale=1; $ages*100/56" | bc)%)"
  echo ""
  echo "------------------------------------------"
  echo "Total Progress: $total/$TOTAL ($percent%)"
  echo "Remaining: $remaining images"
  echo ""
  echo "Press Ctrl+C to stop monitoring"
  echo "=========================================="
  
  sleep 5
done
