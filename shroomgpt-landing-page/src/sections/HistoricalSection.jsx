import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Container } from "../components/uimax/Container.jsx";
import styles from "./HistoricalSection.module.css";

const HISTORICAL_HEADING =
  "History's greatest minds didn't discover the universe sober.";

/** Served from `/new-scientists/` (symlink → `public/scientists-new`). */
const SCIENTISTS = [
  {
    name: "Francis Crick",
    image: "francis-crick.png",
    body: "The molecular biologist who cracked the structure of DNA reportedly used LSD to visualize molecular geometries that conventional thinking couldn't reach. He described the experience as allowing him to think in entirely new dimensions.",
  },
  {
    name: "Richard Feynman",
    image: "richard-feynman.png",
    body: "The Nobel-winning physicist systematically used sensory deprivation and psychedelics to enter altered reasoning states — describing hallucination not as noise, but as a different computational mode for problems that stumped conventional thought.",
  },
  {
    name: "Kary Mullis",
    image: "kary-mullis.png",
    body: "Inventor of PCR and Nobel laureate in chemistry; he spoke openly about LSD informing a nonlinear, associative style of thinking when wrestling with molecular puzzles the linear path missed.",
  },
  {
    name: "Carl Sagan",
    image: "carl-sagan.png",
    body: "Astronomer and science communicator who argued lucid, evidence-minded inquiry could coexist with expanded subjective experience — including advocacy for sensible cannabis policy grounded in data, not stigma.",
  },
  {
    name: "Steve Jobs",
    image: "steve-jobs.png",
    body: "Co-founder of Apple; on the record describing psychedelic experience as among the most important things he did, crediting it with a lasting sense of marvel, connection, and possibility.",
  },
  {
    name: "Elon Musk",
    image: "elon-musk.png",
    body: "Engineer-founder across aerospace and energy; his public commentary often circles convergent problems where first-principles thinking strips inherited assumptions — a cognitive move creativity literature often parallels with altered-state insight.",
  },
  {
    name: "Sam Altman",
    image: "sam-altman.png",
    body: "Technologist behind the current wave of large models; situates AI alongside other frontiers that recolor how humans model minds, language, and meaning — the same conceptual territory humans have long explored through ritual and altered states.",
  },
];

const IMG_BASE = "/new-scientists";

export function HistoricalSection({ className } = {}) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const touchStartX = useRef(null);
  const carouselRef = useRef(null);

  const count = SCIENTISTS.length;

  const goTo = useCallback((index) => {
    setActive(((index % count) + count) % count);
  }, [count]);

  const goPrev = useCallback(() => {
    goTo(active - 1);
  }, [active, goTo]);

  const goNext = useCallback(() => {
    goTo(active + 1);
  }, [active, goTo]);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    const onKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    };
    el.addEventListener("keydown", onKeyDown);
    return () => el.removeEventListener("keydown", onKeyDown);
  }, [goPrev, goNext]);

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e) => {
    if (touchStartX.current == null) return;
    const x = e.changedTouches[0].clientX;
    const dx = x - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 48) return;
    if (dx > 0) goPrev();
    else goNext();
  };

  const transitionMs = reduce ? 0 : 450;
  const slideEase = "cubic-bezier(0.16, 1, 0.3, 1)";

  /** Rotational transition: slides ahead/behind the active index tilt in 3D while the track translates. */
  const slideRotationStyle = (i) => {
    if (reduce) {
      return { transform: "none", transition: "none" };
    }
    const d = i - active;
    const rotateY = Math.max(-34, Math.min(34, d * -15));
    const translateZ = -Math.min(Math.abs(d), 3) * 22;
    const scale = d === 0 ? 1 : 0.94;
    return {
      transform: `rotateY(${rotateY}deg) translateZ(${translateZ}px) scale(${scale})`,
      transition: `transform ${transitionMs}ms ${slideEase}`,
    };
  };

  return (
    <section
      className={[styles.section, className].filter(Boolean).join(" ")}
      aria-labelledby="historical-heading"
    >
      <Container wide>
        <div className={styles.intro}>
          <p className={styles.label}>02 / THE PRECEDENT</p>
          <h2
            id="historical-heading"
            aria-label={HISTORICAL_HEADING}
            style={{ margin: 0 }}
          >
            <span className={styles.heading}>{HISTORICAL_HEADING}</span>
          </h2>
        </div>
      </Container>

      <div className={styles.portraitsStrip}>
        <motion.div
          className={styles.carousel}
          initial={{ opacity: 0, y: reduce ? 0 : 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-8% 0px" }}
          transition={{ duration: reduce ? 0.25 : 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            ref={carouselRef}
            className={styles.carouselShell}
            role="region"
            aria-roledescription="carousel"
            aria-label="Scientist portraits and biographies"
            aria-labelledby={`historical-caption-${active}`}
            tabIndex={0}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <button
              type="button"
              className={styles.navBtn}
              aria-label="Previous portrait"
              onClick={goPrev}
            >
              <span className={styles.navChevron} aria-hidden="true">
                ‹
              </span>
            </button>

            <div className={styles.carouselViewport}>
              <div
                className={styles.carouselTrack}
                style={{
                  transform: `translate3d(-${active * 100}%, 0, 0)`,
                  transitionDuration: `${transitionMs}ms`,
                  transitionTimingFunction: slideEase,
                }}
              >
                {SCIENTISTS.map((s, i) => (
                  <article
                    key={s.name}
                    className={styles.slide}
                    style={slideRotationStyle(i)}
                    aria-hidden={i !== active ? true : undefined}
                    id={`historical-slide-${i}`}
                  >
                    <div className={styles.portrait}>
                      <div className={styles.figure3d}>
                        <div
                          className={[
                            styles.figure3dInner,
                            !reduce && styles.figure3dInnerAnimate,
                            i % 2 === 0 ? styles.figure3dPhaseA : styles.figure3dPhaseB,
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          style={{
                            animationDelay: reduce ? undefined : `${(i % 3) * 0.35}s`,
                          }}
                        >
                          <img
                            src={`${IMG_BASE}/${s.image}`}
                            alt={`Portrait of ${s.name}`}
                            width={640}
                            height={640}
                            sizes="(max-width: 700px) 90vw, min(28rem, 42vw)"
                            loading={i === 0 ? "eager" : "lazy"}
                            decoding="async"
                            className={styles.portraitImg}
                          />
                        </div>
                      </div>
                      <div className={styles.caption}>
                        <h3 style={{ margin: 0 }}>
                          <span className={styles.name} id={`historical-caption-${i}`}>
                            {s.name}
                          </span>
                        </h3>
                        <p className={styles.body}>{s.body}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <button
              type="button"
              className={`${styles.navBtn} ${styles.navBtnNext}`}
              aria-label="Next portrait"
              onClick={goNext}
            >
              <span className={styles.navChevron} aria-hidden="true">
                ›
              </span>
            </button>
          </div>

          <div className={styles.dots} role="group" aria-label="Portrait slides">
            {SCIENTISTS.map((s, i) => (
              <button
                key={s.name}
                type="button"
                aria-current={i === active ? "true" : undefined}
                className={styles.dot}
                data-active={i === active ? "true" : undefined}
                onClick={() => goTo(i)}
                aria-label={`${s.name}, slide ${i + 1} of ${count}`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
