/**
 * Authentication Tools
 *
 * Tools for authentication and session management:
 * - Login/register users
 * - Manage tokens
 * - Debug auth state
 */

import { FastMCP } from 'fastmcp';
import { z } from 'zod';
import { apiCall } from '../api-client.js';

export function registerAuthTools(server: FastMCP) {
  /**
   * Login user (get dev token)
   */
  server.addTool({
    name: 'ryla_auth_login',
    description: `Login a user and get access/refresh tokens. Useful for debugging auth or getting a dev token.
    
Returns tokens that can be used for subsequent authenticated requests.`,
    parameters: z.object({
      email: z.string().email().describe('User email address'),
      password: z.string().min(1).describe('User password'),
    }),
    execute: async (args) => {
      try {
        const result = await apiCall<{
          user: {
            id: string;
            email: string;
            name: string | null;
          };
          accessToken: string;
          refreshToken: string;
        }>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            email: args.email,
            password: args.password,
          }),
        });

        return JSON.stringify(
          {
            success: true,
            user: result.user,
            accessToken: result.accessToken,
            refreshTokenPreview: result.refreshToken?.slice(0, 20) + '...',
            note: 'Set RYLA_DEV_TOKEN to the accessToken value for authenticated calls',
          },
          null,
          2
        );
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
  });

  /**
   * Get long-lived dev token (10-year expiration) for MCP/development tools
   */
  server.addTool({
    name: 'ryla_auth_dev_token',
    description: `Get a long-lived dev token that expires in 10 years instead of 1 hour.
    
Perfect for MCP servers and development tools that need persistent authentication.
This token will not expire for 10 years, so you won't need to refresh it regularly.`,
    parameters: z.object({
      email: z.string().email().describe('User email address'),
      password: z.string().min(1).describe('User password'),
    }),
    execute: async (args) => {
      try {
        const result = await apiCall<{
          user: {
            id: string;
            email: string;
            name: string | null;
          };
          accessToken: string;
        }>('/auth/dev-token', {
          method: 'POST',
          body: JSON.stringify({
            email: args.email,
            password: args.password,
          }),
        });

        return JSON.stringify(
          {
            success: true,
            user: result.user,
            accessToken: result.accessToken,
            expiresIn: '10 years',
            note: 'This token expires in 10 years - perfect for MCP configuration! Set RYLA_DEV_TOKEN to the accessToken value.',
          },
          null,
          2
        );
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          hint: 'Make sure the API server has been restarted to include the new dev-token endpoint',
        });
      }
    },
  });

  /**
   * Register new user
   */
  server.addTool({
    name: 'ryla_auth_register',
    description: 'Register a new user account. Useful for creating test accounts. Both name and publicName are required.',
    parameters: z.object({
      email: z.string().email().describe('Email address'),
      password: z.string().min(8).describe('Password (min 8 chars)'),
      name: z.string().describe('Display name'),
      publicName: z.string().describe('Unique public username/handle'),
    }),
    execute: async (args) => {
      try {
        const result = await apiCall<{
          user: {
            id: string;
            email: string;
            name: string | null;
            publicName: string;
          };
          accessToken: string;
          refreshToken: string;
        }>('/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            email: args.email,
            password: args.password,
            name: args.name,
            publicName: args.publicName,
          }),
        });

        return JSON.stringify(
          {
            success: true,
            user: result.user,
            accessToken: result.accessToken,
            message: 'User registered successfully',
          },
          null,
          2
        );
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
  });

  /**
   * Refresh access token
   */
  server.addTool({
    name: 'ryla_auth_refresh',
    description: 'Refresh an access token using a refresh token.',
    parameters: z.object({
      refreshToken: z.string().describe('The refresh token'),
    }),
    execute: async (args) => {
      try {
        const result = await apiCall<{
          accessToken: string;
          refreshToken: string;
        }>('/auth/refresh', {
          method: 'POST',
          body: JSON.stringify({
            refreshToken: args.refreshToken,
          }),
        });

        return JSON.stringify(
          {
            success: true,
            accessToken: result.accessToken,
            refreshTokenPreview: result.refreshToken?.slice(0, 20) + '...',
          },
          null,
          2
        );
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
  });

  /**
   * Check email exists
   */
  server.addTool({
    name: 'ryla_auth_check_email',
    description: 'Check if an email address is already registered.',
    parameters: z.object({
      email: z.string().email().describe('Email to check'),
    }),
    execute: async (args) => {
      try {
        const result = await apiCall<{
          exists: boolean;
        }>(`/auth/check-email?email=${encodeURIComponent(args.email)}`);

        return JSON.stringify(
          {
            success: true,
            email: args.email,
            exists: result.exists,
          },
          null,
          2
        );
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
  });

  /**
   * Get current auth state
   */
  server.addTool({
    name: 'ryla_auth_me',
    description: 'Get current authenticated user info. Verifies the configured dev token is valid.',
    parameters: z.object({}),
    execute: async () => {
      try {
        const result = await apiCall<{
          user: {
            id: string;
            email: string;
            name: string | null;
            role: string;
            createdAt: string;
          };
        }>('/auth/me');

        return JSON.stringify(
          {
            success: true,
            authenticated: true,
            user: result.user,
          },
          null,
          2
        );
      } catch (error) {
        return JSON.stringify({
          success: false,
          authenticated: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          note: 'Token may be invalid or expired. Use ryla_auth_login to get a new token.',
        });
      }
    },
  });

  /**
   * Logout current session
   */
  server.addTool({
    name: 'ryla_auth_logout',
    description: 'Logout current device/session.',
    parameters: z.object({}),
    execute: async () => {
      try {
        await apiCall('/auth/logout', { method: 'POST' });
        return JSON.stringify({
          success: true,
          message: 'Logged out successfully',
        });
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
  });

  /**
   * Logout all devices
   */
  server.addTool({
    name: 'ryla_auth_logout_all',
    description: 'Logout all devices/sessions for current user.',
    parameters: z.object({}),
    execute: async () => {
      try {
        await apiCall('/auth/logout-all', { method: 'POST' });
        return JSON.stringify({
          success: true,
          message: 'Logged out from all devices',
        });
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
  });
}

