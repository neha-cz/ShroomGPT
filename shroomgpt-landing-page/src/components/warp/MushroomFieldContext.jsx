import { useEffect } from "react";
import { bindMushroomStoreToWindow, startMushroomStoreLoop } from "./mushroomStore.js";

/** Starts global pointer smoothing + scroll tracking for warp text and the mushroom icon. */
export function MushroomFieldProvider({ children }) {
  useEffect(() => {
    startMushroomStoreLoop();
    return bindMushroomStoreToWindow();
  }, []);

  return children;
}
