import styles from "./MushroomIcon.module.css";

/** Mushroom image that follows the smoothed pointer (CSS vars from mushroomStore). */
export function MushroomIcon() {
  return (
    <div className={styles.root} aria-hidden="true">
      <img
        className={styles.img}
        src="/mushroom.png"
        alt=""
        draggable={false}
        decoding="async"
      />
    </div>
  );
}
