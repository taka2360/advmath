// ビルド成果物 (dist/) の検査:
//  1. 未変換の数式 ($...$) が本文に残っていない
//  2. 内部リンクが /advmath/ 配下を指し、実在するファイルに解決できる
//  3. 第三者ドメインのスクリプト・スタイル・フォントを読み込んでいない
import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
const BASE = '/advmath/';
const errors = [];

async function* walk(dir) {
  for (const ent of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) yield* walk(p);
    else if (ent.name.endsWith('.html')) yield p;
  }
}

function resolves(pathname) {
  const p = join(DIST, decodeURI(pathname.slice(BASE.length)));
  return pathname.endsWith('/') ? existsSync(join(p, 'index.html')) : existsSync(p);
}

let pages = 0;
for await (const file of walk(DIST)) {
  pages++;
  const html = await readFile(file, 'utf8');
  const name = file.slice(DIST.length);

  const markup = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '');
  const text = markup
    .replace(/<annotation[\s\S]*?<\/annotation>/g, '')
    .replace(/<[^>]+>/g, '');
  const dollar = text.match(/.{0,30}\$.{0,30}/);
  if (dollar) errors.push(`${name}: 未変換の数式の可能性: …${dollar[0]}…`);
  if (/katex-error/.test(html)) errors.push(`${name}: KaTeX のエラー表示があります`);

  for (const m of markup.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const link = m[1];
    if (/^(https?:|mailto:|#|data:)/.test(link)) continue;
    if (!link.startsWith(BASE)) {
      errors.push(`${name}: base 外のリンク ${link}`);
      continue;
    }
    const path = link.split('#')[0].split('?')[0];
    if (!resolves(path)) errors.push(`${name}: リンク切れ ${link}`);
  }

  for (const m of html.matchAll(/<(?:script|link)\b[^>]*(?:src|href)="(https?:[^"]+)"/g)) {
    const tag = m[0];
    if (/rel="(?:canonical|sitemap)"/.test(tag)) continue;
    errors.push(`${name}: 外部リソースを読み込んでいます ${m[1]}`);
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  console.error(`\ncheck-dist: ${errors.length} 件の問題 (${pages} ページ)`);
  process.exit(1);
}
console.log(`check-dist: OK (${pages} ページ)`);
