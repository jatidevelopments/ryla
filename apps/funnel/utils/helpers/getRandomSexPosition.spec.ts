import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getRandomSexPosition } from './getRandomSexPosition';
import { sexPositions } from '@/constants/sex-positions';

describe('getRandomSexPosition', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockRestore();
  });

  it('should return a position from sexPositions array', () => {
    const position = getRandomSexPosition();
    const values = sexPositions.map(p => p.value);
    expect(values).toContain(position);
  });

  it('should return first position when random is 0', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const position = getRandomSexPosition();
    expect(position).toBe(sexPositions[0].value);
  });

  it('should return last position when random is close to 1', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999);
    const position = getRandomSexPosition();
    const lastIndex = sexPositions.length - 1;
    expect(position).toBe(sexPositions[lastIndex].value);
  });

  it('should return different positions on different calls', () => {
    const positions = new Set();
    for (let i = 0; i < 10; i++) {
      positions.add(getRandomSexPosition());
    }
    // With 10 calls, we should get at least some variety
    expect(positions.size).toBeGreaterThan(0);
  });
});
