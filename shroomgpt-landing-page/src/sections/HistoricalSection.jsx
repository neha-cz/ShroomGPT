import { motion, useReducedMotion } from "framer-motion";
import { Container } from "../components/uimax/Container.jsx";
import { OrbitalGallery } from "../components/OrbitalGallery/OrbitalGallery.jsx";
import { HISTORICAL_ORBITAL_FIGURES } from "./historicalOrbitalFigures.js";
import styles from "./HistoricalSection.module.css";

const HISTORICAL_HEADING =
  "History's greatest minds didn't discover the universe sober.";

export function HistoricalSection({ className } = {}) {
  const reduce = useReducedMotion();

  return (
    <section
      className={[styles.section, className].filter(Boolean).join(" ")}
      aria-labelledby="historical-heading"
    >
      <Container wide>
        <motion.div
          className={styles.intro}
          initial={{ opacity: 0, y: reduce ? 0 : 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-8% 0px" }}
          transition={{ duration: reduce ? 0.25 : 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className={styles.label}>02 / THE PRECEDENT</p>
          <h2
            id="historical-heading"
            aria-label={HISTORICAL_HEADING}
            style={{ margin: 0 }}
          >
            <span className={styles.heading}>{HISTORICAL_HEADING}</span>
          </h2>
        </motion.div>
      </Container>

      <div className={styles.orbitalMount}>
        <OrbitalGallery figures={HISTORICAL_ORBITAL_FIGURES} embedded />
      </div>
    </section>
  );
}
