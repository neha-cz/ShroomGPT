import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
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

export function ThesisSection() {
  const reduce = useReducedMotion();
  const headlineRef = useRef(null);
  const headlineInView = useInView(headlineRef, { once: true, margin: "-12% 0px" });
  const step = reduce ? 0.03 : 0.055;

  return (
    <section className={styles.section} aria-labelledby="thesis-heading">
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

          <h2 id="thesis-heading" className={styles.headline} ref={headlineRef}>
            <span className={styles.wordRow}>
              {HEADLINE_WORDS.map((w, i) => (
                <motion.span
                  key={`${i}-${w}`}
                  className={styles.word}
                  initial={{
                    opacity: 0,
                    y: reduce ? 8 : 22,
                    filter: reduce ? "none" : "blur(8px)",
                  }}
                  animate={
                    headlineInView
                      ? { opacity: 1, y: 0, filter: "blur(0px)" }
                      : {
                          opacity: 0,
                          y: reduce ? 8 : 22,
                          filter: reduce ? "none" : "blur(8px)",
                        }
                  }
                  transition={{
                    duration: reduce ? 0.3 : 0.55,
                    delay: headlineInView ? i * step : 0,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  {w}
                </motion.span>
              ))}
            </span>
          </h2>

          <motion.p
            className={styles.body}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{
              duration: reduce ? 0.35 : 0.65,
              delay: reduce ? 0 : 0.35,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {BODY}
          </motion.p>
        </motion.div>
      </Container>
    </section>
  );
}
