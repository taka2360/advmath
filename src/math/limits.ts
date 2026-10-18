/** ロピタルの定理の図で使う関数の組 (x → a) */
export interface LimitPair {
  id: string;
  label: string;
  f(x: number): number;
  g(x: number): number;
  df(x: number): number;
  dg(x: number): number;
  a: number;
  /** f/g の極限 (存在しなければ null) */
  limit: number | null;
  /** f'/g' の極限 (存在しなければ null) */
  derivLimit: number | null;
}

export const LIMIT_PAIRS: LimitPair[] = [
  {
    id: 'sin',
    label: 'sin x ／ x',
    f: Math.sin,
    g: (x) => x,
    df: Math.cos,
    dg: () => 1,
    a: 0,
    limit: 1,
    derivLimit: 1,
  },
  {
    id: 'exp',
    label: '(eˣ − 1 − x) ／ x²',
    f: (x) => Math.expm1(x) - x,
    g: (x) => x * x,
    df: (x) => Math.expm1(x),
    dg: (x) => 2 * x,
    a: 0,
    limit: 0.5,
    derivLimit: 0.5,
  },
  {
    id: 'osc',
    label: 'x² sin(1/x) ／ x',
    f: (x) => (x === 0 ? 0 : x * x * Math.sin(1 / x)),
    g: (x) => x,
    df: (x) => (x === 0 ? 0 : 2 * x * Math.sin(1 / x) - Math.cos(1 / x)),
    dg: () => 1,
    a: 0,
    limit: 0,
    derivLimit: null,
  },
];

export const ratio = (p: LimitPair, x: number): number => p.f(x) / p.g(x);
export const derivRatio = (p: LimitPair, x: number): number => p.df(x) / p.dg(x);
