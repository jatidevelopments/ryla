#!/usr/bin/env tsx
/**
 * Update README Status Columns
 * 
 * Reads status from epic files and updates README status columns.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

interface EpicStatus {
  id: string;
  status: string;
  phase?: string;
}

function getStatusFromFile(filePath: string): EpicStatus | null {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const match = content.match(/EP-(\d+)/);
    if (!match) return null;
    
    const id = `EP-${match[1]}`;
    const lines = content.split('\n');
    
    let status: string | undefined;
    let phase: string | undefined;
    
    for (let i = 0; i < Math.min(30, lines.length); i++) {
      const line = lines[i];
      
      if (line.match(/^\*\*Status\*\*:\s*(.+)/i)) {
        status = line.match(/^\*\*Status\*\*:\s*(.+)/i)?.[1]?.trim();
      }
      
      if (line.match(/^\*\*Phase\*\*:\s*(.+)/i)) {
        phase = line.match(/^\*\*Phase\*\*:\s*(.+)/i)?.[1]?.trim();
      }
    }
    
    if (status) {
      return { id, status, phase };
    }
  } catch (err) {
    // File doesn't exist or can't be read
  }
  
  return null;
}

function getStatusIcon(status: string): string {
  const normalized = status.toLowerCase();
  if (normalized.includes('completed')) return '✅ Completed';
  if (normalized.includes('in progress')) return '🔄 In Progress';
  if (normalized.includes('in review')) return '👀 In Review';
  if (normalized.includes('proposed')) return '📝 Proposed';
  if (normalized.includes('on hold')) return '⏸️ On Hold';
  if (normalized.includes('cancelled')) return '❌ Cancelled';
  return status; // Return as-is if no match
}

function updateMvpReadme() {
  const readmePath = 'docs/requirements/epics/mvp/README.md';
  let content = readFileSync(readmePath, 'utf-8');
  const lines = content.split('\n');
  
  // Collect all epic statuses
  const epicStatuses = new Map<string, EpicStatus>();
  
  try {
    const files = readdirSync('docs/requirements/epics/mvp');
    for (const file of files) {
      if (file.endsWith('.md') && file.match(/EP-\d+/) && !file.includes('README') && !file.includes('analysis') && !file.includes('phase-status')) {
        const filePath = join('docs/requirements/epics/mvp', file);
        const status = getStatusFromFile(filePath);
        if (status) {
          epicStatuses.set(status.id, status);
        }
      }
    }
  } catch (err) {
    console.error('Error reading MVP epics:', err);
  }
  
  // Update status column in table
  const newLines = lines.map(line => {
    const match = line.match(/\| \[EP-(\d+)\]/);
    if (match) {
      const epicId = `EP-${match[1]}`;
      const status = epicStatuses.get(epicId);
      
      if (status) {
        // Split by | and clean up - keep empty strings to preserve column positions
        const parts = line.split('|').map(p => p.trim());
        // Table: | Epic | Name | Priority | Metric | Status |
        // Parts: [0] empty, [1] Epic, [2] Name, [3] Priority, [4] Metric, [5] Status, [6] empty
        if (parts.length >= 6) {
          // Update Status column (index 5)
          parts[5] = getStatusIcon(status.status);
          // Rebuild line, skip first empty part
          return '| ' + parts.slice(1).join(' | ') + ' |';
        }
      }
    }
    return line;
  });
  
  writeFileSync(readmePath, newLines.join('\n'), 'utf-8');
  console.log('✅ Updated MVP README');
}

function updateAdminReadme() {
  const readmePath = 'docs/requirements/epics/admin/README.md';
  let content = readFileSync(readmePath, 'utf-8');
  const lines = content.split('\n');
  
  // Collect all epic statuses
  const epicStatuses = new Map<string, EpicStatus>();
  
  try {
    const files = readdirSync('docs/requirements/epics/admin');
    for (const file of files) {
      if (file.endsWith('.md') && file.match(/EP-\d+/) && !file.includes('README')) {
        const filePath = join('docs/requirements/epics/admin', file);
        const status = getStatusFromFile(filePath);
        if (status) {
          epicStatuses.set(status.id, status);
        }
      }
    }
  } catch (err) {
    console.error('Error reading Admin epics:', err);
  }
  
  // Update status column in table
  const newLines = lines.map(line => {
    const match = line.match(/\| \[EP-(\d+)\]/);
    if (match) {
      const epicId = `EP-${match[1]}`;
      const status = epicStatuses.get(epicId);
      
      if (status) {
        // Replace status column (4th column in admin README)
        const parts = line.split('|').map(p => p.trim());
        if (parts.length >= 4) {
          parts[3] = getStatusIcon(status.status);
          return '| ' + parts.slice(1).join(' | ') + ' |';
        }
      }
    }
    return line;
  });
  
  writeFileSync(readmePath, newLines.join('\n'), 'utf-8');
  console.log('✅ Updated Admin README');
}

function main() {
  console.log('📝 Updating README Status Columns...\n');
  
  updateMvpReadme();
  updateAdminReadme();
  
  console.log('\n✨ Done!');
}

main();
