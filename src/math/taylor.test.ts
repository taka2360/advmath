import { describe, expect, it } from 'vitest';
import { TAYLOR_FNS, evalTaylor, taylorCoefficients } from './taylor';

describe('taylor', () => {
  it('sin のマクローリン係数', () => {
    const c = taylorCoefficients(TAYLOR_FNS.sin, 0, 5);
    const expected = [0, 1, 0, -1 / 6, 0, 1 / 120];
    c.forEach((v, i) => expect(v).toBeCloseTo(expected[i]!, 12));
  });

  it('log(1+x) のマクローリン係数は (-1)^{k-1}/k', () => {
    const c = taylorCoefficients(TAYLOR_FNS.log1p, 0, 6);
    expect(c[0]).toBeCloseTo(0, 12);
    for (let k = 1; k <= 6; k++) expect(c[k]).toBeCloseTo((k % 2 ? 1 : -1) / k, 12);
  });

  it('e^x の 15 次近似は x=1 で e に十分近い', () => {
    const c = taylorCoefficients(TAYLOR_FNS.exp, 0, 15);
    expect(evalTaylor(c, 0, 1)).toBeCloseTo(Math.E, 10);
  });

  it('a 中心の展開も関数値を再現する', () => {
    const c = taylorCoefficients(TAYLOR_FNS.cos, 1, 20);
    expect(evalTaylor(c, 1, 2.5)).toBeCloseTo(Math.cos(2.5), 10);
  });

  it('log(1+x): 収束半径の内側では誤差が減り、外側では増える', () => {
    const err = (x: number, n: number) =>
      Math.abs(evalTaylor(taylorCoefficients(TAYLOR_FNS.log1p, 0, n), 0, x) - Math.log1p(x));
    expect(err(0.5, 20)).toBeLessThan(err(0.5, 5));
    expect(err(1.5, 20)).toBeGreaterThan(err(1.5, 5));
    expect(TAYLOR_FNS.log1p.radius(0)).toBe(1);
  });
});
