import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(__dirname, "..", "dist");

const required = [
  "ezgif-6aea8380a2524c7e-jpg/ezgif-frame-001.jpg",
  "ezgif-6aea8380a2524c7e-jpg/ezgif-frame-240.jpg",
  "ezgif-29069d220b1923cd-jpg/ezgif-frame-001.jpg",
  "final-bkg-animation-folder/ezgif-frame-001.jpg",
  "cross-fade.png",
];

let ok = true;
for (const rel of required) {
  const full = path.join(dist, rel);
  if (!fs.existsSync(full)) {
    console.error(`[verify-frame-assets] Missing: dist/${rel}`);
    console.error(
      "  → Frame folders under public/ must be present when you run the build (commit and push them for deploy)."
    );
    ok = false;
  }
}

if (!ok) process.exit(1);
console.log("[verify-frame-assets] OK — key frame assets found in dist/");
