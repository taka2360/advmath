import { chCoefficients, det, pow, trace, type M2 } from '../../math/matrix2';

export const CH_PRESETS: Array<{ id: string; label: string; m: M2 }> = [
  { id: 'fib', label: '(1 1 ; 1 0)', m: [1, 1, 1, 0] },
  { id: 'sym', label: '(2 1 ; 1 2)', m: [2, 1, 1, 2] },
  { id: 'gen', label: '(1 2 ; 3 4)', m: [1, 2, 3, 4] },
  { id: 'jordan', label: '(2 1 ; 0 2)', m: [2, 1, 0, 2] },
];

export interface ChState {
  preset: string;
  n: number;
}

const mat = (m: M2) => `(${m[0]} ${m[1]} ; ${m[2]} ${m[3]})`;
const sgn = (x: number) => (x < 0 ? `− ${-x}` : `+ ${x}`);

export function chTable(st: ChState): string {
  const p = CH_PRESETS.find((q) => q.id === st.preset) ?? CH_PRESETS[0]!;
  const A = p.m;
  const t = trace(A);
  const d = det(A);
  const coeffs = chCoefficients(t, d, st.n);
  const rows = coeffs
    .map(([pn, qn], n) => {
      if (n === 0) return '';
      const direct = pow(A, n);
      const viaCh: M2 = [pn * A[0] + qn, pn * A[1], pn * A[2], pn * A[3] + qn];
      const ok = direct.every((v, i) => v === viaCh[i]);
      return `<tr><td>${n}</td><td>${pn}</td><td>${qn}</td><td>${mat(viaCh)}</td><td class="${ok ? 'ok' : ''}">${ok ? '一致' : '不一致'}</td></tr>`;
    })
    .join('');
  return (
    `<p class="ch-rel">A = <b>${mat(A)}</b>　tr A = <b>${t}</b>　det A = <b>${d}</b>　より　<b>A² = ${t}A ${sgn(-d)}I</b>` +
    `<br>漸化式 p<sub>n+1</sub> = ${t}p<sub>n</sub> + q<sub>n</sub>,　q<sub>n+1</sub> = ${-d}p<sub>n</sub></p>` +
    `<table class="ch-table"><thead><tr><th>n</th><th>p<sub>n</sub></th><th>q<sub>n</sub></th><th>p<sub>n</sub>A + q<sub>n</sub>I</th><th>Aⁿ と</th></tr></thead><tbody>${rows}</tbody></table>`
  );
}
