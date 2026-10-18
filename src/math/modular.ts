export function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) [x, y] = [y, x % y];
  return x;
}

export function isPrime(n: number): boolean {
  if (n < 2 || !Number.isInteger(n)) return false;
  for (let p = 2; p * p <= n; p++) if (n % p === 0) return false;
  return true;
}

/** 0 ≤ 結果 < m の剰余 */
export const mod = (a: number, m: number): number => ((a % m) + m) % m;

/** a^e mod m (BigInt で計算するので大きな指数でも正確) */
export function modPow(a: number | bigint, e: number | bigint, m: number | bigint): bigint {
  const M = BigInt(m);
  let base = ((BigInt(a) % M) + M) % M;
  let k = BigInt(e);
  let result = 1n % M;
  while (k > 0n) {
    if (k & 1n) result = (result * base) % M;
    base = (base * base) % M;
    k >>= 1n;
  }
  return result;
}

/** a^0, a^1, …, a^(len−1) を m で割った余り */
export function powerSequence(a: number, m: number, len: number): number[] {
  const out: number[] = [];
  let x = 1 % m;
  for (let i = 0; i < len; i++) {
    out.push(x);
    x = mod(x * a, m);
  }
  return out;
}

/** a^k ≡ 1 (mod m) となる最小の k ≥ 1。gcd(a, m) ≠ 1 なら存在しないので null */
export function order(a: number, m: number): number | null {
  if (m < 2 || gcd(a, m) !== 1) return null;
  let x = mod(a, m);
  for (let k = 1; k <= m; k++) {
    if (x === 1) return k;
    x = mod(x * a, m);
  }
  return null;
}

/** ax ≡ 1 (mod m) の解 (なければ null)。拡張ユークリッドの互除法 */
export function inverse(a: number, m: number): number | null {
  let [r0, r1] = [mod(a, m), m];
  let [s0, s1] = [1, 0];
  while (r1) {
    const q = Math.floor(r0 / r1);
    [r0, r1] = [r1, r0 - q * r1];
    [s0, s1] = [s1, s0 - q * s1];
  }
  return r0 === 1 ? mod(s0, m) : null;
}
