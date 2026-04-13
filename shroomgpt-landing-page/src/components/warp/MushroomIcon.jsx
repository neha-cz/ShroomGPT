import styles from "./MushroomIcon.module.css";

/** Small mushroom that follows the smoothed pointer (CSS vars from mushroomStore). */
export function MushroomIcon() {
  return (
    <div className={styles.root} aria-hidden="true">
      <svg
        className={styles.svg}
        viewBox="0 0 48 56"
        width={44}
        height={52}
        role="presentation"
      >
        <defs>
          <radialGradient id="mush-cap" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#fda4af" />
            <stop offset="45%" stopColor="#e879f9" />
            <stop offset="100%" stopColor="#7c3aed" />
          </radialGradient>
          <linearGradient id="mush-stem" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="100%" stopColor="#d4d4d8" />
          </linearGradient>
        </defs>
        <ellipse cx="24" cy="22" rx="20" ry="16" fill="url(#mush-cap)" />
        <circle cx="14" cy="18" r="2.2" fill="rgba(255,255,255,0.55)" />
        <circle cx="30" cy="16" r="1.6" fill="rgba(255,255,255,0.35)" />
        <path
          d="M18 34 Q24 32 30 34 L28 50 Q24 52 20 50 Z"
          fill="url(#mush-stem)"
        />
        <ellipse cx="24" cy="34" rx="7" ry="3" fill="rgba(0,0,0,0.12)" />
      </svg>
    </div>
  );
}
