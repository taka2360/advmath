import { describe, expect, it } from 'vitest';
import { pappus, shellExact, shellSum, simpson } from './volume';

describe('volume', () => {
  it('y = sin x (0≤x≤π) を y 軸まわりに回転: 2π²', () => {
    expect(shellExact(Math.sin, 0, Math.PI)).toBeCloseTo(2 * Math.PI ** 2, 8);
    expect(shellSum(Math.sin, 0, Math.PI, 2000)).toBeCloseTo(2 * Math.PI ** 2, 4);
  });

  it('円筒殻の枚数を増やすと真の値に近づく', () => {
    const exact = 2 * Math.PI ** 2;
    const e = (n: number) => Math.abs(shellSum(Math.sin, 0, Math.PI, n) - exact);
    expect(e(40)).toBeLessThan(e(10));
    expect(e(10)).toBeLessThan(e(3));
  });

  it('トーラス: 円板 (半径 r, 中心と軸の距離 R ≥ r) を1回転すると 2π² R r²', () => {
    const R = 3;
    const r = 1;
    expect(pappus(R, Math.PI * r * r)).toBeCloseTo(2 * Math.PI ** 2 * R * r * r, 12);
    // 断面ごとの円環の面積を積分した値と一致する (軸を y 軸、円板の中心を (R, 0) に置く)
    const byWashers = simpson(
      (y) => {
        const w = Math.sqrt(Math.max(0, r * r - y * y));
        return Math.PI * ((R + w) ** 2 - (R - w) ** 2);
      },
      -r,
      r,
      20000,
    );
    expect(byWashers).toBeCloseTo(2 * Math.PI ** 2 * R * r * r, 3);
  });

  it('円錐 (直角三角形の回転) でも重心の公式が合う', () => {
    // 頂点 (0,0),(1,0),(0,h) の三角形を y 軸まわり: 体積 π h / 3
    const h = 2;
    const area = h / 2;
    const xg = 1 / 3;
    expect(pappus(xg, area)).toBeCloseTo((Math.PI * h) / 3, 12);
  });
});
