/**
 * Root tRPC Router
 *
 * Combines all routers into a single app router.
 * This is the main export used by the tRPC API handler.
 */

import { router } from './trpc';
import {
  userRouter,
  characterRouter,
  generationRouter,
  postRouter,
  creditsRouter,
  subscriptionRouter,
  promptsRouter,
} from './routers';

/**
 * App Router - combines all routers
 */
export const appRouter = router({
  user: userRouter,
  character: characterRouter,
  generation: generationRouter,
  post: postRouter,
  credits: creditsRouter,
  subscription: subscriptionRouter,
  prompts: promptsRouter,
});

/**
 * Type definition for the API
 * This is used by the client to get full type safety
 */
export type AppRouter = typeof appRouter;
