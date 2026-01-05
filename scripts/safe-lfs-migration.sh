#!/bin/bash
# Safe Git LFS Migration Script
# This script migrates existing image files in git history to Git LFS
# All current work is already committed, so this is safe to run

set -e

echo "🔄 Safe Git LFS Migration"
echo "=========================="
echo ""
echo "✅ Safety checks:"
echo "   - All current work is committed"
echo "   - Backup branch created: backup-before-lfs-migration"
echo "   - Working tree is clean"
echo ""

# Verify we're on main
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "⚠️  Warning: You're not on main branch (currently on: $CURRENT_BRANCH)"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 1
    fi
fi

# Verify working tree is clean
if ! git diff-index --quiet HEAD --; then
    echo "❌ Error: Working tree is not clean. Please commit or stash changes first."
    exit 1
fi

echo "📦 Starting migration..."
echo "   This will rewrite git history to move image files to LFS"
echo "   This may take 5-10 minutes depending on repository size..."
echo ""

# Migrate all image files in history to LFS
git lfs migrate import \
    --include="*.webp,*.png,*.jpg,*.jpeg" \
    --everything

echo ""
echo "✅ Migration complete!"
echo ""
echo "📊 Checking results..."
echo ""
echo "LFS files in latest commit:"
git lfs ls-files | wc -l | xargs echo "   Total:"

echo ""
echo "📝 Next steps:"
echo "   1. Review the migration: git log --oneline -5"
echo "   2. Test locally: git lfs pull"
echo "   3. Check repository size: du -sh .git"
echo ""
echo "🚀 When ready to push:"
echo "   git push origin main --force-with-lease"
echo ""
echo "⚠️  Important:"
echo "   - Use --force-with-lease (safer than --force)"
echo "   - Team members will need to re-clone or reset after push"
echo "   - If something goes wrong, restore from: backup-before-lfs-migration"
echo ""

