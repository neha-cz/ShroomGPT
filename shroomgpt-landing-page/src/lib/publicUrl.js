/**
 * Resolve a path served from Vite's `public/` (works for non-`/` base, e.g. GitHub Pages).
 * @param {string} path e.g. `foo/bar.jpg` or `/foo/bar.jpg`
 */
export function publicUrl(path) {
  const base = import.meta.env.BASE_URL;
  const normalized = path.startsWith("/") ? path.slice(1) : path;
  return base.endsWith("/") ? `${base}${normalized}` : `${base}/${normalized}`;
}
