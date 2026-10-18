export function binom(n: number, k: number): bigint {
  if (k < 0 || k > n) return 0n;
  const kk = Math.min(k, n - k);
  let r = 1n;
  for (let i = 1; i <= kk; i++) r = (r * BigInt(n - kk + i)) / BigInt(i);
  return r;
}

export const catalan = (n: number): bigint => binom(2 * n, n) / BigInt(n + 1);

/** 'R' = 右へ1, 'U' = 上へ1 */
export type Step = 'R' | 'U';
export type Path = Step[];

/** 経路の各時点の座標 (始点 (0,0) を含む) */
export function points(path: readonly Step[]): Array<[number, number]> {
  const out: Array<[number, number]> = [[0, 0]];
  let x = 0;
  let y = 0;
  for (const s of path) {
    if (s === 'R') x++;
    else y++;
    out.push([x, y]);
  }
  return out;
}

/** 対角線 y = x より上 (y > x) に一度も出ないか */
export const isGood = (path: readonly Step[]): boolean => points(path).every(([x, y]) => y <= x);

/** 初めて直線 y = x + 1 に触れる点の番号 (触れなければ −1) */
export function firstTouch(path: readonly Step[]): number {
  return points(path).findIndex(([x, y]) => y === x + 1);
}

/**
 * 反射: 初めて y = x + 1 に触れた点より後の歩みの R と U を入れ替える。
 * (0,0)→(n,n) の悪い経路 と (0,0)→(n−1,n+1) の経路 が1対1に対応する。
 */
export function reflect(path: readonly Step[]): Path {
  const t = firstTouch(path);
  if (t < 0) return [...path];
  return path.map((s, i) => (i < t ? s : s === 'R' ? 'U' : 'R'));
}

/** (0,0)→(r,u) のすべての経路 (小さい r, u の検証用) */
export function allPaths(r: number, u: number): Path[] {
  if (r === 0 && u === 0) return [[]];
  const out: Path[] = [];
  if (r > 0) for (const p of allPaths(r - 1, u)) out.push(['R', ...p]);
  if (u > 0) for (const p of allPaths(r, u - 1)) out.push(['U', ...p]);
  return out;
}

/** 完全順列 (攪乱順列) の個数。包除原理 !n = Σ (−1)^k C(n,k) (n−k)! */
export function derangements(n: number): bigint {
  let fact = 1n;
  const f: bigint[] = [1n];
  for (let i = 1; i <= n; i++) f.push((fact *= BigInt(i)));
  let s = 0n;
  for (let k = 0; k <= n; k++) s += (k % 2 ? -1n : 1n) * binom(n, k) * f[n - k]!;
  return s;
}
