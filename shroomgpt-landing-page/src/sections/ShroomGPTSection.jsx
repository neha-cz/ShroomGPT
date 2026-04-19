import { AutoplayFrameFilm } from "../components/AutoplayFrameFilm.jsx";
import { Container } from "../components/uimax/Container.jsx";
import styles from "./ShroomGPTSection.module.css";

const SUBTITLE_TEXT = "We model the mind as geometry.";

const LEDE_BEFORE = `Psychedelics, in our framework, are transformations of the brain's cognitive energy landscape, deforming the topology of thought the way mass curves spacetime. We simulate this using Einstein's Field Equations, treating the neural state space as a Riemannian manifold whose curvature evolves under pharmacological forcing. ShroomGPT uses this geometric transformation as mathematical inspiration to induce fluidity, `;

const LEDE_AFTER = `.`;

const LEDE_BELOW_FILM_BEFORE =
  "The result is a model that fundamentally thinks in a new way, mirroring how a psychedelic experience ";

const LEDE_BELOW_FILM_AFTER =
  ". In doing so, ShroomGPT isn't just a prompt engineering framework. It is a model that reasons from a place most LLMs cannot reach.";

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
            <span className={styles.title}>ShroomGPT</span>
          </h2>

          <p id="shroomgpt-subtitle" className={styles.subtitle}>
            {SUBTITLE_TEXT}
          </p>

          <p className={styles.lede}>
            {LEDE_BEFORE}
            <strong className={styles.ledeEmphasis}>
              shifting how the model generates, connects, and explores ideas
            </strong>
            {LEDE_AFTER}
          </p>

          <AutoplayFrameFilm className={styles.film} />

          <p className={`${styles.lede} ${styles.ledeBelowFilm}`}>
            {LEDE_BELOW_FILM_BEFORE}
            <strong className={styles.ledeEmphasis}>
              unlocks your creative potential
            </strong>
            {LEDE_BELOW_FILM_AFTER}
          </p>
        </div>
      </Container>
    </section>
  );
}
