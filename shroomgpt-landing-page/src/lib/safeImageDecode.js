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

function prefetchOneUrl(u) {
  if (prefetchedFrameUrls.has(u)) return;
  prefetchedFrameUrls.add(u);
  const pre = new Image();
  pre.decoding = "async";
  pre.fetchPriority = "low";
  pre.src = u;
}

const modIndex = (i, n) => ((i % n) + n) % n;

/**
 * Warm cache around `centerIndex` (for scroll scrub: both directions; for
 * playback: set `behind` to 0 or a small wrap window).
 */
export function prefetchFrameNeighborhood(
  frameUrl,
  centerIndex,
  frameCount,
  ahead = 24,
  behind = 0
) {
  if (typeof Image === "undefined") return;
  const a = Math.max(0, Math.min(frameCount, ahead));
  const b = Math.max(0, Math.min(frameCount, behind));
  for (let k = b; k >= 1; k--) {
    prefetchOneUrl(frameUrl(modIndex(centerIndex - k, frameCount)));
  }
  for (let k = 1; k <= a; k++) {
    prefetchOneUrl(frameUrl(modIndex(centerIndex + k, frameCount)));
  }
}

/** Ahead-only prefetch (time-based loops). */
export function prefetchFrameRing(
  frameUrl,
  centerIndex,
  frameCount,
  ahead = 20
) {
  prefetchFrameNeighborhood(frameUrl, centerIndex, frameCount, ahead, 0);
}

/**
 * Fill the HTTP cache for an entire strip during idle time (low priority),
 * so playback and scrub stay ahead of decode. Respects Save-Data / 2g.
 * @returns {() => void} cancel
 */
export function scheduleIdleFilmstripPrefetch(
  frameUrl,
  frameCount,
  options = {}
) {
  const batchSize = options.batchSize ?? 16;
  const skipIfSaveData = options.skipIfSaveData !== false;

  if (typeof window === "undefined") return () => {};

  try {
    const c = navigator.connection;
    if (skipIfSaveData && c?.saveData) return () => {};
    if (c?.effectiveType === "2g") return () => {};
  } catch {
    /* ignore */
  }

  let cursor = 0;
  let cancelled = false;
  let handle = null;

  const step = () => {
    if (cancelled) return;
    const end = Math.min(cursor + batchSize, frameCount);
    while (cursor < end) {
      prefetchOneUrl(frameUrl(cursor++));
    }
    if (cursor >= frameCount) return;
    if (typeof requestIdleCallback !== "undefined") {
      handle = requestIdleCallback(step, { timeout: 2800 });
    } else {
      handle = window.setTimeout(step, 40);
    }
  };

  if (typeof requestIdleCallback !== "undefined") {
    handle = requestIdleCallback(step, { timeout: 2800 });
  } else {
    handle = window.setTimeout(step, 0);
  }

  return () => {
    cancelled = true;
    if (handle == null) return;
    if (typeof cancelIdleCallback === "function") {
      try {
        cancelIdleCallback(handle);
      } catch {
        clearTimeout(handle);
      }
    } else {
      clearTimeout(handle);
    }
    handle = null;
  };
}
