import { FrameCanvas } from "./components/FrameCanvas.jsx";
import { MushroomFieldProvider, MushroomIcon } from "./components/warp/index.js";
import { HeroSection } from "./sections/HeroSection.jsx";
import { ShroomGPTSection } from "./sections/ShroomGPTSection.jsx";
import { HistoricalSection } from "./sections/HistoricalSection.jsx";
import { ThesisSection } from "./sections/ThesisSection.jsx";
import { WaitlistSection } from "./sections/WaitlistSection.jsx";
import styles from "./App.module.css";

export default function App() {
  return (
    <MushroomFieldProvider>
      <MushroomIcon />
      <FrameCanvas />
      <div className={styles.overlay} aria-hidden="true" />
      <main className={styles.main}>
        <HeroSection />
        <ShroomGPTSection />
        <HistoricalSection />
        <ThesisSection />
        <WaitlistSection />
      </main>
    </MushroomFieldProvider>
  );
}
