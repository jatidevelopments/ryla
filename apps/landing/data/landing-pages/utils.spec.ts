import { describe, it, expect } from 'vitest';
import {
  getLandingPageContent,
  loadLandingPageContent,
  validateLandingPageContent,
  mergeLandingPageContent,
} from './utils';
import type { LandingPageContent } from './types';

describe('landing-pages/utils', () => {
  describe('getLandingPageContent', () => {
    it('should return null for unknown pageId', () => {
      expect(getLandingPageContent('unknown-page')).toBeNull();
    });

    it('should return null for empty pageId', () => {
      expect(getLandingPageContent('')).toBeNull();
    });

    it('should handle invalid pageId gracefully', () => {
      expect(getLandingPageContent('invalid')).toBeNull();
    });
  });

  describe('loadLandingPageContent', () => {
    it('should return a promise', async () => {
      const result = loadLandingPageContent('test');
      expect(result).toBeInstanceOf(Promise);
    });

    it('should return null for unknown pageId', async () => {
      const result = await loadLandingPageContent('unknown-page');
      expect(result).toBeNull();
    });
  });

  describe('validateLandingPageContent', () => {
    it('should return false for null', () => {
      expect(validateLandingPageContent(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(validateLandingPageContent(undefined)).toBe(false);
    });

    it('should return false for non-object', () => {
      expect(validateLandingPageContent('string')).toBe(false);
      expect(validateLandingPageContent(123)).toBe(false);
      expect(validateLandingPageContent([])).toBe(false);
    });

    it('should return false for missing id', () => {
      expect(validateLandingPageContent({ title: 'Test' })).toBe(false);
    });

    it('should return false for invalid id type', () => {
      expect(validateLandingPageContent({ id: 123 })).toBe(false);
    });

    it('should return false for missing title', () => {
      expect(validateLandingPageContent({ id: 'test' })).toBe(false);
    });

    it('should return false for invalid title type', () => {
      expect(validateLandingPageContent({ id: 'test', title: 123 })).toBe(false);
    });

    it('should return false for missing header', () => {
      expect(validateLandingPageContent({ id: 'test', title: 'Test' })).toBe(false);
    });

    it('should return false for invalid header type', () => {
      expect(validateLandingPageContent({ id: 'test', title: 'Test', header: 'invalid' })).toBe(false);
    });

    it('should return false for missing sections', () => {
      expect(validateLandingPageContent({ id: 'test', title: 'Test', header: {} })).toBe(false);
    });

    it('should return false for invalid sections type', () => {
      expect(validateLandingPageContent({ id: 'test', title: 'Test', header: {}, sections: 'invalid' })).toBe(false);
    });

    it('should return true for valid content', () => {
      const validContent: LandingPageContent = {
        id: 'test',
        title: 'Test',
        header: {
          title: 'Test',
          gradient: 'test',
          navigation: [],
          cta: { text: 'Test', href: '/test' },
        },
        sections: [],
      };
      expect(validateLandingPageContent(validContent)).toBe(true);
    });
  });

  describe('mergeLandingPageContent', () => {
    it('should merge default and page content', () => {
      const defaultContent: Partial<LandingPageContent> = {
        id: 'default',
        title: 'Default',
        header: {
          title: 'Default',
          gradient: 'default',
          navigation: [{ label: 'Home', href: '/' }],
          cta: { text: 'Default', href: '/default' },
        },
      };

      const pageContent: LandingPageContent = {
        id: 'page',
        title: 'Page',
        header: {
          title: 'Page',
          gradient: 'page',
          navigation: [{ label: 'About', href: '/about' }],
          cta: { text: 'Page', href: '/page' },
        },
        sections: [
          {
            component: 'Hero',
            content: { headline: 'Page Hero' },
          },
        ],
      };

      const merged = mergeLandingPageContent(defaultContent, pageContent);

      expect(merged.id).toBe('page');
      expect(merged.title).toBe('Page');
      expect(merged.header.title).toBe('Page');
      expect(merged.header.gradient).toBe('page');
      expect(merged.sections).toHaveLength(1);
    });

    it('should handle empty default content', () => {
      const pageContent: LandingPageContent = {
        id: 'page',
        title: 'Page',
        header: {
          title: 'Page',
          gradient: 'page',
          navigation: [],
          cta: { text: 'Page', href: '/page' },
        },
        sections: [],
      };

      const merged = mergeLandingPageContent({}, pageContent);
      expect(merged).toEqual(pageContent);
    });

    it('should merge section content', () => {
      const defaultContent: Partial<LandingPageContent> = {
        sections: [
          {
            component: 'Hero',
            content: { defaultProp: 'default' },
          },
        ],
      };

      const pageContent: LandingPageContent = {
        id: 'page',
        title: 'Page',
        header: {
          title: 'Page',
          gradient: 'page',
          navigation: [],
          cta: { text: 'Page', href: '/page' },
        },
        sections: [
          {
            component: 'Hero',
            content: { pageProp: 'page' },
          },
        ],
      };

      const merged = mergeLandingPageContent(defaultContent, pageContent);
      expect(merged.sections[0].content).toEqual({
        defaultProp: 'default',
        pageProp: 'page',
      });
    });
  });
});
