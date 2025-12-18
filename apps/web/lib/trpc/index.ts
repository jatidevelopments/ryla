// Client-side exports
export {
  TRPCProvider,
  trpc,
  getAuthToken,
  setAuthToken,
  clearAuthToken,
} from './client';

// Note: Server-side utilities should be imported directly from './server'
// to maintain the 'server-only' boundary
