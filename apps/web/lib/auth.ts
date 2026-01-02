/**
 * Authentication utilities for the web app
 * Works with the NestJS API backend
 */

const AUTH_TOKEN_KEY = 'ryla_access_token';
const REFRESH_TOKEN_KEY = 'ryla_refresh_token';

// API base URL - use environment variable or default to local
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  publicName: string;
  role: string | null;
  isEmailVerified: boolean | null;
  banned: boolean | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
  publicName: string;
}

/**
 * Get stored access token
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * Get stored refresh token
 */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Store tokens
 */
export function setTokens(tokens: AuthTokens): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

/**
 * Clear tokens (logout)
 */
export function clearTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

/**
 * Login with email and password
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Login failed');
  }

  const data: AuthResponse = await response.json();
  setTokens(data.tokens);
  return data;
}

/**
 * Register new user
 */
export async function register(credentials: RegisterCredentials): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Registration failed');
  }

  const data: AuthResponse = await response.json();
  setTokens(data.tokens);
  return data;
}

/**
 * Refresh access token
 */
export async function refreshTokens(): Promise<AuthResponse | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      clearTokens();
      return null;
    }

    const data: AuthResponse = await response.json();
    setTokens(data.tokens);
    return data;
  } catch {
    clearTokens();
    return null;
  }
}

/**
 * Logout current session
 */
export async function logout(): Promise<void> {
  const token = getAccessToken();

  if (token) {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      // Ignore errors - we'll clear tokens anyway
    }
  }

  clearTokens();
}

/**
 * Logout all devices/sessions for current user (server-side token invalidation)
 * Clears local tokens and ends the current session.
 */
export async function logoutAllDevices(): Promise<void> {
  const token = getAccessToken();

  if (token) {
    try {
      await fetch(`${API_BASE_URL}/auth/logout-all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      // Ignore errors - we'll clear tokens anyway
    }
  }

  clearTokens();
}

/**
 * Delete current user account.
 * Uses REST endpoint from the NestJS API.
 */
export async function deleteAccount(): Promise<void> {
  const response = await authFetch(`${API_BASE_URL}/user/account`, {
    method: 'DELETE',
  });

  // Nest returns 204 No Content
  if (!(response.status === 204 || response.ok)) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Account deletion failed');
  }

  clearTokens();
}

/**
 * Get current user profile
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = getAccessToken();
  if (!token) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Try to refresh token
        const refreshed = await refreshTokens();
        if (refreshed) {
          return refreshed.user;
        }
        clearTokens();
      }
      return null;
    }

    const data = await response.json();
    return data.user;
  } catch {
    return null;
  }
}

/**
 * Make authenticated API request
 */
export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getAccessToken();

  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // If unauthorized, try to refresh and retry
  if (response.status === 401) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      headers.set('Authorization', `Bearer ${refreshed.tokens.accessToken}`);
      return fetch(url, { ...options, headers });
    }
  }

  return response;
}

