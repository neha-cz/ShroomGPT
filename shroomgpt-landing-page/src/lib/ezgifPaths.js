import { publicUrl } from "./publicUrl.js";
const pad3 = (index) => String(index + 1).padStart(3, "0");

/** Vite `public/`: these are root-relative so they work the same in dev, preview, and static hosts with `base: "/"`. */
export function heroEzgifFramePath(index) {
  return publicUrl(`ezgif-6aea8380a2524c7e-jpg/ezgif-frame-${pad3(index)}.jpg`);
}

export function shroomgptEzgifFramePath(index) {
  return publicUrl(`ezgif-29069d220b1923cd-jpg/ezgif-frame-${pad3(index)}.jpg`);
}

export function finalBkgEzgifFramePath(index) {
  return publicUrl(`final-bkg-animation-folder/ezgif-frame-${pad3(index)}.jpg`);
}
