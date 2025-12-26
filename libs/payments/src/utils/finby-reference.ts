/**
 * Finby Reference Generation Utilities
 * 
 * Generates and validates payment references for Finby API v3
 */

const FUNNEL_REFERENCE_PREFIX = 'RYLAFL';

/**
 * Generate a Finby payment reference scoped to this funnel
 * Format: RYLAFL-REF-{timestamp}-{random}
 */
export function generateFinbyReference(prefix: string = FUNNEL_REFERENCE_PREFIX): string {
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substring(7);
  return `${prefix}-REF-${timestamp}-${randomPart}`;
}

/**
 * Verify that a reference belongs to this funnel
 * Returns true if reference starts with the specified prefix
 */
export function isFunnelReference(reference: string, prefix: string = FUNNEL_REFERENCE_PREFIX): boolean {
  if (!reference) return false;
  return reference.startsWith(`${prefix}-`);
}

