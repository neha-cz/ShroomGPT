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

export { FRAME_COUNT, FRAME_PATH, FRAME_SCROLL_SPEED };
