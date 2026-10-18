import { apply, det, eigen, trace, type M2, type V2 } from '../../math/matrix2';
import { cross2, norm2 } from '../../math/vector';
import { arrowSvg, fmt, gridSvg, makeScale, type View } from '../plot';

export const W = 640;
export const H = 440;
export const VIEW: View = { xMin: -4.65, xMax: 4.65, yMin: -3.2, yMax: 3.2, width: W, height: H };
const S = makeScale(VIEW);

export interface MatrixState {
  m: [number, number, number, number];
  v: [number, number];
}

export const PRESETS: Array<{ id: string; label: string; m: M2 }> = [
  { id: 'sym', label: '対称行列', m: [2, 1, 1, 2] },
  { id: 'rot30', label: '30°回転', m: [Math.cos(Math.PI / 6), -0.5, 0.5, Math.cos(Math.PI / 6)] },
  { id: 'rot90', label: '90°回転', m: [0, -1, 1, 0] },
  { id: 'shear', label: 'せん断', m: [1, 1, 0, 1] },
  { id: 'reflect', label: '直線 y=x に関する対称移動', m: [0, 1, 1, 0] },
  { id: 'scale', label: '2倍の拡大', m: [2, 0, 0, 2] },
  { id: 'proj', label: '射影（det = 0）', m: [1, 1, 0, 0] },
];

const px = (p: V2): [number, number] => [S.sx(p[0]), S.sy(p[1])];
export const toPx = px;
export const toMath = (x: number, y: number): [number, number] => [
  Math.round(S.ix(x) * 10) / 10,
  Math.round(S.iy(y) * 10) / 10,
];

function line(m: M2, p: V2, q: V2, cls: string): string {
  const [x1, y1] = px(apply(m, p));
  const [x2, y2] = px(apply(m, q));
  return `<path class="${cls}" d="M${x1} ${y1}L${x2} ${y2}"/>`;
}

/** 原点を通る方向 d の直線 (画面いっぱい) */
function fullLine(d: V2, cls: string): string {
  const k = 20 / Math.max(1e-9, norm2(d));
  const [x1, y1] = px([d[0] * k, d[1] * k]);
  const [x2, y2] = px([-d[0] * k, -d[1] * k]);
  return `<path class="${cls}" d="M${x1} ${y1}L${x2} ${y2}"/>`;
}

export function matrixScene(st: MatrixState): string {
  const m = st.m;
  let out = gridSvg(VIEW, 1);
  for (let k = -10; k <= 10; k++) {
    out += line(m, [k, -10], [k, 10], 'tgrid');
    out += line(m, [-10, k], [10, k], 'tgrid');
  }
  const e = eigen(m);
  if (e.kind === 'distinct') out += fullLine(e.vectors[0], 'eig') + fullLine(e.vectors[1], 'eig');
  if (e.kind === 'repeated') out += fullLine(e.vector, 'eig');
  // 単位正方形の像
  const sq = ([[0, 0], [1, 0], [1, 1], [0, 1]] as V2[]).map((p) => px(apply(m, p)));
  out += `<path class="area-verm" d="M${sq.map((p) => p.join(' ')).join('L')}Z"/>`;
  const O = px([0, 0]);
  const e1 = px(apply(m, [1, 0]));
  const e2 = px(apply(m, [0, 1]));
  out += arrowSvg(O[0], O[1], e1[0], e1[1], 'verm', 11) + arrowSvg(O[0], O[1], e2[0], e2[1], 'verm', 11);
  const V = px(st.v);
  const Av = apply(m, st.v);
  const AV = px(Av);
  const aligned = norm2(st.v) > 0 && Math.abs(cross2(st.v, Av)) < 1e-9 * Math.max(1, norm2(Av) * norm2(st.v));
  out += arrowSvg(O[0], O[1], AV[0], AV[1], aligned ? 'green' : 'accent', 13);
  out += arrowSvg(O[0], O[1], V[0], V[1], 'ink', 13);
  out += `<text x="${V[0] + 10}" y="${V[1] + 18}" class="lbl-ink">v</text>`;
  out += `<text x="${AV[0] + 10}" y="${AV[1] - 8}" class="${aligned ? 'lbl-green' : 'lbl-accent'}">Av</text>`;
  return out;
}

export function matrixReadout(st: MatrixState): string {
  const m = st.m;
  const e = eigen(m);
  const d = det(m);
  let eig = '';
  switch (e.kind) {
    case 'scalar':
      eig = `<span class="ok">A = ${fmt(e.value, 2)}I：すべての方向が固有方向（固有値 ${fmt(e.value, 2)}）</span>`;
      break;
    case 'distinct':
      eig = `<span class="ok">実固有値 ${fmt(e.values[0], 3)}, ${fmt(e.values[1], 3)}：緑の2直線が固有方向。この上の点は同じ直線上に移る</span>`;
      break;
    case 'repeated':
      eig = `<span class="ok">固有値は重解 ${fmt(e.value, 3)} で、A ≠ kI なので固有方向は1本だけ</span>`;
      break;
    case 'complex':
      eig = `<span class="warn">固有値は虚数 ${fmt(e.re, 3)} ± ${fmt(e.im, 3)}i：実数の固有ベクトルは存在しない（どの方向も向きが変わる）</span>`;
  }
  const Av = apply(m, st.v);
  return (
    `A = <strong>(${fmt(m[0], 2)}, ${fmt(m[1], 2)} ; ${fmt(m[2], 2)}, ${fmt(m[3], 2)})</strong>　` +
    `det A = <strong>${fmt(d, 3)}</strong>（面積の倍率${d < 0 ? '・向きが反転' : ''}）　tr A = <strong>${fmt(trace(m), 3)}</strong><br>` +
    `v = (${fmt(st.v[0], 1)}, ${fmt(st.v[1], 1)}) → Av = (${fmt(Av[0], 2)}, ${fmt(Av[1], 2)})<br>${eig}`
  );
}
