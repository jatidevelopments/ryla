#!/usr/bin/env tsx
/**
 * Cursor Rules Verification Script
 * 
 * Verifies that Cursor rules are properly configured and can be tested
 * for actual injection into prompts.
 */

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

interface RuleMetadata {
  filename: string;
  description?: string;
  alwaysApply?: boolean;
  globs?: string[];
  hasFrontmatter: boolean;
  frontmatterValid: boolean;
  contentLength: number;
}

interface RuleSummary {
  total: number;
  alwaysApplied: RuleMetadata[];
  requestable: RuleMetadata[];
  globBased: RuleMetadata[];
  invalid: RuleMetadata[];
}

async function parseRuleFile(filePath: string): Promise<RuleMetadata> {
  const content = await readFile(filePath, 'utf-8');
  const filename = filePath.split('/').pop() || '';
  
  // Check for frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  
  if (!frontmatterMatch) {
    return {
      filename,
      hasFrontmatter: false,
      frontmatterValid: false,
      contentLength: content.length,
    };
  }
  
  try {
    // Simple YAML-like parsing for frontmatter
    const frontmatter: Record<string, unknown> = {};
    const lines = frontmatterMatch[1].split('\n');
    
    for (const line of lines) {
      const match = line.match(/^(\w+):\s*(.+)$/);
      if (match) {
        const key = match[1];
        let value: unknown = match[2].trim();
        
        // Parse boolean values
        if (value === 'true') value = true;
        else if (value === 'false') value = false;
        // Parse array values (simple case: ["item1", "item2"])
        else if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
          const arrayContent = value.slice(1, -1);
          if (arrayContent.trim()) {
            value = arrayContent
              .split(',')
              .map(v => v.trim().replace(/^["']|["']$/g, ''));
          } else {
            value = [];
          }
        }
        // Remove quotes from string values
        else if (typeof value === 'string' && value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        
        frontmatter[key] = value;
      }
    }
    
    return {
      filename,
      description: frontmatter.description as string | undefined,
      alwaysApply: frontmatter.alwaysApply as boolean | undefined,
      globs: frontmatter.globs as string[] | undefined,
      hasFrontmatter: true,
      frontmatterValid: true,
      contentLength: content.length,
    };
  } catch (error) {
    return {
      filename,
      hasFrontmatter: true,
      frontmatterValid: false,
      contentLength: content.length,
    };
  }
}

async function verifyRules(): Promise<RuleSummary> {
  const rulesDir = join(process.cwd(), '.cursor', 'rules');
  const files = await readdir(rulesDir);
  const mdcFiles = files.filter(f => f.endsWith('.mdc'));
  
  const rules: RuleMetadata[] = await Promise.all(
    mdcFiles.map(file => parseRuleFile(join(rulesDir, file)))
  );
  
  const summary: RuleSummary = {
    total: rules.length,
    alwaysApplied: [],
    requestable: [],
    globBased: [],
    invalid: [],
  };
  
  for (const rule of rules) {
    if (!rule.frontmatterValid || !rule.hasFrontmatter) {
      summary.invalid.push(rule);
      continue;
    }
    
    if (rule.alwaysApply === true) {
      summary.alwaysApplied.push(rule);
    } else {
      summary.requestable.push(rule);
    }
    
    if (rule.globs && rule.globs.length > 0) {
      summary.globBased.push(rule);
    }
  }
  
  return summary;
}

function printSummary(summary: RuleSummary): void {
  console.log('\n📋 Cursor Rules Verification Report\n');
  console.log('═'.repeat(60));
  
  console.log(`\n📊 Summary:`);
  console.log(`   Total rules: ${summary.total}`);
  console.log(`   Always applied: ${summary.alwaysApplied.length}`);
  console.log(`   Requestable: ${summary.requestable.length}`);
  console.log(`   Glob-based: ${summary.globBased.length}`);
  console.log(`   Invalid: ${summary.invalid.length}`);
  
  if (summary.alwaysApplied.length > 0) {
    console.log(`\n✅ Always Applied Rules (${summary.alwaysApplied.length}):`);
    for (const rule of summary.alwaysApplied) {
      const globs = rule.globs ? ` [globs: ${rule.globs.join(', ')}]` : '';
      console.log(`   • ${rule.filename}${globs}`);
    }
  }
  
  if (summary.invalid.length > 0) {
    console.log(`\n❌ Invalid Rules (${summary.invalid.length}):`);
    for (const rule of summary.invalid) {
      console.log(`   • ${rule.filename} - ${!rule.hasFrontmatter ? 'Missing frontmatter' : 'Invalid frontmatter'}`);
    }
  }
  
  if (summary.globBased.length > 0) {
    console.log(`\n📁 Glob-Based Rules (${summary.globBased.length}):`);
    for (const rule of summary.globBased) {
      const globsStr = Array.isArray(rule.globs) ? rule.globs.join(', ') : String(rule.globs || '');
      console.log(`   • ${rule.filename} - ${globsStr}`);
    }
  }
  
  console.log('\n' + '═'.repeat(60));
  
  // Test instructions
  console.log('\n🧪 How to Test Rule Injection:\n');
  console.log('1. Ask the AI assistant: "What rules are currently applied?"');
  console.log('2. Ask about a specific rule: "What does the pipeline-enforcement rule say?"');
  console.log('3. Check if always-applied rules are mentioned in responses');
  console.log('4. Try requesting a rule: "Follow the TypeScript rules"');
  console.log('5. Work on a file matching a glob pattern and verify rule is applied\n');
  
  // Verification checklist
  console.log('✅ Verification Checklist:\n');
  console.log(`   [${summary.invalid.length === 0 ? '✓' : '✗'}] All rules have valid frontmatter`);
  console.log(`   [${summary.alwaysApplied.length > 0 ? '✓' : '✗'}] Always-applied rules are configured`);
  console.log(`   [${summary.requestable.length > 0 ? '✓' : '✗'}] Requestable rules are available`);
  console.log(`   [${summary.total > 0 ? '✓' : '✗'}] Rules directory contains rules\n`);
}

async function main() {
  try {
    const summary = await verifyRules();
    printSummary(summary);
    
    // Exit with error code if there are invalid rules
    if (summary.invalid.length > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error verifying rules:', error);
    process.exit(1);
  }
}

main();
