import { describe, it, expect } from 'vitest';
import { appendHobbies } from './appendHobbies';

describe('appendHobbies', () => {
  it('should append lowercase hobbies to base prompt', () => {
    const basePrompt = 'A beautiful woman';
    const hobbies = ['Reading', 'Swimming', 'Cooking'];
    const result = appendHobbies(basePrompt, hobbies);
    // Function lowercases first letter, keeps rest as-is, no period after base prompt
    expect(result).toBe('A beautiful woman Her hobbies are reading, swimming, cooking.');
  });

  it('should return base prompt when hobbies array is empty', () => {
    const basePrompt = 'A beautiful woman';
    const result = appendHobbies(basePrompt, []);
    expect(result).toBe('A beautiful woman');
  });

  it('should return base prompt when hobbies is null', () => {
    const basePrompt = 'A beautiful woman';
    const result = appendHobbies(basePrompt, null as any);
    expect(result).toBe('A beautiful woman');
  });

  it('should handle single hobby', () => {
    const basePrompt = 'A beautiful woman';
    const result = appendHobbies(basePrompt, ['Reading']);
    // Function lowercases first letter, no period after base prompt
    expect(result).toBe('A beautiful woman Her hobbies are reading.');
  });

  it('should lowercase first letter of each hobby', () => {
    const basePrompt = 'A beautiful woman';
    const result = appendHobbies(basePrompt, ['READING', 'Swimming', 'COOKING']);
    // Function lowercases first letter, keeps rest as-is
    // READING -> r + EADING = rEADING
    // Swimming -> s + wimming = swimming
    // COOKING -> c + OOKING = cOOKING
    expect(result).toBe('A beautiful woman Her hobbies are rEADING, swimming, cOOKING.');
  });

  it('should trim base prompt before appending', () => {
    const basePrompt = '  A beautiful woman  ';
    const result = appendHobbies(basePrompt, ['Reading']);
    // Function lowercases first letter, no period after base prompt
    expect(result).toBe('A beautiful woman Her hobbies are reading.');
  });

  it('should handle hobbies with special characters', () => {
    const basePrompt = 'A beautiful woman';
    const result = appendHobbies(basePrompt, ['Rock-climbing', 'Yoga']);
    // Function lowercases first letter, no period after base prompt
    expect(result).toBe('A beautiful woman Her hobbies are rock-climbing, yoga.');
  });
});
