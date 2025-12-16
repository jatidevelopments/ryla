const FUNNEL_REFERENCE_PREFIX = "RYLAFL";

/**
 * Generate a Finby payment reference scoped to this funnel
 * Format: RYLAFL-REF-{timestamp}-{random}
 */
export function generateFinbyReference(): string {
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substring(7);
    return `${FUNNEL_REFERENCE_PREFIX}-REF-${timestamp}-${randomPart}`;
}

/**
 * Verify that a reference belongs to this funnel
 * Returns true if reference starts with RYLAFL prefix
 */
export function isFunnelReference(reference: string): boolean {
    if (!reference) return false;
    return reference.startsWith(`${FUNNEL_REFERENCE_PREFIX}-`);
}

