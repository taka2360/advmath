import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const units = defineCollection({
  loader: glob({ pattern: '*.mdx', base: './src/content/units' }),
  schema: z.object({
    order: z.number().int().min(1),
    title: z.string(),
    /** 一覧カードに出す一言 */
    hook: z.string(),
    summary: z.string(),
    /** 入試で何が見えるようになるか */
    payoff: z.string(),
    minutes: z.number().int(),
    /** 範囲外の種類 */
    outsideType: z.enum(['道具', '一般化', '技法']),
    /** 高校範囲で必要な前提 */
    hsPrerequisites: z.array(z.string()),
    /** 新しく学ぶ道具 */
    newTools: z.array(z.string()),
    /** 高校数学に戻す方法 */
    backToHS: z.string(),
    edges: z
      .object({
        prerequisite: z.array(z.string()).default([]),
        application: z.array(z.string()).default([]),
        related: z.array(z.string()).default([]),
      })
      .default({ prerequisite: [], application: [], related: [] }),
    /** 検索用の別名・表記揺れ */
    aliases: z.array(z.string()).default([]),
    /** 仮定・境界条件・等号条件・典型的な誤用のチェック項目 */
    pitfalls: z.array(z.string()).min(1),
    exercises: z
      .array(z.object({ id: z.string(), title: z.string(), level: z.enum(['基本', '標準', '発展']) }))
      .min(3)
      .max(5),
    /** 概念マップ上の位置 (0〜100) */
    map: z.object({ x: z.number(), y: z.number(), group: z.enum(['解析', '線形', '離散']), label: z.string() }),
  }),
});

export const collections = { units };
