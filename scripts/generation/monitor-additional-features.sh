#!/bin/bash
# Monitor progress of additional features generation

while true; do
  clear
  echo "╔══════════════════════════════════════════════════════════════╗"
  echo "║   Ethnicity-Specific Additional Features Generation Monitor  ║"
  echo "╚══════════════════════════════════════════════════════════════╝"
  echo ""
  echo "Time: $(date '+%Y-%m-%d %H:%M:%S')"
  echo ""
  
  body=$(find apps/web/public/images/body-types -name "*.webp" 2>/dev/null | wc -l | tr -d ' ')
  breast=$(find apps/web/public/images/breast-sizes -name "*.webp" 2>/dev/null | wc -l | tr -d ' ')
  ass=$(find apps/web/public/images/ass-sizes -name "*.webp" 2>/dev/null | wc -l | tr -d ' ')
  piercing=$(find apps/web/public/images/piercings -name "*.webp" 2>/dev/null | wc -l | tr -d ' ')
  tattoo=$(find apps/web/public/images/tattoos -name "*.webp" 2>/dev/null | wc -l | tr -d ' ')
  skin_color=$(find apps/web/public/images/skin-colors -name "*.webp" 2>/dev/null | wc -l | tr -d ' ')
  skin_feature=$(find apps/web/public/images/skin-features -name "*.webp" 2>/dev/null | wc -l | tr -d ' ')
  
  total=$((body + breast + ass + piercing + tattoo + skin_color + skin_feature))
  percent=$(echo "scale=1; $total*100/294" | bc 2>/dev/null || echo "0")
  remaining=$((294 - total))
  
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📊 PROGRESS: $total/294 ($percent%)"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "Category Breakdown:"
  printf "  Body Types:      %3d/56  " $body
  [ $body -eq 56 ] && echo "✅" || echo "⏳"
  printf "  Breast Sizes:    %3d/28  " $breast
  [ $breast -eq 28 ] && echo "✅" || echo "⏳"
  printf "  Ass Sizes:       %3d/28  " $ass
  [ $ass -eq 28 ] && echo "✅" || echo "⏳"
  printf "  Piercings:       %3d/42  " $piercing
  [ $piercing -eq 42 ] && echo "✅" || echo "⏳"
  printf "  Tattoos:         %3d/35  " $tattoo
  [ $tattoo -eq 35 ] && echo "✅" || echo "⏳"
  printf "  Skin Colors:     %3d/28  " $skin_color
  [ $skin_color -eq 28 ] && echo "✅" || echo "⏳"
  printf "  Skin Features:   %3d/77  " $skin_feature
  [ $skin_feature -eq 77 ] && echo "✅" || echo "⏳"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Remaining: $remaining images"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  
  if ps -p $(cat /tmp/generation.pid 2>/dev/null) > /dev/null 2>&1; then
    echo "✅ Generation script is RUNNING"
    echo ""
    echo "Recent activity:"
    tail -3 /tmp/additional-features-generation.log 2>/dev/null | grep -E "(Generating|Saved|Skipping|Complete)" | tail -2 || echo "  (checking...)"
  else
    echo "❌ Generation script is NOT running"
    echo ""
    echo "Last log entries:"
    tail -5 /tmp/additional-features-generation.log 2>/dev/null | tail -3 || echo "  (no log found)"
  fi
  
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  if [ $total -eq 294 ]; then
    echo ""
    echo "🎉 GENERATION COMPLETE! All 294 images generated!"
    echo ""
    echo "Next step: Run optimization script"
    echo "  python3 scripts/generation/optimize-additional-features.py"
    echo ""
    break
  fi
  
  echo ""
  echo "⏱️  Refreshing in 10 seconds... (Press Ctrl+C to stop)"
  sleep 10
done
