import { describe, expect, it } from 'vitest';
import { allPaths, binom, catalan, derangements, isGood, points, reflect } from './combinatorics';

describe('combinatorics', () => {
  it('カタラン数 1,1,2,5,14,42,132', () => {
    expect([0, 1, 2, 3, 4, 5, 6].map((n) => catalan(n))).toEqual([1n, 1n, 2n, 5n, 14n, 42n, 132n]);
  });

  it('良い経路の数 = C(2n,n) − C(2n,n+1) = カタラン数 (全数検査)', () => {
    for (let n = 1; n <= 7; n++) {
      const good = allPaths(n, n).filter(isGood).length;
      expect(BigInt(good)).toBe(catalan(n));
      expect(binom(2 * n, n) - binom(2 * n, n + 1)).toBe(catalan(n));
    }
  });

  it('反射は 悪い経路 → (n−1, n+1) への経路 の全単射', () => {
    for (let n = 1; n <= 6; n++) {
      const bad = allPaths(n, n).filter((p) => !isGood(p));
      const images = new Set(
        bad.map((p) => {
          const q = reflect(p);
          expect(points(q).at(-1)).toEqual([n - 1, n + 1]);
          return q.join('');
        }),
      );
      expect(images.size).toBe(bad.length);
      expect(BigInt(images.size)).toBe(binom(2 * n, n + 1));
    }
  });

  it('完全順列 !n', () => {
    expect([1, 2, 3, 4, 5].map(derangements)).toEqual([0n, 1n, 2n, 9n, 44n]);
  });
});
