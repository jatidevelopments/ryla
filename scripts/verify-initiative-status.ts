#!/usr/bin/env tsx
/**
 * Verify Initiative Status
 * 
 * Checks each initiative's actual implementation status by:
 * 1. Reading initiative files
 * 2. Finding related epics
 * 3. Checking codebase for implementation
 * 4. Comparing declared status vs actual status
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join } from 'path';

interface InitiativeInfo {
  id: string;
  name: string;
  declaredStatus: string;
  filePath: string;
  relatedEpics: string[];
  actualEpicStatuses: Map<string, string>;
}

interface EpicImplementation {
  id: string;
  hasSchema: boolean;
  hasApiRoutes: boolean;
  hasComponents: boolean;
  hasBusinessLogic: boolean;
  implementationLevel: 'none' | 'partial' | 'complete';
}

// Epic keywords for codebase search
const EPIC_KEYWORDS: Record<string, string[]> = {
  'EP-001': ['wizard', 'character-creation', 'influencer-creation'],
  'EP-002': ['auth', 'authentication', 'login', 'signup', 'session'],
  'EP-003': ['payment', 'finby', 'subscription', 'checkout'],
  'EP-004': ['dashboard', 'character-management', 'influencer-list'],
  'EP-005': ['studio', 'generation', 'content-studio', 'image-generation'],
  'EP-006': ['landing', 'homepage'],
  'EP-007': ['email', 'notification', 'resend'],
  'EP-008': ['gallery', 'image-gallery', 'download'],
  'EP-009': ['credits', 'credit-system'],
  'EP-010': ['subscription', 'plan', 'billing'],
  'EP-011': ['legal', 'terms', 'privacy', 'tos'],
  'EP-012': ['onboarding', 'welcome', 'tour'],
  'EP-013': ['education', 'tutorial', 'guide'],
  'EP-014': ['caption', 'caption-generation'],
  'EP-015': ['speed', 'benchmark', 'performance'],
  'EP-016': ['audit', 'activity-log', 'history'],
  'EP-017': ['notification', 'inbox', 'notification-center'],
  'EP-018': ['settings', 'influencer-settings'],
  'EP-019': ['bug', 'bug-report', 'report'],
  'EP-020': ['template', 'template-gallery', 'template-library'],
  'EP-021': ['outfit', 'outfit-gallery'],
  'EP-022': ['auth', 'unified-auth', 'login-page'],
  'EP-023': ['prompt', 'prompt-builder'],
  'EP-024': ['tutorial', 'contextual-tutorial'],
  'EP-025': ['finby', 'payment-integration'],
  'EP-026': ['lora', 'lora-training'],
  'EP-027': ['nsfw', 'sfw', 'content-filter'],
  'EP-028': ['dna', 'character-dna'],
  'EP-029': ['prompt', 'enhanced-prompt'],
  'EP-030': ['dna', 'base-image'],
  'EP-031': ['dna', 'studio', 'profile'],
  'EP-032': ['wizard', 'progressive'],
  'EP-033': ['base-character', 'character-generation'],
  'EP-034': ['ethnicity', 'ethnicity-generation'],
  'EP-035': ['body-type', 'body-generation'],
  'EP-036': ['ethnicity', 'feature-images'],
  'EP-037': ['profile-picture', 'profile-pic'],
  'EP-038': ['lora', 'lora-usage'],
  'EP-039': ['comfyui', 'dependency', 'websocket'],
  'EP-040': ['face-swap', 'video-swap', 'redis'],
  'EP-041': ['error-handling', 'retry', 'error'],
  'EP-042': ['moderation', 'safety', 'wizard-layout'],
  'EP-043': ['deferred-credits', 'wizard-credits'],
  'EP-044': ['serverless', 'endpoint', 'testing'],
  'EP-045': ['quality-mode', 'quality'],
  'EP-046': ['template-set', 'template-sets'],
  'EP-047': ['template-gallery', 'ux-redesign'],
  'EP-048': ['category', 'tag', 'tagging'],
  'EP-049': ['like', 'popularity', 'likes'],
  'EP-050': ['admin', 'admin-auth', 'rbac'],
  'EP-051': ['admin', 'user-management'],
  'EP-052': ['admin', 'credits', 'billing'],
  'EP-053': ['admin', 'bug-report'],
  'EP-054': ['admin', 'moderation', 'content'],
  'EP-055': ['admin', 'analytics', 'monitoring'],
  'EP-056': ['admin', 'content-library'],
  'EP-057': ['admin', 'advanced', 'operations'],
  'EP-058': ['modal', 'modal-mvp', 'flux-dev'],
};

function searchInFiles(directory: string, keywords: string[]): boolean {
  if (!existsSync(directory)) return false;
  
  try {
    const files = readdirSync(directory, { recursive: true });
    for (const file of files) {
      if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.sql')) {
        const filePath = join(directory, file);
        try {
          const content = readFileSync(filePath, 'utf-8').toLowerCase();
          const matches = keywords.some(keyword => 
            content.includes(keyword.toLowerCase())
          );
          if (matches) return true;
        } catch (err) {
          // Skip files we can't read
        }
      }
    }
  } catch (err) {
    // Directory doesn't exist or can't be read
  }
  return false;
}

function checkEpicImplementation(epicId: string): EpicImplementation {
  const keywords = EPIC_KEYWORDS[epicId] || [];
  
  if (keywords.length === 0) {
    return {
      id: epicId,
      hasSchema: false,
      hasApiRoutes: false,
      hasComponents: false,
      hasBusinessLogic: false,
      implementationLevel: 'none',
    };
  }
  
  const hasSchema = searchInFiles('libs/data/src', keywords) ||
                    searchInFiles('drizzle/migrations', keywords);
  
  const hasApiRoutes = searchInFiles('apps/api/src', keywords) ||
                       searchInFiles('libs/trpc/src', keywords);
  
  const hasComponents = searchInFiles('apps/web', keywords) ||
                        searchInFiles('apps/admin', keywords) ||
                        searchInFiles('libs/ui/src', keywords);
  
  const hasBusinessLogic = searchInFiles('libs/business/src', keywords);
  
  const indicators = [hasSchema, hasApiRoutes, hasComponents, hasBusinessLogic];
  const indicatorCount = indicators.filter(Boolean).length;
  
  let implementationLevel: 'none' | 'partial' | 'complete';
  if (indicatorCount === 0) {
    implementationLevel = 'none';
  } else if (indicatorCount < 3) {
    implementationLevel = 'partial';
  } else {
    implementationLevel = 'complete';
  }
  
  return {
    id: epicId,
    hasSchema,
    hasApiRoutes,
    hasComponents,
    hasBusinessLogic,
    implementationLevel,
  };
}

function extractEpicReferences(content: string): string[] {
  const epics: string[] = [];
  
  // Match EP-XXX patterns
  const epicPattern = /EP-(\d+)/g;
  let match;
  while ((match = epicPattern.exec(content)) !== null) {
    const epicId = `EP-${match[1]}`;
    if (!epics.includes(epicId)) {
      epics.push(epicId);
    }
  }
  
  return epics;
}

function readInitiative(filePath: string): InitiativeInfo | null {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    // Extract ID from filename
    const match = filePath.match(/IN-(\d+)/);
    if (!match) return null;
    
    const id = `IN-${match[1]}`;
    
    // Extract name (first # heading)
    let name = '';
    for (const line of lines) {
      if (line.match(/^#\s*\[?INITIATIVE\]?\s*IN-\d+:/)) {
        name = line.replace(/^#\s*\[?INITIATIVE\]?\s*IN-\d+:\s*/, '').trim();
        break;
      }
    }
    
    // Extract status
    let declaredStatus = 'Unknown';
    for (const line of lines) {
      if (line.match(/^\*\*Status\*\*:/i)) {
        declaredStatus = line.match(/^\*\*Status\*\*:\s*(.+)/i)?.[1]?.trim() || 'Unknown';
        break;
      }
    }
    
    // Extract related epics
    const relatedEpics = extractEpicReferences(content);
    
    return {
      id,
      name,
      declaredStatus,
      filePath,
      relatedEpics,
      actualEpicStatuses: new Map(),
    };
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return null;
  }
}

function determineInitiativeStatus(initiative: InitiativeInfo): {
  suggestedStatus: string;
  completionRate: number;
  reasoning: string;
} {
  if (initiative.relatedEpics.length === 0) {
    return {
      suggestedStatus: initiative.declaredStatus,
      completionRate: 0,
      reasoning: 'No related epics found',
    };
  }
  
  // Check implementation of related epics
  const epicStatuses: EpicImplementation[] = [];
  for (const epicId of initiative.relatedEpics) {
    const impl = checkEpicImplementation(epicId);
    epicStatuses.push(impl);
    initiative.actualEpicStatuses.set(epicId, impl.implementationLevel);
  }
  
  const complete = epicStatuses.filter(e => e.implementationLevel === 'complete').length;
  const partial = epicStatuses.filter(e => e.implementationLevel === 'partial').length;
  const none = epicStatuses.filter(e => e.implementationLevel === 'none').length;
  
  const completionRate = (complete + partial * 0.5) / initiative.relatedEpics.length;
  
  let suggestedStatus: string;
  let reasoning: string;
  
  if (completionRate >= 0.9 && complete === initiative.relatedEpics.length) {
    suggestedStatus = 'Completed';
    reasoning = `All ${complete} related epics fully implemented`;
  } else if (completionRate >= 0.5 || partial > 0 || complete > 0) {
    suggestedStatus = 'Active';
    reasoning = `${complete} complete, ${partial} partial, ${none} not started`;
  } else {
    suggestedStatus = 'Proposed';
    reasoning = `No implementation found for ${initiative.relatedEpics.length} related epics`;
  }
  
  return {
    suggestedStatus,
    completionRate: Math.round(completionRate * 100),
    reasoning,
  };
}

function main() {
  console.log('🔍 Verifying Initiative Status Against Codebase...\n');
  
  const initiatives: InitiativeInfo[] = [];
  
  // Read all initiative files
  try {
    const files = readdirSync('docs/initiatives');
    for (const file of files) {
      if (file.startsWith('IN-') && file.endsWith('.md') && !file.includes('TEMPLATE') && !file.includes('README')) {
        const filePath = join('docs/initiatives', file);
        const initiative = readInitiative(filePath);
        if (initiative) {
          initiatives.push(initiative);
        }
      }
    }
  } catch (err) {
    console.error('Error reading initiatives:', err);
    return;
  }
  
  console.log(`Found ${initiatives.length} initiatives\n`);
  
  // Analyze each initiative
  const results: Array<InitiativeInfo & { analysis: ReturnType<typeof determineInitiativeStatus> }> = [];
  
  for (const initiative of initiatives) {
    const analysis = determineInitiativeStatus(initiative);
    results.push({ ...initiative, analysis });
  }
  
  // Sort by ID
  results.sort((a, b) => {
    const aNum = parseInt(a.id.replace('IN-', ''));
    const bNum = parseInt(b.id.replace('IN-', ''));
    return aNum - bNum;
  });
  
  // Report
  console.log('📊 Initiative Status Analysis:\n');
  
  let statusMatches = 0;
  let statusMismatches = 0;
  
  for (const result of results) {
    const statusMatch = result.declaredStatus.toLowerCase() === result.analysis.suggestedStatus.toLowerCase() ||
                       (result.declaredStatus.includes('Active') && result.analysis.suggestedStatus === 'Active') ||
                       (result.declaredStatus.includes('Completed') && result.analysis.suggestedStatus === 'Completed');
    
    const icon = statusMatch ? '✅' : '⚠️';
    const matchText = statusMatch ? 'MATCH' : 'MISMATCH';
    
    console.log(`${icon} ${result.id}: ${result.name}`);
    console.log(`   Declared: ${result.declaredStatus}`);
    console.log(`   Suggested: ${result.analysis.suggestedStatus} (${result.analysis.completionRate}% complete)`);
    console.log(`   ${matchText}: ${result.analysis.reasoning}`);
    console.log(`   Related Epics: ${result.relatedEpics.length} (${result.relatedEpics.join(', ')})`);
    
    if (result.relatedEpics.length > 0) {
      console.log(`   Epic Status:`);
      for (const epicId of result.relatedEpics) {
        const epicStatus = result.actualEpicStatuses.get(epicId);
        const statusIcon = epicStatus === 'complete' ? '✅' : epicStatus === 'partial' ? '⚠️' : '❌';
        console.log(`     ${statusIcon} ${epicId}: ${epicStatus || 'unknown'}`);
      }
    }
    console.log();
    
    if (statusMatch) {
      statusMatches++;
    } else {
      statusMismatches++;
    }
  }
  
  // Summary
  console.log('\n📈 Summary:');
  console.log(`   ✅ Status Matches: ${statusMatches}`);
  console.log(`   ⚠️  Status Mismatches: ${statusMismatches}`);
  console.log(`   📊 Total Initiatives: ${results.length}`);
  
  // Recommendations
  if (statusMismatches > 0) {
    console.log('\n💡 Recommendations:');
    results
      .filter(r => r.declaredStatus.toLowerCase() !== r.analysis.suggestedStatus.toLowerCase())
      .forEach(r => {
        console.log(`   ${r.id}: Consider updating status from "${r.declaredStatus}" to "${r.analysis.suggestedStatus}"`);
      });
  }
}

main();
