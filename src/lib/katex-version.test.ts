import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const version = (path: string) => (JSON.parse(readFileSync(path, 'utf8')) as { version: string }).version;

describe('KaTeX', () => {
  it('CSS を読み込む katex と、rehype-katex が使う katex のバージョンが一致する', () => {
    // 不一致だとクラス名が食い違い、≠ やベクトルの矢印などの重ね描きが崩れる
    const top = version('node_modules/katex/package.json');
    const nested = 'node_modules/rehype-katex/node_modules/katex/package.json';
    const fromRehype = existsSync(nested) ? version(nested) : top;
    expect(fromRehype).toBe(top);
  });
});
