import { useEffect, useRef } from "react";

/**
 * Map window scroll to frame index for a runway element.
 *
 * Uses document scroll (`scrollY`) vs the runway’s document top, so progress
 * stays correct with `position: sticky` children (viewport `rect` alone can
 * lie about how much of the runway you’ve actually consumed).
 *
 * `SCRUB_RATIO` < 1 finishes the full strip before the runway tail, so the
 * last frames aren’t skipped when the sticky clip scrolls away.
 */
/* Slightly earlier full strip (last frames land while the clip is still obvious) */
const SCRUB_RATIO = 0.62;

function frameIndexFromRunway(runwayEl, totalFrames) {
  if (!runwayEl || totalFrames < 2) return 0;
  const h = runwayEl.offsetHeight;
  const vh = window.innerHeight;
  const scrollY =
    window.scrollY ||
    window.pageYOffset ||
    document.documentElement.scrollTop ||
    0;
  const rect = runwayEl.getBoundingClientRect();
  const topDoc = rect.top + scrollY;
  const start = topDoc - vh;
  const span = Math.max(120, (h + vh) * SCRUB_RATIO);
  const raw = (scrollY - start) / span;
  const t = Math.min(1, Math.max(0, raw));
  return Math.round(t * (totalFrames - 1));
}

function framePath(basePath, index) {
  const n = String(index + 1).padStart(3, "0");
  return `${basePath}/ezgif-frame-${n}.jpg`;
}

/**
 * Double-buffered JPEG sequence driven by window scroll through `runwayRef` bounds.
 */
export function useSectionScrollFrames(
  runwayRef,
  img0Ref,
  img1Ref,
  layerClassNames,
  {
    totalFrames = 240,
    basePath = "/ezgif-43b1d74becc9df2a-jpg",
  } = {}
) {
  const rafRef = useRef(0);

  useEffect(() => {
    const runway = runwayRef.current;
    const el0 = img0Ref.current;
    const el1 = img1Ref.current;
    if (!runway || !el0 || !el1) return;

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

    const boot = framePath(basePath, 0);
    visibleEl().src = boot;
    visibleEl().dataset.frameSrc = boot;
    applyLayerClasses(true);
    displayed = 0;

    const currentIndex = () => frameIndexFromRunway(runway, totalFrames);

    const pump = async () => {
      let safety = 0;
      while (currentIndex() !== displayed) {
        if (++safety > 400) break;

        const want = currentIndex();
        const hid = hiddenEl();
        const next = framePath(basePath, want);

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
          /* ignore */
        }

        const latest = currentIndex();
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
      version += 1;
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        const v = version;
        void (async () => {
          await pump();
          if (v !== version || currentIndex() !== displayed) {
            schedule();
          }
        })();
      });
    };

    schedule();

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
      version += 1;
    };
  }, [runwayRef, img0Ref, img1Ref, layerClassNames, totalFrames, basePath]);
}
