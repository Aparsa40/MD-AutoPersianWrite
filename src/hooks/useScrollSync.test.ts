import { describe, expect, it } from 'vitest';
import { getScrollRatio, getScrollTopForRatio } from './useScrollSync';

const element = (scrollTop: number, scrollHeight: number, clientHeight: number) => ({
  scrollTop,
  scrollHeight,
  clientHeight,
});

describe('scroll sync mapping', () => {
  it('calculates a normalized scroll ratio', () => {
    expect(getScrollRatio(element(250, 1000, 500))).toBe(0.5);
  });

  it('maps a ratio to the target scrollable range', () => {
    expect(getScrollTopForRatio(element(0, 2000, 500), 0.5)).toBe(750);
  });

  it('handles non-scrollable content without producing invalid values', () => {
    expect(getScrollRatio(element(0, 400, 500))).toBe(0);
    expect(getScrollTopForRatio(element(0, 400, 500), 0.8)).toBe(0);
  });
});
