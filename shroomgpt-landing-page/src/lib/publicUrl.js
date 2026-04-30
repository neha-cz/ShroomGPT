/**
 * Resolve a path served from Vite's `public/` (non-`/` `base`, e.g. GitHub Pages subpath).
 * @param {string} path e.g. `foo/bar.jpg` or `/foo/bar.jpg`
 */
export function publicUrl(path) {
  const normalized = path.replace(/^\/+/, "");
  const envBase = import.meta.env.BASE_URL;
  if (envBase == null || envBase === "/" || envBase === "") {
    return `/${normalized}`;
  }
  const b = String(envBase).replace(/\/$/, "");
  return `${b}/${normalized}`;
}
