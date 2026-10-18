import { pappus, shellExact, shellSum } from '../../math/volume';
import { fmt, fnPath, gridSvg, makeScale, type View } from '../plot';

export const W = 720;
export const H = 420;

export interface VolumeState {
  mode: 'shell' | 'pappus';
  /** 円筒殻の枚数 */
  n: number;
  /** 強調する殻の番号 (0..n−1) */
  k: number;
  R: number;
  r: number;
  /** 回転角 (度) */
  theta: number;
}

const f = Math.sin;
const A = 0;
const B = Math.PI;
const r1 = (x: number) => Math.round(x * 10) / 10;

/** 斜投影: 回転軸は画面の縦。奥行き z は斜め上に縮めて描く */
function oblique(cx: number, cy: number, s: number) {
  return (x: number, y: number, z: number): [number, number] => [r1(cx + s * x), r1(cy - s * y - s * 0.32 * z)];
}

function ellipse(P: (x: number, y: number, z: number) => [number, number], rad: number, h: number, cls: string, half?: 'front' | 'back'): string {
  const pts: string[] = [];
  const from = half === 'back' ? 0 : half === 'front' ? Math.PI : 0;
  const to = half ? from + Math.PI : 2 * Math.PI;
  for (let i = 0; i <= 48; i++) {
    const t = from + ((to - from) * i) / 48;
    const [x, y] = P(rad * Math.cos(t), h, rad * Math.sin(t));
    pts.push(`${i ? 'L' : 'M'}${x} ${y}`);
  }
  return `<path class="${cls}" d="${pts.join('')}${half ? '' : 'Z'}"/>`;
}

function shellScene(st: VolumeState): string {
  // 左: 断面のグラフ
  const v: View = { xMin: -0.3, xMax: 3.5, yMin: -0.25, yMax: 1.35, width: 300, height: 300 };
  const s = makeScale(v);
  const dx = (B - A) / st.n;
  let left = '';
  for (let i = 0; i < st.n; i++) {
    const xm = A + (i + 0.5) * dx;
    const x = s.sx(A + i * dx);
    const w = s.sx(A + (i + 1) * dx) - x;
    const y = s.sy(f(xm));
    left += `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(s.sy(0) - y)}" class="${i === st.k ? 'strip on' : 'strip'}"/>`;
  }
  left += `<path class="curve-f" d="${fnPath(f, v, { from: A, to: B, samples: 200 })}"/>`;
  left = `<g transform="translate(20 70)">${gridSvg(v, 1)}${left}<text x="${s.sx(0) + 6}" y="14" class="lbl">回転軸 (y 軸)</text><text x="${s.sx(3.14) - 4}" y="${s.sy(0) + 18}" class="lbl">π</text></g>`;
  // 右: 斜投影の立体
  const P = oblique(530, 330, 52);
  let right = '';
  // 立体の輪郭 (母線)
  const sil = (sign: number) =>
    Array.from({ length: 61 }, (_, i) => {
      const x = (Math.PI * i) / 60;
      const [px, py] = P(sign * x, f(x), 0);
      return `${i ? 'L' : 'M'}${px} ${py}`;
    }).join('');
  right += `<path class="solid-edge" d="${sil(1)}"/><path class="solid-edge" d="${sil(-1)}"/>`;
  right += ellipse(P, Math.PI, 0, 'solid-edge');
  const xm = A + (st.k + 0.5) * dx;
  const h = f(xm);
  const rin = A + st.k * dx;
  const rout = A + (st.k + 1) * dx;
  right += ellipse(P, rout, 0, 'shell-line', 'back') + ellipse(P, rout, h, 'shell-top');
  right += ellipse(P, rin, h, 'shell-line');
  const [lx1, ly1] = P(-rout, 0, 0);
  const [lx2, ly2] = P(-rout, h, 0);
  const [rx1, ry1] = P(rout, 0, 0);
  const [rx2, ry2] = P(rout, h, 0);
  right += `<path class="shell-side" d="M${lx1} ${ly1}L${lx2} ${ly2}M${rx1} ${ry1}L${rx2} ${ry2}"/>`;
  right += ellipse(P, rout, 0, 'shell-line', 'front');
  const [ax1, ay1] = P(0, -0.2, 0);
  const [ax2, ay2] = P(0, 1.6, 0);
  right += `<path class="axis-rot" d="M${ax1} ${ay1}L${ax2} ${ay2}"/>`;
  right += `<text x="380" y="40" class="lbl">半径 x、高さ f(x)、厚さ Δx の円筒殻</text>`;
  return left + right;
}

function pappusScene(st: VolumeState): string {
  const P = oblique(W / 2 - 40, 250, 46);
  const th = (st.theta * Math.PI) / 180;
  let out = '';
  // 回転軸
  const [ax1, ay1] = P(0, -3, 0);
  const [ax2, ay2] = P(0, 3.2, 0);
  out += `<path class="axis-rot" d="M${ax1} ${ay1}L${ax2} ${ay2}"/>`;
  out += `<text x="${ax2 + 8}" y="${ay2 + 4}" class="lbl">回転軸</text>`;
  // 断面の円板: 軸を含む平面 (角 φ) 上の円
  const section = (phi: number, cls: string) => {
    const pts: string[] = [];
    for (let i = 0; i <= 40; i++) {
      const t = (2 * Math.PI * i) / 40;
      const rho = st.R + st.r * Math.cos(t);
      const [x, y] = P(rho * Math.cos(phi), st.r * Math.sin(t), rho * Math.sin(phi));
      pts.push(`${i ? 'L' : 'M'}${x} ${y}`);
    }
    return `<path class="${cls}" d="${pts.join('')}Z"/>`;
  };
  const steps = Math.max(1, Math.round(st.theta / 12));
  for (let i = 1; i < steps; i++) out += section((th * i) / steps, 'sweep');
  out += section(0, 'disk');
  if (st.theta > 0) out += section(th, 'disk end');
  // 重心の軌跡
  const arc: string[] = [];
  for (let i = 0; i <= 60; i++) {
    const phi = (th * i) / 60;
    const [x, y] = P(st.R * Math.cos(phi), 0, st.R * Math.sin(phi));
    arc.push(`${i ? 'L' : 'M'}${x} ${y}`);
  }
  out += `<path class="centroid-path" d="${arc.join('')}"/>`;
  const [gx, gy] = P(st.R, 0, 0);
  out += `<circle cx="${gx}" cy="${gy}" r="5" class="head-verm"/><text x="${gx + 8}" y="${gy + 18}" class="lbl-verm">重心</text>`;
  return out;
}

export function volumeScene(st: VolumeState): string {
  return st.mode === 'shell' ? shellScene(st) : pappusScene(st);
}

export function volumeReadout(st: VolumeState): string {
  if (st.mode === 'shell') {
    const approx = shellSum(f, A, B, st.n);
    const exact = shellExact(f, A, B);
    const xm = A + (st.k + 0.5) * ((B - A) / st.n);
    return (
      `強調した殻：半径 ${fmt(xm, 3)}、高さ ${fmt(f(xm), 3)}、体積 ≈ 2π·${fmt(xm, 3)}·${fmt(f(xm), 3)}·${fmt((B - A) / st.n, 3)} = <strong>${fmt(2 * Math.PI * xm * f(xm) * ((B - A) / st.n), 4)}</strong><br>` +
      `${st.n} 枚の殻の体積の和 = <strong>${fmt(approx, 5)}</strong>　真の体積 2π∫₀^π x sin x dx = 2π² = <strong>${fmt(exact, 5)}</strong>　誤差 ${fmt(Math.abs(approx - exact), 5)}`
    );
  }
  const th = (st.theta * Math.PI) / 180;
  const area = Math.PI * st.r * st.r;
  const ok = st.r <= st.R;
  const v = pappus(st.R, area, th);
  const status = ok
    ? `<span class="ok">円板は軸の片側にある（r ≤ R）ので定理が使える。</span>`
    : `<span class="warn">r > R：円板が回転軸をまたいでいる。軸の両側の部分が重なって掃くので、パップス・ギュルダンの定理は使えない。</span>`;
  return (
    `面積 S = πr² = <strong>${fmt(area, 3)}</strong>、重心と軸の距離 R = <strong>${fmt(st.R, 2)}</strong>、回転角 θ = ${st.theta}°（${fmt(th, 3)} rad）<br>` +
    `V = θ·R·S = <strong>${ok ? fmt(v, 4) : '—'}</strong>${ok && st.theta === 360 ? `（1回転：2π²Rr² = ${fmt(2 * Math.PI ** 2 * st.R * st.r ** 2, 4)}）` : ''}<br>${status}`
  );
}
