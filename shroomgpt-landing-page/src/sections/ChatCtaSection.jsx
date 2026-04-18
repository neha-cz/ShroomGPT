import styles from "./ChatCtaSection.module.css";

export function ChatCtaSection() {
  return (
    <section
      className={styles.section}
      aria-labelledby="chat-cta-heading"
    >
      <h2 id="chat-cta-heading" className={styles.titleWrap}>
        <span className={styles.title}>
          Chat with ShroomGPT and unlock AI&apos;s creative potential.
        </span>
      </h2>
    </section>
  );
}
