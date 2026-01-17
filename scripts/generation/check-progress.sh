#!/bin/bash
cd /Users/admin/Documents/Projects/RYLA

while true; do
  hair=$(find apps/web/public/images/hair-styles -name "*.webp" 2>/dev/null | wc -l | tr -d ' ')
  eyes=$(find apps/web/public/images/eye-colors -name "*.webp" 2>/dev/null | wc -l | tr -d ' ')
  hair_color=$(find apps/web/public/images/hair-colors -name "*.webp" 2>/dev/null | wc -l | tr -d ' ')
  faces=$(find apps/web/public/images/face-shapes -name "*.webp" 2>/dev/null | wc -l | tr -d ' ')
  ages=$(find apps/web/public/images/age-ranges -name "*.webp" 2>/dev/null | wc -l | tr -d ' ')
  total=$((hair + eyes + hair_color + faces + ages))
  percent=$(echo "scale=1; $total*100/406" | bc 2>/dev/null || echo "0")
  remaining=$((406 - total))
  
  echo "[$(date '+%H:%M:%S')] Hair:$hair/98 Eyes:$eyes/84 HairColor:$hair_color/98 Faces:$faces/70 Ages:$ages/56 | Total: $total/406 ($percent%) | Remaining: $remaining"
  
  if [ $total -eq 406 ]; then
    echo "✅ Generation Complete!"
    break
  fi
  
  sleep 5
done
