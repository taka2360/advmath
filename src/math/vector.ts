export type V2 = readonly [number, number];
export type V3 = readonly [number, number, number];

export const dot2 = (a: V2, b: V2): number => a[0] * b[0] + a[1] * b[1];
export const norm2 = (a: V2): number => Math.hypot(a[0], a[1]);
/** 2次元の「外積」 a_x b_y − a_y b_x (符号付き平行四辺形の面積) */
export const cross2 = (a: V2, b: V2): number => a[0] * b[1] - a[1] * b[0];

/** |a|²|b|² − (a·b)² (= cross2(a,b)² : ラグランジュの恒等式) */
export const csGap2 = (a: V2, b: V2): number => dot2(a, a) * dot2(b, b) - dot2(a, b) ** 2;

/** 一次従属 (零ベクトルを含む) か */
export const dependent2 = (a: V2, b: V2, eps = 1e-9): boolean =>
  Math.abs(cross2(a, b)) <= eps * Math.max(1, norm2(a) * norm2(b));

export const dot3 = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const norm3 = (a: V3): number => Math.hypot(a[0], a[1], a[2]);
export const sub3 = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const cross3 = (a: V3, b: V3): V3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

/** 3点を通る平面 n·x = d。3点が一直線上 (または重なる) なら null */
export function planeThrough(p: V3, q: V3, r: V3, eps = 1e-12): { n: V3; d: number } | null {
  const n = cross3(sub3(q, p), sub3(r, p));
  if (norm3(n) <= eps) return null;
  return { n, d: dot3(n, p) };
}
