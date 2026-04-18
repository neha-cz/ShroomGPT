import { motion, useReducedMotion } from "framer-motion";
import { Container } from "../components/uimax/Container.jsx";
import styles from "./HistoricalSection.module.css";

const HISTORICAL_HEADING =
  "History's greatest minds didn't discover the universe sober.";

const SCIENTISTS = [
  {
    name: "Francis Crick",
    image: "crick.png",
    width: 922,
    height: 922,
    body: "The molecular biologist who cracked the structure of DNA reportedly used LSD to visualize molecular geometries that conventional thinking couldn't reach. He described the experience as allowing him to think in entirely new dimensions.",
  },
  {
    name: "Kary Mullis",
    image: "mallis.png",
    width: 800,
    height: 970,
    body: "The Nobel Prize-winning chemist who invented PCR — now foundational to modern medicine — directly credited LSD with the lateral thinking leap that made his discovery possible. He later asked openly: what if he had never taken it?",
  },
  {
    name: "Richard Feynman",
    image: "feynman.png",
    width: 930,
    height: 866,
    body: "The greatest physicist of the 20th century systematically used sensory deprivation and psychedelics to enter altered reasoning states — describing hallucination not as noise, but as a different computational mode for solving problems that stumped conventional thought.",
  },
];

export function HistoricalSection() {
  const reduce = useReducedMotion();

  return (
    <section className={styles.section} aria-labelledby="historical-heading">
      <Container wide>
        <p className={styles.label}>02 / THE PRECEDENT</p>
        <h2
          id="historical-heading"
          aria-label={HISTORICAL_HEADING}
          style={{ margin: 0 }}
        >
          <span className={styles.heading}>{HISTORICAL_HEADING}</span>
        </h2>
      </Container>

      {/* Full-bleed: not inside max-width Container so portraits can use real viewport width */}
      <div className={styles.portraitsStrip}>
        <div className={styles.portraits}>
          {SCIENTISTS.map((s, i) => (
            <motion.article
              key={s.name}
              className={styles.portrait}
              initial={{ opacity: 0, y: reduce ? 0 : 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-12% 0px" }}
              transition={{
                duration: reduce ? 0.35 : 0.65,
                delay: reduce ? 0 : i * 0.05,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <div className={styles.figure}>
                <img
                  src={`/scientists/${s.image}`}
                  alt={`Portrait painting of ${s.name}`}
                  width={s.width}
                  height={s.height}
                  sizes="(max-width: 700px) 92vw, (max-width: 1100px) 44vw, 30vw"
                  loading="lazy"
                  decoding="async"
                  className={styles.portraitImg}
                />
              </div>
              <div className={styles.caption}>
                <h3 aria-label={s.name} style={{ margin: 0 }}>
                  <span className={styles.name}>{s.name}</span>
                </h3>
                <p className={styles.body}>{s.body}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
