#!/usr/bin/env tsx
/**
 * Add Status Fields to Epic Files
 * 
 * Adds standardized status fields to epic files that are missing them.
 * Uses implementation analysis and existing status to determine appropriate status.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

interface EpicFile {
  path: string;
  id: string;
  content: string;
  hasStatus: boolean;
  currentStatus?: string;
  hasInitiative: boolean;
  initiative?: string;
}

const EPIC_DIRS = [
  { dir: 'docs/requirements/epics/mvp', prefix: 'EP-' },
  { dir: 'docs/requirements/epics/admin', prefix: 'EP-' },
  { dir: 'docs/requirements/epics/funnel', prefix: 'EP-' },
  { dir: 'docs/requirements/epics/landing', prefix: 'EP-' },
  { dir: 'docs/requirements/epics/future', prefix: 'EP-' },
];

// Known implementation statuses (from analysis + manual review)
const KNOWN_STATUSES: Record<string, { status: string; phase?: string }> = {
  'EP-001': { status: 'Completed', phase: 'P10' },
  'EP-002': { status: 'Completed', phase: 'P10' },
  'EP-003': { status: 'Completed', phase: 'P10' },
  'EP-004': { status: 'In Progress', phase: 'P6' },
  'EP-005': { status: 'In Progress', phase: 'P6' },
  'EP-006': { status: 'Completed', phase: 'P10' },
  'EP-007': { status: 'Completed', phase: 'P10' },
  'EP-008': { status: 'Completed', phase: 'P10' },
  'EP-009': { status: 'Completed', phase: 'P10' },
  'EP-010': { status: 'Completed', phase: 'P10' },
  'EP-011': { status: 'Completed', phase: 'P10' },
  'EP-012': { status: 'In Progress', phase: 'P4' },
  'EP-013': { status: 'In Progress', phase: 'P4' },
  'EP-014': { status: 'Proposed', phase: 'P2' },
  'EP-015': { status: 'In Progress', phase: 'P6' },
  'EP-016': { status: 'Completed', phase: 'P10' },
  'EP-017': { status: 'Completed', phase: 'P10' },
  'EP-018': { status: 'Completed', phase: 'P10' },
  'EP-019': { status: 'Completed', phase: 'P10' },
  'EP-020': { status: 'Completed', phase: 'P10' },
  'EP-021': { status: 'Proposed', phase: 'P2' },
  'EP-022': { status: 'Proposed', phase: 'P2' },
  'EP-023': { status: 'Proposed', phase: 'P2' },
  'EP-024': { status: 'Proposed', phase: 'P2' },
  'EP-025': { status: 'Completed', phase: 'P10' },
  'EP-026': { status: 'Proposed', phase: 'P2' },
  'EP-027': { status: 'Proposed', phase: 'P2' },
  'EP-028': { status: 'Proposed', phase: 'P2' },
  'EP-029': { status: 'Proposed', phase: 'P2' },
  'EP-030': { status: 'Proposed', phase: 'P2' },
  'EP-031': { status: 'Proposed', phase: 'P2' },
  'EP-032': { status: 'Proposed', phase: 'P2' },
  'EP-033': { status: 'Proposed', phase: 'P2' },
  'EP-034': { status: 'Proposed', phase: 'P2' },
  'EP-035': { status: 'Proposed', phase: 'P2' },
  'EP-036': { status: 'Proposed', phase: 'P2' },
  'EP-037': { status: 'Proposed', phase: 'P2' },
  'EP-038': { status: 'Proposed', phase: 'P2' },
  'EP-039': { status: 'In Progress', phase: 'P6' },
  'EP-040': { status: 'In Progress', phase: 'P3' },
  'EP-041': { status: 'In Progress', phase: 'P3' },
  'EP-042': { status: 'Proposed', phase: 'P2' },
  'EP-043': { status: 'Proposed', phase: 'P2' },
  'EP-044': { status: 'Proposed', phase: 'P2' },
  'EP-045': { status: 'Proposed', phase: 'P2' },
  'EP-046': { status: 'Proposed', phase: 'P2' },
  'EP-047': { status: 'Proposed', phase: 'P2' },
  'EP-048': { status: 'Proposed', phase: 'P2' },
  'EP-049': { status: 'Proposed', phase: 'P2' },
  'EP-050': { status: 'Completed', phase: 'P10' },
  'EP-051': { status: 'In Progress', phase: 'P6' },
  'EP-052': { status: 'Proposed', phase: 'P2' },
  'EP-053': { status: 'Proposed', phase: 'P2' },
  'EP-054': { status: 'Proposed', phase: 'P2' },
  'EP-055': { status: 'Proposed', phase: 'P2' },
  'EP-056': { status: 'Proposed', phase: 'P2' },
  'EP-057': { status: 'Proposed', phase: 'P2' },
  'EP-058': { status: 'In Progress', phase: 'P3' },
};

function extractEpicInfo(filePath: string): EpicFile {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  // Extract EPIC ID
  const match = content.match(/EP-(\d+)/);
  const id = match ? `EP-${match[1]}` : 'UNKNOWN';
  
  // Check for existing status
  let hasStatus = false;
  let currentStatus: string | undefined;
  let hasInitiative = false;
  let initiative: string | undefined;
  
  for (let i = 0; i < Math.min(30, lines.length); i++) {
    const line = lines[i];
    
    if (line.match(/^\*\*Status\*\*:/i)) {
      hasStatus = true;
      currentStatus = line.match(/^\*\*Status\*\*:\s*(.+)/i)?.[1]?.trim();
    }
    
    if (line.match(/^\*\*Initiative\*\*:/i)) {
      hasInitiative = true;
      initiative = line.match(/^\*\*Initiative\*\*:\s*(.+)/i)?.[1]?.trim();
    }
  }
  
  return {
    path: filePath,
    id,
    content,
    hasStatus,
    currentStatus,
    hasInitiative,
    initiative,
  };
}

function addStatusField(epic: EpicFile): string {
  const lines = epic.content.split('\n');
  
  // Find title line (first line starting with #)
  let titleIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/^#\s*\[?EPIC\]?\s*EP-/i)) {
      titleIndex = i;
      break;
    }
  }
  
  if (titleIndex === -1) {
    // No title found, can't add status
    return epic.content;
  }
  
  // Check if status already exists in next few lines
  let hasExistingStatus = false;
  for (let i = titleIndex + 1; i < Math.min(titleIndex + 10, lines.length); i++) {
    if (lines[i].match(/^\*\*Status\*\*:/i)) {
      hasExistingStatus = true;
      break;
    }
  }
  
  if (hasExistingStatus) {
    return epic.content; // Already has status
  }
  
  // Determine status
  const knownStatus = KNOWN_STATUSES[epic.id];
  const status = knownStatus?.status || 'Proposed';
  const phase = knownStatus?.phase || 'P1';
  
  // Get current date
  const today = new Date().toISOString().split('T')[0];
  
  // Build status block
  const statusBlock = [
    '',
    `**Status**: ${status}`,
    `**Phase**: ${phase}`,
  ];
  
  if (epic.hasInitiative && epic.initiative) {
    statusBlock.push(`**Initiative**: ${epic.initiative}`);
  }
  
  statusBlock.push(`**Created**: ${today}`, `**Last Updated**: ${today}`);
  statusBlock.push('');
  
  // Insert after title
  const newLines = [
    ...lines.slice(0, titleIndex + 1),
    ...statusBlock,
    ...lines.slice(titleIndex + 1),
  ];
  
  return newLines.join('\n');
}

function main() {
  console.log('📝 Adding Status Fields to Epic Files...\n');
  
  const epics: EpicFile[] = [];
  
  // Collect all epic files
  for (const { dir } of EPIC_DIRS) {
    try {
      const files = readdirSync(dir);
      for (const file of files) {
        if (file.endsWith('.md') && file.match(/EP-\d+/)) {
          const filePath = join(dir, file);
          const stats = statSync(filePath);
          if (stats.isFile() && !file.includes('README') && !file.includes('analysis') && !file.includes('phase-status')) {
            epics.push(extractEpicInfo(filePath));
          }
        }
      }
    } catch (err) {
      console.error(`Error reading ${dir}:`, err);
    }
  }
  
  console.log(`Found ${epics.length} epic files\n`);
  
  const withoutStatus = epics.filter(e => !e.hasStatus);
  const withStatus = epics.filter(e => e.hasStatus);
  
  console.log(`✅ Epics with status: ${withStatus.length}`);
  console.log(`❌ Epics missing status: ${withoutStatus.length}\n`);
  
  if (withoutStatus.length === 0) {
    console.log('All epics already have status fields!');
    return;
  }
  
  // Add status to epics missing it
  let updated = 0;
  for (const epic of withoutStatus) {
    try {
      const newContent = addStatusField(epic);
      if (newContent !== epic.content) {
        writeFileSync(epic.path, newContent, 'utf-8');
        console.log(`✅ Added status to ${epic.id}`);
        updated++;
      }
    } catch (err) {
      console.error(`❌ Error updating ${epic.id}:`, err);
    }
  }
  
  console.log(`\n✨ Updated ${updated} epic files`);
}

main();
