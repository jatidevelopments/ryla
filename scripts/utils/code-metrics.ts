#!/usr/bin/env npx tsx
/**
 * Code Metrics Tracker
 *
 * Analyzes codebase size and code generation trends over time.
 * Tracks lines of code (LOC) and git history statistics.
 *
 * Usage:
 *   pnpm code:metrics
 *   pnpm code:metrics -- --days 30
 *   pnpm code:metrics -- --format json
 *   pnpm code:metrics -- --use-cloc
 *
 * Options:
 *   --days <number>     Number of days to analyze (default: 30)
 *   --format <json|text> Output format (default: text)
 *   --use-cloc          Use cloc tool if available (more accurate)
 *   --output <path>     Save report to file
 *
 * Output:
 *   - Current LOC statistics
 *   - Daily/weekly/monthly code generation trends
 *   - Breakdown by app/library
 *   - Most active files
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface CodeMetrics {
  timestamp: string;
  current: {
    total: {
      files: number;
      lines: number;
      byLanguage: Record<string, { files: number; lines: number }>;
    };
    byDirectory: Record<string, { files: number; lines: number }>;
  };
  trends: {
    daily: Array<{ date: string; added: number; removed: number; net: number }>;
    weekly: Array<{ week: string; added: number; removed: number; net: number }>;
    monthly: Array<{ month: string; added: number; removed: number; net: number }>;
  };
  activity: {
    mostActiveFiles: Array<{ file: string; changes: number }>;
    commitsByDay: Array<{ date: string; count: number }>;
  };
}

interface FileStats {
  files: number;
  lines: number;
}

const EXCLUDE_DIRS = [
  'node_modules',
  'dist',
  'coverage',
  '.nx',
  '.next',
  'test-results',
  'tmp',
  '.git',
  'build',
  '.turbo',
];

const CODE_EXTENSIONS = {
  typescript: ['.ts', '.tsx'],
  javascript: ['.js', '.jsx', '.mjs', '.cjs'],
  python: ['.py'],
  json: ['.json'],
  markdown: ['.md'],
  sql: ['.sql'],
  shell: ['.sh', '.bash'],
  css: ['.css', '.scss'],
  html: ['.html', '.htm'],
};

function countLinesInFile(filePath: string): number {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return content.split('\n').length;
  } catch {
    return 0;
  }
}

function getFileLanguage(filePath: string): string | null {
  const ext = path.extname(filePath).toLowerCase();
  for (const [lang, exts] of Object.entries(CODE_EXTENSIONS)) {
    if (exts.includes(ext)) {
      return lang;
    }
  }
  return null;
}

function shouldExclude(filePath: string): boolean {
  return EXCLUDE_DIRS.some((dir) => filePath.includes(`/${dir}/`) || filePath.includes(`\\${dir}\\`));
}

function countLinesInDirectory(dir: string, baseDir: string = dir): FileStats {
  let files = 0;
  let lines = 0;

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(baseDir, fullPath);

      if (shouldExclude(relativePath)) {
        continue;
      }

      if (entry.isDirectory()) {
        const stats = countLinesInDirectory(fullPath, baseDir);
        files += stats.files;
        lines += stats.lines;
      } else if (entry.isFile()) {
        const lang = getFileLanguage(fullPath);
        if (lang) {
          files++;
          lines += countLinesInFile(fullPath);
        }
      }
    }
  } catch (error) {
    // Skip directories we can't read
  }

  return { files, lines };
}

function countLinesWithCloc(): FileStats | null {
  try {
    const result = execSync('cloc . --json --exclude-dir=' + EXCLUDE_DIRS.join(','), {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore'],
      cwd: process.cwd(),
    });

    const data = JSON.parse(result);
    return {
      files: data.SUM?.nFiles || 0,
      lines: data.SUM?.code || 0,
    };
  } catch {
    return null;
  }
}

function getCurrentMetrics(useCloc: boolean = false): CodeMetrics['current'] {
  const byLanguage: Record<string, { files: number; lines: number }> = {};
  const byDirectory: Record<string, { files: number; lines: number }> = {};

  let totalFiles = 0;
  let totalLines = 0;

  if (useCloc) {
    const clocResult = countLinesWithCloc();
    if (clocResult) {
      return {
        total: {
          files: clocResult.files,
          lines: clocResult.lines,
          byLanguage: {},
        },
        byDirectory: {},
      };
    }
  }

  // Count by directory
  const directories = ['apps', 'libs', 'scripts'];
  for (const dir of directories) {
    const dirPath = path.join(process.cwd(), dir);
    if (fs.existsSync(dirPath)) {
      const stats = countLinesInDirectory(dirPath);
      byDirectory[dir] = stats;
      totalFiles += stats.files;
      totalLines += stats.lines;
    }
  }

  // Count by language (simplified - would need full scan)
  // For now, we'll do a quick scan of key directories
  const keyDirs = ['apps', 'libs', 'scripts'];
  for (const dir of keyDirs) {
    const dirPath = path.join(process.cwd(), dir);
    if (fs.existsSync(dirPath)) {
      scanForLanguages(dirPath, byLanguage);
    }
  }

  return {
    total: {
      files: totalFiles,
      lines: totalLines,
      byLanguage,
    },
    byDirectory,
  };
}

function scanForLanguages(dir: string, byLanguage: Record<string, { files: number; lines: number }>, baseDir: string = dir) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(baseDir, fullPath);

      if (shouldExclude(relativePath)) {
        continue;
      }

      if (entry.isDirectory()) {
        scanForLanguages(fullPath, byLanguage, baseDir);
      } else {
        const lang = getFileLanguage(fullPath);
        if (lang) {
          if (!byLanguage[lang]) {
            byLanguage[lang] = { files: 0, lines: 0 };
          }
          byLanguage[lang].files++;
          byLanguage[lang].lines += countLinesInFile(fullPath);
        }
      }
    }
  } catch {
    // Skip errors
  }
}

function getGitTrends(days: number): CodeMetrics['trends'] {
  const daily: CodeMetrics['trends']['daily'] = [];
  const weekly: CodeMetrics['trends']['weekly'] = [];
  const monthly: CodeMetrics['trends']['monthly'] = [];

  try {
    // Daily trends
    const dailyLog = execSync(
      `git log --since="${days} days ago" --pretty=format:"%ad" --date=short --numstat`,
      { encoding: 'utf-8', cwd: process.cwd() }
    );

    const dailyMap = new Map<string, { added: number; removed: number }>();
    const lines = dailyLog.split('\n');
    let currentDate = '';

    for (const line of lines) {
      if (line.match(/^\d{4}-\d{2}-\d{2}$/)) {
        currentDate = line;
        if (!dailyMap.has(currentDate)) {
          dailyMap.set(currentDate, { added: 0, removed: 0 });
        }
      } else if (line.match(/^\d+\s+\d+\s+/)) {
        const [added, removed] = line.split(/\s+/).map(Number);
        if (currentDate && dailyMap.has(currentDate)) {
          const stats = dailyMap.get(currentDate)!;
          stats.added += added || 0;
          stats.removed += removed || 0;
        }
      }
    }

    for (const [date, stats] of dailyMap.entries()) {
      daily.push({
        date,
        added: stats.added,
        removed: stats.removed,
        net: stats.added - stats.removed,
      });
    }

    daily.sort((a, b) => a.date.localeCompare(b.date));

    // Weekly trends
    const weeklyLog = execSync(
      `git log --since="${days} days ago" --pretty=format:"%ad" --date=format:"%Y-W%V" --numstat`,
      { encoding: 'utf-8', cwd: process.cwd() }
    );

    const weeklyMap = new Map<string, { added: number; removed: number }>();
    const weeklyLines = weeklyLog.split('\n');
    let currentWeek = '';

    for (const line of weeklyLines) {
      if (line.match(/^\d{4}-W\d{2}$/)) {
        currentWeek = line;
        if (!weeklyMap.has(currentWeek)) {
          weeklyMap.set(currentWeek, { added: 0, removed: 0 });
        }
      } else if (line.match(/^\d+\s+\d+\s+/)) {
        const [added, removed] = line.split(/\s+/).map(Number);
        if (currentWeek && weeklyMap.has(currentWeek)) {
          const stats = weeklyMap.get(currentWeek)!;
          stats.added += added || 0;
          stats.removed += removed || 0;
        }
      }
    }

    for (const [week, stats] of weeklyMap.entries()) {
      weekly.push({
        week,
        added: stats.added,
        removed: stats.removed,
        net: stats.added - stats.removed,
      });
    }

    weekly.sort((a, b) => a.week.localeCompare(b.week));

    // Monthly trends
    const monthlyLog = execSync(
      `git log --since="12 months ago" --pretty=format:"%ad" --date=format:"%Y-%m" --numstat`,
      { encoding: 'utf-8', cwd: process.cwd() }
    );

    const monthlyMap = new Map<string, { added: number; removed: number }>();
    const monthlyLines = monthlyLog.split('\n');
    let currentMonth = '';

    for (const line of monthlyLines) {
      if (line.match(/^\d{4}-\d{2}$/)) {
        currentMonth = line;
        if (!monthlyMap.has(currentMonth)) {
          monthlyMap.set(currentMonth, { added: 0, removed: 0 });
        }
      } else if (line.match(/^\d+\s+\d+\s+/)) {
        const [added, removed] = line.split(/\s+/).map(Number);
        if (currentMonth && monthlyMap.has(currentMonth)) {
          const stats = monthlyMap.get(currentMonth)!;
          stats.added += added || 0;
          stats.removed += removed || 0;
        }
      }
    }

    for (const [month, stats] of monthlyMap.entries()) {
      monthly.push({
        month,
        added: stats.added,
        removed: stats.removed,
        net: stats.added - stats.removed,
      });
    }

    monthly.sort((a, b) => a.month.localeCompare(b.month));
  } catch (error) {
    console.warn('⚠️  Could not analyze git history:', error);
  }

  return { daily, weekly, monthly };
}

function getActivityMetrics(days: number): CodeMetrics['activity'] {
  const mostActiveFiles: Array<{ file: string; changes: number }> = [];
  const commitsByDay: Array<{ date: string; count: number }> = [];

  try {
    // Most active files
    const fileLog = execSync(
      `git log --since="${days} days ago" --pretty=format: --name-only`,
      { encoding: 'utf-8', cwd: process.cwd() }
    );

    const fileCounts = new Map<string, number>();
    for (const file of fileLog.split('\n')) {
      const trimmed = file.trim();
      if (trimmed && !shouldExclude(trimmed)) {
        fileCounts.set(trimmed, (fileCounts.get(trimmed) || 0) + 1);
      }
    }

    for (const [file, count] of fileCounts.entries()) {
      mostActiveFiles.push({ file, changes: count });
    }

    mostActiveFiles.sort((a, b) => b.changes - a.changes);

    // Commits by day
    const commitLog = execSync(
      `git log --since="${days} days ago" --pretty=format:"%ad" --date=short`,
      { encoding: 'utf-8', cwd: process.cwd() }
    );

    const commitCounts = new Map<string, number>();
    for (const date of commitLog.split('\n')) {
      const trimmed = date.trim();
      if (trimmed) {
        commitCounts.set(trimmed, (commitCounts.get(trimmed) || 0) + 1);
      }
    }

    for (const [date, count] of commitCounts.entries()) {
      commitsByDay.push({ date, count });
    }

    commitsByDay.sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.warn('⚠️  Could not analyze activity metrics:', error);
  }

  return {
    mostActiveFiles: mostActiveFiles.slice(0, 20),
    commitsByDay,
  };
}

function formatTextReport(metrics: CodeMetrics): string {
  const lines: string[] = [];

  lines.push('='.repeat(80));
  lines.push('RYLA Code Metrics Report');
  lines.push('='.repeat(80));
  lines.push(`Generated: ${metrics.timestamp}`);
  lines.push('');

  // Current metrics
  lines.push('📊 CURRENT CODEBASE SIZE');
  lines.push('-'.repeat(80));
  lines.push(`Total Files: ${metrics.current.total.files.toLocaleString()}`);
  lines.push(`Total Lines: ${metrics.current.total.lines.toLocaleString()}`);
  lines.push('');

  if (Object.keys(metrics.current.total.byLanguage).length > 0) {
    lines.push('By Language:');
    for (const [lang, stats] of Object.entries(metrics.current.total.byLanguage)) {
      lines.push(`  ${lang.padEnd(15)} ${stats.files.toString().padStart(6)} files, ${stats.lines.toLocaleString().padStart(10)} lines`);
    }
    lines.push('');
  }

  if (Object.keys(metrics.current.byDirectory).length > 0) {
    lines.push('By Directory:');
    for (const [dir, stats] of Object.entries(metrics.current.byDirectory)) {
      lines.push(`  ${dir.padEnd(15)} ${stats.files.toString().padStart(6)} files, ${stats.lines.toLocaleString().padStart(10)} lines`);
    }
    lines.push('');
  }

  // Trends
  lines.push('📈 CODE GENERATION TRENDS');
  lines.push('-'.repeat(80));

  if (metrics.trends.daily.length > 0) {
    const dailyTotal = metrics.trends.daily.reduce(
      (acc, d) => ({ added: acc.added + d.added, removed: acc.removed + d.removed, net: acc.net + d.net }),
      { added: 0, removed: 0, net: 0 }
    );
    lines.push(`Last ${metrics.trends.daily.length} days:`);
    lines.push(`  Added:   ${dailyTotal.added.toLocaleString()} lines`);
    lines.push(`  Removed: ${dailyTotal.removed.toLocaleString()} lines`);
    lines.push(`  Net:     ${dailyTotal.net.toLocaleString()} lines`);
    lines.push(`  Avg/day: ${Math.round(dailyTotal.net / metrics.trends.daily.length).toLocaleString()} lines`);
    lines.push('');
  }

  if (metrics.trends.weekly.length > 0) {
    const weeklyTotal = metrics.trends.weekly.reduce(
      (acc, w) => ({ added: acc.added + w.added, removed: acc.removed + w.removed, net: acc.net + w.net }),
      { added: 0, removed: 0, net: 0 }
    );
    lines.push(`Last ${metrics.trends.weekly.length} weeks:`);
    lines.push(`  Added:   ${weeklyTotal.added.toLocaleString()} lines`);
    lines.push(`  Removed: ${weeklyTotal.removed.toLocaleString()} lines`);
    lines.push(`  Net:     ${weeklyTotal.net.toLocaleString()} lines`);
    lines.push(`  Avg/week: ${Math.round(weeklyTotal.net / metrics.trends.weekly.length).toLocaleString()} lines`);
    lines.push('');
  }

  if (metrics.trends.monthly.length > 0) {
    const monthlyTotal = metrics.trends.monthly.reduce(
      (acc, m) => ({ added: acc.added + m.added, removed: acc.removed + m.removed, net: acc.net + m.net }),
      { added: 0, removed: 0, net: 0 }
    );
    lines.push(`Last ${metrics.trends.monthly.length} months:`);
    lines.push(`  Added:   ${monthlyTotal.added.toLocaleString()} lines`);
    lines.push(`  Removed: ${monthlyTotal.removed.toLocaleString()} lines`);
    lines.push(`  Net:     ${monthlyTotal.net.toLocaleString()} lines`);
    lines.push(`  Avg/month: ${Math.round(monthlyTotal.net / metrics.trends.monthly.length).toLocaleString()} lines`);
    lines.push('');
  }

  // Activity
  lines.push('🔥 MOST ACTIVE FILES');
  lines.push('-'.repeat(80));
  for (const file of metrics.activity.mostActiveFiles.slice(0, 10)) {
    lines.push(`  ${file.changes.toString().padStart(3)} changes: ${file.file}`);
  }
  lines.push('');

  if (metrics.activity.commitsByDay.length > 0) {
    const totalCommits = metrics.activity.commitsByDay.reduce((sum, d) => sum + d.count, 0);
    lines.push(`Total commits (last ${metrics.trends.daily.length} days): ${totalCommits}`);
    lines.push(`Average commits/day: ${(totalCommits / metrics.activity.commitsByDay.length).toFixed(1)}`);
  }

  lines.push('');
  lines.push('='.repeat(80));

  return lines.join('\n');
}

function main() {
  const args = process.argv.slice(2);
  const days = parseInt(args.find((a) => a.startsWith('--days='))?.split('=')[1] || '30');
  const format = args.find((a) => a.startsWith('--format='))?.split('=')[1] || 'text';
  const useCloc = args.includes('--use-cloc');
  const outputPath = args.find((a) => a.startsWith('--output='))?.split('=')[1];

  console.log('🔍 Analyzing codebase...');

  const metrics: CodeMetrics = {
    timestamp: new Date().toISOString(),
    current: getCurrentMetrics(useCloc),
    trends: getGitTrends(days),
    activity: getActivityMetrics(days),
  };

  let output: string;
  if (format === 'json') {
    output = JSON.stringify(metrics, null, 2);
  } else {
    output = formatTextReport(metrics);
  }

  if (outputPath) {
    fs.writeFileSync(outputPath, output, 'utf-8');
    console.log(`✅ Report saved to ${outputPath}`);
  } else {
    console.log(output);
  }
}

if (require.main === module) {
  main();
}
