import { TAYLOR_FNS, evalTaylor, taylorCoefficients, type TaylorFnName } from '../../math/taylor';
import { fmt, fnPath, gridPaths, makeScale, type View } from '../plot';

export const W = 720;
export const H = 400;

export interface TaylorState {
  fn: TaylorFnName;
  n: number;
  a: number;
  x: number;
}

const VIEWS: Record<TaylorFnName, Omit<View, 'width' | 'height'>> = {
  sin: { xMin: -7, xMax: 7, yMin: -2.4, yMax: 2.4 },
  cos: { xMin: -7, xMax: 7, yMin: -2.4, yMax: 2.4 },
  exp: { xMin: -4.5, xMax: 3, yMin: -1.5, yMax: 8 },
  log1p: { xMin: -1.6, xMax: 4.4, yMin: -3.2, yMax: 2.8 },
};

export const view = (fn: TaylorFnName): View => ({ ...VIEWS[fn], width: W, height: H });

export function taylorScene(st: TaylorState) {
  const fn = TAYLOR_FNS[st.fn];
  const v = view(st.fn);
  const s = makeScale(v);
  const c = taylorCoefficients(fn, st.a, st.n);
  const P = (x: number) => evalTaylor(c, st.a, x);
  const R = fn.radius(st.a);
  const { grid, axes } = gridPaths(v, st.fn === 'exp' ? 1 : 1);
  const band = Number.isFinite(R)
    ? { x: s.sx(Math.max(v.xMin, st.a - R)), w: s.sx(Math.min(v.xMax, st.a + R)) - s.sx(Math.max(v.xMin, st.a - R)) }
    : null;
  const fx = fn.f(st.x);
  const px = P(st.x);
  const err = Math.abs(fx - px);
  const dist = Math.abs(st.x - st.a);
  const clampY = (y: number) => Math.min(H + 20, Math.max(-20, s.sy(y)));
  const outside = Number.isFinite(R) && dist > R + 1e-9;
  return {
    grid,
    axes,
    fPath: fnPath(fn.f, v, { samples: 480 }),
    pPath: fnPath(P, v, { samples: 480 }),
    band,
    centerX: s.sx(st.a),
    probe: { x: s.sx(st.x), fy: clampY(fx), py: clampY(px) },
    readout: {
      fx: fmt(fx, 4),
      px: fmt(px, 4),
      err: err < 1e-12 ? '0' : err < 1e-3 ? err.toExponential(1).replace('-', '−') : fmt(err, 4),
      outside,
      radius: Number.isFinite(R) ? fmt(R, 2) : '∞',
    },
  };
}

export function taylorReadout(st: TaylorState, sc: ReturnType<typeof taylorScene>): string {
  const r = sc.readout;
  const x = fmt(st.x, 2);
  const status = r.outside
    ? `<span class="warn">x は収束範囲の外（|x − a| &gt; ${r.radius}）。次数を上げても誤差は小さくならず、むしろ大きくなる。</span>`
    : r.radius === '∞'
      ? '<span class="ok">この関数はどの x でも、次数を上げれば誤差が 0 に近づく（収束半径 ∞）。</span>'
      : `<span class="ok">収束範囲の内側（|x − a| &lt; ${r.radius}）。次数を上げれば誤差は 0 に近づく。</span>`;
  return `x = <strong>${x}</strong> で　f(x) = <strong>${r.fx}</strong>　P<sub>${st.n}</sub>(x) = <strong>${r.px}</strong>　誤差 = <strong>${r.err}</strong><br>${status}`;
}

/** 画面の x 座標 → 数学の x (定義域と表示範囲に収める) */
export function probeFromPx(fn: TaylorFnName, px: number): number {
  const v = view(fn);
  const s = makeScale(v);
  const lo = fn === 'log1p' ? -0.98 : v.xMin;
  return Math.min(v.xMax, Math.max(lo, s.ix(px)));
}
