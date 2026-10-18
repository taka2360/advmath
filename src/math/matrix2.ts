/** 2次正方行列 [[a, b], [c, d]] を [a, b, c, d] で表す */
export type M2 = readonly [number, number, number, number];
export type V2 = readonly [number, number];

export const I2: M2 = [1, 0, 0, 1];

export const mul = (p: M2, q: M2): M2 => [
  p[0] * q[0] + p[1] * q[2],
  p[0] * q[1] + p[1] * q[3],
  p[2] * q[0] + p[3] * q[2],
  p[2] * q[1] + p[3] * q[3],
];
export const det = (m: M2): number => m[0] * m[3] - m[1] * m[2];
export const trace = (m: M2): number => m[0] + m[3];
export const apply = (m: M2, v: V2): V2 => [m[0] * v[0] + m[1] * v[1], m[2] * v[0] + m[3] * v[1]];
export const rotation = (theta: number): M2 => [Math.cos(theta), -Math.sin(theta), Math.sin(theta), Math.cos(theta)];

export function pow(m: M2, n: number): M2 {
  let result: M2 = I2;
  let base = m;
  let k = n;
  while (k > 0) {
    if (k & 1) result = mul(result, base);
    base = mul(base, base);
    k >>= 1;
  }
  return result;
}

export type Eigen =
  /** A = kI : すべての方向が固有方向 */
  | { kind: 'scalar'; value: number }
  /** 相異なる2つの実固有値 */
  | { kind: 'distinct'; values: [number, number]; vectors: [V2, V2] }
  /** 重解だが A ≠ kI : 固有方向は1つだけ */
  | { kind: 'repeated'; value: number; vector: V2 }
  /** 実固有値なし (虚数の固有値 re ± im·i) */
  | { kind: 'complex'; re: number; im: number };

function eigenvector(m: M2, lambda: number, eps: number): V2 {
  const [a, b, c, d] = m;
  // (A − λI)v = 0 の解。ノルムの大きい行に直交する向きを取る
  const r1: V2 = [a - lambda, b];
  const r2: V2 = [c, d - lambda];
  const row = Math.hypot(...r1) >= Math.hypot(...r2) ? r1 : r2;
  const v: V2 = Math.hypot(...row) <= eps ? [1, 0] : [-row[1], row[0]];
  const len = Math.hypot(...v);
  return [v[0] / len, v[1] / len];
}

export function eigen(m: M2, eps = 1e-9): Eigen {
  const [a, b, c, d] = m;
  const scale = Math.max(1, Math.abs(a), Math.abs(b), Math.abs(c), Math.abs(d));
  if (Math.abs(b) <= eps * scale && Math.abs(c) <= eps * scale && Math.abs(a - d) <= eps * scale) {
    return { kind: 'scalar', value: a };
  }
  const t = a + d;
  // 特性方程式 λ² − tλ + det = 0 の判別式は (a−d)² + 4bc
  const disc = (a - d) ** 2 + 4 * b * c;
  const discEps = eps * scale * scale;
  if (disc > discEps) {
    const s = Math.sqrt(disc);
    const l1 = (t + s) / 2;
    const l2 = (t - s) / 2;
    return { kind: 'distinct', values: [l1, l2], vectors: [eigenvector(m, l1, eps), eigenvector(m, l2, eps)] };
  }
  if (disc >= -discEps) {
    const l = t / 2;
    return { kind: 'repeated', value: l, vector: eigenvector(m, l, eps * scale) };
  }
  return { kind: 'complex', re: t / 2, im: Math.sqrt(-disc) / 2 };
}

/**
 * ケーリー・ハミルトン A² = tA − dI を使い A^n = p_n A + q_n I と表す係数 [p_n, q_n] (n = 0..N)。
 * p_{n+1} = t p_n + q_n,  q_{n+1} = −d p_n
 */
export function chCoefficients(t: number, d: number, n: number): Array<[number, number]> {
  const out: Array<[number, number]> = [[0, 1]];
  for (let k = 0; k < n; k++) {
    const [p, q] = out[k]!;
    out.push([t * p + q, -d * p]);
  }
  return out;
}
