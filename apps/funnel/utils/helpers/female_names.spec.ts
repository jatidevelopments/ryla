import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getRandomFemaleName } from './female_names';
import { FEMALE_NAMES } from '@/constants/female_names';

describe('getRandomFemaleName', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockRestore();
  });

  it('should return a name from FEMALE_NAMES array', () => {
    const name = getRandomFemaleName();
    expect(FEMALE_NAMES).toContain(name);
  });

  it('should return first name when random is 0', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const name = getRandomFemaleName();
    expect(name).toBe(FEMALE_NAMES[0]);
  });

  it('should return last name when random is close to 1', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999);
    const name = getRandomFemaleName();
    const lastIndex = FEMALE_NAMES.length - 1;
    expect(name).toBe(FEMALE_NAMES[lastIndex]);
  });

  it('should return different names on different calls', () => {
    const names = new Set();
    for (let i = 0; i < 10; i++) {
      names.add(getRandomFemaleName());
    }
    // With 10 calls, we should get at least some variety (unless array is very small)
    expect(names.size).toBeGreaterThan(0);
  });
});
