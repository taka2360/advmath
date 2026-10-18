import { describe, expect, it } from 'vitest';
import { intLog, logFactorial, riemannRight, stirlingRatio, wallis, wallisProduct } from './asymptotic';
import { simpson } from './volume';

describe('asymptotic', () => {
  it('log n! は積分ではさまれる: ∫_1^n log x dx ≤ log n! ≤ ∫_1^{n+1} log x dx', () => {
    for (const n of [2, 5, 10, 100, 1000]) {
      expect(intLog(n)).toBeLessThanOrEqual(logFactorial(n));
      expect(logFactorial(n)).toBeLessThanOrEqual(intLog(n + 1));
    }
  });

  it('スターリング比は 1 に近づき、常に 1 より大きい', () => {
    expect(stirlingRatio(10)).toBeGreaterThan(1);
    expect(stirlingRatio(10)).toBeCloseTo(1 + 1 / 120, 3);
    expect(Math.abs(stirlingRatio(1000) - 1)).toBeLessThan(1e-4);
  });

  it('ウォリス積分の漸化式は数値積分と一致', () => {
    for (const n of [0, 1, 2, 3, 7, 10]) {
      expect(wallis(n)).toBeCloseTo(
        simpson((x) => Math.sin(x) ** n, 0, Math.PI / 2, 4000),
        9,
      );
    }
    expect(wallis(2) * wallis(3)).toBeCloseTo(Math.PI / 6, 12); // n W_n W_{n−1} = π/2
  });

  it('W_{2n}/W_{2n+1} → 1 と ウォリスの積 → π/2', () => {
    expect(wallis(400) / wallis(401)).toBeCloseTo(1, 2);
    expect(wallisProduct(20000)).toBeCloseTo(Math.PI / 2, 4);
  });

  it('区分求積 (1/n)Σ (k/n)² → 1/3', () => {
    const n = 10000;
    // 右端和の誤差は 1/(2n) + 1/(6n²)
    expect(riemannRight((x) => x * x, n) - 1 / 3).toBeCloseTo(1 / (2 * n) + 1 / (6 * n * n), 12);
  });
});
