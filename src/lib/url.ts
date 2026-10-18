/** base パス (/advmath/) を考慮した内部リンクを作る。内部リンクは必ずこれを通す。 */
export function url(path = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
  const clean = path.replace(/^\/+/, '');
  return base + clean;
}

export function unitUrl(slug: string, hash = ''): string {
  return url(`units/${slug}/`) + (hash ? `#${hash}` : '');
}
