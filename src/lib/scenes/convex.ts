import { CONVEX_FNS, type ConvexFn } from '../../math/convex';
import { fmt, fnPath, gridSvg, makeScale, type View } from '../plot';

export const W = 720;
export const H = 400;

export interface ConvexState {
  fn: string;
  x1: number;
  x2: number;
  /** x1 側の重み (0〜1) */
  t: number;
}

const VIEWS: Record<string, Omit<View, 'width' | 'height'>> = {
  exp: { xMin: -2.5, xMax: 2.5, yMin: -0.6, yMax: 6 },
  sq: { xMin: -2.5, xMax: 2.5, yMin: -0.6, yMax: 6 },
  neglog: { xMin: -0.3, xMax: 4.7, yMin: -1.8, yMax: 3.2 },
  sin: { xMin: -0.4, xMax: 6.6, yMin: -1.7, yMax: 1.7 },
};

export const fnOf = (id: string): ConvexFn => CONVEX_FNS.find((f) => f.id === id) ?? CONVEX_FNS[0]!;
export const view = (id: string): View => ({ ...(VIEWS[id] ?? VIEWS.exp!), width: W, height: H });

/** 点 x を定義域と表示範囲に収める */
export function clampX(id: string, x: number): number {
  const v = view(id);
  const lo = Math.max(v.xMin, fnOf(id).domain[0] + 0.05);
  return Math.min(v.xMax - 0.05, Math.max(lo, x));
}

export function convexGeometry(st: ConvexState) {
  const fn = fnOf(st.fn);
  const v = view(st.fn);
  const s = makeScale(v);
  const f1 = fn.f(st.x1);
  const f2 = fn.f(st.x2);
  const xm = st.t * st.x1 + (1 - st.t) * st.x2;
  const chordY = st.t * f1 + (1 - st.t) * f2;
  const curveY = fn.f(xm);
  return { fn, v, s, f1, f2, xm, chordY, curveY, gap: chordY - curveY };
}

export function convexScene(st: ConvexState): string {
  const g = convexGeometry(st);
  const { s } = g;
  const P1 = [s.sx(st.x1), s.sy(g.f1)];
  const P2 = [s.sx(st.x2), s.sy(g.f2)];
  const M = [s.sx(g.xm), s.sy(g.chordY)];
  const Q = [s.sx(g.xm), s.sy(g.curveY)];
  const ok = g.gap >= -1e-12;
  return (
    gridSvg(g.v, 1) +
    `<path class="curve-f" d="${fnPath(g.fn.f, g.v, { samples: 500 })}"/>` +
    `<path class="vec-accent" style="stroke-width:2" d="M${P1[0]} ${P1[1]}L${P2[0]} ${P2[1]}"/>` +
    `<path class="${ok ? 'vec-green' : 'vec-verm'}" d="M${M[0]} ${M[1]}L${Q[0]} ${Q[1]}"/>` +
    `<circle cx="${Q[0]}" cy="${Q[1]}" r="5" class="head-ink"/>` +
    `<circle cx="${M[0]}" cy="${M[1]}" r="6" class="head-accent"/>` +
    `<text x="${M[0] + 10}" y="${M[1] - 8}" class="lbl-accent">弦上の点</text>` +
    `<text x="${Q[0] + 10}" y="${Q[1] + 18}" class="lbl-ink">曲線上の点</text>`
  );
}

export function convexReadout(st: ConvexState): string {
  const g = convexGeometry(st);
  const t = fmt(st.t, 2);
  const u = fmt(1 - st.t, 2);
  const status =
    g.gap >= -1e-12
      ? `<span class="ok">弦が曲線より上（または一致）：f(${t}x₁ + ${u}x₂) ≤ ${t}f(x₁) + ${u}f(x₂)</span>`
      : `<span class="warn">弦が曲線より下になった。${g.fn.label} は凸ではないので、イェンセンの不等式は成り立たない。</span>`;
  return `x₁ = <strong>${fmt(st.x1, 2)}</strong>, x₂ = <strong>${fmt(st.x2, 2)}</strong>, 重み ${t} : ${u}<br>曲線上 f(平均) = <strong>${fmt(g.curveY, 4)}</strong>　弦上 平均(f) = <strong>${fmt(g.chordY, 4)}</strong>　差 = <strong>${fmt(g.gap, 4)}</strong><br>${status}`;
}
