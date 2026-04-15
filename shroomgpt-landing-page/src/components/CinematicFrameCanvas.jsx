import { useReducedMotion } from "framer-motion";
import { useRef } from "react";
import {
  CINEMATIC_FRAME_COUNT,
  CINEMATIC_FRAME_PATH,
  useRunwayScrollDrivenDoubleBuffer,
} from "../hooks/useScrollDrivenFrame.js";
import styles from "./CinematicFrameCanvas.module.css";

const layerClasses = {
  on: styles.layerOn,
  off: styles.layerOff,
};

export function CinematicFrameCanvas({ runwayRef, visible }) {
  const img0Ref = useRef(null);
  const img1Ref = useRef(null);
  const reduce = useReducedMotion();

  const forcedFrameIndex = !visible || reduce ? 0 : null;

  useRunwayScrollDrivenDoubleBuffer(
    img0Ref,
    img1Ref,
    layerClasses,
    CINEMATIC_FRAME_COUNT,
    CINEMATIC_FRAME_PATH,
    runwayRef,
    forcedFrameIndex
  );

  return (
    <div
      className={`${styles.wrap} ${visible ? "" : styles.wrapHidden}`}
      aria-hidden="true"
    >
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
