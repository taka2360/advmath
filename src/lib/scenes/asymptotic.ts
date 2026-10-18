import { intLog, logFactorial, stirlingRatio, wallis, wallisProduct } from '../../math/asymptotic';
import { fmt, fnPath, gridSvg, makeScale, polyline, type View } from '../plot';

export const W = 720;
export const H = 400;

export interface AsymState {
  mode: 'sum' | 'wallis' | 'stirling';
  n: number;
}

const r1 = (x: number) => Math.round(x * 10) / 10;

function sumScene(n: number): string {
  const v: View = { xMin: 0.4, xMax: n + 1.6, yMin: -0.4, yMax: Math.log(n + 1) + 0.5, width: W, height: H };
  const s = makeScale(v);
  let out = gridSvg(v, 1, 1);
  for (let k = 2; k <= n; k++) {
    // 区間 [k−1, k] に高さ log k の長方形 (曲線より上) と、[k, k+1] に高さ log k (曲線より下)
    const up = { x: s.sx(k - 1), w: s.sx(k) - s.sx(k - 1), y: s.sy(Math.log(k)) };
    out += `<rect x="${r1(up.x)}" y="${r1(up.y)}" width="${r1(up.w)}" height="${r1(s.sy(0) - up.y)}" class="rect-up"/>`;
    const lo = { x: s.sx(k), w: s.sx(k + 1) - s.sx(k) };
    out += `<rect x="${r1(lo.x)}" y="${r1(up.y)}" width="${r1(lo.w)}" height="${r1(s.sy(0) - up.y)}" class="rect-lo"/>`;
  }
  out += `<path class="curve-f" d="${fnPath(Math.log, v, { from: 0.45 })}"/>`;
  for (const k of [1, n, n + 1]) out += `<text x="${s.sx(k)}" y="${s.sy(0) + 18}" text-anchor="middle" class="lbl">${k === 1 ? 1 : k === n ? 'n' : 'n+1'}</text>`;
  out += `<text x="${s.sx(1.2)}" y="${s.sy(Math.log(n + 1)) - 4}" class="lbl">y = log x</text>`;
  return out;
}

function wallisScene(n: number): string {
  const v: View = { xMin: -0.08, xMax: Math.PI / 2 + 0.12, yMin: -0.08, yMax: 1.12, width: W, height: H };
  const s = makeScale(v);
  let out = gridSvg(v, 0.5, 0.25);
  const f = (x: number) => Math.sin(x) ** n;
  const pts: Array<[number, number]> = [[0, 0]];
  for (let i = 0; i <= 120; i++) {
    const x = ((Math.PI / 2) * i) / 120;
    pts.push([x, f(x)]);
  }
  pts.push([Math.PI / 2, 0]);
  out += `<path class="area-accent" d="${polyline(pts, v)}Z"/>`;
  for (const m of [1, 2, 4, 8, 16, 32]) {
    if (m === n) continue;
    out += `<path class="faint" d="${fnPath((x) => Math.sin(x) ** m, v, { from: 0, to: Math.PI / 2, samples: 120 })}"/>`;
  }
  out += `<path class="curve-p" d="${fnPath(f, v, { from: 0, to: Math.PI / 2, samples: 200 })}"/>`;
  out += `<text x="${s.sx(Math.PI / 2)}" y="${s.sy(0) + 18}" text-anchor="middle" class="lbl">π/2</text>`;
  out += `<text x="${s.sx(0.1)}" y="${s.sy(1.05)}" class="lbl">y = sinⁿ x （灰色は n = 1, 2, 4, 8, 16, 32）</text>`;
  return out;
}

function stirlingScene(n: number): string {
  const N = Math.max(n, 5);
  const v: View = { xMin: 0, xMax: N + 1, yMin: 0.995, yMax: 1.09, width: W, height: H };
  const s = makeScale(v);
  let out = gridSvg(v, N > 20 ? 5 : 1, 0.01);
  out += `<path class="dash" d="M0 ${s.sy(1)}H${W}"/>`;
  out += `<path class="curve-g" d="${fnPath((x) => 1 + 1 / (12 * x), v, { from: 0.9, samples: 200 })}"/>`;
  for (let k = 1; k <= n; k++) {
    out += `<circle cx="${r1(s.sx(k))}" cy="${r1(s.sy(stirlingRatio(k)))}" r="${n > 30 ? 3 : 5}" class="head-verm"/>`;
  }
  out += `<text x="${s.sx(0.3)}" y="${s.sy(1) - 6}" class="lbl">比 = 1</text>`;
  out += `<text x="${W - 12}" y="24" text-anchor="end" class="lbl">青い曲線は 1 + 1/(12n)</text>`;
  return out;
}

export function asymScene(st: AsymState): string {
  if (st.mode === 'wallis') return wallisScene(st.n);
  if (st.mode === 'stirling') return stirlingScene(st.n);
  return sumScene(st.n);
}

export function asymReadout(st: AsymState): string {
  const n = st.n;
  if (st.mode === 'sum') {
    return (
      `∫₁ⁿ log x dx = <strong>${fmt(intLog(n), 4)}</strong>　≤　log n! = <strong>${fmt(logFactorial(n), 4)}</strong>　≤　∫₁ⁿ⁺¹ log x dx = <strong>${fmt(intLog(n + 1), 4)}</strong><br>` +
      '<span class="fig-note">朱の長方形（曲線の上）の面積の和が下からの評価を、青の長方形（曲線の下）が上からの評価を与える。どちらも面積は log 2 + … + log n。</span>'
    );
  }
  if (st.mode === 'wallis') {
    return (
      `W<sub>${n}</sub> = ∫₀^{π/2} sin<sup>${n}</sup>x dx = <strong>${fmt(wallis(n), 6)}</strong>　W<sub>${n}</sub>/W<sub>${n + 1}</sub> = <strong>${fmt(wallis(n) / wallis(n + 1), 6)}</strong>（→ 1）<br>` +
      `${n}·W<sub>${n}</sub>·W<sub>${n - 1}</sub> = <strong>${fmt(n * wallis(n) * wallis(n - 1), 6)}</strong>（つねに π/2 = ${fmt(Math.PI / 2, 6)}）　ウォリスの積（${n} 項）= ${fmt(wallisProduct(n), 6)}`
    );
  }
  return `n = ${n} で n! / (√(2πn)(n/e)ⁿ) = <strong>${fmt(stirlingRatio(n), 6)}</strong>　（1 + 1/(12n) = ${fmt(1 + 1 / (12 * n), 6)}）<br><span class="fig-note">比は 1 に近づくが、差 n! − √(2πn)(n/e)ⁿ は大きくなり続ける。「〜」は比が 1 に近づくという意味。</span>`;
}
