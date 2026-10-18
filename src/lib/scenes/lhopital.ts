import { LIMIT_PAIRS, derivRatio, ratio, type LimitPair } from '../../math/limits';
import { fmt, fnPath, gridSvg, niceStep, type View } from '../plot';

export const W = 720;
export const H = 360;

export interface LhopitalState {
  pair: string;
  /** 拡大率の常用対数 (0 〜 3) */
  zoom: number;
}

export const pairOf = (id: string): LimitPair => LIMIT_PAIRS.find((p) => p.id === id) ?? LIMIT_PAIRS[0]!;

export function lhopitalScene(st: LhopitalState): string {
  const p = pairOf(st.pair);
  const w = 2 / 10 ** st.zoom;
  // 窓の中での最大値に合わせて縦軸を決める
  let m = 0;
  for (let i = 0; i <= 200; i++) {
    const x = p.a - w + (2 * w * i) / 200;
    m = Math.max(m, Math.abs(p.f(x)), Math.abs(p.g(x)));
  }
  const yr = (m || 1) * 1.15;
  const v: View = { xMin: p.a - w, xMax: p.a + w, yMin: -yr, yMax: yr, width: W, height: H };
  return (
    gridSvg(v, niceStep(2 * w, 8), niceStep(2 * yr, 6)) +
    `<path class="curve-g" d="${fnPath(p.g, v, { samples: 600 })}"/>` +
    `<path class="curve-f" d="${fnPath(p.f, v, { samples: 1200 })}"/>` +
    `<text x="12" y="22" class="lbl">表示範囲 |x − ${p.a}| ≤ ${w < 0.01 ? w.toExponential(0) : fmt(w, 3)}（縦は自動で拡大）</text>`
  );
}

export function lhopitalReadout(st: LhopitalState): string {
  const p = pairOf(st.pair);
  const hs = [0.1, 0.01, 0.001, 0.0001];
  const rows = hs
    .map((h) => {
      const x = p.a + h;
      return `<tr><td>${h}</td><td>${fmt(ratio(p, x), 5)}</td><td>${fmt(derivRatio(p, x), 5)}</td></tr>`;
    })
    .join('');
  const note =
    p.derivLimit === null
      ? `<span class="warn">f′/g′ は振動して極限をもたないが、f/g 自体は ${p.limit} に収束する。ロピタルの定理は「f′/g′ の極限が存在するとき」にしか何も言わない。</span>`
      : `<span class="ok">f/g も f′/g′ も ${p.limit} に近づく。</span>`;
  return `<table><thead><tr><th>h（x = ${p.a} + h）</th><th>f(x)/g(x)</th><th>f′(x)/g′(x)</th></tr></thead><tbody>${rows}</tbody></table>${note}`;
}
