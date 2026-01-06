/**
 * Validation utilities for influencer settings fields
 */

export function validateName(value: string): string | null {
  if (!value || value.trim().length === 0) {
    return 'Name is required';
  }
  if (value.trim().length > 100) {
    return 'Name must be 100 characters or less';
  }
  return null;
}

export function validateBio(value: string): string | null {
  if (value.length > 500) {
    return 'Bio must be 500 characters or less';
  }
  return null;
}

export function validateHandle(value: string): string | null {
  if (!value || value.trim().length === 0) {
    return 'Handle is required';
  }
  const cleanValue = value.replace(/^@/, '').trim();
  if (cleanValue.length < 3) {
    return 'Handle must be at least 3 characters';
  }
  if (cleanValue.length > 30) {
    return 'Handle must be 30 characters or less';
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(cleanValue)) {
    return 'Handle can only contain letters, numbers, hyphens, and underscores';
  }
  return null;
}

