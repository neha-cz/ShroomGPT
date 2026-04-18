import { useEffect, useLayoutEffect, useRef } from "react";
import styles from "../sections/CubeSection.module.css";

/**
 * Double-buffered JPEG swap (decode hidden layer, then show) to avoid flicker.
 */
export function CubeFilmBuffer({ frameIndex, getFrameUrl }) {
  const img0Ref = useRef(null);
  const img1Ref = useRef(null);
  const frontIs0Ref = useRef(true);
  const displayedRef = useRef(-1);
  const latestRef = useRef(frameIndex);
  latestRef.current = frameIndex;

  useLayoutEffect(() => {
    const el0 = img0Ref.current;
    if (!el0) return;
    const u = getFrameUrl(0);
    el0.src = u;
    el0.dataset.frameSrc = u;
    displayedRef.current = 0;
  }, [getFrameUrl]);

  useEffect(() => {
    const want = frameIndex;
    if (want === displayedRef.current) return;

    const el0 = img0Ref.current;
    const el1 = img1Ref.current;
    if (!el0 || !el1) return;

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

    const hiddenEl = () => (frontIs0Ref.current ? el1 : el0);
    const url = getFrameUrl(want);
    const hid = hiddenEl();

    const finish = () => {
      if (latestRef.current !== want) return;
      if (hid.dataset.frameSrc !== url) return;
      frontIs0Ref.current = !frontIs0Ref.current;
      applyLayerClasses(frontIs0Ref.current);
      displayedRef.current = want;
    };

    if (hid.dataset.frameSrc === url && hid.complete) {
      finish();
      return;
    }

    hid.src = url;
    hid.dataset.frameSrc = url;

    const p = hid.decode?.();
    if (p && typeof p.then === "function") {
      p.then(finish).catch(finish);
    } else if (hid.complete) {
      finish();
    } else {
      hid.onload = () => finish();
    }
  }, [frameIndex, getFrameUrl]);

  return (
    <>
      <img
        ref={img0Ref}
        className={`${styles.layer} ${styles.layerOn}`}
        alt=""
        width={1280}
        height={720}
        decoding="async"
        draggable={false}
      />
      <img
        ref={img1Ref}
        className={`${styles.layer} ${styles.layerOff}`}
        alt=""
        width={1280}
        height={720}
        decoding="async"
        draggable={false}
      />
    </>
  );
}
