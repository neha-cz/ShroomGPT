import { useRef } from "react";
import styles from "./FrameCanvas.module.css";
import {
  FRAME_COUNT,
  useScrollDrivenDoubleBuffer,
} from "../hooks/useScrollDrivenFrame.js";

const layerClasses = {
  on: styles.layerOn,
  off: styles.layerOff,
};

/**
 * @param {() => number} getRunwayEndPx  Hero runway length in px (spacer height − viewport).
 *   Drives the morph so it reverses when scrolling back up, independent of page height.
 */
export function FrameCanvas({ getRunwayEndPx }) {
  const img0Ref = useRef(null);
  const img1Ref = useRef(null);

  useScrollDrivenDoubleBuffer(
    img0Ref,
    img1Ref,
    layerClasses,
    FRAME_COUNT,
    null,
    getRunwayEndPx
  );

  return (
    <div className={styles.wrap} aria-hidden="true">
      <img
        ref={img0Ref}
        className={`${styles.layer} ${styles.layerOn}`}
        alt=""
        decoding="async"
        fetchPriority="high"
        draggable={false}
      />
      <img
        ref={img1Ref}
        className={`${styles.layer} ${styles.layerOff}`}
        alt=""
        decoding="async"
        fetchPriority="low"
        draggable={false}
      />
    </div>
  );
}
