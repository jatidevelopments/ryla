/**
 * Utility functions for generating unique usernames
 */

/**
 * Generate a base username from a name
 * Converts to lowercase, removes special characters, replaces spaces with dots
 */
export function generateBaseUsername(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s.]/g, '') // Remove special characters except dots
    .replace(/\s+/g, '.') // Replace spaces with dots
    .replace(/\.+/g, '.') // Replace multiple dots with single dot
    .replace(/^\.|\.$/g, '') // Remove leading/trailing dots
    .slice(0, 30); // Limit length
}

/**
 * Generate a unique username with a random suffix
 * Format: baseusername1234 (where 1234 is a random 4-digit number)
 */
export function generateUsernameWithSuffix(baseUsername: string): string {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000); // 4-digit number (1000-9999)
  return `${baseUsername}${randomSuffix}`;
}

/**
 * Generate a random username when no name is provided
 * Format: user1234 (where 1234 is a random 4-digit number)
 */
export function generateRandomUsername(): string {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `user${randomSuffix}`;
}
