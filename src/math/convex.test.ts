import { describe, expect, it } from 'vitest';
import { CONVEX_FNS, jensen } from './convex';

describe('jensen', () => {
  it('凸関数では f(平均) ≤ 平均(f)', () => {
    for (const fn of CONVEX_FNS.filter((f) => f.convex)) {
      for (let i = 0; i < 50; i++) {
        const x1 = 0.1 + Math.random() * 3;
        const x2 = 0.1 + Math.random() * 3;
        const t = Math.random();
        const { lhs, rhs } = jensen(fn.f, [x1, x2], [t, 1 - t]);
        expect(lhs).toBeLessThanOrEqual(rhs + 1e-12);
      }
    }
  });

  it('凸でない sin では逆向きになる例がある', () => {
    const { lhs, rhs } = jensen(Math.sin, [0.5, 2.5], [0.5, 0.5]);
    expect(lhs).toBeGreaterThan(rhs);
  });

  it('重みの条件を外すと拒否する', () => {
    expect(() => jensen(Math.exp, [0, 1], [0.7, 0.7])).toThrow();
    expect(() => jensen(Math.exp, [0, 1], [1.5, -0.5])).toThrow();
  });
});
