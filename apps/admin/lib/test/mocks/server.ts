/**
 * MSW Server Setup for Tests
 */

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Setup MSW server with handlers
export const server = setupServer(...handlers);
