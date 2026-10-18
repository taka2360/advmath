export type TaylorFnName = 'sin' | 'cos' | 'exp' | 'log1p';

export interface TaylorFn {
  label: string;
  tex: string;
  f(x: number): number;
  /** k 階導関数の a での値 */
  deriv(k: number, a: number): number;
  /** 展開中心 a の取りうる範囲 */
  centerRange: [number, number];
  /** a を中心とするテイラー級数の収束半径 */
  radius(a: number): number;
}

function factorial(k: number): number {
  let p = 1;
  for (let i = 2; i <= k; i++) p *= i;
  return p;
}

export const TAYLOR_FNS: Record<TaylorFnName, TaylorFn> = {
  sin: {
    label: 'sin x',
    tex: '\sin x',
    f: Math.sin,
    deriv: (k, a) => Math.sin(a + (k * Math.PI) / 2),
    centerRange: [-3, 3],
    radius: () => Infinity,
  },
  cos: {
    label: 'cos x',
    tex: '\cos x',
    f: Math.cos,
    deriv: (k, a) => Math.cos(a + (k * Math.PI) / 2),
    centerRange: [-3, 3],
    radius: () => Infinity,
  },
  exp: {
    label: 'eˣ',
    tex: 'e^x',
    f: Math.exp,
    deriv: (_k, a) => Math.exp(a),
    centerRange: [-2, 1.5],
    radius: () => Infinity,
  },
  log1p: {
    label: 'log(1+x)',
    tex: '\log(1+x)',
    f: (x) => (x > -1 ? Math.log1p(x) : NaN),
    deriv: (k, a) => (k === 0 ? Math.log1p(a) : ((k % 2 === 1 ? 1 : -1) * factorial(k - 1)) / (1 + a) ** k),
    centerRange: [-0.5, 2],
    // 最も近い特異点 x = -1 までの距離
    radius: (a) => 1 + a,
  },
};

/** (x-a)^k の係数 c_k (k = 0..n) */
export function taylorCoefficients(fn: TaylorFn, a: number, n: number): number[] {
  const c: number[] = [];
  for (let k = 0; k <= n; k++) c.push(fn.deriv(k, a) / factorial(k));
  return c;
}

export function evalTaylor(coeffs: readonly number[], a: number, x: number): number {
  const t = x - a;
  let s = 0;
  for (let k = coeffs.length - 1; k >= 0; k--) s = s * t + coeffs[k]!;
  return s;
}
