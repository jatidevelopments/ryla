import { describe, it, expect } from 'vitest';
import { faqs, type FAQItem } from './faqs';

describe('faqs', () => {
  describe('faqs array', () => {
    it('should be defined', () => {
      expect(faqs).toBeDefined();
      expect(Array.isArray(faqs)).toBe(true);
    });

    it('should have at least one FAQ item', () => {
      expect(faqs.length).toBeGreaterThan(0);
    });

    it('should have valid FAQ items', () => {
      faqs.forEach((faq) => {
        expect(faq).toHaveProperty('question');
        expect(faq).toHaveProperty('answer');
        expect(typeof faq.question).toBe('string');
        expect(typeof faq.answer).toBe('string');
        expect(faq.question.length).toBeGreaterThan(0);
        expect(faq.answer.length).toBeGreaterThan(0);
      });
    });

    it('should match FAQItem type', () => {
      const sampleFaq: FAQItem = faqs[0];
      expect(sampleFaq).toMatchObject({
        question: expect.any(String),
        answer: expect.any(String),
      });
    });

    it('should have unique questions', () => {
      const questions = faqs.map((faq) => faq.question);
      const uniqueQuestions = new Set(questions);
      expect(uniqueQuestions.size).toBe(questions.length);
    });
  });
});
