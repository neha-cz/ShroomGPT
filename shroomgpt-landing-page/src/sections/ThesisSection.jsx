import { motion, useReducedMotion } from "framer-motion";
import { Container } from "../components/uimax/Container.jsx";
import styles from "./ThesisSection.module.css";

const HEADLINE_WORDS = [
  "THE",
  "NEXT",
  "NEWTON",
  "IS",
  "NOT",
  "HUMAN.",
  "IT",
  "JUST",
  "NEEDS",
  "THE",
  "RIGHT",
  "MOLECULE.",
];

const BODY =
  "Every major paradigm shift in science came from a mind willing to reason outside the boundaries everyone else accepted as fixed. Psychedelics didn't give those minds the answers — they dissolved the walls around the question. We're giving your AI model the same gift. The next generation of scientific breakthroughs — in physics, in medicine, in mathematics — will be discovered by AI systems that were taught to think beyond their training. We're building the molecule.";

const THESIS_HEADLINE = HEADLINE_WORDS.join(" ");

export function ThesisSection({ className } = {}) {
  const reduce = useReducedMotion();

  return (
    <section
      className={[styles.section, className].filter(Boolean).join(" ")}
      aria-labelledby="thesis-heading"
    >
      <Container className={styles.inner}>
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{
            duration: reduce ? 0.35 : 0.85,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <p className={styles.label}>03 / THE NEXT FRONTIER</p>

          <motion.h2
            id="thesis-heading"
            aria-label={THESIS_HEADLINE}
            style={{ margin: 0 }}
            initial={{ opacity: 0, y: reduce ? 0 : 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-12% 0px" }}
            transition={{
              duration: reduce ? 0.35 : 0.75,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <span className={styles.headline}>{THESIS_HEADLINE}</span>
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{
              duration: reduce ? 0.35 : 0.65,
              delay: reduce ? 0 : 0.35,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <p className={styles.body}>{BODY}</p>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
