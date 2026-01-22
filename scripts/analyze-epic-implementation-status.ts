#!/usr/bin/env tsx
/**
 * Analyze Epic Implementation Status
 * 
 * Analyzes codebase to determine actual implementation status of epics.
 * Checks for:
 * - Database schemas (Drizzle)
 * - API routes/endpoints
 * - React components
 * - Business logic services
 * - Test files
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join } from 'path';

interface EpicImplementationStatus {
  id: string;
  hasSchema: boolean;
  hasApiRoutes: boolean;
  hasComponents: boolean;
  hasBusinessLogic: boolean;
  hasTests: boolean;
  implementationLevel: 'none' | 'partial' | 'complete';
  suggestedStatus: string;
}

// Epic ID to feature keywords mapping
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

function checkEpicImplementation(epicId: string): EpicImplementationStatus {
  const keywords = EPIC_KEYWORDS[epicId] || [];
  
  if (keywords.length === 0) {
    return {
      id: epicId,
      hasSchema: false,
      hasApiRoutes: false,
      hasComponents: false,
      hasBusinessLogic: false,
      hasTests: false,
      implementationLevel: 'none',
      suggestedStatus: 'Proposed',
    };
  }
  
  // Check database schemas
  const hasSchema = searchInFiles('libs/data/src', keywords) ||
                    searchInFiles('drizzle/migrations', keywords);
  
  // Check API routes
  const hasApiRoutes = searchInFiles('apps/api/src', keywords) ||
                       searchInFiles('libs/trpc/src', keywords);
  
  // Check React components
  const hasComponents = searchInFiles('apps/web', keywords) ||
                        searchInFiles('apps/admin', keywords) ||
                        searchInFiles('libs/ui/src', keywords);
  
  // Check business logic
  const hasBusinessLogic = searchInFiles('libs/business/src', keywords);
  
  // Check tests
  const hasTests = searchInFiles('apps/web', keywords.filter(k => k.includes('test'))) ||
                   searchInFiles('apps/api', keywords.filter(k => k.includes('test')));
  
  // Determine implementation level
  const indicators = [hasSchema, hasApiRoutes, hasComponents, hasBusinessLogic];
  const indicatorCount = indicators.filter(Boolean).length;
  
  let implementationLevel: 'none' | 'partial' | 'complete';
  let suggestedStatus: string;
  
  if (indicatorCount === 0) {
    implementationLevel = 'none';
    suggestedStatus = 'Proposed';
  } else if (indicatorCount < 3) {
    implementationLevel = 'partial';
    suggestedStatus = 'In Progress';
  } else {
    implementationLevel = 'complete';
    suggestedStatus = hasTests ? 'Completed' : 'In Review';
  }
  
  return {
    id: epicId,
    hasSchema,
    hasApiRoutes,
    hasComponents,
    hasBusinessLogic,
    hasTests,
    implementationLevel,
    suggestedStatus,
  };
}

function main() {
  console.log('🔍 Analyzing Epic Implementation Status...\n');
  
  // Get all epic IDs from keywords
  const epicIds = Object.keys(EPIC_KEYWORDS).sort((a, b) => {
    const aNum = parseInt(a.replace('EP-', ''));
    const bNum = parseInt(b.replace('EP-', ''));
    return aNum - bNum;
  });
  
  const results: EpicImplementationStatus[] = [];
  
  for (const epicId of epicIds) {
    const status = checkEpicImplementation(epicId);
    results.push(status);
  }
  
  // Summary
  const none = results.filter(r => r.implementationLevel === 'none').length;
  const partial = results.filter(r => r.implementationLevel === 'partial').length;
  const complete = results.filter(r => r.implementationLevel === 'complete').length;
  
  console.log('📊 Implementation Summary:');
  console.log(`  ❌ None: ${none}`);
  console.log(`  ⚠️  Partial: ${partial}`);
  console.log(`  ✅ Complete: ${complete}\n`);
  
  // Detailed results
  console.log('📋 Epic Implementation Status:\n');
  
  results.forEach(result => {
    const indicators = [];
    if (result.hasSchema) indicators.push('📊 Schema');
    if (result.hasApiRoutes) indicators.push('🔌 API');
    if (result.hasComponents) indicators.push('⚛️  UI');
    if (result.hasBusinessLogic) indicators.push('💼 Logic');
    if (result.hasTests) indicators.push('✅ Tests');
    
    const statusIcon = result.implementationLevel === 'complete' ? '✅' :
                      result.implementationLevel === 'partial' ? '⚠️ ' : '❌';
    
    console.log(`${statusIcon} ${result.id}: ${result.suggestedStatus}`);
    if (indicators.length > 0) {
      console.log(`   ${indicators.join(' | ')}`);
    }
    console.log();
  });
  
  // Export suggestions
  console.log('\n💡 Suggested Status Updates:\n');
  results.forEach(result => {
    console.log(`${result.id}: ${result.suggestedStatus}`);
  });
}

main();
