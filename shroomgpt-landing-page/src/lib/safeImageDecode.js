/**
 * `img.decode()` can hang when `src` flips rapidly; a stuck await blocks the film loop.
 */
export function safeDecodeImage(img, timeoutMs = 200) {
  if (!img) return Promise.resolve();
  const budget = new Promise((r) => setTimeout(r, timeoutMs));
  if (typeof img.decode === "function") {
    return Promise.race([img.decode().catch(() => {}), budget]);
  }
  return Promise.race([
    new Promise((resolve) => {
      if (img.complete && img.naturalWidth > 0) resolve();
      else {
        img.addEventListener("load", () => resolve(), { once: true });
        img.addEventListener("error", () => resolve(), { once: true });
      }
    }),
    budget,
  ]);
}
