/** Smoothed pointer for the mushroom cursor (CSS vars). */

export const mushroomStore = {
  clientX:
    typeof window !== "undefined" ? Math.floor(window.innerWidth / 2) : 0,
  clientY:
    typeof window !== "undefined" ? Math.floor(window.innerHeight / 2) : 0,
};

const SMOOTH = 0.12;
const target = { x: mushroomStore.clientX, y: mushroomStore.clientY };

let rafStarted = false;

function syncCssVars() {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const { clientX, clientY } = mushroomStore;
  root.style.setProperty("--mush-x", `${clientX}px`);
  root.style.setProperty("--mush-y", `${clientY}px`);
}

function tick() {
  const s = mushroomStore;
  s.clientX += (target.x - s.clientX) * SMOOTH;
  s.clientY += (target.y - s.clientY) * SMOOTH;
  syncCssVars();
  requestAnimationFrame(tick);
}

export function startMushroomStoreLoop() {
  if (rafStarted || typeof window === "undefined") return;
  rafStarted = true;
  syncCssVars();
  requestAnimationFrame(tick);
}

export function bindMushroomStoreToWindow() {
  if (typeof window === "undefined") return () => {};
  const onPointer = (e) => {
    target.x = e.clientX;
    target.y = e.clientY;
  };
  window.addEventListener("pointermove", onPointer, { passive: true });
  syncCssVars();
  return () => {
    window.removeEventListener("pointermove", onPointer);
  };
}
