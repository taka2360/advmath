/**
 * 3項間漸化式 a_{n+2} = p a_{n+1} + q a_n の一般項。
 * 特性方程式 x² − p x − q = 0 の根の種類で場合分けする。
 */
export type Solution =
  | { kind: 'distinct'; r1: number; r2: number; A: number; B: number }
  | { kind: 'double'; r: number; A: number; B: number }
  | { kind: 'complex'; r: number; theta: number; A: number; B: number }
  /** p = q = 0 : a_n = 0 (n ≥ 2) */
  | { kind: 'zero'; a0: number; a1: number };

export function solve(p: number, q: number, a0: number, a1: number, eps = 1e-12): Solution {
  if (Math.abs(p) <= eps && Math.abs(q) <= eps) return { kind: 'zero', a0, a1 };
  const disc = p * p + 4 * q;
  if (disc > eps) {
    const s = Math.sqrt(disc);
    const r1 = (p + s) / 2;
    const r2 = (p - s) / 2;
    // A + B = a0,  A r1 + B r2 = a1
    const B = (a1 - a0 * r1) / (r2 - r1);
    return { kind: 'distinct', r1, r2, A: a0 - B, B };
  }
  if (disc >= -eps) {
    const r = p / 2;
    // a_n = (A + Bn) r^n,  a0 = A,  a1 = (A + B) r   (r ≠ 0 は p ≠ 0 から従う)
    return { kind: 'double', r, A: a0, B: a1 / r - a0 };
  }
  // 根は r(cos θ ± i sin θ)。2根の積 = −q なので r = √(−q)
  const r = Math.sqrt(-q);
  const theta = Math.atan2(Math.sqrt(-disc) / 2, p / 2);
  // a_n = r^n (A cos nθ + B sin nθ)
  return { kind: 'complex', r, theta, A: a0, B: (a1 / r - a0 * Math.cos(theta)) / Math.sin(theta) };
}

export function evaluate(s: Solution, n: number): number {
  switch (s.kind) {
    case 'distinct':
      return s.A * s.r1 ** n + s.B * s.r2 ** n;
    case 'double':
      return (s.A + s.B * n) * s.r ** n;
    case 'complex':
      return s.r ** n * (s.A * Math.cos(n * s.theta) + s.B * Math.sin(n * s.theta));
    case 'zero':
      return n === 0 ? s.a0 : n === 1 ? s.a1 : 0;
  }
}

/** 漸化式そのものを計算 (a_0..a_{len−1}) */
export function iterate(p: number, q: number, a0: number, a1: number, len: number): number[] {
  const out = [a0, a1];
  while (out.length < len) out.push(p * out[out.length - 1]! + q * out[out.length - 2]!);
  return out.slice(0, len);
}
