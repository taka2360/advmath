# 範囲の外側 — Beyond the Syllabus

高校数学のすぐ外側にある道具（テイラー展開、行列、合同式、カタラン数など）を、
**直観・定理・証明・答案の作法** の4層で学べる、高校生向けの無料教材サイトです。

公開URL: https://taka2360.github.io/advmath/

- 登録・広告・アクセス解析なし、第三者サーバーへの通信なし（フォント・KaTeX も自己配信）
- どの単元にも、触って理解できる図・落とし穴・高校範囲で書き直した答案例・段階的ヒント付き演習
- 教材は CC BY 4.0、コードは MIT

## 単元

| # | 単元 | 範囲外の種類 |
|---|---|---|
| 1 | テイラー展開と近似 | 一般化 |
| 2 | ロピタルの定理 | 一般化 |
| 3 | 凸関数とイェンセンの不等式 | 一般化 |
| 4 | コーシー・シュワルツの不等式 | 一般化 |
| 5 | 行列と一次変換・固有ベクトル | 道具 |
| 6 | ケーリー・ハミルトンの定理 | 道具 |
| 7 | 外積と平面の方程式 | 道具 |
| 8 | 合同式とフェルマーの小定理 | 道具 |
| 9 | 線形漸化式と特性方程式 | 技法 |
| 10 | 格子経路とカタラン数 | 技法 |
| 11 | バウムクーヘン積分とパップス・ギュルダンの定理 | 技法 |
| 12 | 積分評価から漸近を読む | 技法 |

## 開発

```sh
npm install
npm run dev          # 開発サーバー http://localhost:4321/advmath/
npm run check        # 型チェック + 内部リンク規約 (url() を使っているか)
npm test             # 数学関数 (src/math) の単体テスト
npm run build        # 静的ビルド + Pagefind 検索インデックス
node scripts/check-dist.mjs   # 成果物の検査 (未変換の数式・リンク切れ・外部通信)
npm run test:e2e     # Playwright によるブラウザテスト (要 npm run build)
```

`main` への push で GitHub Actions がテスト → ビルド → GitHub Pages へのデプロイを行います。

## 構成

```
src/
  content/units/*.mdx     単元の本文 (frontmatter に前提・落とし穴・演習・地図の位置)
  math/                   描画から独立した数学計算 + 単体テスト
  lib/scenes/             図の描画 (ビルド時の静的SVGとブラウザでの再描画で共有)
  components/interactive/ 単元ごとのインタラクティブ図
  components/unit/        定理・証明・落とし穴・答案の作法・演習の部品
```

### 単元を追加・修正するとき

1. frontmatter の `pitfalls`（仮定・境界条件・等号条件・典型的な誤用）を先に書く
2. 図で使う計算は `src/math/` に置き、テストを書く
3. 本文は4層（`<Layer id="intuition|tool|why|exam|advanced|exercises">`）で書く
4. 答案の作法は `<Craft kind="idea|direct|rebuild">` の3点セットをそろえる
5. 内部リンクは必ず `url()` / `unitUrl()` を通す（`/advmath/` 配下で公開されるため）

誤りの報告や提案は Issues へお願いします。

## ライセンス

- 教材（本文・演習・図）: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.ja) — `LICENSE-CONTENT`
- ソースコード: MIT — `LICENSE`
