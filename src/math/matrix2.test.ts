import { describe, expect, it } from 'vitest';
import { apply, chCoefficients, det, eigen, mul, pow, rotation, trace, type M2 } from './matrix2';

const close = (p: M2, q: M2) => p.forEach((v, i) => expect(v).toBeCloseTo(q[i]!, 9));

describe('matrix2', () => {
  it('ケーリー・ハミルトン A² − (tr A)A + (det A)I = O', () => {
    const A: M2 = [2, -1, 3, 0.5];
    const A2 = mul(A, A);
    const t = trace(A);
    const d = det(A);
    close([A2[0] - t * A[0] + d, A2[1] - t * A[1], A2[2] - t * A[2], A2[3] - t * A[3] + d], [0, 0, 0, 0]);
  });

  it('A^n = p_n A + q_n I が累乗と一致する', () => {
    const A: M2 = [1, 1, 1, 0];
    const coeffs = chCoefficients(trace(A), det(A), 12);
    for (let n = 0; n <= 12; n++) {
      const [p, q] = coeffs[n]!;
      close(pow(A, n), [p * A[0] + q, p * A[1], p * A[2], p * A[3] + q]);
    }
    // フィボナッチ: A^12 の (1,2) 成分は F_12 = 144
    expect(pow(A, 12)[1]).toBe(144);
  });

  it('90° 回転には実固有ベクトルがない', () => {
    const e = eigen(rotation(Math.PI / 2));
    expect(e.kind).toBe('complex');
    if (e.kind === 'complex') {
      expect(e.re).toBeCloseTo(0, 9);
      expect(e.im).toBeCloseTo(1, 9);
    }
  });

  it('180° 回転は −I (すべての方向が固有方向)', () => {
    expect(eigen(rotation(Math.PI)).kind).toBe('scalar');
  });

  it('せん断は重解で固有方向が1つだけ', () => {
    const e = eigen([1, 1, 0, 1]);
    expect(e.kind).toBe('repeated');
    if (e.kind === 'repeated') {
      expect(e.value).toBeCloseTo(1, 9);
      expect(Math.abs(e.vector[1])).toBeCloseTo(0, 9);
    }
  });

  it('相異なる実固有値の固有ベクトルは Av = λv', () => {
    const A: M2 = [2, 1, 1, 2];
    const e = eigen(A);
    expect(e.kind).toBe('distinct');
    if (e.kind === 'distinct') {
      e.vectors.forEach((v, i) => {
        const Av = apply(A, v);
        expect(Av[0]).toBeCloseTo(e.values[i]! * v[0], 9);
        expect(Av[1]).toBeCloseTo(e.values[i]! * v[1], 9);
      });
      expect(e.values).toEqual([3, 1]);
    }
  });
});
