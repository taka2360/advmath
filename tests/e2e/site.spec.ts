import { expect, test, type Page } from '@playwright/test';
import { readdirSync } from 'node:fs';

const slugs = readdirSync('src/content/units').map((f) => f.replace(/\.mdx$/, ''));
const pages = ['', 'units/', 'map/', 'review/', 'about/', 'privacy/', ...slugs.map((s) => `units/${s}/`)];

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  return errors;
}

for (const path of pages) {
  test(`表示: /${path} にエラーと横スクロールがない`, async ({ page }) => {
    const errors = collectErrors(page);
    const external: string[] = [];
    page.on('request', (r) => {
      const u = new URL(r.url());
      if (u.hostname !== 'localhost') external.push(r.url());
    });
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    expect(errors).toEqual([]);
    expect(external, '第三者への通信').toEqual([]);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    // 数式が描画されている (未変換の $ が本文に残っていない)
    const text = await page.locator('main').evaluate((m) => {
      const c = m.cloneNode(true) as HTMLElement;
      c.querySelectorAll('.katex, script, style').forEach((e) => e.remove());
      return c.textContent ?? '';
    });
    expect(text).not.toMatch(/\$[^$]+\$/);
  });
}

test('図: テイラー多項式の次数を変えると読み取り値が更新される', async ({ page }) => {
  await page.goto('units/taylor/');
  const fig = page.locator('[data-figure="taylor"]');
  const readout = fig.locator('[data-k="readout"]');
  const before = await readout.textContent();
  await fig.locator('input[data-in="n"]').fill('9');
  await expect(readout).not.toHaveText(before!);
  await expect(readout).toContainText('P9(x)');
  await fig.getByRole('button', { name: 'log(1+x)' }).click();
  await expect(readout).toContainText('収束範囲の外');
});

test('図: キーボードで点を動かせる', async ({ page }) => {
  await page.goto('units/jensen/');
  const fig = page.locator('[data-figure="convex"]');
  const readout = fig.locator('[data-k="readout"]');
  const before = await readout.textContent();
  await fig.locator('[data-k="h1"]').focus();
  await page.keyboard.press('ArrowRight');
  await expect(readout).not.toHaveText(before!);
});

test('図: 90° 回転では実固有ベクトルなしと表示する', async ({ page }) => {
  await page.goto('units/linear-map/');
  const fig = page.locator('[data-figure="matrix"]');
  await fig.getByRole('button', { name: '90°回転' }).click();
  await expect(fig.locator('[data-k="readout"]')).toContainText('実数の固有ベクトルは存在しない');
});

test('演習: 自己採点が復習リストに反映され、消去できる', async ({ page }) => {
  await page.goto('units/taylor/');
  const ex = page.locator('[data-exercise="taylor-2"]');
  await ex.getByRole('button', { name: 'もう一度' }).click();
  await expect(ex.getByRole('button', { name: 'もう一度' })).toHaveAttribute('aria-pressed', 'true');
  await page.goto('review/');
  await expect(page.locator('[data-list="review"]')).toContainText('誤差を保証した近似値');
  await page.getByRole('button', { name: 'すべての記録を消去' }).click();
  await page.getByRole('button', { name: '本当に消去する' }).click();
  await expect(page.locator('[data-list="review"]')).toBeEmpty();
});

test('演習: localStorage が使えなくても解答は読め、例外で止まらない', async ({ page }) => {
  await page.addInitScript(() => {
    const fail = () => {
      throw new Error('blocked');
    };
    Storage.prototype.getItem = fail;
    Storage.prototype.setItem = fail;
    Storage.prototype.removeItem = fail;
  });
  const errors = collectErrors(page);
  await page.goto('units/congruence/');
  const ex = page.locator('[data-exercise="mod-1"]');
  await ex.getByRole('button', { name: '解けた' }).click();
  await expect(ex.locator('[data-msg]')).toContainText('保存できません');
  await ex.locator('summary', { hasText: '解答' }).click();
  await expect(ex.locator('details[data-kind="answer"]')).toHaveAttribute('open', '');
  expect(errors).toEqual([]);
});

test('検索: 用語・別名で該当単元が見つかる', async ({ page }) => {
  await page.goto('');
  const cases: Array<[string, string]> = [
    ['マクローリン', 'テイラー展開'],
    ['ロピタル', 'ロピタル'],
    ['合同式', '合同式'],
    ['mod', '合同式'],
    ['カタラン', 'カタラン'],
    ['固有値', '行列'],
    ['バウムクーヘン', 'バウムクーヘン'],
    ['スターリング', '漸近'],
  ];
  await page.keyboard.press('Control+k');
  const input = page.locator('[data-search-input]');
  await expect(input).toBeVisible();
  for (const [q, expected] of cases) {
    await input.fill(q);
    await expect(page.locator('[data-search-results] li').first(), q).toContainText(expected, { timeout: 5000 });
  }
});

test('テーマ: 切替ボタンでライト/ダークが変わる', async ({ page }) => {
  await page.goto('');
  const before = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await page.getByRole('button', { name: 'ライト/ダークの切替' }).click();
  const after = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(after).not.toBe(before);
});

test.describe('JavaScript 無効', () => {
  test.use({ javaScriptEnabled: false });

  test('図は静的に描かれ、解答は開ける', async ({ page }) => {
    await page.goto('units/recurrence/');
    const paths = page.locator('[data-figure="recurrence"] svg rect.bar');
    expect(await paths.count()).toBeGreaterThan(5);
    const ex = page.locator('[data-exercise="rec-1"]');
    await ex.locator('summary', { hasText: '解答' }).click();
    await expect(ex.locator('details[data-kind="answer"]')).toHaveAttribute('open', '');
  });
});
