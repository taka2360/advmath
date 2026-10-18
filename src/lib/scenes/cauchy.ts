import { cross2, dependent2, dot2, type V2 } from '../../math/vector';
import { arrowSvg, fmt, gridSvg, makeScale, type View } from '../plot';

export const W = 640;
export const H = 440;
export const VIEW: View = { xMin: -4.65, xMax: 4.65, yMin: -3.2, yMax: 3.2, width: W, height: H };
const S = makeScale(VIEW);

export interface CauchyState {
  a: [number, number];
  b: [number, number];
}

/** ドラッグ位置を 0.25 刻みに丸める (ちょうど平行・零ベクトルにできるように) */
export const snap = (v: number): number => Math.round(v * 4) / 4;

export function toMath(px: number, py: number): [number, number] {
  return [
    Math.min(VIEW.xMax - 0.2, Math.max(VIEW.xMin + 0.2, snap(S.ix(px)))),
    Math.min(VIEW.yMax - 0.2, Math.max(VIEW.yMin + 0.2, snap(S.iy(py)))),
  ];
}

export const toPx = (v: V2): [number, number] => [S.sx(v[0]), S.sy(v[1])];

export function cauchyScene(st: CauchyState): string {
  const { a, b } = st;
  const O = toPx([0, 0]);
  const A = toPx(a);
  const B = toPx(b);
  const AB = toPx([a[0] + b[0], a[1] + b[1]]);
  const aa = dot2(a, a);
  // b の a 方向への正射影
  const k = aa > 0 ? dot2(a, b) / aa : 0;
  const P = toPx([k * a[0], k * a[1]]);
  return (
    gridSvg(VIEW, 1) +
    `<path class="area-green" d="M${O[0]} ${O[1]}L${A[0]} ${A[1]}L${AB[0]} ${AB[1]}L${B[0]} ${B[1]}Z"/>` +
    (aa > 0 ? `<path class="dash" d="M${B[0]} ${B[1]}L${P[0]} ${P[1]}"/>` : '') +
    arrowSvg(O[0], O[1], A[0], A[1], 'accent', 14) +
    arrowSvg(O[0], O[1], B[0], B[1], 'verm', 14) +
    `<text x="${A[0] + 10}" y="${A[1] - 10}" class="lbl-accent">a</text>` +
    `<text x="${B[0] + 10}" y="${B[1] - 10}" class="lbl-verm">b</text>`
  );
}

export function cauchyReadout(st: CauchyState): string {
  const { a, b } = st;
  const lhs = dot2(a, b) ** 2;
  const rhs = dot2(a, a) * dot2(b, b);
  const area = Math.abs(cross2(a, b));
  const eq = dependent2(a, b, 1e-12);
  const status = eq
    ? `<span class="ok">等号成立：a と b は一次従属（${dot2(a, a) === 0 || dot2(b, b) === 0 ? '零ベクトルを含む' : '平行'}）。平行四辺形はつぶれて面積 0。</span>`
    : '<span>a と b が一次独立なので、差は平行四辺形の面積の2乗だけ残る（等号は成り立たない）。</span>';
  return (
    `a = (${fmt(a[0], 2)}, ${fmt(a[1], 2)})　b = (${fmt(b[0], 2)}, ${fmt(b[1], 2)})<br>` +
    `(a·b)² = <strong>${fmt(lhs, 3)}</strong>　≤　|a|²|b|² = <strong>${fmt(rhs, 3)}</strong>　差 = <strong>${fmt(rhs - lhs, 3)}</strong> = (平行四辺形の面積 ${fmt(area, 3)})²<br>${status}`
  );
}
