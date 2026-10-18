/**
 * 演習の自己採点を localStorage に保存する。
 * 保存できない環境 (プライベートモード・ストレージ無効) でも例外を外に出さない。
 */
export type ProblemState = 'solved' | 'review';

export interface ProgressData {
  version: 1;
  problems: Record<string, { state: ProblemState; updatedAt: string }>;
}

export const STORAGE_KEY = 'advmath:progress';

function empty(): ProgressData {
  return { version: 1, problems: {} };
}

function isProgress(value: unknown): value is ProgressData {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Partial<ProgressData>;
  return v.version === 1 && typeof v.problems === 'object' && v.problems !== null;
}

export function load(): ProgressData {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty();
    const parsed: unknown = JSON.parse(raw);
    return isProgress(parsed) ? parsed : empty();
  } catch {
    return empty();
  }
}

/** 保存に成功したら true */
function save(data: ProgressData): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function getState(id: string): ProblemState | undefined {
  return load().problems[id]?.state;
}

export function setState(id: string, state: ProblemState | undefined): boolean {
  const data = load();
  if (state) data.problems[id] = { state, updatedAt: new Date().toISOString() };
  else delete data.problems[id];
  const ok = save(data);
  window.dispatchEvent(new CustomEvent('advmath:progress'));
  return ok;
}

export function clearAll(): boolean {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('advmath:progress'));
    return true;
  } catch {
    return false;
  }
}
