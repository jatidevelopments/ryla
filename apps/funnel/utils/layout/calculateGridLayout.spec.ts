import { describe, it, expect } from 'vitest';
import { calculateGridLayout, getGridColumnsClass } from './calculateGridLayout';

describe('calculateGridLayout', () => {
  it('should return 1x1 for 0 or negative items', () => {
    expect(calculateGridLayout(0)).toEqual({ columns: 1, rows: 1 });
    expect(calculateGridLayout(-1)).toEqual({ columns: 1, rows: 1 });
  });

  it('should return 1x1 for 1 item', () => {
    expect(calculateGridLayout(1)).toEqual({ columns: 1, rows: 1 });
  });

  it('should return 2x1 for 2 items', () => {
    expect(calculateGridLayout(2)).toEqual({ columns: 2, rows: 1 });
  });

  it('should return 3x1 for 3 items', () => {
    expect(calculateGridLayout(3)).toEqual({ columns: 3, rows: 1 });
  });

  it('should return 2x2 for 4 items', () => {
    expect(calculateGridLayout(4)).toEqual({ columns: 2, rows: 2 });
  });

  it('should return 3x2 for 5 items', () => {
    expect(calculateGridLayout(5)).toEqual({ columns: 3, rows: 2 });
  });

  it('should return 3x2 for 6 items', () => {
    expect(calculateGridLayout(6)).toEqual({ columns: 3, rows: 2 });
  });

  it('should return 3x3 for 7 items', () => {
    expect(calculateGridLayout(7)).toEqual({ columns: 3, rows: 3 });
  });

  it('should return 4x2 for 8 items', () => {
    expect(calculateGridLayout(8)).toEqual({ columns: 4, rows: 2 });
  });

  it('should return 3x3 for 9 items', () => {
    expect(calculateGridLayout(9)).toEqual({ columns: 3, rows: 3 });
  });

  it('should return 4x3 for 10 items', () => {
    expect(calculateGridLayout(10)).toEqual({ columns: 4, rows: 3 });
  });

  it('should return 4x3 for 11 items', () => {
    expect(calculateGridLayout(11)).toEqual({ columns: 4, rows: 3 });
  });

  it('should return 4x3 for 12 items', () => {
    expect(calculateGridLayout(12)).toEqual({ columns: 4, rows: 3 });
  });

  it('should calculate layout for larger numbers', () => {
    const result = calculateGridLayout(20);
    expect(result.columns).toBeGreaterThan(0);
    expect(result.rows).toBeGreaterThan(0);
    expect(result.columns * result.rows).toBeGreaterThanOrEqual(20);
  });

  it('should handle numbers divisible by 4', () => {
    const result = calculateGridLayout(16);
    expect(result.columns).toBe(4);
    expect(result.rows).toBe(4);
  });

  it('should handle numbers divisible by 3', () => {
    const result = calculateGridLayout(15);
    // For 15 items, sqrt is ~3.87, ceil is 4
    // Since columns (4) is not > 4, the divisibility check doesn't run
    // So columns stays 4, rows = ceil(15/4) = 4
    expect(result.columns).toBe(4);
    expect(result.rows).toBe(4);
  });
});

describe('getGridColumnsClass', () => {
  it('should return correct Tailwind class for 1 column', () => {
    expect(getGridColumnsClass(1)).toBe('grid-cols-1');
  });

  it('should return correct Tailwind class for 2-6 columns', () => {
    expect(getGridColumnsClass(2)).toBe('grid-cols-2');
    expect(getGridColumnsClass(3)).toBe('grid-cols-3');
    expect(getGridColumnsClass(4)).toBe('grid-cols-4');
    expect(getGridColumnsClass(5)).toBe('grid-cols-5');
    expect(getGridColumnsClass(6)).toBe('grid-cols-6');
  });

  it('should return template string for columns > 6', () => {
    expect(getGridColumnsClass(7)).toBe('grid-cols-7');
    expect(getGridColumnsClass(10)).toBe('grid-cols-10');
  });
});
