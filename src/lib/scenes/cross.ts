import { cross3, dot3, norm3, type V3 } from '../../math/vector';
import { arrowSvg, fmt } from '../plot';

export const W = 640;
export const H = 440;

export interface CrossState {
  a: [number, number, number];
  b: [number, number, number];
  /** 視点の方位角・仰角 (ラジアン) */
  yaw: number;
  pitch: number;
}

const K = 38;

export function project(p: V3, yaw: number, pitch: number): [number, number] {
  const x1 = p[0] * Math.cos(yaw) - p[1] * Math.sin(yaw);
  const y1 = p[0] * Math.sin(yaw) + p[1] * Math.cos(yaw);
  const z2 = y1 * Math.sin(pitch) + p[2] * Math.cos(pitch);
  return [Math.round((W / 2 + K * x1) * 10) / 10, Math.round((H / 2 + 30 - K * z2) * 10) / 10];
}

export function crossScene(st: CrossState): string {
  const P = (p: V3) => project(p, st.yaw, st.pitch);
  let out = '';
  // xy 平面の方眼
  for (let k = -4; k <= 4; k++) {
    const [x1, y1] = P([k, -4, 0]);
    const [x2, y2] = P([k, 4, 0]);
    const [x3, y3] = P([-4, k, 0]);
    const [x4, y4] = P([4, k, 0]);
    out += `<path class="s-grid" d="M${x1} ${y1}L${x2} ${y2}M${x3} ${y3}L${x4} ${y4}"/>`;
  }
  const axes: Array<[V3, string]> = [
    [[4.6, 0, 0], 'x'],
    [[0, 4.6, 0], 'y'],
    [[0, 0, 4.6], 'z'],
  ];
  const O = P([0, 0, 0]);
  for (const [e, name] of axes) {
    const [x, y] = P(e);
    const [xn, yn] = P([-e[0], -e[1], -e[2]]);
    out += `<path class="s-axis" d="M${xn} ${yn}L${x} ${y}"/><text x="${x + 6}" y="${y + 4}" class="lbl">${name}</text>`;
  }
  const { a, b } = st;
  const c = cross3(a, b);
  const A = P(a);
  const B = P(b);
  const AB = P([a[0] + b[0], a[1] + b[1], a[2] + b[2]]);
  const C = P(c);
  out += `<path class="area-green" d="M${O[0]} ${O[1]}L${A[0]} ${A[1]}L${AB[0]} ${AB[1]}L${B[0]} ${B[1]}Z"/>`;
  out += arrowSvg(O[0], O[1], A[0], A[1], 'accent', 12) + arrowSvg(O[0], O[1], B[0], B[1], 'verm', 12);
  out += arrowSvg(O[0], O[1], C[0], C[1], 'green', 13);
  out += `<text x="${A[0] + 8}" y="${A[1] - 6}" class="lbl-accent">a</text>`;
  out += `<text x="${B[0] + 8}" y="${B[1] - 6}" class="lbl-verm">b</text>`;
  if (norm3(c) > 1e-9) out += `<text x="${C[0] + 8}" y="${C[1] - 6}" class="lbl-green">a×b</text>`;
  return out;
}

export function crossReadout(st: CrossState): string {
  const { a, b } = st;
  const c = cross3(a, b);
  const n = norm3(c);
  const v = (p: V3) => `(${p.map((x) => fmt(x, 1)).join(', ')})`;
  const status =
    n < 1e-9
      ? '<span class="warn">a×b = 0：a と b は一次従属（平行または零ベクトル）。平行四辺形はつぶれ、a, b を含む平面は1つに定まらない。</span>'
      : `<span class="ok">a×b は a, b の両方に垂直（a·(a×b) = ${fmt(dot3(a, c), 1)}, b·(a×b) = ${fmt(dot3(b, c), 1)}）。原点と a, b を含む平面は ${fmt(c[0], 1)}x ${c[1] < 0 ? '−' : '+'} ${fmt(Math.abs(c[1]), 1)}y ${c[2] < 0 ? '−' : '+'} ${fmt(Math.abs(c[2]), 1)}z = 0。</span>`;
  return `a = ${v(a)}　b = ${v(b)}　a×b = <strong>${v(c)}</strong><br>|a×b| = <strong>${fmt(n, 3)}</strong> = 平行四辺形の面積<br>${status}`;
}
