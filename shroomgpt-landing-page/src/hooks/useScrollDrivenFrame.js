import { useEffect, useRef } from "react";

const FRAME_COUNT = 240;
const FRAME_SCROLL_SPEED = 2.2;
const FRAME_PATH = (index) => {
  const n = String(index + 1).padStart(3, "0");
  return `/ezgif-6aea8380a2524c7e-jpg/ezgif-frame-${n}.jpg`;
};

export function frameIndexFromScroll(totalFrames) {
  const maxY = Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight
  );
  const y = window.scrollY;
  return frameIndexFromScrollY(y, maxY, totalFrames, FRAME_SCROLL_SPEED);
}

/** Same mapping as scroll position `y` over range `[0, maxY]` (top = last frame). */
export function frameIndexFromScrollY(y, maxY, totalFrames, speed = 1) {
  const tBase = maxY <= 0 ? 0 : Math.min(1, Math.max(0, y / maxY));
  const t = Math.min(1, tBase * Math.max(0.1, speed));
  const forward = Math.round(t * (totalFrames - 1));
  /* Top of page = last frame; scrolling down runs the sequence backward */
  return totalFrames - 1 - forward;
}

/**
 * Double-buffered frames: decode into hidden layer, swap only if scroll still matches.
 */
export function useScrollDrivenDoubleBuffer(
  img0Ref,
  img1Ref,
  layerClassNames,
  totalFrames = FRAME_COUNT,
  forcedFrameIndex = null
) {
  const rafRef = useRef(0);

  useEffect(() => {
    const el0 = img0Ref.current;
    const el1 = img1Ref.current;
    if (!el0 || !el1) return;
    let alive = true;

    const { on: onClass, off: offClass } = layerClassNames;

    const applyLayerClasses = (front0Visible) => {
      if (front0Visible) {
        el0.classList.add(onClass);
        el0.classList.remove(offClass);
        el1.classList.add(offClass);
        el1.classList.remove(onClass);
      } else {
        el1.classList.add(onClass);
        el1.classList.remove(offClass);
        el0.classList.add(offClass);
        el0.classList.remove(onClass);
      }
    };

    let frontIs0 = true;
    let displayed = 0;

    const visibleEl = () => (frontIs0 ? el0 : el1);
    const hiddenEl = () => (frontIs0 ? el1 : el0);

    const currentFrame = () =>
      Number.isInteger(forcedFrameIndex)
        ? forcedFrameIndex
        : frameIndexFromScroll(totalFrames);

    const initial = currentFrame();
    const boot = FRAME_PATH(initial);
    visibleEl().src = boot;
    visibleEl().dataset.frameSrc = boot;
    applyLayerClasses(true);
    displayed = initial;

    const pump = async () => {
      let safety = 0;
      while (currentFrame() !== displayed) {
        if (!alive) return;
        if (++safety > 400) break;

        const want = currentFrame();
        const hid = hiddenEl();
        const next = FRAME_PATH(want);

        if (hid.dataset.frameSrc === next && hid.complete) {
          frontIs0 = !frontIs0;
          applyLayerClasses(frontIs0);
          displayed = want;
          continue;
        }

        hid.src = next;
        hid.dataset.frameSrc = next;

        try {
          if (hid.decode) await hid.decode();
        } catch {
          /* ignore decode errors */
        }
        if (!alive) return;

        const latest = currentFrame();
        if (latest !== want) {
          continue;
        }

        frontIs0 = !frontIs0;
        applyLayerClasses(frontIs0);
        displayed = want;
      }
    };

    let version = 0;

    const schedule = () => {
      if (!alive) return;
      version += 1;
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        if (!alive) return;
        rafRef.current = 0;
        const v = version;
        void (async () => {
          await pump();
          if (!alive) return;
          if (v !== version || currentFrame() !== displayed) {
            schedule();
          }
        })();
      });
    };

    schedule();

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });

    return () => {
      alive = false;
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
      version += 1;
    };
  }, [img0Ref, img1Ref, layerClassNames, totalFrames, forcedFrameIndex]);
}

/** Second filmstrip (cinematic interlude) — same frame count / naming pattern, different folder. */
export const CINEMATIC_FRAME_COUNT = 240;
export const CINEMATIC_FRAME_PATH = (index) => {
  const n = String(index + 1).padStart(3, "0");
  return `/ezgif-29069d220b1923cd-jpg/ezgif-frame-${n}.jpg`;
};

/** Stable frame index: `round()` flips at boundaries when p jitters; `floor` does not. */
function frameIndexFromProgress(p, totalFrames) {
  const maxIdx = totalFrames - 1;
  const t = Math.min(1, Math.max(0, p));
  return Math.min(maxIdx, Math.floor(t * totalFrames + 1e-9));
}

function prefetchFrameRange(framePath, totalFrames, center, behind, ahead, prefetched) {
  for (let d = -behind; d <= ahead; d++) {
    const i = center + d;
    if (i < 0 || i >= totalFrames) continue;
    const url = framePath(i);
    if (prefetched.has(url)) continue;
    prefetched.add(url);
    const im = new Image();
    im.decoding = "async";
    im.src = url;
  }
}

/**
 * Like `useScrollDrivenDoubleBuffer`, but maps scroll **through a runway element**
 * (tall spacer) to frame index 0 → last while the fixed layer stays on screen.
 */
export function useRunwayScrollDrivenDoubleBuffer(
  img0Ref,
  img1Ref,
  layerClassNames,
  totalFrames,
  framePath,
  runwayRef,
  forcedFrameIndex = null
) {
  const rafRef = useRef(0);
  const runwayLayoutRef = useRef({ top: 0, range: 1 });
  const prefetchedRef = useRef(new Set());

  useEffect(() => {
    const el0 = img0Ref.current;
    const el1 = img1Ref.current;
    if (!el0 || !el1) return;
    let alive = true;

    const { on: onClass, off: offClass } = layerClassNames;

    const applyLayerClasses = (front0Visible) => {
      if (front0Visible) {
        el0.classList.add(onClass);
        el0.classList.remove(offClass);
        el1.classList.add(offClass);
        el1.classList.remove(onClass);
      } else {
        el1.classList.add(onClass);
        el1.classList.remove(offClass);
        el0.classList.add(offClass);
        el0.classList.remove(onClass);
      }
    };

    let frontIs0 = true;
    let displayed = 0;

    const visibleEl = () => (frontIs0 ? el0 : el1);
    const hiddenEl = () => (frontIs0 ? el1 : el0);

    const syncRunwayLayout = () => {
      const runway = runwayRef.current;
      if (!runway) return;
      const r = runway.getBoundingClientRect();
      runwayLayoutRef.current = {
        top: r.top + window.scrollY,
        range: Math.max(1, runway.offsetHeight - window.innerHeight),
      };
    };

    const runwayProgress01 = () => {
      const { top, range } = runwayLayoutRef.current;
      const local = window.scrollY - top;
      return Math.min(1, Math.max(0, local / range));
    };

    const currentFrame = () => {
      if (Number.isInteger(forcedFrameIndex)) return forcedFrameIndex;
      const runway = runwayRef.current;
      if (!runway) return 0;
      const p = runwayProgress01();
      return frameIndexFromProgress(p, totalFrames);
    };

    syncRunwayLayout();
    const prefetched = prefetchedRef.current;
    prefetched.clear();

    const initial = currentFrame();
    prefetchFrameRange(framePath, totalFrames, initial, 2, 20, prefetched);
    const boot = framePath(initial);
    visibleEl().src = boot;
    visibleEl().dataset.frameSrc = boot;
    applyLayerClasses(true);
    displayed = initial;

    const pump = async () => {
      let safety = 0;
      while (currentFrame() !== displayed) {
        if (!alive) return;
        if (++safety > 400) break;

        const want = currentFrame();
        prefetchFrameRange(framePath, totalFrames, want, 3, 18, prefetched);

        const hid = hiddenEl();
        const next = framePath(want);

        if (hid.dataset.frameSrc === next && hid.complete) {
          frontIs0 = !frontIs0;
          applyLayerClasses(frontIs0);
          displayed = want;
          continue;
        }

        hid.src = next;
        hid.dataset.frameSrc = next;

        try {
          if (hid.decode) await hid.decode();
        } catch {
          /* ignore decode errors */
        }
        if (!alive) return;

        const latest = currentFrame();
        if (latest !== want) {
          continue;
        }

        frontIs0 = !frontIs0;
        applyLayerClasses(frontIs0);
        displayed = want;
      }
    };

    let version = 0;

    const schedule = () => {
      if (!alive) return;
      version += 1;
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        if (!alive) return;
        rafRef.current = 0;
        const v = version;
        void (async () => {
          await pump();
          if (!alive) return;
          if (v !== version || currentFrame() !== displayed) {
            schedule();
          }
        })();
      });
    };

    const onResize = () => {
      syncRunwayLayout();
      schedule();
    };

    let resizeObserver = null;
    const runway = runwayRef.current;
    if (runway && typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        syncRunwayLayout();
        schedule();
      });
      resizeObserver.observe(runway);
    }

    schedule();

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      alive = false;
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
      resizeObserver?.disconnect();
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
      version += 1;
    };
  }, [
    img0Ref,
    img1Ref,
    layerClassNames,
    totalFrames,
    framePath,
    runwayRef,
    forcedFrameIndex,
  ]);
}

export { FRAME_COUNT, FRAME_PATH, FRAME_SCROLL_SPEED };
