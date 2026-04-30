import { useEffect, useRef } from "react";
import { shroomgptEzgifFramePath } from "../lib/ezgifPaths.js";
import {
  prefetchFrameRing,
  safeDecodeImage,
  scheduleIdleFilmstripPrefetch,
} from "../lib/safeImageDecode.js";
import styles from "./AutoplayFrameFilm.module.css";

const FRAME_COUNT = 240;
const FPS = 24;

const frameUrl = (index) => shroomgptEzgifFramePath(index);

/**
 * Time-driven JPEG sequence (not scroll-linked). Double-buffered img swap
 * after decode for steady playback.
 */
export function AutoplayFrameFilm({ className = "" }) {
  const img0Ref = useRef(null);
  const img1Ref = useRef(null);

  useEffect(() => {
    const el0 = img0Ref.current;
    const el1 = img1Ref.current;
    if (!el0 || !el1) return;

    let alive = true;
    let rafId = 0;

    const applyLayerClasses = (front0Visible) => {
      if (front0Visible) {
        el0.classList.add(styles.layerOn);
        el0.classList.remove(styles.layerOff);
        el1.classList.add(styles.layerOff);
        el1.classList.remove(styles.layerOn);
      } else {
        el1.classList.add(styles.layerOn);
        el1.classList.remove(styles.layerOff);
        el0.classList.add(styles.layerOff);
        el0.classList.remove(styles.layerOn);
      }
    };

    const t0 = performance.now();
    let frontIs0 = true;
    let displayed = 0;

    const visibleEl = () => (frontIs0 ? el0 : el1);
    const hiddenEl = () => (frontIs0 ? el1 : el0);

    const frameAtTime = (now) =>
      Math.floor(((now - t0) / 1000) * FPS) % FRAME_COUNT;

    const u0 = frameUrl(0);
    el0.src = u0;
    el0.dataset.frameSrc = u0;
    el1.dataset.frameSrc = "";
    applyLayerClasses(true);
    displayed = 0;
    prefetchFrameRing(frameUrl, 0, FRAME_COUNT, 56);
    const cancelIdlePrefetch = scheduleIdleFilmstripPrefetch(
      frameUrl,
      FRAME_COUNT,
      { batchSize: 14 }
    );

    let pumping = false;

    const catchUp = async () => {
      while (alive) {
        const want = frameAtTime(performance.now());
        if (want === displayed) break;

        const hid = hiddenEl();
        const next = frameUrl(want);
        hid.src = next;
        hid.dataset.frameSrc = next;
        const ok = await safeDecodeImage(hid, next);
        if (!alive) return;
        if (!ok) continue;

        frontIs0 = !frontIs0;
        applyLayerClasses(frontIs0);
        displayed = want;
        prefetchFrameRing(frameUrl, displayed, FRAME_COUNT, 52);
      }
    };

    const tick = () => {
      if (!alive) return;
      if (!pumping) {
        pumping = true;
        void (async () => {
          try {
            await catchUp();
          } finally {
            pumping = false;
          }
        })();
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      alive = false;
      cancelIdlePrefetch();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      className={`${styles.wrap} ${className}`.trim()}
      aria-hidden="true"
    >
      <div className={styles.aspect}>
        <img
          ref={img0Ref}
          className={`${styles.layer} ${styles.layerOn}`}
          alt=""
          loading="eager"
          fetchPriority="high"
          decoding="auto"
          draggable={false}
        />
        <img
          ref={img1Ref}
          className={`${styles.layer} ${styles.layerOff}`}
          alt=""
          loading="eager"
          fetchPriority="low"
          decoding="auto"
          draggable={false}
        />
      </div>
    </div>
  );
}
