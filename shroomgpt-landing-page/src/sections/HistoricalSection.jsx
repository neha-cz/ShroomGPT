import { Fragment, useCallback, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import TarotShuffleReveal from "../components/TarotShuffleReveal/TarotShuffleReveal.jsx";
import styles from "./HistoricalSection.module.css";

const HISTORICAL_TITLE = "The Burning Man effect";
const HISTORICAL_SUBTITLE =
  "The brilliant minds whose work was driven by psychedelic experiences.";

const JOBS_QUOTE = `“Taking LSD was a profound experience, one of the most important things in my life. LSD shows you that there’s another side to the coin, and you can’t remember it when it wears off, but you know it. It reinforced my sense of what was important—creating great things instead of making money, putting things back into the stream of history and of human consciousness as much as I could.”`;

const MULLIS_QUOTE = `“Would I have invented PCR if I hadn’t taken LSD? I seriously doubt it … [having taken LSD] I could sit on a DNA molecule and watch the polymers go by. I learnt that partly on psychedelic drugs.”`;

const SAGAN_QUOTE = `“Many but not all my cannabis trips have somewhere in them a symbolism significant to me which I won’t attempt to describe here, a kind of mandala embossed on the high. Free-associating to this mandala, both visually and as plays on words, has produced a very rich array of insights.”`;

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
  const [showJobsQuote, setShowJobsQuote] = useState(false);
  const onTarotComplete = useCallback(() => {
    setShowJobsQuote(true);
  }, []);

  return (
    <section
      className={[styles.section, className].filter(Boolean).join(" ")}
      aria-labelledby="historical-heading"
    >
      <div className={styles.tarotRegion}>
        <div className={styles.tarotBlock} aria-label="The Burning Man effect, tarot animation">
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
          <TarotShuffleReveal cards={TAROT_CARDS} onDealComplete={onTarotComplete} />
          {showJobsQuote ? (
            <Fragment>
              <motion.blockquote
                className={styles.jobsQuote}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.28 }}
                transition={{
                  duration: reduce ? 0.2 : 1.4,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <p className={styles.jobsQuoteText}>{JOBS_QUOTE}</p>
                <footer className={styles.jobsQuoteFooter}>
                  <cite className={styles.jobsAttribution}>Steve Jobs</cite>
                </footer>
              </motion.blockquote>
              <motion.blockquote
                className={styles.mullisQuote}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.28 }}
                transition={{
                  duration: reduce ? 0.2 : 1.4,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <p className={styles.mullisQuoteText}>{MULLIS_QUOTE}</p>
                <footer className={styles.mullisQuoteFooter}>
                  <cite className={styles.mullisAttribution}>Kary Mullis</cite>
                </footer>
              </motion.blockquote>
              <motion.blockquote
                className={styles.saganQuote}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.28 }}
                transition={{
                  duration: reduce ? 0.2 : 1.4,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <p className={styles.saganQuoteText}>{SAGAN_QUOTE}</p>
                <footer className={styles.saganQuoteFooter}>
                  <cite className={styles.saganAttribution}>Carl Sagan</cite>
                </footer>
              </motion.blockquote>
            </Fragment>
          ) : null}
        </div>
      </div>
    </section>
  );
}
