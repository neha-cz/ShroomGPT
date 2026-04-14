import { motion, useReducedMotion } from "framer-motion";
import { Container } from "../components/uimax/Container.jsx";
import { WarpText } from "../components/warp/index.js";
import styles from "./ShroomGPTSection.module.css";

const LEDE_TEXT =
  "We morph standard LLM transformer architecture—how attention fuses context, how depth stacks abstraction, how feedback loops close—into an altered topology so the model doesn't only predict the next token. It reasons in exploratory jumps, as if its weights were tuned by a shifted state: not random hallucination, but a wider search through hypothesis space. That's ShroomGPT.";

export function ShroomGPTSection() {
  const reduce = useReducedMotion();

  return (
    <section
      className={styles.section}
      aria-labelledby="shroomgpt-heading"
    >
      <Container wide>
        <div className={styles.copy}>
          <motion.div
            className={styles.warpRow}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{
              duration: reduce ? 0.25 : 0.5,
              delay: reduce ? 0 : 0.08,
              ease: "easeOut",
            }}
          >
            <WarpText
              text="01 / SHROOMGPT"
              className={styles.label}
              typographyClassName={styles.label}
              align="center"
            />
          </motion.div>

          <motion.h2
            id="shroomgpt-heading"
            className={styles.warpRow}
            aria-label="ShroomGPT"
            style={{ margin: 0 }}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{
              duration: reduce ? 0.3 : 0.6,
              delay: reduce ? 0 : 0.14,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <WarpText
              text="ShroomGPT"
              className={styles.title}
              typographyClassName={styles.title}
              align="center"
              ariaHidden
              fallbackAs="span"
            />
          </motion.h2>

          <motion.div
            className={styles.warpRow}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{
              duration: reduce ? 0.3 : 0.65,
              delay: reduce ? 0 : 0.2,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <WarpText
              text={LEDE_TEXT}
              className={styles.lede}
              typographyClassName={styles.lede}
              align="center"
            />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
