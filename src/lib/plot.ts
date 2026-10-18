/**
 * 2次元座標系と関数グラフの SVG パス生成。DOM に依存しない純粋関数なので、
 * ビルド時 (静的 SVG) とブラウザ (操作時の再描画) の両方で同じ計算を使う。
 */
export interface View {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  width: number;
  height: number;
}

export interface Scale {
  sx(x: number): number;
  sy(y: number): number;
  /** 画面座標 → 数学座標 */
  ix(px: number): number;
  iy(py: number): number;
}

export function makeScale(v: View): Scale {
  const kx = v.width / (v.xMax - v.xMin);
  const ky = v.height / (v.yMax - v.yMin);
  return {
    sx: (x) => (x - v.xMin) * kx,
    sy: (y) => v.height - (y - v.yMin) * ky,
    ix: (px) => v.xMin + px / kx,
    iy: (py) => v.yMin + (v.height - py) / ky,
  };
}

const r = (n: number) => Math.round(n * 100) / 100;

/**
 * 関数 f のグラフ。定義域外 (NaN) や値の発散で線を切る。
 * 表示範囲から大きく外れた点は範囲の少し外にクランプして描く。
 */
export function fnPath(f: (x: number) => number, v: View, opts: { from?: number; to?: number; samples?: number } = {}): string {
  const s = makeScale(v);
  const from = Math.max(opts.from ?? v.xMin, v.xMin);
  const to = Math.min(opts.to ?? v.xMax, v.xMax);
  const n = opts.samples ?? 360;
  const span = v.yMax - v.yMin;
  const lo = v.yMin - span;
  const hi = v.yMax + span;
  let d = '';
  let prevSide: number | null = null;
  for (let i = 0; i <= n; i++) {
    const x = from + ((to - from) * i) / n;
    const y = f(x);
    if (!Number.isFinite(y)) {
      prevSide = null;
      continue;
    }
    const side = y > hi ? 1 : y < lo ? -1 : 0;
    const yc = Math.min(hi, Math.max(lo, y));
    // 範囲外どうし (同じ側、または発散で反対側へ跳ぶ) は線で結ばない
    const lift = prevSide === null || (side !== 0 && prevSide !== 0);
    d += `${lift ? 'M' : 'L'}${r(s.sx(x))} ${r(s.sy(yc))}`;
    prevSide = side;
  }
  return d;
}

/** 折れ線 */
export function polyline(points: ReadonlyArray<readonly [number, number]>, v: View): string {
  const s = makeScale(v);
  return points.map(([x, y], i) => `${i ? 'L' : 'M'}${r(s.sx(x))} ${r(s.sy(y))}`).join('');
}

/** 目盛り位置 (step の倍数) */
export function ticks(min: number, max: number, step: number): number[] {
  const out: number[] = [];
  const start = Math.ceil(min / step - 1e-9) * step;
  for (let t = start; t <= max + 1e-9; t += step) out.push(Math.round(t / step) * step);
  return out;
}

/** 方眼と座標軸の path をまとめて返す */
export function gridPaths(v: View, step = 1, stepY = step): { grid: string; axes: string } {
  const s = makeScale(v);
  let grid = '';
  for (const x of ticks(v.xMin, v.xMax, step)) if (x !== 0) grid += `M${r(s.sx(x))} 0V${v.height}`;
  for (const y of ticks(v.yMin, v.yMax, stepY)) if (y !== 0) grid += `M0 ${r(s.sy(y))}H${v.width}`;
  let axes = '';
  if (v.xMin <= 0 && v.xMax >= 0) axes += `M${r(s.sx(0))} 0V${v.height}`;
  if (v.yMin <= 0 && v.yMax >= 0) axes += `M0 ${r(s.sy(0))}H${v.width}`;
  return { grid, axes };
}

/** 数値の表示用整形 (-0 を出さない) */
export function fmt(n: number, digits = 3): string {
  if (!Number.isFinite(n)) return n > 0 ? '∞' : n < 0 ? '−∞' : '—';
  const t = n.toFixed(digits);
  const z = Number(t) === 0 ? (0).toFixed(digits) : t;
  return z.replace('-', '−');
}

/** 方眼と軸の SVG 断片 */
export function gridSvg(v: View, step = 1, stepY = step): string {
  const { grid, axes } = gridPaths(v, step, stepY);
  return `<path class="s-grid" fill="none" d="${grid}"/><path class="s-axis" fill="none" d="${axes}"/>`;
}

/** 表示範囲に合う目盛り間隔 (1, 2, 5 × 10^k) */
export function niceStep(span: number, target = 8): number {
  const raw = span / target;
  const p = 10 ** Math.floor(Math.log10(raw));
  const m = raw / p;
  return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
}

/** 矢印 (線 + 三角形の矢じり)。color は vec-* / head-* クラスの接尾辞 */
export function arrowSvg(x1: number, y1: number, x2: number, y2: number, color: string, head = 10): string {
  const len = Math.hypot(x2 - x1, y2 - y1);
  if (len < 1e-6) return `<circle cx="${r(x1)}" cy="${r(y1)}" r="4" class="head-${color}"/>`;
  const ux = (x2 - x1) / len;
  const uy = (y2 - y1) / len;
  const h = Math.min(head, len * 0.6);
  const bx = x2 - ux * h;
  const by = y2 - uy * h;
  const px = -uy * h * 0.45;
  const py = ux * h * 0.45;
  return (
    `<path class="vec-${color}" d="M${r(x1)} ${r(y1)}L${r(bx)} ${r(by)}"/>` +
    `<path class="head-${color}" d="M${r(x2)} ${r(y2)}L${r(bx + px)} ${r(by + py)}L${r(bx - px)} ${r(by - py)}Z"/>`
  );
}
