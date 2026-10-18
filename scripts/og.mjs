// OGP 画像 (public/og.png, 1200×630) を生成する。デザインを変えたときだけ手動で実行する。
//   node scripts/og.mjs
import { chromium } from '@playwright/test';
import { readdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const fontDir = fileURLToPath(new URL('../node_modules/@fontsource/zen-old-mincho/files/', import.meta.url));
// 日本語の全サブセットを読み込む (@fontsource は文字範囲ごとに分割されている)
const faces = readdirSync(fontDir)
  .filter((f) => /zen-old-mincho-\d+-700-normal\.woff2$/.test(f))
  .map((f) => `@font-face{font-family:Z;font-weight:700;src:url(${pathToFileURL(fontDir + f).href})}`)
  .join('\n');

// sin x と 7 次のテイラー多項式
const pts = (fn) =>
  Array.from({ length: 301 }, (_, i) => {
    const x = -8 + (16 * i) / 300;
    const y = Math.max(-6, Math.min(6, fn(x)));
    return `${i ? 'L' : 'M'}${(((x + 8) / 16) * 560).toFixed(1)} ${(210 - y * 70).toFixed(1)}`;
  }).join('');
const taylor7 = (x) => x - x ** 3 / 6 + x ** 5 / 120 - x ** 7 / 5040;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
${faces}
body{margin:0;width:1200px;height:630px;background:#f6f4ee;font-family:Z,serif;color:#1c1b19;display:flex;align-items:center;overflow:hidden}
.l{padding:0 0 0 80px;width:600px}
.e{font-family:sans-serif;font-size:22px;letter-spacing:.2em;color:#b93d14;margin:0 0 18px}
h1{font-size:78px;line-height:1.25;margin:0;letter-spacing:.04em}
p{font-size:30px;line-height:1.6;margin:26px 0 0;color:#47443e}
svg{margin-left:10px}
</style></head><body>
<div class="l"><div class="e">BEYOND THE SYLLABUS</div><h1>範囲の外側</h1><p>高校数学のすぐ外側を、<br>触って・証明して・答案まで。</p></div>
<svg width="560" height="420" viewBox="0 0 560 420">
<path d="M0 210H560M280 0V420" stroke="#cfc8b8" stroke-width="2"/>
<path d="${pts(Math.sin)}" fill="none" stroke="#1c1b19" stroke-width="4"/>
<path d="${pts(taylor7)}" fill="none" stroke="#b93d14" stroke-width="5"/>
</svg></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: fileURLToPath(new URL('../public/og.png', import.meta.url)) });
await browser.close();
console.log('public/og.png を生成しました');
