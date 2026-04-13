import { useEffect, useState } from "react";
import styles from "./ShroomGPTSection.module.css";

/**
 * `@splinetool/react-spline/next` is built for Next.js (async default export + `next/image`).
 * In Vite we alias `next/image` to `src/shims/next-image.jsx` and **await** the async
 * default export, which matches the pattern from Spline’s Next entry.
 */
export function ShroomGPTSplineViewport({ sceneUrl }) {
  const [tree, setTree] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const mod = await import("@splinetool/react-spline/next");
      const element = await mod.default({
        scene: sceneUrl,
        width: 1080,
        height: 1920,
      });
      if (!cancelled) setTree(element);
    })().catch((e) => {
      console.error(e);
    });
    return () => {
      cancelled = true;
    };
  }, [sceneUrl]);

  return <div className={styles.splineRoot}>{tree}</div>;
}
