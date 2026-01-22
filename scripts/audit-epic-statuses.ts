#!/usr/bin/env tsx
/**
 * Audit Epic Statuses
 * 
 * Scans all epic files and reports:
 * - Which epics have status fields
 * - Which epics are missing status fields
 * - Status values found
 * - README status vs file status mismatches
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

interface EpicInfo {
  id: string;
  path: string;
  hasStatus: boolean;
  status?: string;
  phase?: string;
  initiative?: string;
  lastUpdated?: string;
}

const EPIC_DIRS = [
  'docs/requirements/epics/mvp',
  'docs/requirements/epics/admin',
  'docs/requirements/epics/funnel',
  'docs/requirements/epics/landing',
  'docs/requirements/epics/future',
];

function extractEpicInfo(filePath: string): EpicInfo {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  // Extract EPIC ID from filename or first line
  const match = content.match(/EP-(\d+)/);
  const id = match ? `EP-${match[1]}` : 'UNKNOWN';
  
  const info: EpicInfo = {
    id,
    path: filePath,
    hasStatus: false,
  };
  
  // Look for status field (various formats)
  for (let i = 0; i < Math.min(30, lines.length); i++) {
    const line = lines[i];
    
    // Status field
    if (line.match(/^\*\*Status\*\*:\s*(.+)/i)) {
      info.hasStatus = true;
      info.status = line.match(/^\*\*Status\*\*:\s*(.+)/i)?.[1]?.trim();
    }
    
    // Phase field
    if (line.match(/^\*\*Phase\*\*:\s*(.+)/i)) {
      info.phase = line.match(/^\*\*Phase\*\*:\s*(.+)/i)?.[1]?.trim();
    }
    
    // Initiative field
    if (line.match(/^\*\*Initiative\*\*:\s*(.+)/i)) {
      info.initiative = line.match(/^\*\*Initiative\*\*:\s*(.+)/i)?.[1]?.trim();
    }
    
    // Last Updated field
    if (line.match(/^\*\*Last Updated\*\*:\s*(.+)/i)) {
      info.lastUpdated = line.match(/^\*\*Last Updated\*\*:\s*(.+)/i)?.[1]?.trim();
    }
  }
  
  return info;
}

function scanEpics(): EpicInfo[] {
  const epics: EpicInfo[] = [];
  
  for (const dir of EPIC_DIRS) {
    try {
      const files = readdirSync(dir);
      for (const file of files) {
        if (file.endsWith('.md') && file.startsWith('EP-')) {
          const filePath = join(dir, file);
          const stats = statSync(filePath);
          if (stats.isFile()) {
            epics.push(extractEpicInfo(filePath));
          }
        }
      }
    } catch (err) {
      console.error(`Error reading ${dir}:`, err);
    }
  }
  
  return epics.sort((a, b) => {
    const aNum = parseInt(a.id.replace('EP-', ''));
    const bNum = parseInt(b.id.replace('EP-', ''));
    return aNum - bNum;
  });
}

function readReadmeStatuses(): Map<string, string> {
  const statusMap = new Map<string, string>();
  
  // Read MVP README
  try {
    const mvpReadme = readFileSync('docs/requirements/epics/mvp/README.md', 'utf-8');
    const lines = mvpReadme.split('\n');
    for (const line of lines) {
      const match = line.match(/\| \[EP-(\d+)\]/);
      if (match) {
        const epicId = `EP-${match[1]}`;
        // Extract status from table (usually last column before |)
        const parts = line.split('|').map(p => p.trim());
        if (parts.length >= 5) {
          statusMap.set(epicId, parts[4] || 'Unknown');
        }
      }
    }
  } catch (err) {
    console.error('Error reading MVP README:', err);
  }
  
  // Read Admin README
  try {
    const adminReadme = readFileSync('docs/requirements/epics/admin/README.md', 'utf-8');
    const lines = adminReadme.split('\n');
    for (const line of lines) {
      const match = line.match(/\| \[EP-(\d+)\]/);
      if (match) {
        const epicId = `EP-${match[1]}`;
        const parts = line.split('|').map(p => p.trim());
        if (parts.length >= 4) {
          statusMap.set(epicId, parts[3] || 'Unknown');
        }
      }
    }
  } catch (err) {
    console.error('Error reading Admin README:', err);
  }
  
  return statusMap;
}

function main() {
  console.log('🔍 Auditing Epic Statuses...\n');
  
  const epics = scanEpics();
  const readmeStatuses = readReadmeStatuses();
  
  console.log(`Found ${epics.length} epic files\n`);
  
  // Statistics
  const withStatus = epics.filter(e => e.hasStatus).length;
  const withoutStatus = epics.filter(e => !e.hasStatus).length;
  
  console.log('📊 Statistics:');
  console.log(`  ✅ Epics with status field: ${withStatus}`);
  console.log(`  ❌ Epics missing status field: ${withoutStatus}\n`);
  
  // Status values found
  const statusValues = new Map<string, number>();
  epics.forEach(e => {
    if (e.status) {
      statusValues.set(e.status, (statusValues.get(e.status) || 0) + 1);
    }
  });
  
  if (statusValues.size > 0) {
    console.log('📈 Status Values Found:');
    Array.from(statusValues.entries())
      .sort((a, b) => b[1] - a[1])
      .forEach(([status, count]) => {
        console.log(`  ${status}: ${count}`);
      });
    console.log();
  }
  
  // Epics missing status
  if (withoutStatus > 0) {
    console.log('❌ Epics Missing Status Field:');
    epics
      .filter(e => !e.hasStatus)
      .forEach(e => {
        console.log(`  ${e.id}: ${e.path}`);
      });
    console.log();
  }
  
  // Epics with status
  if (withStatus > 0) {
    console.log('✅ Epics With Status:');
    epics
      .filter(e => e.hasStatus)
      .slice(0, 10) // Show first 10
      .forEach(e => {
        console.log(`  ${e.id}: ${e.status || 'Unknown'} ${e.phase ? `(${e.phase})` : ''}`);
      });
    if (withStatus > 10) {
      console.log(`  ... and ${withStatus - 10} more`);
    }
    console.log();
  }
  
  // README vs File status comparison
  console.log('📋 README Status vs File Status:');
  let matches = 0;
  let mismatches = 0;
  
  epics
    .filter(e => e.hasStatus && readmeStatuses.has(e.id))
    .forEach(e => {
      const readmeStatus = readmeStatuses.get(e.id) || '';
      const fileStatus = e.status || '';
      
      // Normalize for comparison (remove emojis, trim)
      const normalizedReadme = readmeStatus.replace(/[✅🔄📝⏸️❌👀]/g, '').trim();
      const normalizedFile = fileStatus.trim();
      
      if (normalizedReadme.toLowerCase() === normalizedFile.toLowerCase() || 
          normalizedReadme.includes('Defined') && normalizedFile === 'Proposed') {
        matches++;
      } else {
        mismatches++;
        console.log(`  ⚠️  ${e.id}: README="${readmeStatus}" vs File="${fileStatus}"`);
      }
    });
  
  if (matches > 0) {
    console.log(`  ✅ Matches: ${matches}`);
  }
  if (mismatches === 0 && matches > 0) {
    console.log('  ✅ All statuses match!');
  }
  console.log();
  
  // Recommendations
  console.log('💡 Recommendations:');
  if (withoutStatus > 0) {
    console.log(`  1. Add status fields to ${withoutStatus} epics missing them`);
  }
  if (mismatches > 0) {
    console.log(`  2. Update ${mismatches} README status columns to match file status`);
  }
  if (statusValues.size === 0) {
    console.log('  3. Standardize status values across all epics');
  }
  console.log('  4. See docs/process/EPIC-STATUS-TRACKING.md for standards');
}

main();
