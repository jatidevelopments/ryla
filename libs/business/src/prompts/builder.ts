/**
 * Prompt Builder
 *
 * Builds complete prompts from templates and character DNA.
 * Provides a fluent API for constructing complex prompts.
 *
 * Usage:
 *   import { PromptBuilder, characterDNATemplates } from '@ryla/business/prompts';
 *
 *   const prompt = new PromptBuilder()
 *     .withCharacter(characterDNATemplates.latinaModel)
 *     .withTemplate('portrait-selfie-casual')
 *     .withScene('indoor.cafe')
 *     .withOutfit('casual.sundress')
 *     .withLighting('natural.goldenHour')
 *     .withExpression('positive.smile')
 *     .build();
 */

import {
  CharacterDNA,
  PromptTemplate,
  BuiltPrompt,
} from './types';
import { dnaToPromptSegment } from './character-dna';
import { getTemplateById, promptTemplates } from './templates';
import {
  sceneOptions,
  outfitOptions,
  lightingOptions,
  expressionOptions,
  poseOptions,
  styleModifiers,
  stylePresets,
  StylePresetType,
  ModelType,
  buildNegativePrompt,
  buildEnhancedNegativePrompt,
} from './categories';
import { applyContextEnhancements } from './context-enhancer';
import {
  validateCoherence,
  CoherenceResult,
  CoherenceInput,
} from './coherence-validator';
import {
  scorePrompt,
  PromptQualityScore,
  ScoringInput,
} from './quality-scorer';
import {
  optimizeForModel,
  getModelConfig,
  checkModelCompatibility,
  OptimizedPrompt,
} from './model-optimizer';
import {
  AIPromptEnhancer,
  EnhancementResult,
} from './ai-enhancer';
import { OutfitComposition, getPieceById } from '@ryla/shared';

/**
 * Fluent prompt builder class
 * 
 * Enhanced with realism mode, model-specific optimization, and style presets.
 * 
 * Usage:
 *   const prompt = new PromptBuilder()
 *     .withCharacter(characterDNA)
 *     .withScene('indoor.cafe')
 *     .withRealismMode(true)        // NEW: Enable ultra-realistic mode
 *     .forModel('flux-dev')          // NEW: Optimize for specific model
 *     .withEnhancedStylePreset('ultraRealistic')  // NEW: Enhanced presets
 *     .build();
 */
export class PromptBuilder {
  private character?: CharacterDNA;
  private template?: PromptTemplate;
  private scene?: string;
  private scenePath?: string; // Original scene path for context lookup
  private outfit?: string | OutfitComposition;
  private lighting?: string;
  private expression?: string;
  private pose?: string;
  private additionalDetails: string[] = [];
  private modifiers: string[] = [];
  private customNegative?: string;
  private additionalNegatives: string[] = [];

  // NEW: Enhanced features
  private realismMode = false;
  private targetModel: ModelType = 'default';
  private activeStylePreset?: StylePresetType;
  private contextEnhancementEnabled = false;
  private contextOptions: {
    includeAtmosphere: boolean;
    includeLighting: boolean;
    includeActivity: boolean;
    maxAdditions: number;
  } = {
      includeAtmosphere: true,
      includeLighting: true,
      includeActivity: false,
      maxAdditions: 3,
    };

  /**
   * Set the character DNA
   */
  withCharacter(character: CharacterDNA): this {
    this.character = character;
    return this;
  }

  /**
   * Set the template by ID or provide a custom template string
   */
  withTemplate(templateIdOrCustom: string): this {
    const found = getTemplateById(templateIdOrCustom);
    if (found) {
      this.template = found;
    } else {
      // Treat as custom template string
      this.template = {
        id: 'custom',
        category: 'portrait',
        subcategory: 'custom',
        name: 'Custom Template',
        description: 'User-provided template',
        template: templateIdOrCustom,
        requiredDNA: ['age', 'hair', 'eyes', 'skin'],
        tags: [],
        rating: 'sfw',
      };
    }
    return this;
  }

  /**
   * Set the scene using dot notation (e.g., 'indoor.cafe')
   */
  withScene(scenePath: string): this {
    this.scenePath = scenePath; // Store original path for context lookup
    this.scene = this.resolveOption(scenePath, sceneOptions);
    return this;
  }

  /**
   * Enable context-aware scene enhancements
   * Automatically adds scene-appropriate details (e.g., café → coffee shop ambiance)
   * 
   * @param enabled - Whether to enable context enhancement (default: true)
   * @param options - Configuration options
   * @example
   *   builder.withContextEnhancement(true)
   *   builder.withContextEnhancement(true, { includeActivity: true })
   */
  withContextEnhancement(
    enabled = true,
    options?: {
      includeAtmosphere?: boolean;
      includeLighting?: boolean;
      includeActivity?: boolean;
      maxAdditions?: number;
    }
  ): this {
    this.contextEnhancementEnabled = enabled;
    if (options) {
      this.contextOptions = { ...this.contextOptions, ...options };
    }
    return this;
  }

  /**
   * Set the outfit (supports both string path and OutfitComposition)
   */
  withOutfit(outfitPath: string | OutfitComposition): this {
    if (typeof outfitPath === 'string') {
      this.outfit = this.resolveOption(outfitPath, outfitOptions);
    } else {
      this.outfit = outfitPath;
    }
    return this;
  }

  /**
   * Set the lighting using dot notation (e.g., 'natural.goldenHour')
   */
  withLighting(lightingPath: string): this {
    this.lighting = this.resolveOption(lightingPath, lightingOptions);
    return this;
  }

  /**
   * Set the expression using dot notation (e.g., 'positive.smile')
   */
  withExpression(expressionPath: string): this {
    this.expression = this.resolveOption(expressionPath, expressionOptions);
    return this;
  }

  /**
   * Set the pose using dot notation (e.g., 'standing.casual')
   */
  withPose(posePath: string): this {
    this.pose = this.resolveOption(posePath, poseOptions);
    return this;
  }

  /**
   * Add additional details to the prompt
   */
  addDetails(...details: string[]): this {
    this.additionalDetails.push(...details);
    return this;
  }

  /**
   * Add style modifiers
   */
  addModifiers(...mods: string[]): this {
    this.modifiers.push(...mods);
    return this;
  }

  /**
   * Add preset style modifier groups (basic modifiers)
   */
  withStylePreset(preset: keyof typeof styleModifiers): this {
    this.modifiers.push(...styleModifiers[preset]);
    return this;
  }

  /**
   * Apply an enhanced style preset with full configuration
   * Includes modifiers and optimized negative prompt categories
   * 
   * @param preset - The style preset to apply
   * @example
   *   builder.withEnhancedStylePreset('ultraRealistic')
   */
  withEnhancedStylePreset(preset: StylePresetType): this {
    const presetConfig = stylePresets[preset];
    if (presetConfig) {
      this.activeStylePreset = preset;
      this.modifiers.push(...presetConfig.modifiers);
    }
    return this;
  }

  /**
   * Enable ultra-realistic mode for authentic-looking images
   * Adds smartphone aesthetic, natural skin texture, and anti-AI modifiers
   * 
   * @param enabled - Whether to enable realism mode (default: true)
   * @example
   *   builder.withRealismMode(true)
   */
  withRealismMode(enabled = true): this {
    this.realismMode = enabled;
    if (enabled) {
      // Add realism modifiers
      this.modifiers.push(
        ...styleModifiers.ultraRealistic,
        ...styleModifiers.naturalSkin
      );
    }
    return this;
  }

  /**
   * Target a specific AI model for prompt optimization
   * Adjusts negative prompts and formatting for the model
   * 
   * @param model - The target model ('flux-dev' | 'z-image-turbo' | 'sdxl' | 'default')
   * @example
   *   builder.forModel('flux-dev')
   */
  forModel(model: ModelType): this {
    this.targetModel = model;
    return this;
  }

  /**
   * Set a custom negative prompt
   */
  withNegativePrompt(negative: string): this {
    this.customNegative = negative;
    return this;
  }

  /**
   * Build the final prompt
   * 
   * Token ordering priority (AI models prioritize earlier tokens):
   * 1. Character DNA (subject) - FIRST
   * 2. Shot type/framing
   * 3. Expression/action
   * 4. Lighting
   * 5. Scene/environment
   * 6. Style modifiers
   */
  build(): BuiltPrompt {
    if (!this.character) {
      throw new Error('Character DNA is required. Use withCharacter() first.');
    }

    // Apply context enhancements if enabled
    let contextAdditions: string[] = [];
    if (this.contextEnhancementEnabled && this.scenePath) {
      const enhancements = applyContextEnhancements(this.scenePath, this.contextOptions);
      contextAdditions = enhancements.promptAdditions;
      this.additionalNegatives.push(...enhancements.negativeAdditions);

      // Use suggested lighting if no lighting is set
      if (!this.lighting && enhancements.suggestedLighting) {
        this.lighting = enhancements.suggestedLighting;
      }
    }

    // Get template or use optimized default with better token ordering
    // Subject first, then action, then environment, then style
    const templateStr = this.template?.template ||
      '{{character}}, {{expression}}, {{pose}}, {{lighting}}, {{outfit}}, {{scene}}';

    // Build character segment
    const characterSegment = dnaToPromptSegment(this.character);

    // Build outfit string (handle both old string format and new composition format)
    const outfitString = typeof this.outfit === 'string'
      ? this.outfit
      : buildOutfitPrompt(this.outfit);

    // Replace placeholders
    let prompt = templateStr
      .replace(/\{\{character\}\}/g, characterSegment)
      .replace(/\{\{name\}\}/g, this.character.name)
      .replace(/\{\{outfit\}\}/g, outfitString || 'casual outfit')
      .replace(/\{\{scene\}\}/g, this.scene || 'neutral background')
      .replace(/\{\{lighting\}\}/g, this.lighting || 'natural lighting')
      .replace(/\{\{expression\}\}/g, this.expression || 'natural expression')
      .replace(/\{\{pose\}\}/g, this.pose || '');

    // Add context enhancements (scene-aware additions)
    if (contextAdditions.length > 0) {
      prompt += ', ' + contextAdditions.join(', ');
    }

    // Add additional details
    if (this.additionalDetails.length > 0) {
      prompt += ', ' + this.additionalDetails.join(', ');
    }

    // Add modifiers
    if (this.modifiers.length > 0) {
      prompt += ', ' + this.modifiers.join(', ');
    }

    // Clean up: remove empty placeholders, double commas, extra spaces
    prompt = prompt
      .replace(/,\s*,/g, ',')
      .replace(/,\s*$/g, '')
      .replace(/^\s*,/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Build negative prompt with enhanced options
    let negativePrompt: string;

    if (this.customNegative) {
      // User provided custom negative prompt
      negativePrompt = this.customNegative;
    } else if (this.activeStylePreset && stylePresets[this.activeStylePreset]) {
      // Use negative categories from style preset
      negativePrompt = buildNegativePrompt(stylePresets[this.activeStylePreset].negativeCategories);
    } else if (this.realismMode || this.targetModel !== 'default') {
      // Use enhanced negative prompt for realism/model-specific
      negativePrompt = buildEnhancedNegativePrompt({
        model: this.targetModel,
        includeAiArtifacts: this.realismMode,
        includeSkin: this.realismMode,
        includeBody: true,
      });
    } else if (this.template?.negativePrompt) {
      // Use template's negative prompt
      negativePrompt = this.template.negativePrompt;
    } else {
      // Default negative prompt
      negativePrompt = buildNegativePrompt();
    }

    // Append context-specific negatives
    if (this.additionalNegatives.length > 0) {
      negativePrompt += ', ' + this.additionalNegatives.join(', ');
    }

    return {
      prompt,
      negativePrompt,
      recommended: {
        workflow: this.template?.recommendedWorkflow || 'z-image-danrisi',
        aspectRatio: this.template?.aspectRatio || '1:1',
      },
    };
  }

  /**
   * Build with full model-specific optimization
   * Applies model-specific keywords, formatting, and parameter recommendations
   * 
   * @returns OptimizedPrompt with prompt, negativePrompt, parameters, and optimization notes
   * @example
   *   const result = builder
   *     .forModel('flux-dev')
   *     .withRealismMode(true)
   *     .buildOptimized();
   *   // result.parameters contains { steps, guidance, aspectRatio }
   *   // result.notes explains what was optimized
   */
  buildOptimized(): OptimizedPrompt {
    // First build the base prompt
    const base = this.build();

    // Then optimize for target model
    return optimizeForModel(this.targetModel, {
      prompt: base.prompt,
      negativePrompt: base.negativePrompt,
      aspectRatio: base.recommended.aspectRatio,
      realismMode: this.realismMode,
    });
  }

  /**
   * Check if current configuration is compatible with target model
   * Use before building to identify potential issues
   * 
   * @returns Compatibility result with warnings and suggestions
   */
  checkModelCompatibility(): {
    compatible: boolean;
    warnings: string[];
    suggestions: string[];
  } {
    if (this.targetModel === 'default') {
      return { compatible: true, warnings: [], suggestions: [] };
    }

    // Build prompt to check it
    const base = this.build();
    return checkModelCompatibility(this.targetModel, base.prompt);
  }

  /**
   * Get recommended parameters for the target model
   */
  getModelParameters(): {
    steps: number;
    guidance: number;
    aspectRatio: string;
  } {
    const config = getModelConfig(this.targetModel);
    return {
      steps: config.defaultSteps,
      guidance: config.defaultGuidance,
      aspectRatio: this.template?.aspectRatio || config.recommendedAspectRatios[0],
    };
  }

  /**
   * Enhance the prompt using AI (OpenRouter/Gemini/OpenAI)
   * Improves the prompt with photography techniques, realism keywords, and better descriptions.
   * 
   * @param enhancer - An AIPromptEnhancer instance (create with createOpenRouterEnhancer, createGeminiEnhancer, createOpenAIEnhancer, or createAutoEnhancer)
   * @param options - Enhancement options
   * @returns Promise with enhanced BuiltPrompt and enhancement details
   * @example
   *   // Recommended: OpenRouter (best prices, reliability, 500+ models)
   *   import { createOpenRouterEnhancer } from '@ryla/business/prompts';
   *   const enhancer = createOpenRouterEnhancer({ 
   *     apiKey: process.env.OPENROUTER_API_KEY,
   *     defaultModel: 'deepseek/deepseek-chat',
   *   });
   *   
   *   // Or use auto-detection (prefers OpenRouter if available)
   *   import { createAutoEnhancer } from '@ryla/business/prompts';
   *   const enhancer = createAutoEnhancer();
   *   
   *   const result = await builder.buildWithAI(enhancer, { strength: 0.8 });
   *   console.log(result.enhancement.changes); // What was improved
   */
  async buildWithAI(
    enhancer: AIPromptEnhancer,
    options?: {
      /** Enhancement strength 0-1 (default: 0.7) */
      strength?: number;
      /** Focus areas for enhancement */
      focus?: ('realism' | 'lighting' | 'composition' | 'details' | 'emotion')[];
    }
  ): Promise<{
    prompt: string;
    negativePrompt: string;
    recommended: { workflow: string; aspectRatio: string };
    enhancement: EnhancementResult;
  }> {
    // Build base prompt first
    const base = this.build();

    // Enhance with AI
    const enhancement = await enhancer.enhance({
      prompt: base.prompt,
      style: this.activeStylePreset,
      characterContext: this.character,
      targetModel: this.targetModel === 'default' ? undefined : this.targetModel,
      strength: options?.strength,
      focus: options?.focus,
    });

    // Merge negative prompt additions
    let negativePrompt = base.negativePrompt;
    if (enhancement.negativeAdditions.length > 0) {
      negativePrompt += ', ' + enhancement.negativeAdditions.join(', ');
    }

    return {
      prompt: enhancement.enhancedPrompt,
      negativePrompt,
      recommended: base.recommended,
      enhancement,
    };
  }

  /**
   * Validate coherence between selected prompt elements
   * Check for expression-pose conflicts, scene-outfit mismatches, etc.
   * 
   * @returns CoherenceResult with valid status, warnings, and suggestions
   * @example
   *   const result = builder.validateCoherence();
   *   if (!result.valid) {
   *     console.log('Warnings:', result.warnings);
   *     console.log('Suggestions:', result.suggestions);
   *   }
   */
  validateCoherence(): CoherenceResult {
    const input: CoherenceInput = {};

    // Map internal values to validation format
    // We use scenePath/expression/pose paths which match the validator's expected format
    if (this.scenePath) input.scene = this.scenePath;
    if (this.expression) input.expression = this.findExpressionPath();
    if (this.pose) input.pose = this.findPosePath();
    if (this.outfit) input.outfit = this.findOutfitPath();

    return validateCoherence(input);
  }

  /**
   * Get quality score for the current configuration
   * Call this AFTER build() to score the generated prompt
   * 
   * @returns PromptQualityScore with 0-100 score, grade, and suggestions
   * @example
   *   const result = builder.build();
   *   const score = builder.getQualityScore();
   *   console.log(`Quality: ${score.overall}/100 (${score.grade})`);
   */
  getQualityScore(): PromptQualityScore {
    // Build prompt to score it (if not already built, we build temporarily)
    const built = this.build();

    // Get coherence warnings count
    const coherenceResult = this.validateCoherence();

    const input: ScoringInput = {
      prompt: built.prompt,
      negativePrompt: built.negativePrompt,
      hasRealism: this.realismMode,
      hasContextEnhancement: this.contextEnhancementEnabled,
      hasStylePreset: !!this.activeStylePreset,
      hasModelTarget: this.targetModel !== 'default',
      coherenceWarnings: coherenceResult.warningCount,
      hasExpression: !!this.expression,
      hasPose: !!this.pose,
      hasLighting: !!this.lighting,
      hasScene: !!this.scene,
    };

    return scorePrompt(input);
  }

  /**
   * Get a quick quality check before full build
   * Validates coherence and returns any blocking issues
   * 
   * @returns Object with isReady, warnings, and blockers
   */
  preflightCheck(): {
    isReady: boolean;
    blockers: string[];
    warnings: string[];
  } {
    const blockers: string[] = [];
    const warnings: string[] = [];

    // Check required fields
    if (!this.character) {
      blockers.push('Character DNA is required');
    }

    // Check coherence
    const coherence = this.validateCoherence();
    for (const warning of coherence.warnings) {
      if (warning.severity === 'high') {
        blockers.push(warning.message);
      } else {
        warnings.push(warning.message);
      }
    }

    // Add suggestions as warnings
    warnings.push(...coherence.suggestions);

    return {
      isReady: blockers.length === 0,
      blockers,
      warnings: Array.from(new Set(warnings)), // Deduplicate
    };
  }

  /**
   * Find the original expression path from the resolved value
   */
  private findExpressionPath(): string | undefined {
    if (!this.expression) return undefined;

    // Search through expression options to find the path
    for (const [category, options] of Object.entries(expressionOptions)) {
      if (typeof options === 'object') {
        for (const [key, value] of Object.entries(options as Record<string, string>)) {
          if (value === this.expression) {
            return `${category}.${key}`;
          }
        }
      }
    }
    return undefined;
  }

  /**
   * Find the original pose path from the resolved value
   */
  private findPosePath(): string | undefined {
    if (!this.pose) return undefined;

    for (const [category, options] of Object.entries(poseOptions)) {
      if (typeof options === 'object') {
        for (const [key, value] of Object.entries(options as Record<string, string>)) {
          if (value === this.pose) {
            return `${category}.${key}`;
          }
        }
      }
    }
    return undefined;
  }

  /**
   * Find the original outfit path from the resolved value
   */
  private findOutfitPath(): string | undefined {
    if (!this.outfit || typeof this.outfit !== 'string') return undefined;

    for (const [category, options] of Object.entries(outfitOptions)) {
      if (typeof options === 'object') {
        for (const [key, value] of Object.entries(options as Record<string, string>)) {
          if (value === this.outfit) {
            return `${category}.${key}`;
          }
        }
      }
    }
    return undefined;
  }

  /**
   * Resolve an option path like 'indoor.cafe' to its value
   */
  private resolveOption(path: string, options: Record<string, unknown>): string {
    const parts = path.split('.');
    let current: unknown = options;

    for (const part of parts) {
      if (typeof current === 'object' && current !== null && part in current) {
        current = (current as Record<string, unknown>)[part];
      } else {
        // Path not found, return the path as a literal string
        return path;
      }
    }

    return typeof current === 'string' ? current : path;
  }
}

/**
 * Build outfit prompt string from OutfitComposition
 * Converts a multi-piece outfit composition into a prompt string
 */
export function buildOutfitPrompt(composition: OutfitComposition | null | undefined): string {
  if (!composition) return '';

  const parts: string[] = [];

  // Required pieces (top, bottom, shoes)
  if (composition.top) {
    const piece = getPieceById(composition.top);
    if (piece) parts.push(piece.label.toLowerCase());
  }
  if (composition.bottom) {
    const piece = getPieceById(composition.bottom);
    if (piece) parts.push(piece.label.toLowerCase());
  }
  if (composition.shoes) {
    const piece = getPieceById(composition.shoes);
    if (piece) parts.push(piece.label.toLowerCase());
  }

  // Optional pieces (only if not "none")
  if (composition.headwear && composition.headwear !== 'none' && composition.headwear !== 'none-headwear') {
    const piece = getPieceById(composition.headwear);
    if (piece) parts.push(`wearing ${piece.label.toLowerCase()}`);
  }
  if (composition.outerwear && composition.outerwear !== 'none' && composition.outerwear !== 'none-outerwear') {
    const piece = getPieceById(composition.outerwear);
    if (piece) parts.push(`wearing ${piece.label.toLowerCase()}`);
  }

  // Accessories (multiple)
  if (composition.accessories && composition.accessories.length > 0) {
    const accessoryLabels = composition.accessories
      .map(id => {
        const piece = getPieceById(id);
        return piece ? piece.label.toLowerCase() : id;
      })
      .join(', ');
    if (accessoryLabels) parts.push(`with ${accessoryLabels}`);
  }

  return parts.length > 0 ? `wearing ${parts.join(', ')}` : '';
}

/**
 * Quick build function for simple use cases
 */
export function buildPrompt(
  templateId: string,
  character: CharacterDNA,
  options?: {
    scene?: string;
    outfit?: string;
    lighting?: string;
    expression?: string;
  }
): BuiltPrompt {
  const builder = new PromptBuilder()
    .withCharacter(character)
    .withTemplate(templateId);

  if (options?.scene) builder.withScene(options.scene);
  if (options?.outfit) builder.withOutfit(options.outfit);
  if (options?.lighting) builder.withLighting(options.lighting);
  if (options?.expression) builder.withExpression(options.expression);

  return builder.build();
}

/**
 * Generate a random prompt for testing
 */
export function generateRandomPrompt(character: CharacterDNA): BuiltPrompt {
  const template = promptTemplates[Math.floor(Math.random() * promptTemplates.length)];

  // Collect all scenes, outfits, etc. as string arrays
  const scenes: string[] = [
    ...Object.values(sceneOptions.indoor),
    ...Object.values(sceneOptions.outdoor),
  ];
  const outfits: string[] = [
    ...Object.values(outfitOptions.casual),
    ...Object.values(outfitOptions.fashion),
  ];
  const lightings: string[] = [
    ...Object.values(lightingOptions.natural),
    ...Object.values(lightingOptions.studio),
  ];
  const expressions: string[] = [
    ...Object.values(expressionOptions.positive),
    ...Object.values(expressionOptions.neutral),
  ];

  return new PromptBuilder()
    .withCharacter(character)
    .withTemplate(template.id)
    .withScene(scenes[Math.floor(Math.random() * scenes.length)])
    .withOutfit(outfits[Math.floor(Math.random() * outfits.length)])
    .withLighting(lightings[Math.floor(Math.random() * lightings.length)])
    .withExpression(expressions[Math.floor(Math.random() * expressions.length)])
    .withStylePreset('quality')
    .build();
}

