import { useCallback, useEffect, useRef, useState } from "react";
import { FrameCanvas } from "./components/FrameCanvas.jsx";
import { MushroomFieldProvider, MushroomIcon } from "./components/warp/index.js";
import { HeroSection } from "./sections/HeroSection.jsx";
import { ShroomGPTSection } from "./sections/ShroomGPTSection.jsx";
import { HistoricalSection } from "./sections/HistoricalSection.jsx";
import { ThesisSection } from "./sections/ThesisSection.jsx";
import { WaitlistSection } from "./sections/WaitlistSection.jsx";
import styles from "./App.module.css";

/**
 * When the fixed hero hides (matches `.heroSpacer` height − viewport).
 * Spacer height controls how long the backdrop scrubs before the rest of the page.
 */
function runwayScrollEndPx(spacerEl) {
  if (!spacerEl) return 0;
  const h = spacerEl.offsetHeight;
  const vh = window.innerHeight;
  return Math.max(0, h - vh);
}

export default function App() {
  const spacerRef = useRef(null);
  const historicalRef = useRef(null);
  const [heroOverlayOn, setHeroOverlayOn] = useState(true);
  const [sectionsUnlocked, setSectionsUnlocked] = useState(false);
  const [whiteBackdropAlpha, setWhiteBackdropAlpha] = useState(0);
  /** Once the user scrolls past the runway, keep the overlay off until they return ~to top. */
  const leftRunwayRef = useRef(false);

  const syncHeroOverlay = useCallback(() => {
    const el = spacerRef.current;
    if (!el) return;
    const end = runwayScrollEndPx(el);
    const y = window.scrollY;
    if (y <= 1) leftRunwayRef.current = false;
    if (y >= end - 1) leftRunwayRef.current = true;
    if (sectionsUnlocked) {
      setHeroOverlayOn(false);
      return;
    }
    if (y >= end - 1) {
      setSectionsUnlocked(true);
      setHeroOverlayOn(false);
      return;
    }
    const show = !leftRunwayRef.current && y < end - 1;
    setHeroOverlayOn(show);
  }, [sectionsUnlocked]);

  useEffect(() => {
    syncHeroOverlay();
    window.addEventListener("scroll", syncHeroOverlay, { passive: true });
    window.addEventListener("resize", syncHeroOverlay, { passive: true });
    return () => {
      window.removeEventListener("scroll", syncHeroOverlay);
      window.removeEventListener("resize", syncHeroOverlay);
    };
  }, [syncHeroOverlay]);

  useEffect(() => {
    if (!sectionsUnlocked) {
      setWhiteBackdropAlpha(0);
      return;
    }
    const updateFade = () => {
      const node = historicalRef.current;
      if (!node) {
        setWhiteBackdropAlpha(0);
        return;
      }
      const rect = node.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      /* 0 while Historical starts below viewport; ramps to 1 as it reaches top. */
      const t = (vh - rect.top) / (vh * 0.9);
      const alpha = Math.min(1, Math.max(0, t));
      setWhiteBackdropAlpha(alpha);
    };
    updateFade();
    window.addEventListener("scroll", updateFade, { passive: true });
    window.addEventListener("resize", updateFade, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateFade);
      window.removeEventListener("resize", updateFade);
    };
  }, [sectionsUnlocked]);

  return (
    <MushroomFieldProvider>
      <MushroomIcon />
      <FrameCanvas frozenFrameIndex={sectionsUnlocked ? 0 : null} />
      {sectionsUnlocked ? (
        <>
          <div
            className={styles.overlay}
            aria-hidden="true"
            style={{ opacity: 1 - whiteBackdropAlpha }}
          />
          <div
            className={styles.whiteBackdrop}
            aria-hidden="true"
            style={{ opacity: whiteBackdropAlpha }}
          />
        </>
      ) : (
        <div className={styles.overlay} aria-hidden="true" />
      )}
      <div
        className={
          heroOverlayOn ? styles.heroFixed : `${styles.heroFixed} ${styles.heroFixedHidden}`
        }
        aria-hidden={!heroOverlayOn}
      >
        <HeroSection scrollRootRef={spacerRef} />
      </div>
      <main className={styles.main} id="main-content">
        <div ref={spacerRef} className={styles.heroSpacer} aria-hidden="true" />
        {sectionsUnlocked ? (
          <>
            <ShroomGPTSection />
            <div ref={historicalRef}>
              <HistoricalSection />
            </div>
            <ThesisSection />
            <WaitlistSection />
          </>
        ) : null}
      </main>
    </MushroomFieldProvider>
  );
}
