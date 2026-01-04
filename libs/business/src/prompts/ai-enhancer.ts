/**
 * AI Prompt Enhancer
 * 
 * Uses LLMs (Gemini, OpenAI/GPT, or local) to enhance and improve prompts
 * for better image generation quality.
 * 
 * Features:
 * - Expand simple prompts into detailed descriptions
 * - Add realism keywords and photography techniques
 * - Suggest improvements based on the target style
 * - Maintain character consistency
 * 
 * Usage:
 *   import { AIPromptEnhancer, createGeminiEnhancer } from '@ryla/business/prompts';
 *   
 *   const enhancer = createGeminiEnhancer({ apiKey: process.env.GEMINI_API_KEY });
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
  focus?: ('realism' | 'lighting' | 'composition' | 'details' | 'emotion')[];
  /** Maximum output length (approximate) */
  maxLength?: number;
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

Your task is to enhance prompts to produce high-quality, realistic images that look like authentic photographs rather than AI-generated content.

Key principles:
1. SUBJECT FIRST: Always start with the subject description (age, ethnicity, features)
2. NATURAL IMPERFECTIONS: Include subtle skin texture, pores, natural lighting
3. PHOTOGRAPHY TERMS: Use real photography terminology (shallow DOF, bokeh, etc.)
4. AVOID AI CLICHÉS: Never use "perfect", "flawless", "porcelain" - these create fake-looking images
5. CONTEXT MATCHING: Ensure outfit, pose, and expression match the scene
6. CANDID FEEL: Prefer natural, candid moments over posed studio shots

Format your response as JSON:
{
  "enhancedPrompt": "the improved prompt",
  "negativeAdditions": ["terms to add to negative prompt"],
  "changes": ["explanation of each major change"],
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
  ) {}

  /**
   * Check if the enhancer is available
   */
  isAvailable(): boolean {
    return this.provider.isAvailable();
  }

  /**
   * Enhance a prompt using AI
   */
  async enhance(request: EnhancementRequest): Promise<EnhancementResult> {
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

    // Build the enhancement prompt
    const userPrompt = this.buildUserPrompt(request, style, strength);

    try {
      const response = await this.provider.complete(
        `${ENHANCER_SYSTEM_PROMPT}\n\n${userPrompt}`,
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
    strength: number
  ): string {
    const parts: string[] = [];

    parts.push(`ORIGINAL PROMPT:\n"${request.prompt}"`);
    parts.push(`\nTARGET STYLE: ${style}`);
    parts.push(STYLE_INSTRUCTIONS[style]);

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
 * Create a mock enhancer for testing
 */
export function createMockEnhancer(): AIPromptEnhancer {
  return new AIPromptEnhancer(new MockAIProvider());
}

/**
 * Auto-detect and create the best available enhancer
 * Checks for API keys in environment variables
 */
export function createAutoEnhancer(env?: {
  GEMINI_API_KEY?: string;
  OPENAI_API_KEY?: string;
}): AIPromptEnhancer {
  const geminiKey = env?.GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : undefined);
  const openaiKey = env?.OPENAI_API_KEY || (typeof process !== 'undefined' ? process.env?.OPENAI_API_KEY : undefined);

  // Prefer Gemini (faster, cheaper for this use case)
  if (geminiKey) {
    return createGeminiEnhancer({ apiKey: geminiKey });
  }

  if (openaiKey) {
    return createOpenAIEnhancer({ apiKey: openaiKey });
  }

  // Fallback to mock
  console.warn('No AI API key found, using mock enhancer');
  return createMockEnhancer();
}

