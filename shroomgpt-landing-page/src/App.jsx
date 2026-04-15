import { useCallback, useEffect, useRef, useState } from "react";
import { CinematicFrameCanvas } from "./components/CinematicFrameCanvas.jsx";
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
  const cinematicSpacerRef = useRef(null);
  const [heroOverlayOn, setHeroOverlayOn] = useState(true);
  const [sectionsUnlocked, setSectionsUnlocked] = useState(false);
  const [cinematicBackdropAlpha, setCinematicBackdropAlpha] = useState(0);
  const [cinematicOverlayOn, setCinematicOverlayOn] = useState(false);
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

  const syncCinematicOverlay = useCallback(() => {
    if (!sectionsUnlocked) {
      setCinematicOverlayOn(false);
      return;
    }
    const el = cinematicSpacerRef.current;
    if (!el) {
      setCinematicOverlayOn(false);
      return;
    }
    const start = el.getBoundingClientRect().top + window.scrollY;
    const range = runwayScrollEndPx(el);
    const y = window.scrollY;
    const on = y >= start - 2 && y <= start + range + 2;
    setCinematicOverlayOn(on);
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
    syncCinematicOverlay();
    window.addEventListener("scroll", syncCinematicOverlay, { passive: true });
    window.addEventListener("resize", syncCinematicOverlay, { passive: true });
    return () => {
      window.removeEventListener("scroll", syncCinematicOverlay);
      window.removeEventListener("resize", syncCinematicOverlay);
    };
  }, [syncCinematicOverlay]);

  useEffect(() => {
    if (!sectionsUnlocked) {
      setCinematicBackdropAlpha(0);
      return;
    }
    const updateFade = () => {
      const node = cinematicSpacerRef.current;
      if (!node) {
        setCinematicBackdropAlpha(0);
        return;
      }
      const rect = node.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const t = (2 * vh - rect.top) / vh;
      const alpha = Math.min(1, Math.max(0, t));
      setCinematicBackdropAlpha(alpha);
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
      <CinematicFrameCanvas
        runwayRef={cinematicSpacerRef}
        visible={cinematicOverlayOn}
      />
      {sectionsUnlocked ? (
        <>
          <div
            className={styles.overlay}
            aria-hidden="true"
            style={{ opacity: 1 - cinematicBackdropAlpha }}
          />
          <div
            className={styles.cinematicBackdrop}
            aria-hidden="true"
            style={{ opacity: cinematicBackdropAlpha }}
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
            <div
              ref={cinematicSpacerRef}
              className={styles.cinematicSpacer}
              aria-hidden="true"
            />
            <HistoricalSection />
            <ThesisSection />
            <WaitlistSection />
          </>
        ) : null}
      </main>
    </MushroomFieldProvider>
  );
}
