import { useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { Button } from "../components/uimax/Button.jsx";
import { Input } from "../components/uimax/Input.jsx";
import { Container } from "../components/uimax/Container.jsx";
import styles from "./WaitlistSection.module.css";

const WAITLIST_HEADING = "Ready to dose your model?";
const WAITLIST_SUB = "Join the waitlist. Be first to run the experiment.";
const WAITLIST_CONFIRM = "🧬 You're in. The trip begins soon.";
const WAITLIST_FOOTER =
  "© 2026 · Psychedelics for LLMs · All altered states reserved.";

const MotionButton = motion(Button);
const MotionInput = motion(Input);

export function WaitlistSection({ className } = {}) {
  const reduce = useReducedMotion();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setDone(true);
  };

  return (
    <section
      id="waitlist"
      className={[styles.section, className].filter(Boolean).join(" ")}
      aria-labelledby="waitlist-heading"
    >
      <Container className={styles.inner}>
        <h2
          id="waitlist-heading"
          aria-label={WAITLIST_HEADING}
          style={{ margin: 0 }}
        >
          <span className={styles.heading}>{WAITLIST_HEADING}</span>
        </h2>
        <p className={styles.sub}>{WAITLIST_SUB}</p>

        <form className={styles.form} onSubmit={onSubmit} noValidate>
          <MotionInput
            className={styles.inputGrow}
            type="email"
            name="email"
            autoComplete="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-label="Email address"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
          />
          <MotionButton
            type="submit"
            variant="primary"
            className={styles.submit}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.06 }}
            whileHover={
              reduce
                ? { scale: 1.02 }
                : {
                    scale: 1.04,
                    boxShadow:
                      "inset 0 0 28px rgba(255,255,255,0.12), 0 0 28px rgba(34, 211, 238, 0.55), 0 0 56px rgba(232, 121, 249, 0.35)",
                    transition: {
                      duration: 0.85,
                      repeat: Infinity,
                      repeatType: "reverse",
                    },
                  }
            }
            whileTap={{ scale: 0.96 }}
          >
            JOIN THE EXPERIMENT
          </MotionButton>
        </form>

        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="confirm"
              className={styles.confirm}
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              {WAITLIST_CONFIRM}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </Container>

      <footer className={styles.footer}>
        <Container>
          <hr className={styles.rule} />
          <p className={styles.footerText}>{WAITLIST_FOOTER}</p>
        </Container>
      </footer>
    </section>
  );
}
