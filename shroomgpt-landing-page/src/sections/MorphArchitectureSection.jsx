import Spline from "@splinetool/react-spline";
import styles from "./MorphArchitectureSection.module.css";

const SPLINE_SCENE_URL =
  "https://prod.spline.design/Dvr9qtF09XUjVDxj/scene.splinecode";

export function MorphArchitectureSection() {
  return (
    <section
      className={styles.section}
      aria-labelledby="morph-architecture-heading"
    >
      <div className={styles.intro}>
        <h2 id="morph-architecture-heading" className={styles.title}>
          Morphing the model&apos;s architecture.
        </h2>
      </div>
      <div className={styles.body}>
        <div className={styles.splineWrap}>
          <Spline scene={SPLINE_SCENE_URL} className={styles.splineCanvas} />
        </div>
      </div>
    </section>
  );
}
