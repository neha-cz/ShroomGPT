import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Container } from "../components/uimax/Container.jsx";
import { useSectionScrollFrames } from "../hooks/useSectionScrollFrames.js";
import styles from "./ShroomGPTSection.module.css";

const SECTION_FRAMES = 240;
const SECTION_FRAME_BASE = "/ezgif-43b1d74becc9df2a-jpg";

const layerClasses = {
  on: styles.frameOn,
  off: styles.frameOff,
};

export function ShroomGPTSection() {
  const reduce = useReducedMotion();
  /** Only sticky film + pad — NOT the copy block — so frame scrub matches scroll distance */
  const runwayScrubRef = useRef(null);
  const frame0Ref = useRef(null);
  const frame1Ref = useRef(null);

  useSectionScrollFrames(runwayScrubRef, frame0Ref, frame1Ref, layerClasses, {
    totalFrames: SECTION_FRAMES,
    basePath: SECTION_FRAME_BASE,
  });

  const { scrollYProgress } = useScroll({
    target: runwayScrubRef,
    offset: ["start end", "end start"],
  });

  const cueOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  return (
    <section
      className={styles.section}
      aria-labelledby="shroomgpt-heading"
    >
      <Container wide>
        <div className={styles.scrollStage}>
          <div
            ref={runwayScrubRef}
            className={styles.runwayScrub}
            aria-label="ShroomGPT — scroll advances the sequence"
          >
            <div className={styles.stickyInner}>
              <motion.p
                className={styles.scrollCue}
                style={{ opacity: cueOpacity }}
                aria-hidden="true"
              >
                Keep scrolling — frames follow the page
              </motion.p>

              <div className={styles.frameViewport}>
                <img
                  ref={frame0Ref}
                  className={`${styles.frameLayer} ${styles.frameOn}`}
                  alt=""
                  decoding="async"
                  draggable={false}
                />
                <img
                  ref={frame1Ref}
                  className={`${styles.frameLayer} ${styles.frameOff}`}
                  alt=""
                  decoding="async"
                  draggable={false}
                />
              </div>
            </div>

            <div className={styles.scrollPad} aria-hidden="true" />
          </div>

          <div className={styles.copy}>
            <motion.p
              className={styles.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{
                duration: reduce ? 0.25 : 0.5,
                delay: reduce ? 0 : 0.08,
                ease: "easeOut",
              }}
            >
              01 / SHROOMGPT
            </motion.p>

            <motion.h2
              id="shroomgpt-heading"
              className={styles.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{
                duration: reduce ? 0.3 : 0.6,
                delay: reduce ? 0 : 0.14,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              ShroomGPT
            </motion.h2>

            <motion.p
              className={styles.lede}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{
                duration: reduce ? 0.3 : 0.65,
                delay: reduce ? 0 : 0.2,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              We morph standard LLM transformer architecture—how attention fuses
              context, how depth stacks abstraction, how feedback loops close—into
              an altered topology so the model doesn&apos;t only predict the next
              token. It reasons in exploratory jumps, as if its weights were tuned
              by a shifted state: not random hallucination, but a wider search
              through hypothesis space. That&apos;s ShroomGPT.
            </motion.p>

            <motion.p
              className={styles.embedNote}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: reduce ? 0 : 0.28 }}
            >
              Same scroll-scrubbed filmstrip as the backdrop — 240 frames, one
              continuous descent through the page.
            </motion.p>
          </div>
        </div>
      </Container>
    </section>
  );
}
