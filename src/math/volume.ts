/** シンプソン則 (n は偶数に丸める) */
export function simpson(g: (x: number) => number, a: number, b: number, n = 1000): number {
  const m = n % 2 ? n + 1 : n;
  const h = (b - a) / m;
  let s = g(a) + g(b);
  for (let i = 1; i < m; i++) s += (i % 2 ? 4 : 2) * g(a + i * h);
  return (s * h) / 3;
}

/**
 * 0 ≤ a ≤ x ≤ b, 0 ≤ y ≤ f(x) の領域を y 軸のまわりに1回転した立体を、
 * n 枚の円筒殻 (各区間の中点で高さを取る) で近似した体積。
 */
export function shellSum(f: (x: number) => number, a: number, b: number, n: number): number {
  const dx = (b - a) / n;
  let s = 0;
  for (let i = 0; i < n; i++) {
    const x = a + (i + 0.5) * dx;
    s += 2 * Math.PI * x * f(x) * dx;
  }
  return s;
}

/** バウムクーヘン積分 V = 2π ∫_a^b x f(x) dx */
export const shellExact = (f: (x: number) => number, a: number, b: number): number =>
  2 * Math.PI * simpson((x) => x * f(x), a, b, 2000);

/**
 * パップス・ギュルダン: 面積 S の図形を、重心から距離 R の軸のまわりに角 θ だけ回転させた体積 θ R S。
 * (図形が軸の片側にあるときに限る)
 */
export const pappus = (R: number, area: number, theta = 2 * Math.PI): number => theta * R * area;
