import { Container } from "../components/uimax/Container.jsx";
import { WarpText } from "../components/warp/index.js";
import styles from "./ShroomGPTSection.module.css";

const SUBTITLE_TEXT = "We model the mind as geometry.";

const TITLE_GRADIENT = {
  stops: [
    [0, "#f8c8dc"],
    [0.45, "#e879f9"],
    [1, "#a020f0"],
  ],
};

const LEDE_BEFORE = `Psychedelics, in our framework, are transformations of the brain's cognitive energy landscape, deforming the topology of thought the way mass curves spacetime. We simulate this using Einstein's Field Equations, treating the neural state space as a Riemannian manifold whose curvature evolves under pharmacological forcing. The resulting geometric transformation is then injected directly into the LLM architecture, altering the topology of the model's internal reasoning space, `;

const LEDE_AFTER = `. The output is a model that thinks beyond its training.`;

export function ShroomGPTSection() {
  return (
    <section
      className={styles.section}
      aria-labelledby="shroomgpt-heading"
    >
      <Container wide>
        <div className={styles.copy}>
          <p className={styles.label}>01 / SHROOMGPT</p>

          <h2
            id="shroomgpt-heading"
            className={styles.titleWrap}
            aria-label="ShroomGPT"
            style={{ margin: 0 }}
            aria-describedby="shroomgpt-subtitle"
          >
            <WarpText
              text="ShroomGPT"
              className={styles.title}
              typographyClassName={styles.title}
              canvasGradient={TITLE_GRADIENT}
              align="center"
              ariaHidden
              fallbackAs="span"
            />
          </h2>

          <p id="shroomgpt-subtitle" className={styles.subtitle}>
            {SUBTITLE_TEXT}
          </p>

          <p className={styles.lede}>
            {LEDE_BEFORE}
            <strong className={styles.ledeEmphasis}>
              shifting how it generates, connects, and explores ideas
            </strong>
            {LEDE_AFTER}
          </p>
        </div>
      </Container>
    </section>
  );
}
