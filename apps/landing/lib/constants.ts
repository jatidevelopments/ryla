/**
 * Application Constants
 * 
 * Centralized constants for the landing page application.
 */

/**
 * Funnel URL - Where CTAs should redirect users
 */
export const FUNNEL_URL = "https://goviral.ryla.ai/";

/**
 * API Base URL - Backend API endpoint
 * For Cloudflare Pages (static export), API routes don't work, so we use the main API
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://end.ryla.ai";

