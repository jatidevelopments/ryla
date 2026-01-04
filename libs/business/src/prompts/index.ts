/**
 * RYLA Prompt Library
 *
 * Central registry of prompts for AI image generation.
 * Extracted from AI influencer course and community best practices.
 *
 * Usage:
 *   import { PromptBuilder, buildPrompt, validateCoherence, scorePrompt } from '@ryla/business/prompts';
 *
 *   // Build a complete prompt with character DNA
 *   const full = buildPrompt('portrait.casual', characterDNA);
 *
 *   // Use enhanced features (EP-023 Phases 1-3)
 *   const builder = new PromptBuilder()
 *     .withCharacter(dna)
 *     .withScene('indoor.cafe')
 *     .withExpression('positive.smile')
 *     .withRealismMode(true)           // Ultra-realistic mode
 *     .withContextEnhancement(true)    // Scene-aware additions
 *     .withEnhancedStylePreset('ultraRealistic')
 *     .forModel('flux-dev');
 *
 *   // Get coherence warnings before building
 *   const coherence = builder.validateCoherence();
 *   if (!coherence.valid) console.log(coherence.suggestions);
 *
 *   // Build and score the prompt
 *   const result = builder.build();
 *   const score = builder.getQualityScore();
 *   console.log(`Quality: ${score.overall}/100 (${score.grade})`);
 */

export * from './types';
export * from './templates';
export * from './character-dna';
export * from './categories';
export * from './builder';
export * from './profile-picture-sets';
export * from './context-enhancer';
export * from './coherence-validator';
export * from './quality-scorer';
export * from './model-optimizer';
export * from './ai-enhancer';

