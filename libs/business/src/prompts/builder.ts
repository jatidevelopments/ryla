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
  PromptBuildOptions,
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
  buildNegativePrompt,
} from './categories';

/**
 * Fluent prompt builder class
 */
export class PromptBuilder {
  private character?: CharacterDNA;
  private template?: PromptTemplate;
  private scene?: string;
  private outfit?: string;
  private lighting?: string;
  private expression?: string;
  private pose?: string;
  private additionalDetails: string[] = [];
  private modifiers: string[] = [];
  private customNegative?: string;

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
    this.scene = this.resolveOption(scenePath, sceneOptions);
    return this;
  }

  /**
   * Set the outfit using dot notation (e.g., 'casual.jeans')
   */
  withOutfit(outfitPath: string): this {
    this.outfit = this.resolveOption(outfitPath, outfitOptions);
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
   * Add preset style modifier groups
   */
  withStylePreset(preset: keyof typeof styleModifiers): this {
    this.modifiers.push(...styleModifiers[preset]);
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
   */
  build(): BuiltPrompt {
    if (!this.character) {
      throw new Error('Character DNA is required. Use withCharacter() first.');
    }

    // Get template or use a default
    const templateStr = this.template?.template ||
      '{{character}}, {{outfit}}, {{scene}}, {{lighting}}, {{expression}}';

    // Build character segment
    const characterSegment = dnaToPromptSegment(this.character);

    // Replace placeholders
    let prompt = templateStr
      .replace(/\{\{character\}\}/g, characterSegment)
      .replace(/\{\{name\}\}/g, this.character.name)
      .replace(/\{\{outfit\}\}/g, this.outfit || 'casual outfit')
      .replace(/\{\{scene\}\}/g, this.scene || 'neutral background')
      .replace(/\{\{lighting\}\}/g, this.lighting || 'natural lighting')
      .replace(/\{\{expression\}\}/g, this.expression || 'natural expression')
      .replace(/\{\{pose\}\}/g, this.pose || '');

    // Add additional details
    if (this.additionalDetails.length > 0) {
      prompt += ', ' + this.additionalDetails.join(', ');
    }

    // Add modifiers
    if (this.modifiers.length > 0) {
      prompt += ', ' + this.modifiers.join(', ');
    }

    // Clean up
    prompt = prompt.replace(/,\s*,/g, ',').replace(/\s+/g, ' ').trim();

    // Build negative prompt
    const negativePrompt = this.customNegative ||
      this.template?.negativePrompt ||
      buildNegativePrompt();

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

