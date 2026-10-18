import { describe, expect, it } from 'vitest';
import { cross2, cross3, csGap2, dependent2, dot3, norm3, planeThrough } from './vector';

describe('vector', () => {
  it('ラグランジュの恒等式 |a|²|b|²−(a·b)² = (a×b)²', () => {
    for (let i = 0; i < 50; i++) {
      const a = [Math.random() * 4 - 2, Math.random() * 4 - 2] as const;
      const b = [Math.random() * 4 - 2, Math.random() * 4 - 2] as const;
      expect(csGap2(a, b)).toBeCloseTo(cross2(a, b) ** 2, 10);
      expect(csGap2(a, b)).toBeGreaterThanOrEqual(-1e-12);
    }
  });

  it('等号成立は一次従属のとき (零ベクトルを含む)', () => {
    expect(dependent2([1, 2], [-2, -4])).toBe(true);
    expect(dependent2([0, 0], [3, 1])).toBe(true);
    expect(dependent2([1, 0], [0, 1])).toBe(false);
  });

  it('外積は両方に垂直で、大きさは平行四辺形の面積', () => {
    const a = [1, 2, 3] as const;
    const b = [-2, 0, 1] as const;
    const c = cross3(a, b);
    expect(dot3(c, a)).toBeCloseTo(0, 12);
    expect(dot3(c, b)).toBeCloseTo(0, 12);
    const cos = dot3(a, b) / (norm3(a) * norm3(b));
    expect(norm3(c)).toBeCloseTo(norm3(a) * norm3(b) * Math.sqrt(1 - cos * cos), 10);
  });

  it('3点を通る平面。一直線上なら null', () => {
    const pl = planeThrough([1, 0, 0], [0, 1, 0], [0, 0, 1])!;
    expect(pl.n).toEqual([1, 1, 1]);
    expect(pl.d).toBe(1);
    expect(planeThrough([0, 0, 0], [1, 1, 1], [2, 2, 2])).toBeNull();
  });
});
