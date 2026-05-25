/*
 * generate-icons.mjs — rasterize public/logo-mark.svg into PWA icons.
 *
 * Outputs (into public/icons/):
 *   - icon-192.png            192x192   (any)
 *   - icon-512.png            512x512   (any)
 *   - icon-maskable-512.png   512x512   (maskable: mark centered on a leaf-green
 *                                        #5aa630 safe-area background with padding)
 *   - apple-touch-icon.png    180x180   (any, on a cream background)
 *
 * Requires the `sharp` library (dev dependency). If it isn't installed, this
 * script prints a clear message and exits non-zero.
 *
 * Usage:
 *   pnpm add -D sharp && node scripts/generate-icons.mjs
 */

import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdir, access } from "node:fs/promises";
import { constants } from "node:fs";

const LEAF_GREEN = "#5aa630";
const CREAM = "#fdfdf8";

// Padding ratio for maskable icon so the mark sits inside the safe zone.
const MASKABLE_PADDING_RATIO = 0.2;

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SOURCE_SVG = join(ROOT, "public", "logo-mark.svg");
const OUT_DIR = join(ROOT, "public", "icons");

async function loadSharp() {
  try {
    const mod = await import("sharp");
    return mod.default ?? mod;
  } catch {
    console.error(
      "\n[generate-icons] The `sharp` library is not installed.\n" +
        "Install it as a dev dependency, then re-run this script:\n\n" +
        "  pnpm add -D sharp && node scripts/generate-icons.mjs\n"
    );
    process.exit(1);
  }
}

async function ensureSource() {
  try {
    await access(SOURCE_SVG, constants.R_OK);
  } catch {
    console.error(
      `[generate-icons] Source SVG not found or unreadable: ${SOURCE_SVG}`
    );
    process.exit(1);
  }
}

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
    alpha: 1,
  };
}

/** A square "any"-purpose icon: the mark fit onto a transparent canvas. */
async function renderStandard(sharp, size, outFile) {
  const svg = await sharp(SOURCE_SVG, { density: 384 })
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  await sharp(svg).png().toFile(outFile);
}

/** "any" icon on a solid background (used for apple-touch-icon). */
async function renderOnBackground(sharp, size, bgHex, outFile) {
  const mark = await sharp(SOURCE_SVG, { density: 384 })
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: hexToRgb(bgHex),
    },
  })
    .composite([{ input: mark, gravity: "center" }])
    .png()
    .toFile(outFile);
}

/** Maskable icon: mark centered with padding on a leaf-green safe area. */
async function renderMaskable(sharp, size, outFile) {
  const padding = Math.round(size * MASKABLE_PADDING_RATIO);
  const innerSize = size - padding * 2;

  const mark = await sharp(SOURCE_SVG, { density: 384 })
    .resize(innerSize, innerSize, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: hexToRgb(LEAF_GREEN),
    },
  })
    .composite([{ input: mark, gravity: "center" }])
    .png()
    .toFile(outFile);
}

async function main() {
  await ensureSource();
  const sharp = await loadSharp();
  await mkdir(OUT_DIR, { recursive: true });

  const tasks = [
    renderStandard(sharp, 192, join(OUT_DIR, "icon-192.png")),
    renderStandard(sharp, 512, join(OUT_DIR, "icon-512.png")),
    renderMaskable(sharp, 512, join(OUT_DIR, "icon-maskable-512.png")),
    renderOnBackground(sharp, 180, CREAM, join(OUT_DIR, "apple-touch-icon.png")),
  ];

  await Promise.all(tasks);

  console.log("[generate-icons] Wrote PWA icons to public/icons/:");
  console.log("  - icon-192.png");
  console.log("  - icon-512.png");
  console.log("  - icon-maskable-512.png");
  console.log("  - apple-touch-icon.png");
}

main().catch((error) => {
  console.error("[generate-icons] Failed:", error);
  process.exit(1);
});
