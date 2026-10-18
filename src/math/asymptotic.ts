/** log n! = Σ_{k=1}^n log k */
export function logFactorial(n: number): number {
  let s = 0;
  for (let k = 2; k <= n; k++) s += Math.log(k);
  return s;
}

/** ∫_1^n log x dx = n log n − n + 1 */
export const intLog = (n: number): number => n * Math.log(n) - n + 1;

/** スターリングの近似 √(2πn) (n/e)^n の対数 */
export const logStirling = (n: number): number => 0.5 * Math.log(2 * Math.PI * n) + n * (Math.log(n) - 1);

/** n! / (√(2πn)(n/e)^n) — n → ∞ で 1 に近づく */
export const stirlingRatio = (n: number): number => Math.exp(logFactorial(n) - logStirling(n));

/** ウォリス積分 W_n = ∫_0^{π/2} sin^n x dx。W_0 = π/2, W_1 = 1, W_n = (n−1)/n · W_{n−2} */
export function wallis(n: number): number {
  let w0 = Math.PI / 2;
  let w1 = 1;
  if (n === 0) return w0;
  for (let k = 2; k <= n; k++) [w0, w1] = [w1, ((k - 1) / k) * w0];
  return w1;
}

/** ウォリスの積 Π_{k=1}^n (2k)² / ((2k−1)(2k+1)) — n → ∞ で π/2 */
export function wallisProduct(n: number): number {
  let p = 1;
  for (let k = 1; k <= n; k++) p *= (4 * k * k) / ((2 * k - 1) * (2 * k + 1));
  return p;
}

/** 区分求積: (1/n) Σ_{k=1}^n f(k/n) (右端) */
export function riemannRight(f: (x: number) => number, n: number): number {
  let s = 0;
  for (let k = 1; k <= n; k++) s += f(k / n);
  return s / n;
}
