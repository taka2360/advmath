import { describe, expect, it } from 'vitest';
import { evaluate, iterate, solve } from './recurrence';

const cases: Array<[number, number, number, number, string]> = [
  [1, 1, 0, 1, 'distinct'], // フィボナッチ
  [5, -6, 1, 4, 'distinct'],
  [2, -1, 3, 5, 'double'], // a_n = 3 + 2n
  [4, -4, 1, 6, 'double'],
  [1, -1, 1, 2, 'complex'], // 周期 6
  [2, -2, 1, 0, 'complex'],
  [3, 0, 2, 1, 'distinct'], // q = 0
];

describe('recurrence', () => {
  it.each(cases)('p=%d q=%d a0=%d a1=%d (%s) で一般項と漸化式が一致', (p, q, a0, a1, kind) => {
    const s = solve(p, q, a0, a1);
    expect(s.kind).toBe(kind);
    const seq = iterate(p, q, a0, a1, 15);
    seq.forEach((v, n) => expect(evaluate(s, n)).toBeCloseTo(v, 6));
  });

  it('重根のときは n r^n の項が必要', () => {
    const s = solve(2, -1, 3, 5);
    expect(s.kind === 'double' && s.B).toBeCloseTo(2, 12);
  });

  it('フィボナッチ F_10 = 55', () => {
    expect(evaluate(solve(1, 1, 0, 1), 10)).toBeCloseTo(55, 9);
  });
});
