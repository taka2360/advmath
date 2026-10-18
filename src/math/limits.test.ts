import { describe, expect, it } from 'vitest';
import { LIMIT_PAIRS, derivRatio, ratio } from './limits';

describe('limits', () => {
  it('f/g は極限に近づく', () => {
    for (const p of LIMIT_PAIRS) {
      expect(ratio(p, 1e-4)).toBeCloseTo(p.limit!, 3);
      expect(ratio(p, -1e-4)).toBeCloseTo(p.limit!, 3);
    }
  });

  it('導関数は差分商と一致する', () => {
    for (const p of LIMIT_PAIRS) {
      const x = 0.37;
      const h = 1e-6;
      expect(p.df(x)).toBeCloseTo((p.f(x + h) - p.f(x - h)) / (2 * h), 5);
      expect(p.dg(x)).toBeCloseTo((p.g(x + h) - p.g(x - h)) / (2 * h), 5);
    }
  });

  it("x² sin(1/x) / x では f'/g' が振動し極限をもたない", () => {
    const p = LIMIT_PAIRS.find((q) => q.id === 'osc')!;
    // 1/x = 2kπ と (2k+1)π で -cos(1/x) は -1 と +1
    const k = 1000;
    expect(derivRatio(p, 1 / (2 * k * Math.PI))).toBeCloseTo(-1, 3);
    expect(derivRatio(p, 1 / ((2 * k + 1) * Math.PI))).toBeCloseTo(1, 3);
  });
});
