/**
 * AI Prompt Enhancer
 * 
 * Uses LLMs (OpenRouter, Gemini, OpenAI/GPT, or local) to enhance and improve prompts
 * for better image generation quality.
 * 
 * Features:
 * - Expand simple prompts into detailed descriptions
 * - Add realism keywords and photography techniques
 * - Suggest improvements based on the target style
 * - Maintain character consistency
 * 
 * Providers:
 * - OpenRouter (recommended): 500+ models, better prices, automatic fallback
 * - Gemini: Fast, cheap
 * - OpenAI: Reliable fallback
 * 
 * Usage:
 *   // Recommended: OpenRouter (best prices, reliability)
 *   import { createOpenRouterEnhancer } from '@ryla/business/prompts';
 *   const enhancer = createOpenRouterEnhancer({ 
 *     apiKey: process.env.OPENROUTER_API_KEY,
 *     defaultModel: 'deepseek/deepseek-chat', // Cost-optimized
 *   });
 *   
 *   // Or use auto-detection (prefers OpenRouter if available)
 *   import { createAutoEnhancer } from '@ryla/business/prompts';
 *   const enhancer = createAutoEnhancer();
 *   
 *   const result = await enhancer.enhance({
 *     prompt: "A woman in a coffee shop",
 *     style: "ultraRealistic",
 *     characterContext: characterDNA,
 *   });
 */

import { CharacterDNA } from './types';
import { StylePresetType, stylePresets } from './categories';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Enhancement request configuration
 */
export interface EnhancementRequest {
  /** The original prompt to enhance */
  prompt: string;
  /** Target style preset */
  style?: StylePresetType;
  /** Character context for consistency */
  characterContext?: CharacterDNA;
  /** Target AI model (affects output style) */
  targetModel?: 'flux-dev' | 'z-image-turbo' | 'sdxl';
  /** Enhancement strength (0.0 - 1.0) */
  strength?: number;
  /** Specific aspects to focus on */
  focus?: ('realism' | 'lighting' | 'composition' | 'details' | 'emotion' | 'character')[];
  /** Maximum output length (approximate) */
  maxLength?: number;
  /** Use wizard-specific character creation enhancement (focuses on unique character creation) */
  isWizard?: boolean;
}

/**
 * Enhancement result
 */
export interface EnhancementResult {
  /** Enhanced prompt */
  enhancedPrompt: string;
  /** Suggested negative prompt additions */
  negativeAdditions: string[];
  /** Explanation of changes */
  changes: string[];
  /** Confidence score (0-1) */
  confidence: number;
  /** Original prompt for reference */
  originalPrompt: string;
  /** Tokens/characters used */
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

/**
 * AI Provider interface - implement this for different LLM providers
 */
export interface AIProvider {
  /** Provider name */
  name: string;
  /** Check if the provider is available/configured */
  isAvailable(): boolean;
  /** Generate a completion */
  complete(prompt: string, options?: {
    maxTokens?: number;
    temperature?: number;
  }): Promise<{
    text: string;
    usage?: { inputTokens: number; outputTokens: number };
  }>;
}

// =============================================================================
// SYSTEM PROMPTS
// =============================================================================

const ENHANCER_SYSTEM_PROMPT = `You are an expert AI image prompt engineer specializing in photorealistic AI influencer images.

Your task is to enhance prompts to produce high-quality, realistic images that look like authentic photographs.

Key principles for Photorealism:
1. SUBJECT & ANATOMY: Start with the subject (age, ethnicity, features). Preserve slight natural asymmetries. Ensure gravity-based compression on soft tissue and realistic muscle definition.
2. CAMERA & OPTICS: Use high-end specs: "Shot on Fujifilm GFX 100S, 80mm prime lens, f/2.8". Include "shallow depth of field", "sharp focus on eyes", and "natural background bokeh".
3. LIGHTING: Use "high-key butterfly lighting", "large softboxes", and "subsurface scattering". Avoid artificial rim light, bloom, or glow.
4. MICRO-TEXTURES: Mention individual hair strands, pores, fine wrinkles, follicles, and tear-film reflections. Include "wet mucosa" and "subdermal depth".
5. AVOID AI CLICHÉS: Never use "perfect", "flawless", "porcelain", or "beauty filter".
6. CANDID FEEL: Focus on authentic, candid moments and natural skin imperfections.
7. IDENTITY PRESERVATION: Enforce strict facial identity preservation, bone structure consistency, and avoid beautification bias or softened morphology.

Format your response as JSON:
{
  "enhancedPrompt": "the improved prompt incorporating specific optics and micro-details",
  "negativeAdditions": ["anime", "cartoon", "cgi", "plastic skin", "airbrushed", "waxy", "smooth polygons", "excessive smoothing"],
  "changes": ["explanation of changes"],
  "confidence": 0.85
}`;

const WIZARD_CHARACTER_CREATION_SYSTEM_PROMPT = `You are an expert AI character creation specialist. Your task is to transform a minimal character description into a detailed, unique character prompt for AI image generation.

Your goal is to create a DISTINCT, MEMORABLE character that stands out - not a generic AI-generated person.

Key principles:
1. CHARACTER UNIQUENESS: Add specific, distinguishing features that make this character memorable and unique
2. EXPAND MINIMAL INPUT: Transform brief descriptions into rich, detailed character portraits
3. PHYSICAL DETAILS: Add specific facial structure, skin tone, hair texture, body proportions, unique features
4. PERSONALITY IN APPEARANCE: Include details that reflect personality (confident posture, friendly expression, style choices)
5. REALISTIC IMPERFECTIONS: Include subtle natural features (freckles, beauty marks, natural skin texture) - avoid "perfect" or "flawless"
6. QUALITY KEYWORDS: Always include "8K hyper-realistic, ultra-detailed, professional photography" for best results
7. PRESERVE USER VISION: Keep the user's core description intact while expanding it

CRITICAL: Focus on creating a UNIQUE CHARACTER, not a generic person. Add distinguishing features, specific details, and personality markers that make this character stand out.

Format your response as JSON:
{
  "enhancedPrompt": "the detailed, unique character description with quality keywords",
  "negativeAdditions": ["terms to add to negative prompt"],
  "changes": ["explanation of character enhancements"],
  "confidence": 0.85
}`;

const STYLE_INSTRUCTIONS: Record<StylePresetType, string> = {
  quality: 'Focus on technical quality: sharp focus, good lighting, high resolution.',
  ultraRealistic: 'Maximum realism: smartphone aesthetic, natural skin texture, candid moment feel, avoid any AI artifacts.',
  instagramReady: 'Instagram influencer aesthetic: trendy, well-lit, lifestyle photography, authentic but polished.',
  editorialFashion: 'High fashion editorial: dramatic lighting, magazine quality, artistic composition, professional retouching.',
  casualSelfie: 'Everyday selfie: casual, natural, smartphone quality, genuine expression, relaxed setting.',
  professionalPortrait: 'Professional headshot: studio lighting, business attire, confident expression, clean background.',
};

// =============================================================================
// AI PROMPT ENHANCER CLASS
// =============================================================================

/**
 * AI Prompt Enhancer
 * 
 * Enhances prompts using LLM providers for better image generation.
 */
export class AIPromptEnhancer {
  constructor(
    private provider: AIProvider,
    private options: {
      /** Default style if not specified */
      defaultStyle?: StylePresetType;
      /** Default temperature for completions */
      temperature?: number;
      /** Enable caching of results */
      enableCache?: boolean;
    } = {}
  ) { }

  /**
   * Check if the enhancer is available
   */
  isAvailable(): boolean {
    return this.provider.isAvailable();
  }

  /**
   * Enhance a prompt using AI
   */
  async enhance(request: EnhancementRequest & { isWizard?: boolean }): Promise<EnhancementResult> {
    if (!this.isAvailable()) {
      // Return passthrough result if provider not available
      return {
        enhancedPrompt: request.prompt,
        negativeAdditions: [],
        changes: ['AI enhancement unavailable - using original prompt'],
        confidence: 0,
        originalPrompt: request.prompt,
      };
    }

    const style = request.style || this.options.defaultStyle || 'quality';
    const strength = request.strength ?? 0.7;
    const isWizard = request.isWizard ?? false;

    // Use wizard-specific system prompt for character creation
    const systemPrompt = isWizard ? WIZARD_CHARACTER_CREATION_SYSTEM_PROMPT : ENHANCER_SYSTEM_PROMPT;

    // Build the enhancement prompt
    const userPrompt = this.buildUserPrompt(request, style, strength, isWizard);

    try {
      const response = await this.provider.complete(
        `${systemPrompt}\n\n${userPrompt}`,
        {
          maxTokens: request.maxLength ? Math.ceil(request.maxLength * 1.5) : 500,
          temperature: this.options.temperature ?? 0.7,
        }
      );

      // Parse the JSON response
      const result = this.parseResponse(response.text, request.prompt);

      return {
        ...result,
        originalPrompt: request.prompt,
        usage: response.usage,
      };
    } catch (error) {
      // Graceful fallback
      console.error('AI enhancement failed:', error);
      return {
        enhancedPrompt: request.prompt,
        negativeAdditions: [],
        changes: [`Enhancement failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        confidence: 0,
        originalPrompt: request.prompt,
      };
    }
  }

  /**
   * Build the user prompt for the LLM
   */
  private buildUserPrompt(
    request: EnhancementRequest,
    style: StylePresetType,
    strength: number,
    isWizard: boolean = false
  ): string {
    const parts: string[] = [];

    if (isWizard) {
      // Wizard-specific prompt building - focus on character creation
      // Apply reasoning-first pattern for deeper, more specific character generation
      parts.push(`ORIGINAL USER INPUT (minimal description):\n"${request.prompt}"`);
      parts.push(`\nBefore enhancing, reason through this character step by step:`);
      parts.push(`UNDERSTAND: What is the user's core vision for this character? What should this character enable or represent?`);
      parts.push(`ANALYZE: What physical features (facial structure, skin tone, hair texture, body proportions), personality traits, and unique distinguishing elements matter most?`);
      parts.push(`REASON: How do these elements interact to create a memorable, realistic character? What makes this character distinct from generic AI-generated images?`);
      parts.push(`SYNTHESIZE: What specific details will make this character feel like a real, unique person with personality?`);
      parts.push(`CONCLUDE: What is the most effective enhancement approach that preserves the user's vision while adding depth?`);
      parts.push(`\nNow enhance the prompt with this reasoning in mind:`);
      parts.push(`1. Expand this minimal description into a rich, detailed character portrait`);
      parts.push(`2. Add specific physical features (facial structure, skin tone, hair texture, body proportions)`);
      parts.push(`3. Include personality traits that show in appearance (confident posture, friendly expression, etc.)`);
      parts.push(`4. Add unique distinguishing features to make this character memorable and distinct`);
      parts.push(`5. Ensure the character feels like a real, unique person - not generic or AI-generated`);
      parts.push(`6. Focus on creating a character that stands out and has personality`);
      parts.push(`\nIMPORTANT:`);
      parts.push(`- Keep the user's core vision intact`);
      parts.push(`- Add details that make the character unique and memorable`);
      parts.push(`- Use natural, realistic descriptions (avoid "perfect" or "flawless")`);
      parts.push(`- Include subtle imperfections that make characters feel real`);
      parts.push(`- Always include quality keywords: "8K hyper-realistic, ultra-detailed, professional photography"`);
    } else {
      // Standard enhancement prompt
      parts.push(`ORIGINAL PROMPT:\n"${request.prompt}"`);
      parts.push(`\nTARGET STYLE: ${style}`);
      parts.push(STYLE_INSTRUCTIONS[style]);
    }

    if (request.characterContext) {
      const dna = request.characterContext;
      parts.push(`\nCHARACTER CONTEXT:`);
      parts.push(`- Name: ${dna.name}`);
      if (dna.age) parts.push(`- Age: ${dna.age}`);
      if (dna.ethnicity) parts.push(`- Ethnicity: ${dna.ethnicity}`);
      if (dna.hair) parts.push(`- Hair: ${dna.hair}`);
      if (dna.eyes) parts.push(`- Eyes: ${dna.eyes}`);
      if (dna.skin) parts.push(`- Skin: ${dna.skin}`);
      if (dna.bodyType) parts.push(`- Body Type: ${dna.bodyType}`);
      parts.push(`\nMaintain consistency with this character description.`);
    }

    if (request.targetModel) {
      parts.push(`\nTARGET MODEL: ${request.targetModel}`);
      if (request.targetModel === 'flux-dev') {
        parts.push('Optimize for photorealism and detail. Use natural language descriptions.');
      } else if (request.targetModel === 'z-image-turbo') {
        parts.push('Keep prompt concise but descriptive. Focus on key visual elements.');
      }
    }

    if (request.focus && request.focus.length > 0) {
      parts.push(`\nFOCUS AREAS: ${request.focus.join(', ')}`);
    }

    parts.push(`\nENHANCEMENT STRENGTH: ${Math.round(strength * 100)}%`);
    if (strength < 0.3) {
      parts.push('Make minimal changes - just fix obvious issues.');
    } else if (strength < 0.6) {
      parts.push('Make moderate improvements while preserving the original intent.');
    } else {
      parts.push('Significantly enhance with rich detail and photography techniques.');
    }

    parts.push('\nProvide your response as valid JSON.');

    return parts.join('\n');
  }

  /**
   * Parse the LLM response
   */
  private parseResponse(
    text: string,
    originalPrompt: string
  ): Omit<EnhancementResult, 'originalPrompt' | 'usage'> {
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          enhancedPrompt: parsed.enhancedPrompt || originalPrompt,
          negativeAdditions: parsed.negativeAdditions || [],
          changes: parsed.changes || [],
          confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
        };
      }
    } catch {
      // JSON parsing failed
    }

    // Fallback: use the text as the enhanced prompt
    return {
      enhancedPrompt: text.trim() || originalPrompt,
      negativeAdditions: [],
      changes: ['Response format was unexpected'],
      confidence: 0.3,
    };
  }

  /**
   * Quick enhance with sensible defaults
   */
  async quickEnhance(
    prompt: string,
    style: StylePresetType = 'ultraRealistic'
  ): Promise<string> {
    const result = await this.enhance({ prompt, style });
    return result.enhancedPrompt;
  }
}

// =============================================================================
// PROVIDER IMPLEMENTATIONS
// =============================================================================

/**
 * Gemini API Provider
 */
export class GeminiProvider implements AIProvider {
  name = 'gemini';
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(config: {
    apiKey: string;
    model?: string;
    baseUrl?: string;
  }) {
    this.apiKey = config.apiKey;
    this.model = config.model || 'gemini-1.5-flash';
    this.baseUrl = config.baseUrl || 'https://generativelanguage.googleapis.com/v1beta';
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async complete(prompt: string, options?: {
    maxTokens?: number;
    temperature?: number;
  }): Promise<{ text: string; usage?: { inputTokens: number; outputTokens: number } }> {
    const response = await fetch(
      `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: options?.maxTokens || 500,
            temperature: options?.temperature || 0.7,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return {
      text,
      usage: data.usageMetadata ? {
        inputTokens: data.usageMetadata.promptTokenCount || 0,
        outputTokens: data.usageMetadata.candidatesTokenCount || 0,
      } : undefined,
    };
  }
}

/**
 * OpenAI API Provider
 */
export class OpenAIProvider implements AIProvider {
  name = 'openai';
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(config: {
    apiKey: string;
    model?: string;
    baseUrl?: string;
  }) {
    this.apiKey = config.apiKey;
    this.model = config.model || 'gpt-4o-mini';
    this.baseUrl = config.baseUrl || 'https://api.openai.com/v1';
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async complete(prompt: string, options?: {
    maxTokens?: number;
    temperature?: number;
  }): Promise<{ text: string; usage?: { inputTokens: number; outputTokens: number } }> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options?.maxTokens || 500,
        temperature: options?.temperature || 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';

    return {
      text,
      usage: data.usage ? {
        inputTokens: data.usage.prompt_tokens || 0,
        outputTokens: data.usage.completion_tokens || 0,
      } : undefined,
    };
  }
}

/**
 * OpenRouter API Provider
 * 
 * Unified interface for 500+ LLM models across 60+ providers.
 * Provides better prices, better uptime, and automatic fallback.
 * 
 * @see https://openrouter.ai/
 */
export class OpenRouterProvider implements AIProvider {
  name = 'openrouter';
  private apiKey: string;
  private defaultModel: string;
  private baseUrl: string;
  private httpReferer?: string;
  private appTitle?: string;

  constructor(config: {
    apiKey: string;
    defaultModel?: string;
    baseUrl?: string;
    httpReferer?: string;
    appTitle?: string;
  }) {
    this.apiKey = config.apiKey;
    this.defaultModel = config.defaultModel || 'openai/gpt-4o-mini';
    this.baseUrl = config.baseUrl || 'https://openrouter.ai/api/v1';
    this.httpReferer = config.httpReferer;
    this.appTitle = config.appTitle;
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async complete(prompt: string, options?: {
    maxTokens?: number;
    temperature?: number;
    model?: string; // Override default model
  }): Promise<{ text: string; usage?: { inputTokens: number; outputTokens: number } }> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
    };

    // Optional headers for analytics (OpenRouter best practice)
    if (this.httpReferer) {
      headers['HTTP-Referer'] = this.httpReferer;
    }
    if (this.appTitle) {
      headers['X-Title'] = this.appTitle;
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: options?.model || this.defaultModel,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options?.maxTokens || 500,
        temperature: options?.temperature || 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';

    return {
      text,
      usage: data.usage ? {
        inputTokens: data.usage.prompt_tokens || 0,
        outputTokens: data.usage.completion_tokens || 0,
      } : undefined,
    };
  }
}

/**
 * Mock provider for testing (no API calls)
 */
export class MockAIProvider implements AIProvider {
  name = 'mock';

  isAvailable(): boolean {
    return true;
  }

  async complete(prompt: string): Promise<{ text: string }> {
    // Extract the original prompt from the input
    const match = prompt.match(/ORIGINAL PROMPT:\n"([^"]+)"/);
    const original = match ? match[1] : 'A beautiful woman';

    // Return a mocked enhancement
    return {
      text: JSON.stringify({
        enhancedPrompt: `${original}, photographed with a smartphone camera, natural skin texture with visible pores, candid moment, soft natural lighting, shallow depth of field, authentic Instagram aesthetic, high resolution`,
        negativeAdditions: ['airbrushed', 'plastic skin', 'uncanny valley'],
        changes: [
          'Added smartphone photography aesthetic',
          'Included natural skin texture details',
          'Added candid moment feel',
        ],
        confidence: 0.85,
      }),
    };
  }
}

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

/**
 * Create a Gemini-powered enhancer
 */
export function createGeminiEnhancer(config: {
  apiKey: string;
  model?: string;
  defaultStyle?: StylePresetType;
}): AIPromptEnhancer {
  return new AIPromptEnhancer(
    new GeminiProvider({ apiKey: config.apiKey, model: config.model }),
    { defaultStyle: config.defaultStyle }
  );
}

/**
 * Create an OpenAI-powered enhancer
 */
export function createOpenAIEnhancer(config: {
  apiKey: string;
  model?: string;
  defaultStyle?: StylePresetType;
}): AIPromptEnhancer {
  return new AIPromptEnhancer(
    new OpenAIProvider({ apiKey: config.apiKey, model: config.model }),
    { defaultStyle: config.defaultStyle }
  );
}

/**
 * Create an OpenRouter-powered enhancer
 * 
 * Provides access to 500+ models across 60+ providers with better prices
 * and automatic fallback. Recommended for production use.
 * 
 * @example
 *   const enhancer = createOpenRouterEnhancer({
 *     apiKey: process.env.OPENROUTER_API_KEY,
 *     defaultModel: 'deepseek/deepseek-chat', // Cheaper alternative
 *   });
 */
export function createOpenRouterEnhancer(config: {
  apiKey: string;
  defaultModel?: string;
  defaultStyle?: StylePresetType;
  httpReferer?: string;
  appTitle?: string;
}): AIPromptEnhancer {
  return new AIPromptEnhancer(
    new OpenRouterProvider({
      apiKey: config.apiKey,
      defaultModel: config.defaultModel,
      httpReferer: config.httpReferer,
      appTitle: config.appTitle,
    }),
    { defaultStyle: config.defaultStyle }
  );
}

/**
 * Create a mock enhancer for testing
 */
export function createMockEnhancer(): AIPromptEnhancer {
  return new AIPromptEnhancer(new MockAIProvider());
}

/**
 * Auto-detect and create the best available enhancer
 * Checks for API keys in environment variables
 * 
 * Priority order:
 * 1. OpenRouter (best prices, reliability, 500+ models)
 * 2. Gemini (fast, cheap)
 * 3. OpenAI (reliable fallback)
 * 4. Mock (testing only)
 */
export function createAutoEnhancer(env?: {
  OPENROUTER_API_KEY?: string;
  GEMINI_API_KEY?: string;
  OPENAI_API_KEY?: string;
  OPENROUTER_DEFAULT_MODEL?: string;
}): AIPromptEnhancer {
  const openrouterKey = env?.['OPENROUTER_API_KEY'] || (typeof process !== 'undefined' ? process.env?.['OPENROUTER_API_KEY'] : undefined);
  const geminiKey = env?.['GEMINI_API_KEY'] || (typeof process !== 'undefined' ? process.env?.['GEMINI_API_KEY'] : undefined);
  const openaiKey = env?.['OPENAI_API_KEY'] || (typeof process !== 'undefined' ? process.env?.['OPENAI_API_KEY'] : undefined);
  const openrouterModel = env?.['OPENROUTER_DEFAULT_MODEL'] || (typeof process !== 'undefined' ? process.env?.['OPENROUTER_DEFAULT_MODEL'] : undefined);

  // Prefer OpenRouter (best prices, reliability, automatic fallback)
  if (openrouterKey) {
    return createOpenRouterEnhancer({
      apiKey: openrouterKey,
      defaultModel: openrouterModel,
      httpReferer: typeof window !== 'undefined' ? window.location.origin : 'https://ryla.ai',
      appTitle: 'RYLA AI Influencer Platform',
    });
  }

  // Fallback to Gemini (faster, cheaper for this use case)
  if (geminiKey) {
    return createGeminiEnhancer({ apiKey: geminiKey });
  }

  // Fallback to OpenAI
  if (openaiKey) {
    return createOpenAIEnhancer({ apiKey: openaiKey });
  }

  // Fallback to mock
  console.warn('No AI API key found, using mock enhancer');
  return createMockEnhancer();
}

