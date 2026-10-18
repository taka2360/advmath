import { gcd, isPrime, modPow, order, powerSequence } from '../../math/modular';

export const W = 640;
export const H = 440;
const CX = W / 2;
const CY = H / 2;
const R = 170;

export interface ModState {
  m: number;
  a: number;
}

const pos = (k: number, m: number): [number, number] => {
  const th = -Math.PI / 2 + (2 * Math.PI * k) / m;
  return [Math.round((CX + R * Math.cos(th)) * 10) / 10, Math.round((CY + R * Math.sin(th)) * 10) / 10];
};

export function modScene(st: ModState): string {
  const { m, a } = st;
  const ord = order(a, m);
  const len = ord ?? m + 1;
  const seq = powerSequence(a, m, len + 1);
  const visited = new Set(seq);
  let out = `<circle cx="${CX}" cy="${CY}" r="${R}" class="ring"/>`;
  // a^k → a^{k+1} を弦で結ぶ
  for (let k = 0; k < len; k++) {
    const [x1, y1] = pos(seq[k]!, m);
    const [x2, y2] = pos(seq[k + 1]!, m);
    if (seq[k] === seq[k + 1]) continue;
    out += `<path class="chord" d="M${x1} ${y1}L${x2} ${y2}" style="opacity:${(0.45 + (0.55 * (k + 1)) / len).toFixed(2)}"/>`;
  }
  for (let r = 0; r < m; r++) {
    const [x, y] = pos(r, m);
    const [lx, ly] = [CX + (x - CX) * 1.13, CY + (y - CY) * 1.13];
    const cls = r === 1 ? 'res one' : visited.has(r) ? 'res on' : 'res';
    out += `<circle cx="${x}" cy="${y}" r="${m > 18 ? 7 : 9}" class="${cls}"/>`;
    out += `<text x="${lx}" y="${ly + 5}" text-anchor="middle" class="lbl">${r}</text>`;
  }
  out += `<text x="${CX}" y="${CY - 6}" text-anchor="middle" class="lbl-ink">${a} の累乗</text>`;
  out += `<text x="${CX}" y="${CY + 18}" text-anchor="middle" class="lbl">mod ${m}</text>`;
  return out;
}

export function modReadout(st: ModState): string {
  const { m, a } = st;
  const g = gcd(a, m);
  const ord = order(a, m);
  const seq = powerSequence(a, m, Math.min(m + 1, 13));
  const list = seq.map((r, k) => `${a}<sup>${k}</sup>≡<strong>${r}</strong>`).join('　');
  const prime = isPrime(m);
  const fermat = modPow(a, m - 1, m);
  let status: string;
  if (prime && g === 1) {
    status = `<span class="ok">${m} は素数で ${m}∤${a}。フェルマーの小定理どおり ${a}<sup>${m - 1}</sup> ≡ ${fermat} (mod ${m})。周期 ${ord} は ${m - 1} の約数。</span>`;
  } else if (prime) {
    status = `<span class="warn">${m} は素数だが ${m} | ${a}。条件 p∤a を外れるので ${a}<sup>${m - 1}</sup> ≡ ${fermat} (mod ${m}) となり、1 にならない。</span>`;
  } else if (fermat === 1n) {
    status = `<span class="warn">${m} は合成数なのに ${a}<sup>${m - 1}</sup> ≡ 1 (mod ${m})。小定理の逆は成り立たない（1 になっても素数とは限らない）。</span>`;
  } else {
    status = `<span class="warn">${m} は合成数で、${a}<sup>${m - 1}</sup> ≡ ${fermat} (mod ${m})。素数でなければ 1 になるとは限らない。</span>`;
  }
  const period = ord ? `周期（${a} の位数）= <strong>${ord}</strong>` : `gcd(${a}, ${m}) = ${g} なので、累乗は 1 に戻らない`;
  return `${list}${seq.length < m + 1 ? '　…' : ''}<br>${period}<br>${status}`;
}
