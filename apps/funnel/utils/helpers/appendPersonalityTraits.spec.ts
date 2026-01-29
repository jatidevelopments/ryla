import { describe, it, expect } from 'vitest';
import { appendPersonalityTraits } from './appendPersonalityTraits';

describe('appendPersonalityTraits', () => {
  it('should append capitalized traits to base prompt', () => {
    const basePrompt = 'A beautiful woman';
    const traits = ['kind', 'funny', 'smart'];
    const result = appendPersonalityTraits(basePrompt, traits);
    // Function capitalizes first letter, keeps rest as-is, no period after base prompt
    expect(result).toBe('A beautiful woman She is Kind, Funny, Smart.');
  });

  it('should return base prompt when traits array is empty', () => {
    const basePrompt = 'A beautiful woman';
    const result = appendPersonalityTraits(basePrompt, []);
    expect(result).toBe('A beautiful woman');
  });

  it('should return base prompt when traits is null', () => {
    const basePrompt = 'A beautiful woman';
    const result = appendPersonalityTraits(basePrompt, null as any);
    expect(result).toBe('A beautiful woman');
  });

  it('should handle single trait', () => {
    const basePrompt = 'A beautiful woman';
    const result = appendPersonalityTraits(basePrompt, ['kind']);
    // No period after base prompt
    expect(result).toBe('A beautiful woman She is Kind.');
  });

  it('should capitalize first letter of each trait', () => {
    const basePrompt = 'A beautiful woman';
    const result = appendPersonalityTraits(basePrompt, ['KIND', 'funny', 'SMART']);
    // Function capitalizes first letter, keeps rest as-is
    // KIND -> K + IND = KIND (first letter already uppercase)
    // funny -> F + unny = Funny
    // SMART -> S + MART = SMART (first letter already uppercase)
    // No period after base prompt
    expect(result).toBe('A beautiful woman She is KIND, Funny, SMART.');
  });

  it('should trim base prompt before appending', () => {
    const basePrompt = '  A beautiful woman  ';
    const result = appendPersonalityTraits(basePrompt, ['kind']);
    // No period after base prompt
    expect(result).toBe('A beautiful woman She is Kind.');
  });

  it('should handle traits with special characters', () => {
    const basePrompt = 'A beautiful woman';
    const result = appendPersonalityTraits(basePrompt, ['kind-hearted', 'fun-loving']);
    // No period after base prompt
    expect(result).toBe('A beautiful woman She is Kind-hearted, Fun-loving.');
  });
});
