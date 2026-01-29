# Code Metrics Tracking

Tracks codebase size and code generation trends over time using git history analysis.

## Overview

The code metrics tracker provides insights into:
- **Current codebase size**: Total files, lines of code (LOC), breakdown by language and directory
- **Code generation trends**: Daily, weekly, and monthly statistics on code added/removed
- **Activity metrics**: Most active files and commit frequency

## Quick Start

### Basic Usage

```bash
# Generate a report for the last 30 days (default)
pnpm code:metrics

# Analyze last 7 days
pnpm code:metrics -- --days=7

# Analyze last 90 days
pnpm code:metrics -- --days=90

# Output as JSON
pnpm code:metrics -- --format=json

# Save report to file
pnpm code:metrics -- --output=tmp/code-metrics-report.txt

# Use cloc for more accurate counting (if installed)
pnpm code:metrics -- --use-cloc
```

## Installation

### Optional: Install cloc for Better Accuracy

The script works without `cloc`, but using it provides more accurate line counts:

```bash
# macOS
brew install cloc

# Linux (Debian/Ubuntu)
apt-get install cloc

# Linux (RHEL/CentOS)
yum install cloc

# Windows (via Chocolatey)
choco install cloc
```

If `cloc` is not installed, the script will use a custom file-reading approach that's slightly less accurate but still functional.

## Command Options

| Option | Description | Default |
|-------|-------------|---------|
| `--days=<number>` | Number of days to analyze for trends | `30` |
| `--format=<json\|text>` | Output format | `text` |
| `--use-cloc` | Use cloc tool if available | `false` |
| `--output=<path>` | Save report to file | (prints to stdout) |

## Output Format

### Text Format (Default)

```
================================================================================
RYLA Code Metrics Report
================================================================================
Generated: 2025-01-15T10:30:00.000Z

📊 CURRENT CODEBASE SIZE
--------------------------------------------------------------------------------
Total Files: 2,145
Total Lines: 187,432

By Language:
  typescript      1,234 files,    145,234 lines
  python            89 files,     12,456 lines
  json             456 files,     18,234 lines
  markdown         367 files,     11,508 lines

By Directory:
  apps           1,234 files,    123,456 lines
  libs             456 files,     45,678 lines
  scripts          455 files,     18,298 lines

📈 CODE GENERATION TRENDS
--------------------------------------------------------------------------------
Last 30 days:
  Added:   12,345 lines
  Removed:  8,234 lines
  Net:      4,111 lines
  Avg/day:    137 lines

Last 4 weeks:
  Added:   45,678 lines
  Removed: 32,123 lines
  Net:     13,555 lines
  Avg/week: 3,389 lines

Last 12 months:
  Added:   234,567 lines
  Removed: 123,456 lines
  Net:    111,111 lines
  Avg/month: 9,259 lines

🔥 MOST ACTIVE FILES
--------------------------------------------------------------------------------
  45 changes: apps/web/app/studio/page.tsx
  32 changes: apps/api/src/modules/character/character.service.ts
  28 changes: libs/business/src/workflows/index.ts
  ...

Total commits (last 30 days): 234
Average commits/day: 7.8

================================================================================
```

### JSON Format

```json
{
  "timestamp": "2025-01-15T10:30:00.000Z",
  "current": {
    "total": {
      "files": 2145,
      "lines": 187432,
      "byLanguage": {
        "typescript": { "files": 1234, "lines": 145234 },
        "python": { "files": 89, "lines": 12456 }
      }
    },
    "byDirectory": {
      "apps": { "files": 1234, "lines": 123456 },
      "libs": { "files": 456, "lines": 45678 }
    }
  },
  "trends": {
    "daily": [
      { "date": "2025-01-15", "added": 234, "removed": 123, "net": 111 }
    ],
    "weekly": [
      { "week": "2025-W02", "added": 1234, "removed": 567, "net": 667 }
    ],
    "monthly": [
      { "month": "2025-01", "added": 12345, "removed": 8234, "net": 4111 }
    ]
  },
  "activity": {
    "mostActiveFiles": [
      { "file": "apps/web/app/studio/page.tsx", "changes": 45 }
    ],
    "commitsByDay": [
      { "date": "2025-01-15", "count": 8 }
    ]
  }
}
```

## Understanding the Metrics

### Current Codebase Size

- **Total Files**: Count of all code files (TypeScript, Python, JSON, etc.)
- **Total Lines**: Total lines of code across all files
- **By Language**: Breakdown showing which languages contribute most
- **By Directory**: Breakdown by major directories (apps, libs, scripts)

### Code Generation Trends

- **Daily**: Day-by-day breakdown of code added/removed
- **Weekly**: Week-by-week summary (ISO week format: YYYY-W##)
- **Monthly**: Month-by-month summary (YYYY-MM format)
- **Net Change**: Lines added minus lines removed (shows actual growth)
- **Average**: Average daily/weekly/monthly net change

### Activity Metrics

- **Most Active Files**: Files with the most commits/changes in the period
- **Commits by Day**: Commit frequency over time
- **Average Commits/Day**: Development activity metric

## Use Cases

### 1. Track Development Velocity

```bash
# Weekly velocity report
pnpm code:metrics -- --days=7 --output=tmp/weekly-velocity.txt
```

Use this to:
- Measure team productivity
- Identify slow weeks
- Track sprint progress

### 2. Monitor Code Growth

```bash
# Monthly growth report
pnpm code:metrics -- --days=30 --format=json --output=tmp/monthly-growth.json
```

Use this to:
- Track codebase size over time
- Identify areas of rapid growth
- Plan refactoring efforts

### 3. Identify Hotspots

The "Most Active Files" section helps identify:
- Files that need refactoring (too many changes)
- Critical paths (frequently modified)
- Areas of technical debt

### 4. Historical Analysis

```bash
# Analyze last 6 months
pnpm code:metrics -- --days=180 --format=json --output=tmp/historical.json
```

Use this to:
- Understand long-term trends
- Plan capacity
- Measure impact of initiatives

## Automation

### Daily Reports

Add to cron or GitHub Actions:

```bash
# Daily at 9 AM
0 9 * * * cd /path/to/ryla && pnpm code:metrics -- --days=1 --output=tmp/daily-$(date +\%Y-\%m-\%d).txt
```

### Weekly Summary

```bash
# Every Monday at 9 AM
0 9 * * 1 cd /path/to/ryla && pnpm code:metrics -- --days=7 --output=tmp/weekly-$(date +\%Y-W\%V).txt
```

### CI/CD Integration

Add to GitHub Actions workflow:

```yaml
- name: Generate Code Metrics
  run: |
    pnpm code:metrics -- --days=30 --format=json --output=tmp/metrics.json
    # Upload as artifact or post to monitoring system
```

## Limitations

1. **Git History Required**: Metrics depend on git history. Shallow clones may have limited data.
2. **File Exclusions**: Automatically excludes `node_modules`, `dist`, `coverage`, etc. Custom exclusions not yet supported.
3. **Language Detection**: Uses file extensions. May not detect all languages accurately.
4. **Performance**: Large codebases may take 10-30 seconds to analyze.

## Troubleshooting

### "Could not analyze git history"

- Ensure you're in a git repository
- Check that git is installed and accessible
- Verify you have commit history for the requested period

### "cloc not found" (when using --use-cloc)

- Install cloc (see Installation section)
- Or remove `--use-cloc` flag to use built-in counting

### Slow Performance

- Reduce the `--days` parameter
- Use `--use-cloc` for faster counting (if available)
- Exclude large directories manually (future feature)

## Future Enhancements

Potential improvements:
- [ ] Custom exclusion patterns
- [ ] Per-app/library breakdown in trends
- [ ] Code complexity metrics
- [ ] Test coverage integration
- [ ] Historical database for long-term tracking
- [ ] Web dashboard integration
- [ ] Slack/email notifications

## Related Documentation

- [File Organization Guide](../FILE-ORGANIZATION-GUIDE.md)
- [Git Workflow](../../process/GIT-WORKFLOW.md)
- [Analytics Tracking](../../analytics/TRACKING-PLAN.md)

## Script Location

- **Script**: `scripts/utils/code-metrics.ts`
- **Package Script**: `pnpm code:metrics`
- **Documentation**: `docs/technical/guides/CODE-METRICS-TRACKING.md`
