# Git LFS Setup and Usage

## Overview

This repository uses **Git LFS (Large File Storage)** to handle large image files. All image files (`.webp`, `.png`, `.jpg`, `.jpeg`) are automatically tracked by Git LFS, preventing repository size issues and push failures.

## Current Status

- ✅ **Git LFS configured** (December 2024)
- ✅ **1,395 image files** migrated to LFS
- ✅ **All image formats tracked**: `.webp`, `.png`, `.jpg`, `.jpeg`
- ✅ **Configuration file**: `.gitattributes`

## Configuration

Git LFS tracking is configured in `.gitattributes`:

```
*.webp filter=lfs diff=lfs merge=lfs -text
*.png filter=lfs diff=lfs merge=lfs -text
*.jpg filter=lfs diff=lfs merge=lfs -text
*.jpeg filter=lfs diff=lfs merge=lfs -text
```

This means:
- All image files are automatically tracked by Git LFS
- No manual steps needed when adding new images
- Files are stored separately from git history (reduces repository size)

## Installation

Git LFS is required to work with this repository. Install it if you haven't already:

```bash
# macOS (via Homebrew)
brew install git-lfs

# Ubuntu/Debian
sudo apt-get install git-lfs

# Windows (via Chocolatey)
choco install git-lfs

# Or download from: https://git-lfs.github.com/
```

After installation, initialize Git LFS:

```bash
git lfs install
```

## Daily Usage

### Adding New Images

**No special steps needed!** Just add images normally:

```bash
git add apps/web/public/images/new-image.webp
git commit -m "feat: add new image"
git push
```

Git LFS automatically handles the files.

### Checking LFS Files

See which files are tracked by LFS:

```bash
git lfs ls-files
```

Count LFS files:

```bash
git lfs ls-files | wc -l
```

### Pulling LFS Files

When cloning or pulling, LFS files are automatically downloaded. If you need to manually pull LFS files:

```bash
git lfs pull
```

### Verifying LFS Status

Check if Git LFS is working:

```bash
git lfs version
git lfs env
```

## Migration History

The repository was migrated to Git LFS in **December 2024**:

- **Problem**: Repository had 11,066 image files (~847MB), causing push failures
- **Solution**: Migrated all existing images in git history to Git LFS
- **Result**: 1,149 LFS objects (701 MB) successfully uploaded to GitHub
- **Backup**: Branch `backup-before-lfs-migration` contains pre-migration history

### Migration Script

A safe migration script is available: `scripts/safe-lfs-migration.sh`

**Note**: Only use this if you need to migrate additional file types or fix issues. The repository is already fully migrated.

## Troubleshooting

### Push Fails with "file too large" Error

If you see this error, it means:
1. Git LFS might not be installed: `git lfs install`
2. File might not be tracked: Check `.gitattributes`
3. File might need to be migrated: Contact team lead

### LFS Files Not Downloading

If LFS files aren't downloading automatically:

```bash
# Pull LFS files manually
git lfs pull

# Or re-clone the repository
git clone <repository-url>
```

### Checking File Size

Check if a file is actually in LFS or regular git:

```bash
# Check if file is tracked by LFS
git lfs ls-files | grep filename

# Check file size in git
git cat-file -s HEAD:path/to/file
```

If the size is ~130 bytes, it's an LFS pointer (correct). If it's the actual file size, it's not in LFS.

### Team Members After Migration

After the initial migration, team members needed to:

```bash
# Option 1: Re-clone (recommended)
git clone <repository-url>

# Option 2: Reset local branch
git fetch origin
git reset --hard origin/main
git lfs pull
```

## Best Practices

1. **Always use Git LFS for images** - Don't disable it
2. **Compress images before committing** - See `docs/technical/IMAGE-OPTIMIZATION.md`
3. **Don't commit very large files** (>100MB) - Consider external storage
4. **Verify LFS is working** - Check `git lfs ls-files` after adding images

## Related Documentation

- **Image Optimization**: `docs/technical/IMAGE-OPTIMIZATION.md`
- **Compression Script**: `scripts/utils/compress-slider-images.py`
- **Migration Script**: `scripts/git/safe-lfs-migration.sh`

## GitHub LFS Limits

GitHub provides:
- **Free accounts**: 1 GB storage, 1 GB bandwidth/month
- **Pro accounts**: 50 GB storage, 50 GB bandwidth/month
- **Organization accounts**: 50 GB storage, 50 GB bandwidth/month

Current usage: ~701 MB stored (well within limits)

## Support

If you encounter issues:
1. Check this documentation
2. Verify Git LFS is installed: `git lfs version`
3. Check `.gitattributes` configuration
4. Contact team lead if problems persist

