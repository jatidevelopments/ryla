import { describe, it, expect } from 'vitest';
import { stepNameToStepId, stepIdToStepName } from './stepMapping';

describe('stepMapping', () => {
  describe('stepNameToStepId', () => {
    it('should convert step name to kebab-case', () => {
      expect(stepNameToStepId('Choose Creation Method')).toBe('choose-creation-method');
    });

    it('should handle single word', () => {
      expect(stepNameToStepId('Welcome')).toBe('welcome');
    });

    it('should remove special characters', () => {
      expect(stepNameToStepId('Step 1: Introduction!')).toBe('step-1-introduction');
    });

    it('should handle multiple spaces', () => {
      expect(stepNameToStepId('Step    Name')).toBe('step-name');
    });

    it('should handle leading/trailing spaces', () => {
      expect(stepNameToStepId('  Step Name  ')).toBe('step-name');
    });

    it('should handle multiple hyphens', () => {
      expect(stepNameToStepId('Step---Name')).toBe('step-name');
    });

    it('should handle empty string', () => {
      expect(stepNameToStepId('')).toBe('');
    });
  });

  describe('stepIdToStepName', () => {
    it('should convert step ID to title case', () => {
      expect(stepIdToStepName('choose-creation-method')).toBe('Choose Creation Method');
    });

    it('should handle single word', () => {
      expect(stepIdToStepName('welcome')).toBe('Welcome');
    });

    it('should handle multiple hyphens', () => {
      expect(stepIdToStepName('step-name-test')).toBe('Step Name Test');
    });

    it('should handle empty string', () => {
      expect(stepIdToStepName('')).toBe('');
    });

    it('should round-trip conversion', () => {
      const original = 'Choose Creation Method';
      const stepId = stepNameToStepId(original);
      const converted = stepIdToStepName(stepId);
      expect(converted).toBe(original);
    });
  });
});
