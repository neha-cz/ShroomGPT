import { useEffect, useState } from "react";

function readPrefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Accurate, updated `prefers-reduced-motion` (Framer’s `useReducedMotion` can be
 * wrong for film loops: it snapshots once and used a non-standard media string).
 */
export function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(readPrefersReducedMotion);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduce(!!mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return reduce;
}
