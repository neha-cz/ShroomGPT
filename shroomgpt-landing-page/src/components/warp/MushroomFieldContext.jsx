import { useEffect } from "react";
import { bindMushroomStoreToWindow, startMushroomStoreLoop } from "./mushroomStore.js";

/** Starts global pointer smoothing for the mushroom cursor (CSS vars). */
export function MushroomFieldProvider({ children }) {
  useEffect(() => {
    startMushroomStoreLoop();
    return bindMushroomStoreToWindow();
  }, []);

  return children;
}
