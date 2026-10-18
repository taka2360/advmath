export interface ConvexFn {
  id: string;
  label: string;
  f(x: number): number;
  /** 定義域 (開区間の端は除く) */
  domain: [number, number];
  /** 定義域全体で (下に) 凸か */
  convex: boolean;
}

export const CONVEX_FNS: ConvexFn[] = [
  { id: 'exp', label: 'eˣ', f: Math.exp, domain: [-Infinity, Infinity], convex: true },
  { id: 'sq', label: 'x²', f: (x) => x * x, domain: [-Infinity, Infinity], convex: true },
  { id: 'neglog', label: '−log x', f: (x) => (x > 0 ? -Math.log(x) : NaN), domain: [0, Infinity], convex: true },
  { id: 'sin', label: 'sin x（凸でない）', f: Math.sin, domain: [-Infinity, Infinity], convex: false },
];

export function checkWeights(ws: readonly number[]): void {
  if (ws.some((w) => w < 0)) throw new RangeError('重みは非負でなければならない');
  const s = ws.reduce((a, b) => a + b, 0);
  if (Math.abs(s - 1) > 1e-9) throw new RangeError('重みの和は 1 でなければならない');
}

/** イェンセン: f(Σ w_i x_i) と Σ w_i f(x_i) */
export function jensen(f: (x: number) => number, xs: readonly number[], ws: readonly number[]): { lhs: number; rhs: number } {
  if (xs.length !== ws.length) throw new RangeError('点と重みの個数が違う');
  checkWeights(ws);
  const mean = xs.reduce((s, x, i) => s + ws[i]! * x, 0);
  return { lhs: f(mean), rhs: xs.reduce((s, x, i) => s + ws[i]! * f(x), 0) };
}
