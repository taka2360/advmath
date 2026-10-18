import { binom, catalan, firstTouch, isGood, points, reflect, type Step } from '../../math/combinatorics';

export const W = 640;
export const H = 440;

export interface LatticeState {
  n: number;
  path: Step[];
  showReflect: boolean;
}

function frame(n: number) {
  const cell = Math.min((W - 120) / (n + 1), (H - 70) / (n + 1));
  const x0 = (W - cell * (n + 1)) / 2 - 20;
  const y0 = H - 40;
  const P = (x: number, y: number): [number, number] => [Math.round((x0 + x * cell) * 10) / 10, Math.round((y0 - y * cell) * 10) / 10];
  return { cell, P };
}

const pathD = (pts: Array<[number, number]>, P: (x: number, y: number) => [number, number]) =>
  pts.map(([x, y], i) => `${i ? 'L' : 'M'}${P(x, y).join(' ')}`).join('');

export function latticeScene(st: LatticeState): string {
  const { n, path } = st;
  const { P } = frame(n);
  let out = '';
  for (let x = 0; x <= n; x++) out += `<path class="s-grid" d="M${P(x, 0).join(' ')}L${P(x, n + 1).join(' ')}"/>`;
  for (let y = 0; y <= n + 1; y++) out += `<path class="s-grid" d="M${P(0, y).join(' ')}L${P(n, y).join(' ')}"/>`;
  // 対角線 y = x と、越えてはいけない線 y = x + 1
  out += `<path class="dash" d="M${P(0, 0).join(' ')}L${P(n, n).join(' ')}"/>`;
  out += `<path class="forbid" d="M${P(0, 1).join(' ')}L${P(n, n + 1).join(' ')}"/>`;
  const [tx, ty] = P(n, n + 1);
  out += `<text x="${tx - 6}" y="${ty - 8}" text-anchor="end" class="lbl-verm">y = x + 1</text>`;
  const pts = points(path);
  const complete = path.length === 2 * n;
  const good = isGood(path);
  const t = firstTouch(path);
  if (st.showReflect && t >= 0 && complete) {
    const rpts = points(reflect(path));
    out += `<path class="refl" d="${pathD(rpts.slice(t), P)}"/>`;
    const [ex, ey] = P(n - 1, n + 1);
    out += `<circle cx="${ex}" cy="${ey}" r="7" class="head-green"/><text x="${ex + 10}" y="${ey + 5}" class="lbl-green">(${n - 1}, ${n + 1})</text>`;
  }
  out += `<path class="${good ? 'walk good' : 'walk bad'}" d="${pathD(pts, P)}"/>`;
  if (t >= 0) {
    const [hx, hy] = P(pts[t]![0], pts[t]![1]);
    out += `<circle cx="${hx}" cy="${hy}" r="8" class="head-verm"/>`;
  }
  const [sx, sy] = P(0, 0);
  const [gx, gy] = P(n, n);
  out += `<circle cx="${sx}" cy="${sy}" r="6" class="head-ink"/><text x="${sx - 10}" y="${sy + 20}" class="lbl">(0, 0)</text>`;
  out += `<circle cx="${gx}" cy="${gy}" r="6" class="head-ink"/><text x="${gx + 10}" y="${gy + 18}" class="lbl">(${n}, ${n})</text>`;
  const last = pts.at(-1)!;
  const [cx, cy] = P(last[0], last[1]);
  if (!complete) out += `<circle cx="${cx}" cy="${cy}" r="7" class="knob"/>`;
  return out;
}

export function latticeReadout(st: LatticeState): string {
  const { n, path } = st;
  const total = binom(2 * n, n);
  const bad = binom(2 * n, n + 1);
  const counts = `(0,0) から (${n},${n}) への最短経路 <strong>${total}</strong> 本 − y = x + 1 に触れる経路 <strong>${bad}</strong> 本 = 対角線を越えない経路 <strong>${catalan(n)}</strong> 本（カタラン数 C<sub>${n}</sub>）`;
  if (path.length < 2 * n) return `${counts}<br>経路を作成中（${path.length} / ${2 * n} 歩）`;
  const status = isGood(path)
    ? '<span class="ok">この経路は対角線を越えない（良い経路）。</span>'
    : st.showReflect
      ? `<span class="warn">悪い経路：初めて y = x + 1 に触れた点（朱）から先を対角線に関して折り返すと、(${n - 1}, ${n + 1}) へ向かう経路（緑）になる。この対応は1対1。</span>`
      : '<span class="warn">悪い経路（y = x + 1 に触れている）。「反射を表示」で対応を見てみよう。</span>';
  return `${counts}<br>${status}`;
}

export function randomPath(n: number): Step[] {
  const s: Step[] = [...Array<Step>(n).fill('R'), ...Array<Step>(n).fill('U')];
  for (let i = s.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [s[i], s[j]] = [s[j]!, s[i]!];
  }
  return s;
}
