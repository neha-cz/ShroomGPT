import { forwardRef, useCallback } from "react";
import Spline from "@splinetool/react-spline";
import styles from "./CubeSection.module.css";

/** Hosted Spline scene (react-spline; Vite uses `@splinetool/react-spline`, not `/next`). */
const SPLINE_SCENE_URL =
  "https://prod.spline.design/Bqs5zZC-Z72lgF1A/scene.splinecode";

export const CubeSection = forwardRef(function CubeSection(_props, forwardedRef) {
  const setSectionRef = useCallback(
    (node) => {
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [forwardedRef]
  );

  return (
    <section
      ref={setSectionRef}
      className={styles.section}
      aria-labelledby="cube-section-heading"
    >
      <div className={styles.sectionIntro}>
        <h2 id="cube-section-heading" className={styles.subtitle}>
          Transforming the LLM architecture
        </h2>
      </div>
      <div className={styles.sticky}>
        <div className={styles.splineWrap}>
          <Spline scene={SPLINE_SCENE_URL} className={styles.splineCanvas} />
        </div>
        <div className={styles.copyBelow}>
          <p className={styles.lede}>
            Altered-state effects are translated into structured perturbations and injected into the
            model&apos;s internal activations during inference. As each distorted signal propagates
            through the remaining layers, it{" "}
            <strong className={styles.ledeEmphasis}>
              compounds across every token generated
            </strong>
            , producing genuine shifts in reasoning.
          </p>
        </div>
      </div>
    </section>
  );
});
