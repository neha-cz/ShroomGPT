import { useReducedMotion } from "framer-motion";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import styles from "./CubeSection.module.css";

const FRAME_COUNT = 42;
const FILM_PATH = "/shroom-llm-cube";
/** Scroll delta (wheel or touch) accumulated before advancing one frame */
const FRAME_STEP_PX = 95;

function frameUrl(index) {
  const n = String(Math.min(FRAME_COUNT, Math.max(1, index + 1))).padStart(3, "0");
  return `${FILM_PATH}/ezgif-frame-${n}.jpg`;
}

function getLockScrollY(sectionEl) {
  if (!sectionEl) return 0;
  const rect = sectionEl.getBoundingClientRect();
  return rect.top + window.scrollY;
}

/** Scroll position encoded in `body.style.top` while fixed (e.g. `-512px` → 512) */
function readScrollYFromFixedBody() {
  const top = document.body.style.top;
  if (!top || top === "0px") return null;
  const n = parseInt(top, 10);
  return Number.isNaN(n) ? null : Math.abs(n);
}

function applyBodyLock(scrollY) {
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
  document.body.style.position = "fixed";
  document.body.style.top = `-${scrollY}px`;
  document.body.style.left = "0";
  document.body.style.right = "0";
  document.body.style.width = "100%";
}

function clearBodyLock() {
  document.documentElement.style.overflow = "";
  document.body.style.overflow = "";
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.left = "";
  document.body.style.right = "";
  document.body.style.width = "";
}

/**
 * Plain black cube strip. On approach: page locks; wheel/touch advance frames;
 * at end (or scroll up from frame 0): unlock and resume normal scroll.
 * Ref shared with App for cinematic backdrop fade.
 */
export const CubeSection = forwardRef(function CubeSection(_props, forwardedRef) {
  const reduce = useReducedMotion();
  const sectionRef = useRef(null);
  const [frameIndex, setFrameIndex] = useState(0);
  /** before_lock | locked | after_unlock */
  const [phase, setPhase] = useState("before_lock");
  const savedScrollYRef = useRef(0);
  const lockYRef = useRef(0);
  const accumRef = useRef(0);
  const frameRef = useRef(0);
  const phaseRef = useRef("before_lock");
  const touchLastY = useRef(null);
  /** Ignore global scroll handler briefly after programmatic unlock to avoid fighting layout */
  const ignoreScrollRef = useRef(false);

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
      const y = readScrollYFromFixedBody() ?? savedScrollYRef.current;
      clearBodyLock();
      /* Two-arg scroll is immediate (no smooth scroll) on all browsers */
      window.scrollTo(0, y);

      phaseRef.current = "after_unlock";
      setPhase("after_unlock");
      frameRef.current = FRAME_COUNT - 1;
      setFrameIndex(FRAME_COUNT - 1);
      accumRef.current = 0;

      ignoreScrollRef.current = true;
      window.setTimeout(() => {
        ignoreScrollRef.current = false;
      }, 240);

      /* Re-apply the wheel/trackpad delta as real scroll so the gesture continues naturally */
      requestAnimationFrame(() => {
        if (momentumDelta > 0) {
          window.scrollBy(0, momentumDelta);
        }
        syncLockY();
      });
    },
    [syncLockY]
  );

  const releaseLockBackward = useCallback(
    (momentumDelta = 0) => {
      const y = readScrollYFromFixedBody() ?? savedScrollYRef.current;
      clearBodyLock();
      window.scrollTo(0, y);

      phaseRef.current = "before_lock";
      setPhase("before_lock");
      frameRef.current = 0;
      setFrameIndex(0);
      accumRef.current = 0;

      ignoreScrollRef.current = true;
      window.setTimeout(() => {
        ignoreScrollRef.current = false;
      }, 240);

      requestAnimationFrame(() => {
        if (momentumDelta < 0) {
          window.scrollBy(0, momentumDelta);
        } else {
          window.scrollBy(0, -2);
        }
        syncLockY();
      });
    },
    [syncLockY]
  );

  const engageLock = useCallback(() => {
    if (reduce || phaseRef.current !== "before_lock") return;
    phaseRef.current = "locked";
    const y = lockYRef.current;
    savedScrollYRef.current = y;
    applyBodyLock(y);
    setPhase("locked");
    frameRef.current = 0;
    setFrameIndex(0);
    accumRef.current = 0;
  }, [reduce]);

  const applyScrollDelta = useCallback(
    (delta) => {
      if (phaseRef.current !== "locked") return;

      if (frameRef.current >= FRAME_COUNT - 1 && delta > 0) {
        releaseLockForward(delta);
        return;
      }
      if (frameRef.current === 0 && delta < 0) {
        releaseLockBackward(delta);
        return;
      }

      accumRef.current += delta;

      while (accumRef.current >= FRAME_STEP_PX && frameRef.current < FRAME_COUNT - 1) {
        accumRef.current -= FRAME_STEP_PX;
        frameRef.current += 1;
        setFrameIndex(frameRef.current);
      }
      while (accumRef.current <= -FRAME_STEP_PX && frameRef.current > 0) {
        accumRef.current += FRAME_STEP_PX;
        frameRef.current -= 1;
        setFrameIndex(frameRef.current);
      }
    },
    [releaseLockForward, releaseLockBackward]
  );

  useEffect(() => {
    if (reduce) {
      phaseRef.current = "after_unlock";
      setPhase("after_unlock");
      setFrameIndex(FRAME_COUNT - 1);
      frameRef.current = FRAME_COUNT - 1;
      return;
    }

    const onScroll = () => {
      if (ignoreScrollRef.current) return;

      const ph = phaseRef.current;
      syncLockY();
      const lockY = lockYRef.current;

      if (ph === "after_unlock") {
        if (window.scrollY < lockY - 80) {
          phaseRef.current = "before_lock";
          setPhase("before_lock");
          setFrameIndex(0);
          frameRef.current = 0;
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
      applyScrollDelta(e.deltaY);
    };

    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    return () => window.removeEventListener("wheel", onWheel, { capture: true });
  }, [reduce, phase, applyScrollDelta]);

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
      applyScrollDelta(delta * 1.4);
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
  }, [reduce, phase, applyScrollDelta]);

  useEffect(() => {
    return () => {
      if (phaseRef.current === "locked") {
        const y = readScrollYFromFixedBody() ?? savedScrollYRef.current;
        clearBodyLock();
        window.scrollTo(0, y);
      }
    };
  }, []);

  return (
    <section
      ref={setSectionRef}
      className={styles.section}
      aria-label="Shroom LLM cube sequence"
    >
      <div className={styles.sticky}>
        <div className={styles.frameWrap}>
          <img
            src={frameUrl(frameIndex)}
            alt=""
            className={styles.frame}
            width={1280}
            height={720}
            decoding="async"
            draggable={false}
          />
        </div>
      </div>
    </section>
  );
});
