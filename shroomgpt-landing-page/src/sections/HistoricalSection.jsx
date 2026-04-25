import { motion, useReducedMotion } from "framer-motion";
import TarotShuffleReveal from "../components/TarotShuffleReveal/TarotShuffleReveal.jsx";
import styles from "./HistoricalSection.module.css";

const HISTORICAL_TITLE = "The Burning Man effect";
const HISTORICAL_SUBTITLE =
  "How psychedelics have shaped the most brilliant minds.";

const base = import.meta.env.BASE_URL;
const tarotImage = (n) => `${base}tarot%20cards/${n}.png`;

/** Order matches `public/tarot cards/1.png` … `6.png` — relabel or reorder to match your artwork. */
const TAROT_CARDS = [
  { name: "Steve Jobs", imageUrl: tarotImage(1) },
  { name: "Elon Musk", imageUrl: tarotImage(2) },
  { name: "Sam Altman", imageUrl: tarotImage(3) },
  { name: "Richard Feynman", imageUrl: tarotImage(4) },
  { name: "Carl Sagan", imageUrl: tarotImage(5) },
  { name: "Kary Mullis", imageUrl: tarotImage(6) },
];

export function HistoricalSection({ className } = {}) {
  const reduce = useReducedMotion();

  return (
    <section
      className={[styles.section, className].filter(Boolean).join(" ")}
      aria-labelledby="historical-heading"
    >
      <motion.div
        className={styles.intro}
        initial={{ opacity: 0, y: reduce ? 0 : 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-8% 0px" }}
        transition={{ duration: reduce ? 0.25 : 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className={styles.label}>02 / THE PRECEDENT</p>
        <h2 id="historical-heading" className={styles.title} style={{ margin: 0 }}>
          {HISTORICAL_TITLE}
        </h2>
        <p className={styles.subtitle}>{HISTORICAL_SUBTITLE}</p>
      </motion.div>
      <div className={styles.tarotRegion}>
        <div className={styles.tarotTrack}>
          {/* 100dvh = deal stage; 400dvh = remaining flow so lockY0 + 5·viewport reaches the end of this block */}
          <TarotShuffleReveal cards={TAROT_CARDS} />
          <div className={styles.tarotVirtualSpace} aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
