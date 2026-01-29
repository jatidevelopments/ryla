import { describe, it, expect } from 'vitest';
import * as landingPages from './index';

describe('landing-pages/index', () => {
  it('should export types', () => {
    expect(landingPages).toHaveProperty('loadLandingPageContent');
    expect(landingPages).toHaveProperty('validateLandingPageContent');
    expect(landingPages).toHaveProperty('mergeLandingPageContent');
  });

  it('should export functions', () => {
    expect(typeof landingPages.loadLandingPageContent).toBe('function');
    expect(typeof landingPages.validateLandingPageContent).toBe('function');
    expect(typeof landingPages.mergeLandingPageContent).toBe('function');
  });
});
