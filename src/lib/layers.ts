/** 単元の各層。id は全単元で共通 (目次と層ナビが参照する) */
export const LAYERS = {
  intuition: '第1層 直観',
  tool: '第2層 道具',
  why: '第3層 なぜ成り立つか',
  exam: '第4層 答案の作法',
  advanced: '発展',
  exercises: '演習',
} as const;

export const LAYER_NAV: Array<{ id: keyof typeof LAYERS; short: string }> = [
  { id: 'intuition', short: '直観' },
  { id: 'tool', short: '道具' },
  { id: 'why', short: 'なぜ' },
  { id: 'exam', short: '答案' },
  { id: 'advanced', short: '発展' },
  { id: 'exercises', short: '演習' },
];
