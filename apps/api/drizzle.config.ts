/**
 * @deprecated Use root drizzle.config.ts instead
 *
 * Schemas have moved to libs/data/src/schema/
 * Run migrations from project root:
 *   pnpm db:generate
 *   pnpm db:migrate
 *   pnpm db:push
 *   pnpm db:studio
 */

// Re-export root config for backwards compatibility
export { default } from '../../drizzle.config';
