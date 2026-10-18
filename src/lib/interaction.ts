/**
 * 図の初期化規約とポインター/キーボード操作。
 * 各図は [data-figure="名前"] の要素ごとに独立して初期化する (同じ図が複数あっても干渉しない)。
 */
export function onFigures(name: string, init: (root: HTMLElement) => void): void {
  const run = () => {
    document.querySelectorAll<HTMLElement>(`[data-figure="${name}"]:not([data-ready])`).forEach((el) => {
      el.dataset.ready = '';
      try {
        init(el);
      } catch (err) {
        // 図の失敗は本文の閲覧を妨げない。静的 SVG がそのまま残る。
        console.error(`[advmath] figure "${name}" failed`, err);
      }
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
}

export function $<T extends Element = HTMLElement>(root: ParentNode, sel: string): T {
  const el = root.querySelector<T>(sel);
  if (!el) throw new Error(`missing element: ${sel}`);
  return el;
}

/** ポインター位置を SVG の viewBox 座標に変換 */
export function svgPoint(svg: SVGSVGElement, e: { clientX: number; clientY: number }): { x: number; y: number } {
  const m = svg.getScreenCTM();
  if (!m) return { x: 0, y: 0 };
  const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
  return { x: p.x, y: p.y };
}

export interface DragOptions {
  /** viewBox 座標で呼ばれる */
  onDrag(p: { x: number; y: number }): void;
  /** 矢印キー。dx, dy は -1/0/1、Shift で 10 倍 */
  onKey?(dx: number, dy: number, big: boolean): void;
}

/** ハンドル (tabindex=0 を付けた要素) をドラッグ・キーボード操作可能にする */
export function draggable(handle: Element, svg: SVGSVGElement, opts: DragOptions): void {
  const el = handle as SVGElement;
  el.addEventListener('pointerdown', (e) => {
    const ev = e as PointerEvent;
    ev.preventDefault();
    el.setPointerCapture(ev.pointerId);
    (el as unknown as HTMLElement).focus?.({ preventScroll: true });
    opts.onDrag(svgPoint(svg, ev));
  });
  el.addEventListener('pointermove', (e) => {
    const ev = e as PointerEvent;
    if (!el.hasPointerCapture(ev.pointerId)) return;
    opts.onDrag(svgPoint(svg, ev));
  });
  const end = (e: Event) => {
    const ev = e as PointerEvent;
    if (el.hasPointerCapture(ev.pointerId)) el.releasePointerCapture(ev.pointerId);
  };
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', end);
  if (opts.onKey) {
    const onKey = opts.onKey;
    el.addEventListener('keydown', (e) => {
      const ev = e as KeyboardEvent;
      const map: Record<string, [number, number]> = {
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
        ArrowUp: [0, 1],
        ArrowDown: [0, -1],
      };
      const d = map[ev.key];
      if (!d) return;
      ev.preventDefault();
      onKey(d[0], d[1], ev.shiftKey);
    });
  }
}

/** range / select などの値変更を即時反映 */
export function onInput<T extends HTMLInputElement | HTMLSelectElement>(el: T, cb: (el: T) => void): void {
  el.addEventListener('input', () => cb(el));
  el.addEventListener('change', () => cb(el));
}

/** seg ボタン群 (data-value) の単一選択 */
export function segmented(group: HTMLElement, cb: (value: string) => void): void {
  const buttons = Array.from(group.querySelectorAll<HTMLButtonElement>('button[data-value]'));
  for (const b of buttons) {
    b.addEventListener('click', () => {
      for (const o of buttons) o.setAttribute('aria-pressed', String(o === b));
      cb(b.dataset.value ?? '');
    });
  }
}

export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function setAttrs(el: Element, attrs: Record<string, string | number>): void {
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
}
