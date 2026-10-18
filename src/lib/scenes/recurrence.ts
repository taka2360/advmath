import { evaluate, iterate, solve, type Solution } from '../../math/recurrence';
import { fmt } from '../plot';

export const W = 720;
export const H = 380;
const N = 12;

export interface RecState {
  p: number;
  q: number;
  a0: number;
  a1: number;
}

const r1 = (x: number) => Math.round(x * 10) / 10;

export function recScene(st: RecState): string {
  const seq = iterate(st.p, st.q, st.a0, st.a1, N);
  const sol = solve(st.p, st.q, st.a0, st.a1);
  const max = Math.max(1, ...seq.map((v) => Math.abs(v)));
  const x0 = 40;
  const x1 = 500;
  const mid = H / 2;
  const half = H / 2 - 40;
  const bw = (x1 - x0) / N;
  let out = `<path class="s-axis" d="M${x0} ${mid}H${x1}"/>`;
  seq.forEach((v, n) => {
    const h = (v / max) * half;
    const x = x0 + n * bw + bw * 0.18;
    out += `<rect x="${r1(x)}" y="${r1(h >= 0 ? mid - h : mid)}" width="${r1(bw * 0.64)}" height="${r1(Math.max(1, Math.abs(h)))}" class="bar"/>`;
    const f = evaluate(sol, n);
    out += `<circle cx="${r1(x + bw * 0.32)}" cy="${r1(mid - (f / max) * half)}" r="4.5" class="head-verm"/>`;
    out += `<text x="${r1(x + bw * 0.32)}" y="${H - 10}" text-anchor="middle" class="lbl">${n}</text>`;
  });
  out += `<text x="${x0}" y="22" class="lbl">縦軸の最大 = ${fmt(max, 2)}</text>`;
  // 特性方程式の根を複素数平面に
  const cx = 610;
  const cy = mid;
  const R = 50;
  out += `<circle cx="${cx}" cy="${cy}" r="${R}" class="ring"/><path class="s-axis" d="M${cx - 90} ${cy}H${cx + 90}M${cx} ${cy - 90}V${cy + 90}"/>`;
  out += `<text x="${cx - 88}" y="${cy - 96}" class="lbl">根（単位円つき）</text>`;
  const roots = rootsOf(sol, st);
  for (const [re, im] of roots) {
    const k = Math.max(1, Math.hypot(re, im) / 1.7);
    out += `<circle cx="${r1(cx + (R * re) / k)}" cy="${r1(cy - (R * im) / k)}" r="6" class="head-accent"/>`;
  }
  return out;
}

function rootsOf(sol: Solution, st: RecState): Array<[number, number]> {
  switch (sol.kind) {
    case 'distinct':
      return [
        [sol.r1, 0],
        [sol.r2, 0],
      ];
    case 'double':
      return [[sol.r, 0]];
    case 'complex':
      return [
        [sol.r * Math.cos(sol.theta), sol.r * Math.sin(sol.theta)],
        [sol.r * Math.cos(sol.theta), -sol.r * Math.sin(sol.theta)],
      ];
    case 'zero':
      return st.p === 0 && st.q === 0 ? [[0, 0]] : [];
  }
}

export function recReadout(st: RecState): string {
  const sol = solve(st.p, st.q, st.a0, st.a1);
  const f = (x: number) => fmt(x, 3);
  const eq = `x² = ${fmt(st.p, 2)}x ${st.q < 0 ? '−' : '+'} ${fmt(Math.abs(st.q), 2)}`;
  let form: string;
  switch (sol.kind) {
    case 'distinct':
      form = `<span class="ok">異なる2つの実数解 ${f(sol.r1)}, ${f(sol.r2)}</span><br>aₙ = <strong>${f(sol.A)}·(${f(sol.r1)})ⁿ + ${f(sol.B)}·(${f(sol.r2)})ⁿ</strong>`;
      break;
    case 'double':
      form = `<span class="warn">重解 ${f(sol.r)}：λⁿ だけでは足りず、n λⁿ の項が必要</span><br>aₙ = <strong>(${f(sol.A)} + ${f(sol.B)}n)·(${f(sol.r)})ⁿ</strong>`;
      break;
    case 'complex':
      form = `<span class="ok">虚数解 r(cos θ ± i sin θ)、r = ${f(sol.r)}, θ = ${f(sol.theta)}：振動しながら rⁿ で伸び縮み</span><br>aₙ = <strong>${f(sol.r)}ⁿ (${f(sol.A)} cos ${f(sol.theta)}n + ${f(sol.B)} sin ${f(sol.theta)}n)</strong>`;
      break;
    case 'zero':
      form = '<span>p = q = 0 なので a₂ 以降はすべて 0</span>';
  }
  return `aₙ₊₂ = ${fmt(st.p, 2)}aₙ₊₁ ${st.q < 0 ? '−' : '+'} ${fmt(Math.abs(st.q), 2)}aₙ,　a₀ = ${fmt(st.a0, 2)},　a₁ = ${fmt(st.a1, 2)}<br>特性方程式 ${eq} の解は ${form}<br><span class="fig-note">棒＝漸化式で順に計算した値、朱の点＝一般項の式で計算した値（一致する）</span>`;
}
