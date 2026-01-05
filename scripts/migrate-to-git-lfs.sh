#!/bin/bash
# Migrate existing image files to Git LFS
# This script safely migrates large image files to Git LFS

set -e

echo "🔄 Migrating image files to Git LFS..."
echo ""
echo "⚠️  WARNING: This will rewrite git history!"
echo "   Make sure you have a backup or are working on a branch."
echo ""

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" = "main" ]; then
    echo "❌ You're on main branch. Creating migration branch..."
    git checkout -b migrate/git-lfs-images
    echo "✅ Created branch: migrate/git-lfs-images"
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  You have uncommitted changes."
    echo "   Options:"
    echo "   1. Commit them first: git add . && git commit -m 'chore: save work before LFS migration'"
    echo "   2. Stash them: git stash"
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 1
    fi
fi

echo ""
echo "📦 Migrating files to Git LFS..."
echo "   This may take several minutes..."
echo ""

# Migrate all image files to LFS
git lfs migrate import \
    --include="*.webp,*.png,*.jpg,*.jpeg" \
    --everything

echo ""
echo "✅ Migration complete!"
echo ""
echo "📊 Checking LFS files..."
git lfs ls-files | head -10

echo ""
echo "🚀 Next steps:"
echo "   1. Review changes: git log --oneline -5"
echo "   2. Test locally: git lfs pull"
echo "   3. Push to remote: git push origin $(git branch --show-current) --force-with-lease"
echo ""
echo "⚠️  Note: You'll need to force push because history was rewritten."
echo "   Use --force-with-lease for safety (fails if remote has new commits)."

