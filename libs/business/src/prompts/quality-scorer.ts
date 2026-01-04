/**
 * Prompt Quality Scorer
 * 
 * Scores prompts on a 0-100 scale based on factors that affect image quality.
 * Provides suggestions for improvement.
 * 
 * Usage:
 *   import { scorePrompt, PromptQualityScore } from '@ryla/business/prompts';
 *   
 *   const score = scorePrompt({
 *     prompt: "A 24-year-old woman...",
 *     hasRealism: true,
 *     hasContextEnhancement: true,
 *   });
 *   // Returns { overall: 85, breakdown: {...}, suggestions: [...] }
 */

/**
 * Quality score breakdown by category
 */
export interface QualityBreakdown {
  /** Subject clarity (0-20) */
  subjectClarity: number;
  /** Specificity of details (0-15) */
  specificity: number;
  /** Realism keywords present (0-15) */
  realismPotential: number;
  /** Token ordering quality (0-15) */
  tokenOrdering: number;
  /** Negative prompt quality (0-10) */
  negativePromptQuality: number;
  /** Scene context (0-10) */
  sceneContext: number;
  /** Expression-pose coherence (0-10) */
  coherence: number;
  /** No conflicting terms (0-5) */
  noConflicts: number;
}

/**
 * Quality score result
 */
export interface PromptQualityScore {
  /** Overall score 0-100 */
  overall: number;
  /** Letter grade */
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  /** Score breakdown by category */
  breakdown: QualityBreakdown;
  /** Improvement suggestions */
  suggestions: string[];
  /** Positive aspects */
  strengths: string[];
}

/**
 * Scoring input
 */
export interface ScoringInput {
  /** The built prompt string */
  prompt: string;
  /** The negative prompt string */
  negativePrompt?: string;
  /** Whether realism mode is enabled */
  hasRealism?: boolean;
  /** Whether context enhancement is enabled */
  hasContextEnhancement?: boolean;
  /** Whether a style preset is applied */
  hasStylePreset?: boolean;
  /** Whether model targeting is enabled */
  hasModelTarget?: boolean;
  /** Number of coherence warnings */
  coherenceWarnings?: number;
  /** Whether expression is specified */
  hasExpression?: boolean;
  /** Whether pose is specified */
  hasPose?: boolean;
  /** Whether lighting is specified */
  hasLighting?: boolean;
  /** Whether scene is specified */
  hasScene?: boolean;
}

/**
 * Keywords that indicate high realism
 */
const REALISM_KEYWORDS = [
  'amateur photo',
  'candid',
  'natural skin',
  'authentic',
  'raw unedited',
  'smartphone',
  'natural imperfections',
  'skin texture',
  'pores',
  'realistic',
];

/**
 * Keywords that indicate quality modifiers
 */
const QUALITY_KEYWORDS = [
  'detailed',
  'high resolution',
  '8k',
  'professional',
  'masterpiece',
  'best quality',
];

/**
 * Keywords that suggest AI/artificial look (to avoid)
 */
const AI_ARTIFACT_KEYWORDS = [
  'perfect',
  'flawless',
  'porcelain',
  'smooth skin',
  'airbrushed',
];

/**
 * Count keyword matches in a string
 */
function countKeywords(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  return keywords.filter(kw => lower.includes(kw.toLowerCase())).length;
}

/**
 * Check if prompt starts with subject (character description)
 */
function hasProperTokenOrdering(prompt: string): boolean {
  const lower = prompt.toLowerCase();
  // Should start with age + description (e.g., "24-year-old", "22 year old")
  const startsWithAge = /^\d{2}[\s-]?year[\s-]?old/i.test(prompt.trim());
  // Or starts with common character descriptors
  const startsWithDescriptor = lower.startsWith('a ') || 
    lower.startsWith('photo of') ||
    lower.startsWith('portrait of') ||
    lower.startsWith('close-up');
  
  return startsWithAge || startsWithDescriptor;
}

/**
 * Check for conflicting terms in the prompt
 */
function hasConflictingTerms(prompt: string): boolean {
  const lower = prompt.toLowerCase();
  
  // Conflicting pairs
  const conflicts = [
    ['bright', 'dark'],
    ['indoor', 'outdoor'],
    ['day', 'night'],
    ['smiling', 'frowning'],
    ['happy', 'sad'],
    ['relaxed', 'tense'],
  ];

  for (const [a, b] of conflicts) {
    if (lower.includes(a) && lower.includes(b)) {
      return true;
    }
  }

  return false;
}

/**
 * Score a prompt for quality
 */
export function scorePrompt(input: ScoringInput): PromptQualityScore {
  const breakdown: QualityBreakdown = {
    subjectClarity: 0,
    specificity: 0,
    realismPotential: 0,
    tokenOrdering: 0,
    negativePromptQuality: 0,
    sceneContext: 0,
    coherence: 0,
    noConflicts: 0,
  };

  const suggestions: string[] = [];
  const strengths: string[] = [];

  // 1. Subject Clarity (0-20)
  // Check for character description elements
  const hasAge = /\d{2}[\s-]?year[\s-]?old/i.test(input.prompt);
  const hasHair = /hair/i.test(input.prompt);
  const hasEyes = /eyes/i.test(input.prompt);
  const hasSkin = /skin/i.test(input.prompt);

  if (hasAge) breakdown.subjectClarity += 5;
  if (hasHair) breakdown.subjectClarity += 5;
  if (hasEyes) breakdown.subjectClarity += 5;
  if (hasSkin) breakdown.subjectClarity += 5;

  if (breakdown.subjectClarity >= 15) {
    strengths.push('Good character description');
  } else {
    suggestions.push('Add more character details (age, hair, eyes, skin)');
  }

  // 2. Specificity (0-15)
  const wordCount = input.prompt.split(/\s+/).length;
  const commaCount = (input.prompt.match(/,/g) || []).length;

  if (wordCount >= 30) breakdown.specificity += 5;
  else if (wordCount >= 20) breakdown.specificity += 3;

  if (commaCount >= 5) breakdown.specificity += 5;
  else if (commaCount >= 3) breakdown.specificity += 3;

  const qualityKeywordCount = countKeywords(input.prompt, QUALITY_KEYWORDS);
  if (qualityKeywordCount >= 2) {
    breakdown.specificity += 5;
    strengths.push('Good quality modifiers');
  } else {
    suggestions.push('Add quality modifiers (detailed, high resolution, etc.)');
  }

  // 3. Realism Potential (0-15)
  const realismKeywordCount = countKeywords(input.prompt, REALISM_KEYWORDS);
  
  if (input.hasRealism) {
    breakdown.realismPotential += 8;
    strengths.push('Realism mode enabled');
  }

  if (realismKeywordCount >= 3) {
    breakdown.realismPotential += 7;
  } else if (realismKeywordCount >= 1) {
    breakdown.realismPotential += 4;
  } else if (!input.hasRealism) {
    suggestions.push('Enable realism mode or add realistic keywords');
  }

  // Check for AI artifact terms (bad)
  const aiArtifactCount = countKeywords(input.prompt, AI_ARTIFACT_KEYWORDS);
  if (aiArtifactCount > 0) {
    breakdown.realismPotential = Math.max(0, breakdown.realismPotential - 3);
    suggestions.push('Remove "perfect/flawless" terms that create AI look');
  }

  // 4. Token Ordering (0-15)
  if (hasProperTokenOrdering(input.prompt)) {
    breakdown.tokenOrdering += 10;
    strengths.push('Subject-first token ordering');
  } else {
    suggestions.push('Start prompt with character description');
  }

  if (input.hasExpression) breakdown.tokenOrdering += 2;
  if (input.hasPose) breakdown.tokenOrdering += 3;

  // 5. Negative Prompt Quality (0-10)
  if (input.negativePrompt) {
    const negLength = input.negativePrompt.split(/,/).length;
    
    if (negLength >= 15) {
      breakdown.negativePromptQuality += 10;
      strengths.push('Comprehensive negative prompt');
    } else if (negLength >= 10) {
      breakdown.negativePromptQuality += 7;
    } else if (negLength >= 5) {
      breakdown.negativePromptQuality += 4;
    } else {
      suggestions.push('Expand negative prompt with more terms');
    }

    // Check for AI artifact terms in negative (good)
    const hasAntiAI = /plastic|airbrushed|waxy|uncanny/i.test(input.negativePrompt);
    if (hasAntiAI) {
      breakdown.negativePromptQuality = Math.min(10, breakdown.negativePromptQuality + 2);
    }
  } else {
    suggestions.push('Add a negative prompt');
  }

  // 6. Scene Context (0-10)
  if (input.hasContextEnhancement) {
    breakdown.sceneContext += 8;
    strengths.push('Context enhancement enabled');
  }
  
  if (input.hasScene) {
    breakdown.sceneContext += 2;
  } else {
    suggestions.push('Specify a scene/environment');
  }

  // 7. Coherence (0-10)
  const coherenceWarnings = input.coherenceWarnings || 0;
  if (coherenceWarnings === 0) {
    breakdown.coherence = 10;
    strengths.push('Good element coherence');
  } else if (coherenceWarnings === 1) {
    breakdown.coherence = 6;
  } else if (coherenceWarnings === 2) {
    breakdown.coherence = 3;
  } else {
    suggestions.push('Fix coherence issues between elements');
  }

  // 8. No Conflicts (0-5)
  if (!hasConflictingTerms(input.prompt)) {
    breakdown.noConflicts = 5;
  } else {
    suggestions.push('Remove conflicting terms in prompt');
  }

  // Calculate overall score
  const overall = 
    breakdown.subjectClarity +
    breakdown.specificity +
    breakdown.realismPotential +
    breakdown.tokenOrdering +
    breakdown.negativePromptQuality +
    breakdown.sceneContext +
    breakdown.coherence +
    breakdown.noConflicts;

  // Determine grade
  let grade: 'A' | 'B' | 'C' | 'D' | 'F';
  if (overall >= 85) grade = 'A';
  else if (overall >= 70) grade = 'B';
  else if (overall >= 55) grade = 'C';
  else if (overall >= 40) grade = 'D';
  else grade = 'F';

  return {
    overall,
    grade,
    breakdown,
    suggestions: suggestions.slice(0, 5), // Limit to top 5
    strengths,
  };
}

/**
 * Get a quick quality rating without full breakdown
 */
export function getQuickRating(prompt: string): {
  rating: 'excellent' | 'good' | 'fair' | 'poor';
  score: number;
} {
  const wordCount = prompt.split(/\s+/).length;
  const hasRealism = countKeywords(prompt, REALISM_KEYWORDS) > 0;
  const hasQuality = countKeywords(prompt, QUALITY_KEYWORDS) > 0;
  const properOrder = hasProperTokenOrdering(prompt);

  let score = 0;
  if (wordCount >= 30) score += 25;
  else if (wordCount >= 20) score += 15;
  if (hasRealism) score += 25;
  if (hasQuality) score += 25;
  if (properOrder) score += 25;

  let rating: 'excellent' | 'good' | 'fair' | 'poor';
  if (score >= 75) rating = 'excellent';
  else if (score >= 50) rating = 'good';
  else if (score >= 25) rating = 'fair';
  else rating = 'poor';

  return { rating, score };
}

/**
 * Format score for display
 */
export function formatScoreDisplay(score: PromptQualityScore): string {
  const lines: string[] = [
    `Quality Score: ${score.overall}/100 (${score.grade})`,
    '',
    'Breakdown:',
    `  Subject Clarity: ${score.breakdown.subjectClarity}/20`,
    `  Specificity: ${score.breakdown.specificity}/15`,
    `  Realism: ${score.breakdown.realismPotential}/15`,
    `  Token Order: ${score.breakdown.tokenOrdering}/15`,
    `  Negative Prompt: ${score.breakdown.negativePromptQuality}/10`,
    `  Scene Context: ${score.breakdown.sceneContext}/10`,
    `  Coherence: ${score.breakdown.coherence}/10`,
    `  No Conflicts: ${score.breakdown.noConflicts}/5`,
  ];

  if (score.strengths.length > 0) {
    lines.push('', 'Strengths:');
    score.strengths.forEach(s => lines.push(`  ✓ ${s}`));
  }

  if (score.suggestions.length > 0) {
    lines.push('', 'Suggestions:');
    score.suggestions.forEach(s => lines.push(`  • ${s}`));
  }

  return lines.join('\n');
}

