import { useCallback, useEffect, useRef, useState } from "react";
import { FrameCanvas } from "./components/FrameCanvas.jsx";
import { MushroomFieldProvider, MushroomIcon } from "./components/warp/index.js";
import { HeroSection } from "./sections/HeroSection.jsx";
import { ShroomGPTSection } from "./sections/ShroomGPTSection.jsx";
import { CubeSection } from "./sections/CubeSection.jsx";
import { MorphArchitectureSection } from "./sections/MorphArchitectureSection.jsx";
import { HistoricalSection } from "./sections/HistoricalSection.jsx";
import { ShroomPersonSection } from "./sections/ShroomPersonSection.jsx";
import { FinalBkgAnimation } from "./components/FinalBkgAnimation.jsx";
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
  const psychedelicStackRef = useRef(null);
  const [heroOverlayOn, setHeroOverlayOn] = useState(true);
  /** After the first time the user leaves the hero runway, keep sections in the DOM. */
  const [everUnlocked, setEverUnlocked] = useState(false);
  const [cinematicBackdropAlpha, setCinematicBackdropAlpha] = useState(0);

  const getRunwayEndPx = useCallback(() => runwayScrollEndPx(spacerRef.current), []);

  const syncFromScroll = useCallback(() => {
    const el = spacerRef.current;
    if (!el) return;
    const end = runwayScrollEndPx(el);
    const y = window.scrollY;
    setHeroOverlayOn(y < end);
    if (y >= end) {
      setEverUnlocked((u) => u || true);
    }
  }, []);

  useEffect(() => {
    syncFromScroll();
    window.addEventListener("scroll", syncFromScroll, { passive: true });
    window.addEventListener("resize", syncFromScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", syncFromScroll);
      window.removeEventListener("resize", syncFromScroll);
    };
  }, [syncFromScroll]);

  useEffect(() => {
    if (!everUnlocked) {
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
      /* Shift curve so the cinematic / “fade to black” completes sooner (less scroll lag). */
      const headStartVh = 0.38;
      const t = ((2 + headStartVh) * vh - rect.top) / vh;
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
  }, [everUnlocked]);

  return (
    <MushroomFieldProvider>
      <MushroomIcon />
      <FrameCanvas getRunwayEndPx={getRunwayEndPx} />
      {everUnlocked ? (
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
        {everUnlocked ? (
          <>
            <ShroomGPTSection />
            <CubeSection ref={cinematicSpacerRef} />
            <MorphArchitectureSection />
            <div
              ref={psychedelicStackRef}
              className={styles.psychedelicHistoricalStack}
            >
              <ShroomPersonSection scrollRootRef={psychedelicStackRef} />
              <div className={styles.psychedelicContent}>
                <HistoricalSection className={styles.historicalOverPsychedelic} />
              </div>
            </div>
            <FinalBkgAnimation />
          </>
        ) : null}
      </main>
    </MushroomFieldProvider>
  );
}
