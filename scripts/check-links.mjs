// src/ 内でルート相対の href="/..." や src="/..." を直接書いていないか検査する。
// GitHub Pages では /advmath/ 配下に公開されるため、内部リンクは必ず url() を通す。
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../src/', import.meta.url));
const PATTERN = /\b(?:href|src)=["']\/(?!\/)/g;

async function* walk(dir) {
  for (const ent of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) yield* walk(p);
    else if (/\.(astro|mdx|ts|md)$/.test(ent.name)) yield p;
  }
}

let bad = 0;
for await (const file of walk(ROOT)) {
  const text = await readFile(file, 'utf8');
  text.split('\n').forEach((line, i) => {
    if (PATTERN.test(line)) {
      console.error(`${file}:${i + 1}: ルート相対リンクは url() を使ってください\n  ${line.trim()}`);
      bad++;
    }
    PATTERN.lastIndex = 0;
  });
}
if (bad) process.exit(1);
console.log('check-links: OK');
