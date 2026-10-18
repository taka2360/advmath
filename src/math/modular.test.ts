import { describe, expect, it } from 'vitest';
import { gcd, inverse, isPrime, modPow, order, powerSequence } from './modular';

describe('modular', () => {
  it('フェルマーの小定理: p 素数, p∤a なら a^{p−1} ≡ 1', () => {
    for (const p of [2, 3, 5, 7, 11, 13, 101]) {
      for (let a = 1; a < 3 * p; a++) {
        if (a % p === 0) continue;
        expect(modPow(a, p - 1, p)).toBe(1n);
      }
    }
  });

  it('条件を外すと成り立たない', () => {
    // 合成数
    expect(modPow(2, 14, 15)).toBe(4n);
    // p | a
    expect(modPow(7, 6, 7)).toBe(0n);
  });

  it('大きな指数: 2^100 mod 7 = 2', () => {
    expect(modPow(2, 100, 7)).toBe(2n);
  });

  it('位数は p−1 の約数', () => {
    for (let a = 1; a < 13; a++) expect(12 % order(a, 13)!).toBe(0);
    expect(order(2, 7)).toBe(3);
    expect(order(4, 6)).toBeNull();
  });

  it('累乗の列は周期的', () => {
    expect(powerSequence(3, 7, 8)).toEqual([1, 3, 2, 6, 4, 5, 1, 3]);
  });

  it('逆元', () => {
    expect(inverse(3, 7)).toBe(5);
    expect(inverse(4, 6)).toBeNull();
    expect(gcd(84, 36)).toBe(12);
    expect(isPrime(97)).toBe(true);
    expect(isPrime(91)).toBe(false);
  });
});
