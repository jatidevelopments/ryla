/**
 * RYLA Prompt Library
 *
 * Central registry of prompts for AI image generation.
 * Extracted from AI influencer course and community best practices.
 *
 * Usage:
 *   import { prompts, buildPrompt, PromptCategory } from '@ryla/business/prompts';
 *
 *   // Get a random prompt from category
 *   const prompt = prompts.portrait.casual[0];
 *
 *   // Build a complete prompt with character DNA
 *   const full = buildPrompt('portrait.casual', characterDNA);
 */

export * from './types';
export * from './templates';
export * from './character-dna';
export * from './categories';
export * from './builder';
export * from './profile-picture-sets';

