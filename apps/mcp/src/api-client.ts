/**
 * API Client Configuration
 *
 * Centralized API configuration and helper for making authenticated API calls.
 * Supports both local and production environments.
 */

// Determine environment
const RYLA_ENV = process.env.RYLA_ENV || process.env.NODE_ENV || 'local';
const isProduction = RYLA_ENV === 'production' || RYLA_ENV === 'prod';

// API configuration
// Priority: RYLA_API_URL env var > production default > local default
export const API_BASE_URL = 
  process.env.RYLA_API_URL || 
  (isProduction ? 'https://end.ryla.ai' : 'http://localhost:3001');

export const DEV_TOKEN = process.env.RYLA_DEV_TOKEN || '';

export const apiConfig = {
  baseUrl: API_BASE_URL,
  token: DEV_TOKEN,
};

/**
 * Make an authenticated API call to the RYLA backend
 */
export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (DEV_TOKEN) {
    headers['Authorization'] = `Bearer ${DEV_TOKEN}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error ${response.status}: ${error}`);
  }

  return response.json();
}

