import { Container } from "../components/uimax/Container.jsx";
import { WarpText } from "../components/warp/index.js";
import styles from "./ShroomGPTSection.module.css";

const LEDE_TEXT =
  "We morph standard LLM transformer architecture—how attention fuses context, how depth stacks abstraction, how feedback loops close—into an altered topology so the model doesn't only predict the next token. It reasons in exploratory jumps, as if its weights were tuned by a shifted state: not random hallucination, but a wider search through hypothesis space. That's ShroomGPT.";

export function ShroomGPTSection() {
  return (
    <section
      className={styles.section}
      aria-labelledby="shroomgpt-heading"
    >
      <Container wide>
        <div className={styles.copy}>
          <div className={styles.warpRow}>
            <WarpText
              text="01 / SHROOMGPT"
              className={styles.label}
              typographyClassName={styles.label}
              align="center"
            />
          </div>

          <h2
            id="shroomgpt-heading"
            className={styles.warpRow}
            aria-label="ShroomGPT"
            style={{ margin: 0 }}
          >
            <WarpText
              text="ShroomGPT"
              className={styles.title}
              typographyClassName={styles.title}
              align="center"
              ariaHidden
              fallbackAs="span"
            />
          </h2>

          <div className={styles.warpRow}>
            <WarpText
              text={LEDE_TEXT}
              className={styles.lede}
              typographyClassName={styles.lede}
              align="center"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
