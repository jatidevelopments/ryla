/**
 * Payment Reference Utilities
 * 
 * Generates and parses payment references for Finby integration.
 * References are used to link payments to users and products.
 */

/**
 * Generate reference for subscription purchase
 * Format: sub_{userId}_{planId}
 */
export function generateSubscriptionReference(userId: string, planId: string): string {
  return `sub_${userId}_${planId}`;
}

/**
 * Generate reference for credit purchase
 * Format: cred_{userId}_{packageId}
 */
export function generateCreditReference(userId: string, packageId: string): string {
  return `cred_${userId}_${packageId}`;
}

/**
 * Parse subscription reference
 * Returns { userId, planId } or null if invalid
 */
export function parseSubscriptionReference(reference: string): { userId: string; planId: string } | null {
  const parts = reference.split('_');
  if (parts.length !== 3 || parts[0] !== 'sub') {
    return null;
  }
  return {
    userId: parts[1],
    planId: parts[2],
  };
}

/**
 * Parse credit purchase reference
 * Returns { userId, packageId } or null if invalid
 */
export function parseCreditReference(reference: string): { userId: string; packageId: string } | null {
  const parts = reference.split('_');
  if (parts.length !== 3 || parts[0] !== 'cred') {
    return null;
  }
  return {
    userId: parts[1],
    packageId: parts[2],
  };
}

/**
 * Parse any payment reference (subscription or credit)
 * Returns the type and parsed data
 */
export function parsePaymentReference(reference: string): 
  | { type: 'subscription'; userId: string; planId: string }
  | { type: 'credit'; userId: string; packageId: string }
  | null {
  if (reference.startsWith('sub_')) {
    const parsed = parseSubscriptionReference(reference);
    if (parsed) {
      return { type: 'subscription', ...parsed };
    }
  }
  
  if (reference.startsWith('cred_')) {
    const parsed = parseCreditReference(reference);
    if (parsed) {
      return { type: 'credit', ...parsed };
    }
  }
  
  return null;
}

