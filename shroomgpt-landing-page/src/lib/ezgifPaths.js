const pad3 = (index) => String(index + 1).padStart(3, "0");

/** Vite `public/`: these are root-relative so they work the same in dev, preview, and static hosts with `base: "/"`. */
export function heroEzgifFramePath(index) {
  return `/ezgif-6aea8380a2524c7e-jpg/ezgif-frame-${pad3(index)}.jpg`;
}

export function shroomgptEzgifFramePath(index) {
  return `/ezgif-29069d220b1923cd-jpg/ezgif-frame-${pad3(index)}.jpg`;
}

export function finalBkgEzgifFramePath(index) {
  return `/final-bkg-animation-folder/ezgif-frame-${pad3(index)}.jpg`;
}
