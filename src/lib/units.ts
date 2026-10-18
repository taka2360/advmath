import { getCollection, type CollectionEntry } from 'astro:content';

export type Unit = CollectionEntry<'units'>;

export async function allUnits(): Promise<Unit[]> {
  return (await getCollection('units')).sort((a, b) => a.data.order - b.data.order);
}

export type EdgeKind = 'prerequisite' | 'application' | 'related';

export interface Edge {
  from: string;
  to: string;
  kind: EdgeKind;
}

const RANK: Record<EdgeKind, number> = { prerequisite: 3, application: 2, related: 1 };

/** 全単元の辺。同じ2単元の間に複数あるときは強いもの (前提 > 応用 > 関連) を残す */
export function edgesOf(units: Unit[]): Edge[] {
  const ids = new Set(units.map((u) => u.id));
  const best = new Map<string, Edge>();
  for (const u of units) {
    for (const kind of ['prerequisite', 'application', 'related'] as const) {
      for (const other of u.data.edges[kind]) {
        if (!ids.has(other)) throw new Error(`${u.id}: 存在しない単元 ${other} への辺`);
        // 前提は other → u、応用・関連は u → other の向き
        const e: Edge = kind === 'prerequisite' ? { from: other, to: u.id, kind } : { from: u.id, to: other, kind };
        const key = [e.from, e.to].sort().join('|');
        const prev = best.get(key);
        if (!prev || RANK[kind] > RANK[prev.kind]) best.set(key, e);
      }
    }
  }
  return [...best.values()];
}

export const pad2 = (n: number) => String(n).padStart(2, '0');
