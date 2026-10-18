import katex from 'katex';

/** ビルド時に KaTeX で数式を HTML にする (.astro ページで使う) */
export const tex = (src: string, displayMode = false): string =>
  katex.renderToString(src, { displayMode, throwOnError: true, strict: 'ignore' });

/** 「文章 $数式$ 文章」の形の文字列の $…$ 部分だけを数式にする */
export const texInline = (text: string): string =>
  text
    .split(/(\$[^$]+\$)/)
    .map((part) =>
      part.startsWith('$') && part.endsWith('$')
        ? tex(part.slice(1, -1))
        : part.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!),
    )
    .join('');
