import { UUID_RE } from './constants';

/**
 * Check if a string is a valid UUID
 */
export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

