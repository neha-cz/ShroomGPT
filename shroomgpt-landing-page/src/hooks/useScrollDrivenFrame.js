import { useEffect, useRef } from "react";
import { heroEzgifFramePath } from "../lib/ezgifPaths.js";
import {
  prefetchFrameNeighborhood,
  safeDecodeImage,
  scheduleIdleFilmstripPrefetch,
} from "../lib/safeImageDecode.js";

const FRAME_COUNT = 240;
const FRAME_SCROLL_SPEED = 2.2;
const FRAME_PATH = (index) => heroEzgifFramePath(index);

/**
 * @deprecated For page-wide scroll; prefer a fixed runway (hero spacer) via
 * `getRunwayEndPx` in `useScrollDrivenDoubleBuffer` so the full document height
 * does not stretch the filmstrip to a sliver of scroll.
 */
export function frameIndexFromScroll(totalFrames) {
  const maxY = Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight
  );
  const y = window.scrollY;
  return frameIndexFromScrollY(y, maxY, totalFrames, FRAME_SCROLL_SPEED);
}

/**
 * Maps scroll `y` to a frame: `t = y / scrollRangePx` clamped to [0,1].
 * Use `scrollRangePx` = hero `.heroSpacer` height − viewport so the morph
 * always scrubs with the same distance whether or not sections below are mounted
 * (scroll up reverses; `y` past the range keeps t=1 = “end” frame).
 */
export function frameIndexFromScrollY(y, scrollRangePx, totalFrames, speed = 1) {
  let range = scrollRangePx;
  if (range <= 0 && typeof document !== "undefined" && typeof window !== "undefined") {
    // Avoid a stuck single frame when the runway is mis-measured (0) in prod layout.
    const vh = window.innerHeight;
    const docH = document.documentElement?.scrollHeight ?? 0;
    const fallback = Math.max(0, docH - vh);
    range = fallback > 0 ? fallback : Math.max(1, vh);
  }
  const tBase = Math.min(1, Math.max(0, y / range));
  const t = Math.min(1, tBase * Math.max(0.1, speed));
  const forward = Math.round(t * (totalFrames - 1));
  /* Top of page = last frame; scrolling down runs the sequence backward */
  return totalFrames - 1 - forward;
}

/**
 * Double-buffered frames: decode into hidden layer, swap only if scroll still matches.
 *
 * @param {() => number | null} [getRunwayEndPx]  Returns scroll distance (px) for the
 *   full hero runway (usually spacer height − viewport). When set, `y/that` drives
 *   the strip so it reverses when scrolling back up, independent of `scrollHeight`.
 */
export function useScrollDrivenDoubleBuffer(
  img0Ref,
  img1Ref,
  layerClassNames,
  totalFrames = FRAME_COUNT,
  forcedFrameIndex = null,
  getRunwayEndPx = null
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

    const currentFrame = () => {
      if (Number.isInteger(forcedFrameIndex)) {
        return forcedFrameIndex;
      }
      if (typeof getRunwayEndPx === "function") {
        const end = getRunwayEndPx();
        if (end == null || !Number.isFinite(end)) {
          return frameIndexFromScroll(totalFrames);
        }
        const y = window.scrollY;
        return frameIndexFromScrollY(
          y,
          end,
          totalFrames,
          FRAME_SCROLL_SPEED
        );
      }
      return frameIndexFromScroll(totalFrames);
    };

    const initial = currentFrame();
    const boot = FRAME_PATH(initial);
    visibleEl().src = boot;
    visibleEl().dataset.frameSrc = boot;
    applyLayerClasses(true);
    displayed = initial;
    prefetchFrameNeighborhood(FRAME_PATH, initial, totalFrames, 56, 56);
    const cancelIdlePrefetch = scheduleIdleFilmstripPrefetch(
      FRAME_PATH,
      totalFrames,
      { batchSize: 14 }
    );

    const pump = async () => {
      let safety = 0;
      while (currentFrame() !== displayed) {
        if (!alive) return;
        if (++safety > 400) break;

        const want = currentFrame();
        const hid = hiddenEl();
        const next = FRAME_PATH(want);

        if (
          hid.dataset.frameSrc === next &&
          hid.complete &&
          hid.naturalWidth > 0
        ) {
          frontIs0 = !frontIs0;
          applyLayerClasses(frontIs0);
          displayed = want;
          prefetchFrameNeighborhood(FRAME_PATH, want, totalFrames, 48, 48);
          continue;
        }

        hid.src = next;
        hid.dataset.frameSrc = next;

        const ok = await safeDecodeImage(hid, next);
        if (!alive) return;
        if (!ok) continue;

        const latest = currentFrame();
        if (latest !== want) {
          continue;
        }

        frontIs0 = !frontIs0;
        applyLayerClasses(frontIs0);
        displayed = want;
        prefetchFrameNeighborhood(FRAME_PATH, want, totalFrames, 48, 48);
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

    const onLoad = () => schedule();
    if (document.readyState === "complete") {
      requestAnimationFrame(() => schedule());
    } else {
      window.addEventListener("load", onLoad, { passive: true });
    }

    return () => {
      alive = false;
      cancelIdlePrefetch();
      window.removeEventListener("load", onLoad);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
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
    forcedFrameIndex,
    getRunwayEndPx,
  ]);
}

export { FRAME_COUNT, FRAME_PATH, FRAME_SCROLL_SPEED };
