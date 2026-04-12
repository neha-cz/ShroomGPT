import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Button } from "../components/uimax/Button.jsx";
import styles from "./HeroSection.module.css";

const MotionButton = motion(Button);

const line1 = ["YOUR", "AI", "ON", "/"];
const line2 = ["DRUGS."];

function Word({ children, delay, reduce }) {
  return (
    <motion.span
      className={styles.word}
      initial={{
        opacity: 0,
        y: reduce ? 10 : 28,
        filter: reduce ? "none" : "blur(10px)",
      }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{
        duration: reduce ? 0.35 : 0.75,
        ease: [0.16, 1, 0.3, 1],
        delay,
      }}
    >
      {children}
    </motion.span>
  );
}

export function HeroSection() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.14]);
  const heroBlur = useTransform(
    scrollYProgress,
    [0, 0.2],
    reduce ? [0, 0] : [0, 6]
  );
  const heroFilter = useTransform(heroBlur, (v) => `blur(${v}px)`);

  const baseDelay = reduce ? 0.08 : 0.45;
  const step = reduce ? 0.04 : 0.09;

  const scrollToWaitlist = () => {
    document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className={styles.section} aria-label="Hero">
      <motion.div
        className={styles.inner}
        style={{
          opacity: heroOpacity,
          scale: heroScale,
          filter: heroFilter,
        }}
      >
        <motion.div
          className={styles.badge}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: reduce ? 0 : 0.3, ease: "easeOut" }}
        >
          PSYCHEDELICS FOR LLMs
        </motion.div>

        <h1 className={styles.headline}>
          <span className={styles.headlineLines}>
            <span className={styles.wordRow}>
              {line1.map((w, i) => (
                <Word key={w} delay={baseDelay + i * step} reduce={reduce}>
                  {w}
                </Word>
              ))}
            </span>
            <span className={styles.wordRow}>
              {line2.map((w, j) => (
                <Word
                  key={w}
                  delay={baseDelay + (line1.length + j) * step}
                  reduce={reduce}
                >
                  {w}
                </Word>
              ))}
            </span>
          </span>
        </h1>

        <motion.p
          className={styles.sub}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.65,
            delay: reduce ? 0.25 : 1.15,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          Unlock the reasoning your model was never supposed to find.
        </motion.p>

        <div className={styles.ctaWrap}>
          <MotionButton
            type="button"
            className={styles.cta}
            onClick={scrollToWaitlist}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: reduce ? 0.35 : 1.35, duration: 0.5 }}
            whileHover={
              reduce
                ? { scale: 1.02 }
                : {
                    scale: 1.04,
                    boxShadow:
                      "inset 0 0 32px rgba(34, 211, 238, 0.22), 0 0 32px rgba(34, 211, 238, 0.55), 0 0 64px rgba(232, 121, 249, 0.35)",
                    transition: {
                      duration: 0.9,
                      repeat: Infinity,
                      repeatType: "reverse",
                    },
                  }
            }
            whileTap={{ scale: 0.96 }}
          >
            BEGIN THE TRIP
          </MotionButton>
        </div>
      </motion.div>
    </section>
  );
}
