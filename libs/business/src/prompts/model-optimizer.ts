/**
 * Model Optimizer
 * 
 * Optimizes prompts for specific AI image generation models.
 * Each model has unique strengths, token limits, and formatting preferences.
 * 
 * Usage:
 *   import { optimizeForModel, getModelConfig, ModelType } from '@ryla/business/prompts';
 *   
 *   const optimized = optimizeForModel('flux-dev', {
 *     prompt: "A 24-year-old woman...",
 *     negativePrompt: "...",
 *   });
 */

import { ModelType, negativePromptElements } from './categories';

/**
 * Model configuration with optimization rules
 */
export interface ModelConfig {
  /** Model identifier */
  id: ModelType;
  /** Human-readable name */
  name: string;
  /** Model description */
  description: string;
  /** Maximum recommended prompt tokens/characters */
  maxPromptLength: number;
  /** Whether model uses negative prompts */
  supportsNegativePrompt: boolean;
  /** Default inference steps */
  defaultSteps: number;
  /** Default guidance scale (CFG) */
  defaultGuidance: number;
  /** Recommended aspect ratios */
  recommendedAspectRatios: string[];
  /** Keywords that work well with this model */
  boostKeywords: string[];
  /** Keywords to avoid for this model */
  avoidKeywords: string[];
  /** Special formatting rules */
  formatting: {
    /** Use natural language vs keyword style */
    useNaturalLanguage: boolean;
    /** Separator between prompt segments */
    separator: string;
    /** Whether to capitalize first word */
    capitalizeFirst: boolean;
    /** Whether to add period at end */
    addPeriod: boolean;
  };
  /** Negative prompt categories that work best */
  recommendedNegativeCategories: (keyof typeof negativePromptElements)[];
}

/**
 * Model configurations
 */
export const modelConfigs: Record<ModelType, ModelConfig> = {
  'flux-dev': {
    id: 'flux-dev',
    name: 'Flux Dev',
    description: 'High-quality photorealistic model with strong prompt adherence',
    maxPromptLength: 512,
    supportsNegativePrompt: true,
    defaultSteps: 28,
    defaultGuidance: 3.5,
    recommendedAspectRatios: ['1:1', '4:5', '9:16', '16:9'],
    boostKeywords: [
      'photorealistic',
      'hyperrealistic',
      'professional photography',
      'high resolution',
      '8k',
      'detailed skin texture',
      'natural lighting',
      'sharp focus',
      'masterpiece',
    ],
    avoidKeywords: [
      'cartoon',
      'anime',
      'illustration',
      'painting',
      'sketch',
      'abstract',
      'stylized',
    ],
    formatting: {
      useNaturalLanguage: true,
      separator: ', ',
      capitalizeFirst: true,
      addPeriod: false,
    },
    recommendedNegativeCategories: ['anatomy', 'quality', 'face', 'faceAdvanced', 'skin', 'flux', 'aiArtifacts'],
  },

  'z-image-turbo': {
    id: 'z-image-turbo',
    name: 'Z-Image Turbo',
    description: 'Fast, efficient model optimized for realism',
    maxPromptLength: 384,
    supportsNegativePrompt: true,
    defaultSteps: 6,
    defaultGuidance: 2.0,
    recommendedAspectRatios: ['1:1', '4:5', '3:4'],
    boostKeywords: [
      'realistic photograph',
      'candid',
      'natural',
      'authentic',
      'amateur photo',
      'smartphone quality',
      'genuine moment',
    ],
    avoidKeywords: [
      'digital art',
      'CGI',
      'render',
      '3D',
      'ultra detailed',
      'maximum quality', // Over-optimization can cause issues
    ],
    formatting: {
      useNaturalLanguage: true,
      separator: ', ',
      capitalizeFirst: true,
      addPeriod: false,
    },
    recommendedNegativeCategories: ['anatomy', 'quality', 'face', 'skin', 'flux', 'aiArtifacts'],
  },

  sdxl: {
    id: 'sdxl',
    name: 'Stable Diffusion XL',
    description: 'Versatile model with good prompt adherence',
    maxPromptLength: 256,
    supportsNegativePrompt: true,
    defaultSteps: 30,
    defaultGuidance: 7.0,
    recommendedAspectRatios: ['1:1', '4:3', '16:9'],
    boostKeywords: [
      'best quality',
      'masterpiece',
      'highly detailed',
      'sharp focus',
      'professional photograph',
      'cinematic lighting',
    ],
    avoidKeywords: [
      'worst quality',
      'low quality',
      'bad anatomy', // Better in negative
    ],
    formatting: {
      useNaturalLanguage: false, // SDXL works well with keyword lists
      separator: ', ',
      capitalizeFirst: false,
      addPeriod: false,
    },
    recommendedNegativeCategories: ['anatomy', 'quality', 'face', 'skin'],
  },

  default: {
    id: 'default',
    name: 'Default',
    description: 'Generic configuration for unknown models',
    maxPromptLength: 256,
    supportsNegativePrompt: true,
    defaultSteps: 25,
    defaultGuidance: 5.0,
    recommendedAspectRatios: ['1:1'],
    boostKeywords: ['high quality', 'detailed', 'professional'],
    avoidKeywords: [],
    formatting: {
      useNaturalLanguage: true,
      separator: ', ',
      capitalizeFirst: true,
      addPeriod: false,
    },
    recommendedNegativeCategories: ['anatomy', 'quality', 'face'],
  },
};

/**
 * Get configuration for a specific model
 */
export function getModelConfig(model: ModelType): ModelConfig {
  return modelConfigs[model] || modelConfigs.default;
}

/**
 * Prompt and parameters after model optimization
 */
export interface OptimizedPrompt {
  /** Optimized prompt text */
  prompt: string;
  /** Optimized negative prompt */
  negativePrompt: string;
  /** Recommended parameters */
  parameters: {
    steps: number;
    guidance: number;
    aspectRatio: string;
  };
  /** Optimization notes */
  notes: string[];
  /** Whether prompt was modified */
  wasModified: boolean;
}

/**
 * Input for optimization
 */
export interface OptimizationInput {
  /** Original prompt */
  prompt: string;
  /** Original negative prompt */
  negativePrompt?: string;
  /** Desired aspect ratio */
  aspectRatio?: string;
  /** Whether realism mode is enabled */
  realismMode?: boolean;
}

/**
 * Optimize a prompt for a specific model
 */
export function optimizeForModel(
  model: ModelType,
  input: OptimizationInput
): OptimizedPrompt {
  const config = getModelConfig(model);
  const notes: string[] = [];
  let wasModified = false;

  let prompt = input.prompt;
  let negativePrompt = input.negativePrompt || '';

  // 1. Apply formatting rules
  if (config.formatting.capitalizeFirst && prompt.length > 0) {
    const firstChar = prompt.charAt(0);
    if (firstChar !== firstChar.toUpperCase()) {
      prompt = firstChar.toUpperCase() + prompt.slice(1);
      wasModified = true;
    }
  }

  // 2. Remove or warn about keywords to avoid
  for (const keyword of config.avoidKeywords) {
    const regex = new RegExp(`\\b${escapeRegex(keyword)}\\b`, 'gi');
    if (regex.test(prompt)) {
      prompt = prompt.replace(regex, '').replace(/,\s*,/g, ',').trim();
      notes.push(`Removed "${keyword}" (not optimal for ${config.name})`);
      wasModified = true;
    }
  }

  // 3. Add boost keywords for realism mode (if not already present)
  if (input.realismMode) {
    const boostsToAdd: string[] = [];
    const lowerPrompt = prompt.toLowerCase();

    for (const boost of config.boostKeywords.slice(0, 3)) { // Add top 3 boosts
      if (!lowerPrompt.includes(boost.toLowerCase())) {
        boostsToAdd.push(boost);
      }
    }

    if (boostsToAdd.length > 0) {
      prompt = prompt + config.formatting.separator + boostsToAdd.join(config.formatting.separator);
      notes.push(`Added ${config.name} boost keywords`);
      wasModified = true;
    }
  }

  // 4. Truncate if exceeds max length
  if (prompt.length > config.maxPromptLength) {
    // Try to truncate at a comma boundary
    const truncated = prompt.slice(0, config.maxPromptLength);
    const lastComma = truncated.lastIndexOf(',');
    if (lastComma > config.maxPromptLength * 0.8) {
      prompt = truncated.slice(0, lastComma).trim();
    } else {
      prompt = truncated.trim();
    }
    notes.push(`Truncated prompt to ${config.maxPromptLength} chars for ${config.name}`);
    wasModified = true;
  }

  // 5. Build optimized negative prompt
  if (config.supportsNegativePrompt) {
    const requiredNegatives: string[] = [];
    
    for (const category of config.recommendedNegativeCategories) {
      requiredNegatives.push(...negativePromptElements[category]);
    }

    // Merge with user's negative prompt, avoiding duplicates
    const existingNegatives = new Set(
      negativePrompt.split(',').map(n => n.trim().toLowerCase())
    );
    
    const newNegatives: string[] = [];
    for (const neg of requiredNegatives) {
      if (!existingNegatives.has(neg.toLowerCase())) {
        newNegatives.push(neg);
      }
    }

    if (newNegatives.length > 0) {
      negativePrompt = negativePrompt
        ? negativePrompt + ', ' + newNegatives.join(', ')
        : newNegatives.join(', ');
      notes.push(`Enhanced negative prompt for ${config.name}`);
      wasModified = true;
    }
  }

  // 6. Clean up prompt
  prompt = cleanPrompt(prompt);
  negativePrompt = cleanPrompt(negativePrompt);

  // 7. Determine aspect ratio
  const aspectRatio = input.aspectRatio || config.recommendedAspectRatios[0];

  return {
    prompt,
    negativePrompt,
    parameters: {
      steps: config.defaultSteps,
      guidance: config.defaultGuidance,
      aspectRatio,
    },
    notes,
    wasModified,
  };
}

/**
 * Get recommended parameters for a model
 */
export function getRecommendedParameters(
  model: ModelType,
  options?: {
    aspectRatio?: string;
    quality?: 'fast' | 'balanced' | 'quality';
  }
): {
  steps: number;
  guidance: number;
  aspectRatio: string;
  scheduler?: string;
} {
  const config = getModelConfig(model);
  const quality = options?.quality || 'balanced';

  // Adjust steps based on quality preference
  let steps = config.defaultSteps;
  if (quality === 'fast') {
    steps = Math.max(Math.floor(steps * 0.6), 4);
  } else if (quality === 'quality') {
    steps = Math.ceil(steps * 1.3);
  }

  // Validate aspect ratio
  const aspectRatio = options?.aspectRatio && config.recommendedAspectRatios.includes(options.aspectRatio)
    ? options.aspectRatio
    : config.recommendedAspectRatios[0];

  return {
    steps,
    guidance: config.defaultGuidance,
    aspectRatio,
  };
}

/**
 * Check if a prompt is compatible with a model
 */
export function checkModelCompatibility(
  model: ModelType,
  prompt: string
): {
  compatible: boolean;
  warnings: string[];
  suggestions: string[];
} {
  const config = getModelConfig(model);
  const warnings: string[] = [];
  const suggestions: string[] = [];
  const lowerPrompt = prompt.toLowerCase();

  // Check for avoided keywords
  for (const keyword of config.avoidKeywords) {
    if (lowerPrompt.includes(keyword.toLowerCase())) {
      warnings.push(`"${keyword}" may not work well with ${config.name}`);
      suggestions.push(`Remove or replace "${keyword}"`);
    }
  }

  // Check prompt length
  if (prompt.length > config.maxPromptLength) {
    warnings.push(`Prompt exceeds recommended length for ${config.name} (${prompt.length}/${config.maxPromptLength})`);
    suggestions.push('Shorten prompt or remove less important details');
  }

  // Check for boost keywords
  let hasBoosts = 0;
  for (const boost of config.boostKeywords) {
    if (lowerPrompt.includes(boost.toLowerCase())) {
      hasBoosts++;
    }
  }

  if (hasBoosts === 0) {
    suggestions.push(`Add ${config.name} optimized keywords like "${config.boostKeywords[0]}"`);
  }

  return {
    compatible: warnings.length === 0,
    warnings,
    suggestions,
  };
}

/**
 * Get all supported models
 */
export function getSupportedModels(): ModelType[] {
  return Object.keys(modelConfigs) as ModelType[];
}

/**
 * Get model summary for UI display
 */
export function getModelSummaries(): Array<{
  id: ModelType;
  name: string;
  description: string;
  speed: 'fast' | 'medium' | 'slow';
}> {
  return [
    {
      id: 'flux-dev',
      name: 'Flux Dev',
      description: 'Best quality, highly photorealistic',
      speed: 'medium',
    },
    {
      id: 'z-image-turbo',
      name: 'Z-Image Turbo',
      description: 'Fast generation, great for realism',
      speed: 'fast',
    },
    {
      id: 'sdxl',
      name: 'SDXL',
      description: 'Versatile, good all-rounder',
      speed: 'medium',
    },
  ];
}

// Helper functions

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function cleanPrompt(prompt: string): string {
  return prompt
    .replace(/,\s*,/g, ',')      // Remove double commas
    .replace(/^\s*,/, '')        // Remove leading comma
    .replace(/,\s*$/, '')        // Remove trailing comma
    .replace(/\s+/g, ' ')        // Normalize whitespace
    .trim();
}

