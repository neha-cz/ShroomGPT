import { useReducedMotion } from "framer-motion";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { CubeFilmBuffer } from "../components/CubeFilmBuffer.jsx";
import styles from "./CubeSection.module.css";

const FRAME_COUNT = 42;
const FILM_PATH = "/shroom-llm-cube";
/** Scroll pixels per frame of film — lower = smoother / finer scrub */
const PIXELS_PER_FRAME = 22;

function getLockScrollY(sectionEl) {
  if (!sectionEl) return 0;
  const rect = sectionEl.getBoundingClientRect();
  return rect.top + window.scrollY;
}

/**
 * Scroll-pinned cube (no `position: fixed` on body — avoids cross-browser unlock glitches).
 * While locked: wheel/touch advance frames; document scroll is held at `savedScrollYRef`.
 */
export const CubeSection = forwardRef(function CubeSection(_props, forwardedRef) {
  const reduce = useReducedMotion();
  const sectionRef = useRef(null);
  const [frameIndex, setFrameIndex] = useState(0);
  const [phase, setPhase] = useState("before_lock");
  const savedScrollYRef = useRef(0);
  const lockYRef = useRef(0);
  /** Continuous film position (0 … FRAME_COUNT-1); maps smoothly from scroll delta */
  const filmPositionRef = useRef(0);
  const frameRef = useRef(0);
  const phaseRef = useRef("before_lock");
  const touchLastY = useRef(null);
  const ignoreScrollRef = useRef(false);
  const inputPendingRef = useRef(0);
  const inputRafRef = useRef(0);

  const setSectionRef = useCallback(
    (node) => {
      sectionRef.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [forwardedRef]
  );

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    frameRef.current = frameIndex;
  }, [frameIndex]);

  const syncLockY = useCallback(() => {
    lockYRef.current = getLockScrollY(sectionRef.current);
  }, []);

  useEffect(() => {
    syncLockY();
    window.addEventListener("resize", syncLockY, { passive: true });
    return () => window.removeEventListener("resize", syncLockY);
  }, [syncLockY]);

  const releaseLockForward = useCallback(
    (momentumDelta = 0) => {
      const anchor = savedScrollYRef.current;
      phaseRef.current = "after_unlock";
      setPhase("after_unlock");
      frameRef.current = FRAME_COUNT - 1;
      filmPositionRef.current = FRAME_COUNT - 1;
      setFrameIndex(FRAME_COUNT - 1);

      ignoreScrollRef.current = true;
      window.setTimeout(() => {
        ignoreScrollRef.current = false;
      }, 320);

      /* Stay at anchor, then apply the same wheel delta as normal scrolling */
      window.scrollTo(0, anchor);
      if (momentumDelta > 0) {
        window.scrollBy(0, momentumDelta);
      }
      syncLockY();
    },
    [syncLockY]
  );

  const releaseLockBackward = useCallback(
    (momentumDelta = 0) => {
      const anchor = savedScrollYRef.current;
      phaseRef.current = "before_lock";
      setPhase("before_lock");
      frameRef.current = 0;
      filmPositionRef.current = 0;
      setFrameIndex(0);

      ignoreScrollRef.current = true;
      window.setTimeout(() => {
        ignoreScrollRef.current = false;
      }, 320);

      window.scrollTo(0, anchor);
      if (momentumDelta < 0) {
        window.scrollBy(0, momentumDelta);
      } else {
        window.scrollBy(0, -2);
      }
      syncLockY();
    },
    [syncLockY]
  );

  const engageLock = useCallback(() => {
    if (reduce || phaseRef.current !== "before_lock") return;
    const y = lockYRef.current;
    savedScrollYRef.current = y;
    window.scrollTo(0, y);
    phaseRef.current = "locked";
    setPhase("locked");
    frameRef.current = 0;
    filmPositionRef.current = 0;
    setFrameIndex(0);
  }, [reduce]);

  const getFrameUrl = useCallback((index) => {
    const n = String(Math.min(FRAME_COUNT, Math.max(1, index + 1))).padStart(3, "0");
    return `${FILM_PATH}/ezgif-frame-${n}.jpg`;
  }, []);

  const applyFilmDelta = useCallback(
    (delta) => {
      if (phaseRef.current !== "locked" || delta === 0) return;

      if (frameRef.current >= FRAME_COUNT - 1 && delta > 0) {
        releaseLockForward(delta);
        return;
      }
      if (frameRef.current === 0 && delta < 0) {
        releaseLockBackward(delta);
        return;
      }

      const max = FRAME_COUNT - 1;
      filmPositionRef.current = Math.max(
        0,
        Math.min(max, filmPositionRef.current + delta / PIXELS_PER_FRAME)
      );

      const next = Math.min(max, Math.max(0, Math.round(filmPositionRef.current)));
      if (next !== frameRef.current) {
        frameRef.current = next;
        filmPositionRef.current = next;
        setFrameIndex(next);
      }
    },
    [releaseLockForward, releaseLockBackward]
  );

  const flushInput = useCallback(() => {
    inputRafRef.current = 0;
    const d = inputPendingRef.current;
    inputPendingRef.current = 0;
    if (d !== 0) applyFilmDelta(d);
  }, [applyFilmDelta]);

  const scheduleFilmInput = useCallback((delta) => {
    inputPendingRef.current += delta;
    if (!inputRafRef.current) {
      inputRafRef.current = requestAnimationFrame(flushInput);
    }
  }, [flushInput]);

  useEffect(() => {
    if (reduce) {
      phaseRef.current = "after_unlock";
      setPhase("after_unlock");
      setFrameIndex(FRAME_COUNT - 1);
      frameRef.current = FRAME_COUNT - 1;
      filmPositionRef.current = FRAME_COUNT - 1;
      return;
    }

    const onScroll = () => {
      if (ignoreScrollRef.current) return;

      const ph = phaseRef.current;

      if (ph === "locked") {
        const pin = savedScrollYRef.current;
        if (Math.abs(window.scrollY - pin) > 0.5) {
          window.scrollTo(0, pin);
        }
        return;
      }

      syncLockY();
      const lockY = lockYRef.current;

      if (ph === "after_unlock") {
        if (window.scrollY < lockY - 80) {
          phaseRef.current = "before_lock";
          setPhase("before_lock");
          setFrameIndex(0);
          frameRef.current = 0;
          filmPositionRef.current = 0;
        }
        return;
      }

      if (ph === "before_lock" && window.scrollY >= lockY - 1) {
        window.scrollTo(0, lockY);
        requestAnimationFrame(() => engageLock());
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [reduce, engageLock, syncLockY]);

  useEffect(() => {
    if (reduce || phase !== "locked") return;

    const onWheel = (e) => {
      e.preventDefault();
      e.stopPropagation();
      scheduleFilmInput(e.deltaY);
    };

    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    return () => {
      window.removeEventListener("wheel", onWheel, { capture: true });
      if (inputRafRef.current) {
        cancelAnimationFrame(inputRafRef.current);
        inputRafRef.current = 0;
      }
      inputPendingRef.current = 0;
    };
  }, [reduce, phase, scheduleFilmInput]);

  useEffect(() => {
    if (reduce || phase !== "locked") return;

    const onTouchStart = (e) => {
      touchLastY.current = e.touches[0].clientY;
    };
    const onTouchMove = (e) => {
      if (touchLastY.current == null) return;
      e.preventDefault();
      const y = e.touches[0].clientY;
      const delta = touchLastY.current - y;
      touchLastY.current = y;
      scheduleFilmInput(delta * 1.35);
    };
    const onTouchEnd = () => {
      touchLastY.current = null;
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true, capture: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false, capture: true });
    window.addEventListener("touchend", onTouchEnd, { capture: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart, { capture: true });
      window.removeEventListener("touchmove", onTouchMove, { capture: true });
      window.removeEventListener("touchend", onTouchEnd, { capture: true });
    };
  }, [reduce, phase, scheduleFilmInput]);

  return (
    <section
      ref={setSectionRef}
      className={styles.section}
      aria-label="Shroom LLM cube sequence"
    >
      <div className={styles.sticky}>
        <div className={styles.frameWrap}>
          <CubeFilmBuffer frameIndex={frameIndex} getFrameUrl={getFrameUrl} />
        </div>
      </div>
    </section>
  );
});
