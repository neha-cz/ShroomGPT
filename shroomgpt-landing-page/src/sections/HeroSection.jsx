import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Button } from "../components/uimax/Button.jsx";
import styles from "./HeroSection.module.css";

const MotionButton = motion(Button);


const line1 = ["TAKE", "YOUR", "AI"];
const line2 = ["ON", "A", "TRIP."];


function pseudoRandom(seed) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
}

function Letter({ ch, index, progress, reduce }) {
  if (ch === " ") return <span className={styles.space} aria-hidden>{ch}</span>;
  if (reduce) return <span className={styles.letter}>{ch}</span>;

  const SCATTER_START = 0;
  const SCATTER_END = 0.45;
  const dirX = pseudoRandom(index + 1) * 2 - 1;
  const dirY = pseudoRandom(index + 41) * 2 - 1;
  const driftX = useTransform(progress, [SCATTER_START, SCATTER_END], [0, dirX * 280]);
  const driftY = useTransform(
    progress,
    [SCATTER_START, SCATTER_END],
    [0, dirY * 210 - (90 + pseudoRandom(index + 77) * 70)]
  );
  const spin = useTransform(progress, [SCATTER_START, SCATTER_END], [0, (pseudoRandom(index + 101) * 2 - 1) * 46]);
  const fade = useTransform(progress, [SCATTER_START, SCATTER_END], [1, 0.08]);

  return (
    <motion.span
      className={styles.letter}
      style={{ x: driftX, y: driftY, rotate: spin, opacity: fade }}
    >
      {ch}
    </motion.span>
  );
}

function Word({ children, delay, reduce, progress, wordIndex }) {
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
      {Array.from(children).map((ch, i) => (
        <Letter
          key={`${ch}-${i}`}
          ch={ch}
          index={wordIndex * 24 + i}
          progress={progress}
          reduce={reduce}
        />
      ))}
    </motion.span>
  );
}

export function HeroSection({ scrollRootRef }) {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: scrollRootRef,
    offset: ["start start", "end start"],
  });
  const descFade = useTransform(scrollYProgress, [0, 0.45], [1, 0]);
  const ctaFade = useTransform(scrollYProgress, [0, 0.45], [1, 0]);

  const baseDelay = reduce ? 0.08 : 0.45;
  const step = reduce ? 0.04 : 0.09;

  const scrollToPage = () => {
    document.getElementById("main-content")?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
    });
  };

  return (
    <section className={styles.section} aria-label="Hero">
      <motion.div className={styles.inner}>
        <h1 className={styles.headline}>
          <span className={styles.headlineLines}>
            <span className={styles.wordRow}>
              {line1.map((w, i) => (
                <Word
                  key={w}
                  delay={baseDelay + i * step}
                  reduce={reduce}
                  progress={scrollYProgress}
                  wordIndex={i}
                >
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
                  progress={scrollYProgress}
                  wordIndex={line1.length + j}
                >
                  {w}
                </Word>
              ))}
            </span>
          </span>
        </h1>

        <motion.div
          style={{ opacity: reduce ? 1 : descFade }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.65,
            delay: reduce ? 0.25 : 1.15,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <p className={styles.sub}>
            Get your model high on ideas it was never supposed to have.
          </p>
        </motion.div>

        <motion.div
          className={styles.ctaWrap}
          style={{ opacity: reduce ? 1 : ctaFade }}
        >
          <MotionButton
            type="button"
            className={styles.cta}
            onClick={scrollToPage}
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
        </motion.div>
      </motion.div>
    </section>
  );
}
