import { useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./ShroomPersonSection.module.css";

const IMG_SRC = "/cropped-pinterest.png";

/** Veil reaches 0 after this many viewport heights of scroll (not full section height). */
const FADE_SCROLL_VH = 1.42;

/**
 * Psychedelic plate + scroll-scrubbed black veil (inverse of ShroomGPT→Cube:
 * those sit on the canvas then the fixed stack fades to black; here we start
 * black and reveal the image as the user scrolls through this block).
 */
export function ShroomPersonSection() {
  const reduce = useReducedMotion();
  const sectionRef = useRef(null);
  /** 1 = full black veil; 0 = image fully visible */
  const [veilOpacity, setVeilOpacity] = useState(1);

  const updateVeil = useCallback(() => {
    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    const scrollable = vh * FADE_SCROLL_VH;
    const scrolled = vh - rect.top;
    const progress = Math.min(1, Math.max(0, scrolled / scrollable));
    setVeilOpacity(1 - progress);
  }, []);

  useEffect(() => {
    if (reduce) {
      setVeilOpacity(0);
      return;
    }
    updateVeil();
    window.addEventListener("scroll", updateVeil, { passive: true });
    window.addEventListener("resize", updateVeil, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateVeil);
      window.removeEventListener("resize", updateVeil);
    };
  }, [reduce, updateVeil]);

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      aria-label="Shroom portrait backdrop"
    >
      <div className={styles.bgStack}>
        <img
          className={styles.bgImg}
          src={IMG_SRC}
          alt=""
          width={760}
          height={1366}
          decoding="async"
          draggable={false}
        />
        <div
          className={styles.veil}
          aria-hidden="true"
          style={{ opacity: veilOpacity }}
        />
        <div className={styles.content} />
      </div>
    </section>
  );
}
