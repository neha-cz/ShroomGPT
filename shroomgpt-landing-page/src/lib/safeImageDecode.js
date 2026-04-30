/**
 * Resolve `url` the same way the browser does for `img.src = url` (absolute href).
 */
function resolveHref(url) {
  if (typeof window === "undefined" || url == null) return String(url);
  try {
    return new URL(url, window.location.href).href;
  } catch {
    return String(url);
  }
}

function resolvedSrcMatches(img, expectedHref) {
  if (expectedHref == null) return true;
  try {
    return img.src === expectedHref;
  } catch {
    return false;
  }
}

/**
 * Wait until `img` has loaded the URL we care about, then try `decode()` so the
 * swap is not a half-painted frame. Returns false on error, aborted load, or
 * if `src` changed before completion.
 *
 * The old 200ms race caused production (slower CPU/network) to swap before
 * decode finished — glitchy “intermediate” frames.
 */
export async function safeDecodeImage(img, expectedSrc = null) {
  if (!img) return false;
  const expectedHref = expectedSrc != null ? resolveHref(expectedSrc) : null;

  const stillExpected = () =>
    expectedHref == null || resolvedSrcMatches(img, expectedHref);

  const waitLoaded = () =>
    new Promise((resolve) => {
      if (!stillExpected()) {
        resolve("abort");
        return;
      }
      if (img.complete) {
        resolve(img.naturalWidth > 0 ? "ok" : "error");
        return;
      }
      const onLoad = () => {
        cleanup();
        if (!stillExpected()) resolve("abort");
        else resolve(img.naturalWidth > 0 ? "ok" : "error");
      };
      const onErr = () => {
        cleanup();
        resolve("error");
      };
      const cleanup = () => {
        img.removeEventListener("load", onLoad);
        img.removeEventListener("error", onErr);
      };
      img.addEventListener("load", onLoad, { once: true });
      img.addEventListener("error", onErr, { once: true });
    });

  const status = await waitLoaded();
  if (status !== "ok") return false;
  if (!stillExpected()) return false;

  if (typeof img.decode === "function") {
    const DECODE_BUDGET_MS = 8000;
    try {
      await Promise.race([
        img.decode(),
        new Promise((_, rej) =>
          setTimeout(() => rej(new Error("decode budget")), DECODE_BUDGET_MS)
        ),
      ]);
    } catch {
      /* decode can reject if superseded; pixels may still be OK after load */
    }
  }

  return stillExpected() && img.naturalWidth > 0;
}

const prefetchedFrameUrls = new Set();

/**
 * Warm cache for upcoming frames in time-driven sequences.
 * Dedupes by URL so we do not spawn dozens of redundant requests every swap at 24fps.
 */
export function prefetchFrameRing(frameUrl, centerIndex, frameCount, ahead = 16) {
  if (typeof Image === "undefined") return;
  const n = Math.min(Math.max(0, frameCount), Math.max(0, ahead));
  for (let i = 1; i <= n; i++) {
    const idx = (centerIndex + i) % frameCount;
    const u = frameUrl(idx);
    if (prefetchedFrameUrls.has(u)) continue;
    prefetchedFrameUrls.add(u);
    const pre = new Image();
    pre.decoding = "async";
    pre.src = u;
  }
}
