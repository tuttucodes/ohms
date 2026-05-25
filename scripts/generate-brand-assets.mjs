/*
 * generate-brand-assets.mjs — produce OHMS brand assets (favicon, app icons,
 * Open Graph / social share cards) from the founder's leaf mark.
 *
 * Source selection (in priority order):
 *   1. public/ohms-logo.png   — the founder's EXACT logo, preferred if present.
 *   2. public/logo-mark.svg   — the leaf-in-a-glossy-circle mark (fallback).
 *
 * Outputs:
 *   - app/icon.png            32x32    Next.js App Router auto-serves as favicon.
 *   - app/apple-icon.png      180x180  Next.js auto-serves as apple-touch-icon.
 *   - public/favicon-32.png   32x32    plain PNG sibling of the ico fallback.
 *   - public/favicon.ico      multi-size (16/32/48) when sharp can emit .ico.
 *                              If sharp CANNOT write .ico, we skip it and rely on
 *                              app/icon.png (which Next.js serves as the favicon)
 *                              plus public/favicon-32.png — and log a clear note.
 *   - public/og.png           1200x630 polished social share card.
 *   - public/og-square.png    1080x1080 Instagram-style square variant.
 *
 * Requires the `sharp` library (dev dependency). If it isn't installed, this
 * script prints an install hint and exits with code 1. Each asset is generated
 * independently so a single failure does not abort the rest; progress is logged
 * and the process exits 0 only when every asset succeeded.
 *
 * Usage:
 *   pnpm add -D sharp && node scripts/generate-brand-assets.mjs
 */

import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdir, access, stat } from "node:fs/promises";
import { constants } from "node:fs";

// ---------------------------------------------------------------------------
// Brand constants
// ---------------------------------------------------------------------------

const LEAF_GREEN = "#5aa630";
const LEAF_GREEN_DEEP = "#3f8f2e";
const LEAF_GREEN_SOFT = "#8ed05a";
const CREAM = "#fdfdf8";
const INK = "#26331f";
const SUBTLE_INK = "#52614a";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const SOURCE_PNG = join(ROOT, "public", "ohms-logo.png");
const SOURCE_SVG = join(ROOT, "public", "logo-mark.svg");

const APP_DIR = join(ROOT, "app");
const PUBLIC_DIR = join(ROOT, "public");

// SVG-render density. Higher density => crisper rasterization of vector input.
const SVG_DENSITY = 512;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function loadSharp() {
  try {
    const mod = await import("sharp");
    return mod.default ?? mod;
  } catch {
    console.error(
      "\n[brand-assets] The `sharp` library is not installed.\n" +
        "Install it as a dev dependency, then re-run this script:\n\n" +
        "  pnpm add -D sharp && node scripts/generate-brand-assets.mjs\n"
    );
    process.exit(1);
  }
}

async function exists(path) {
  try {
    await access(path, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

/** Resolve the best available source mark. Prefers the founder's PNG. */
async function resolveSource() {
  if (await exists(SOURCE_PNG)) {
    return { path: SOURCE_PNG, isSvg: false, label: "public/ohms-logo.png" };
  }
  if (await exists(SOURCE_SVG)) {
    return { path: SOURCE_SVG, isSvg: true, label: "public/logo-mark.svg" };
  }
  console.error(
    "[brand-assets] No source mark found. Expected one of:\n" +
      `  ${SOURCE_PNG}\n  ${SOURCE_SVG}`
  );
  process.exit(1);
}

function hexToRgb(hex, alpha = 1) {
  const value = hex.replace("#", "");
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
    alpha,
  };
}

/** Load the source mark resized to a square PNG buffer (transparent fit). */
async function markBuffer(sharp, source, size) {
  const opts = source.isSvg ? { density: SVG_DENSITY } : {};
  return sharp(source.path, opts)
    .resize(size, size, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
}

/** A square PNG canvas of a solid color. */
function solidCanvas(sharp, size, hex, alpha = 1) {
  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: hexToRgb(hex, alpha),
    },
  });
}

/**
 * An SVG buffer with a rounded-rectangle fill — used as a soft cream "chip"
 * behind small icons so the green mark reads clearly against any browser UI.
 */
function roundedRectSvg(size, radius, fillHex) {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">` +
      `<rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="${fillHex}"/>` +
      `</svg>`
  );
}

// ---------------------------------------------------------------------------
// Asset generators (each returns a Promise; failures are caught by the runner)
// ---------------------------------------------------------------------------

/**
 * app/icon.png — 32x32 mark on a cream rounded background.
 * Next.js App Router auto-serves app/icon.png as the favicon.
 */
async function makeAppIcon(sharp, source) {
  const SIZE = 32;
  const RADIUS = 8;
  const PADDING = 3;
  const inner = SIZE - PADDING * 2;

  const chip = roundedRectSvg(SIZE, RADIUS, CREAM);
  const mark = await markBuffer(sharp, source, inner);

  await solidCanvas(sharp, SIZE, CREAM, 0) // transparent base
    .composite([
      { input: chip, top: 0, left: 0 },
      { input: mark, gravity: "center" },
    ])
    .png()
    .toFile(join(APP_DIR, "icon.png"));
}

/**
 * app/apple-icon.png — 180x180 mark on a solid cream background (no
 * transparency, per Apple touch-icon expectations).
 */
async function makeAppleIcon(sharp, source) {
  const SIZE = 180;
  const PADDING = 24;
  const inner = SIZE - PADDING * 2;

  const mark = await markBuffer(sharp, source, inner);

  await solidCanvas(sharp, SIZE, CREAM)
    .composite([{ input: mark, gravity: "center" }])
    .png()
    .toFile(join(APP_DIR, "apple-icon.png"));
}

/** public/favicon-32.png — plain 32x32 PNG (cream chip + mark). */
async function makeFavicon32(sharp, source) {
  const SIZE = 32;
  const RADIUS = 8;
  const PADDING = 3;
  const inner = SIZE - PADDING * 2;

  const chip = roundedRectSvg(SIZE, RADIUS, CREAM);
  const mark = await markBuffer(sharp, source, inner);

  await solidCanvas(sharp, SIZE, CREAM, 0)
    .composite([
      { input: chip, top: 0, left: 0 },
      { input: mark, gravity: "center" },
    ])
    .png()
    .toFile(join(PUBLIC_DIR, "favicon-32.png"));
}

/**
 * public/favicon.ico — multi-size (16/32/48) ICO.
 * sharp does NOT support writing the .ico container, so we detect that and
 * surface a clear, non-fatal note. Returns true if written, false if skipped.
 */
async function makeFaviconIco(sharp, source) {
  const out = join(PUBLIC_DIR, "favicon.ico");
  // sharp has no .ico() encoder; .toFile("*.ico") fails. Probe capability.
  try {
    const mark = await markBuffer(sharp, source, 48);
    // Attempt: this throws "Unsupported output format ico" on all sharp builds.
    await sharp(mark).toFormat("ico").toFile(out);
    return true;
  } catch (err) {
    const reason = err && err.message ? err.message : String(err);
    console.warn(
      "[brand-assets] sharp cannot emit .ico (" +
        reason.split("\n")[0] +
        "). Skipping favicon.ico — Next.js serves app/icon.png as the favicon,\n" +
        "               and public/favicon-32.png is available as a static fallback."
    );
    return false;
  }
}

/**
 * Build the OG card SVG overlay (text + decorative marks). Rendered to a buffer
 * and composited over a gradient canvas. The leaf mark is composited separately
 * as a raster so it stays crisp.
 */
function ogOverlaySvg(width, height, layout) {
  const { wordmarkSize, taglineSize, eyebrowSize, textX, baselineY } = layout;
  const wordmarkY = baselineY;
  const taglineY = wordmarkY + taglineSize + 28;
  const eyebrowY = wordmarkY - wordmarkSize - 18;

  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${CREAM}"/>
          <stop offset="58%" stop-color="#f1f7e8"/>
          <stop offset="100%" stop-color="#e3f0d2"/>
        </linearGradient>
        <radialGradient id="glow" cx="78%" cy="22%" r="60%">
          <stop offset="0%" stop-color="${LEAF_GREEN_SOFT}" stop-opacity="0.42"/>
          <stop offset="60%" stop-color="${LEAF_GREEN}" stop-opacity="0.10"/>
          <stop offset="100%" stop-color="${LEAF_GREEN}" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="wordFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${LEAF_GREEN}"/>
          <stop offset="100%" stop-color="${LEAF_GREEN_DEEP}"/>
        </linearGradient>
      </defs>

      <!-- Base gradient + soft top-right glow -->
      <rect x="0" y="0" width="${width}" height="${height}" fill="url(#bg)"/>
      <rect x="0" y="0" width="${width}" height="${height}" fill="url(#glow)"/>

      <!-- Subtle leaf-green accent bar on the left edge -->
      <rect x="0" y="0" width="14" height="${height}" fill="${LEAF_GREEN}"/>

      <!-- Decorative scattered dots (organic, low-opacity) -->
      <g fill="${LEAF_GREEN}" opacity="0.10">
        <circle cx="${width - 120}" cy="${height - 90}" r="46"/>
        <circle cx="${width - 230}" cy="${height - 150}" r="20"/>
        <circle cx="${width - 70}" cy="${height - 200}" r="14"/>
      </g>

      <!-- Eyebrow / kicker -->
      <text x="${textX}" y="${eyebrowY}"
        font-family="'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif"
        font-size="${eyebrowSize}" font-weight="600" letter-spacing="6"
        fill="${LEAF_GREEN_DEEP}" opacity="0.9">KIDSWEAR · MADE GENTLE</text>

      <!-- Wordmark -->
      <text x="${textX}" y="${wordmarkY}"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="${wordmarkSize}" font-weight="700" letter-spacing="2"
        fill="url(#wordFill)">OHMS</text>

      <!-- Tagline -->
      <text x="${textX + 4}" y="${taglineY}"
        font-family="'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif"
        font-size="${taglineSize}" font-weight="500" letter-spacing="1.5"
        fill="${SUBTLE_INK}">Soft And Comfort</text>

      <!-- Thin divider under the lockup -->
      <rect x="${textX + 5}" y="${taglineY + 26}" width="120" height="4" rx="2" fill="${LEAF_GREEN}"/>
    </svg>`
  );
}

/**
 * public/og.png — 1200x630 social share card. Left-aligned wordmark + tagline,
 * leaf mark on the right inside a soft cream disc.
 */
async function makeOg(sharp, source) {
  const WIDTH = 1200;
  const HEIGHT = 630;

  const overlay = ogOverlaySvg(WIDTH, HEIGHT, {
    eyebrowSize: 24,
    wordmarkSize: 150,
    taglineSize: 38,
    textX: 96,
    baselineY: 340,
  });

  // Leaf mark on the right, seated inside a soft cream disc with a faint ring.
  const markSize = 300;
  const discSize = 380;
  const disc = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${discSize}" height="${discSize}">` +
      `<circle cx="${discSize / 2}" cy="${discSize / 2}" r="${discSize / 2 - 6}" fill="${CREAM}"/>` +
      `<circle cx="${discSize / 2}" cy="${discSize / 2}" r="${discSize / 2 - 6}" fill="none" stroke="${LEAF_GREEN}" stroke-opacity="0.18" stroke-width="6"/>` +
      `</svg>`
  );
  const mark = await markBuffer(sharp, source, markSize);

  const discComposed = await sharp(disc)
    .composite([{ input: mark, gravity: "center" }])
    .png()
    .toBuffer();

  const discTop = Math.round((HEIGHT - discSize) / 2);
  const discLeft = WIDTH - discSize - 110;

  await sharp(overlay)
    .composite([{ input: discComposed, top: discTop, left: discLeft }])
    .png()
    .toFile(join(PUBLIC_DIR, "og.png"));
}

/**
 * public/og-square.png — 1080x1080 Instagram-style variant. Mark on top,
 * centered wordmark + tagline below.
 */
async function makeOgSquare(sharp, source) {
  const SIZE = 1080;

  // Centered composition: mark high, text stacked below center.
  const overlay = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}">
      <defs>
        <linearGradient id="bgsq" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${CREAM}"/>
          <stop offset="60%" stop-color="#f1f7e8"/>
          <stop offset="100%" stop-color="#e3f0d2"/>
        </linearGradient>
        <radialGradient id="glowsq" cx="50%" cy="30%" r="55%">
          <stop offset="0%" stop-color="${LEAF_GREEN_SOFT}" stop-opacity="0.40"/>
          <stop offset="100%" stop-color="${LEAF_GREEN}" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="wordFillSq" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${LEAF_GREEN}"/>
          <stop offset="100%" stop-color="${LEAF_GREEN_DEEP}"/>
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="${SIZE}" height="${SIZE}" fill="url(#bgsq)"/>
      <rect x="0" y="0" width="${SIZE}" height="${SIZE}" fill="url(#glowsq)"/>
      <g fill="${LEAF_GREEN}" opacity="0.09">
        <circle cx="140" cy="${SIZE - 150}" r="60"/>
        <circle cx="${SIZE - 150}" cy="${SIZE - 220}" r="26"/>
      </g>

      <text x="${SIZE / 2}" y="690" text-anchor="middle"
        font-family="'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif"
        font-size="30" font-weight="600" letter-spacing="8"
        fill="${LEAF_GREEN_DEEP}" opacity="0.9">KIDSWEAR · MADE GENTLE</text>

      <text x="${SIZE / 2}" y="850" text-anchor="middle"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="170" font-weight="700" letter-spacing="3"
        fill="url(#wordFillSq)">OHMS</text>

      <text x="${SIZE / 2}" y="920" text-anchor="middle"
        font-family="'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif"
        font-size="42" font-weight="500" letter-spacing="2"
        fill="${SUBTLE_INK}">Soft And Comfort</text>
    </svg>`
  );

  const markSize = 360;
  const discSize = 440;
  const disc = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${discSize}" height="${discSize}">` +
      `<circle cx="${discSize / 2}" cy="${discSize / 2}" r="${discSize / 2 - 8}" fill="${CREAM}"/>` +
      `<circle cx="${discSize / 2}" cy="${discSize / 2}" r="${discSize / 2 - 8}" fill="none" stroke="${LEAF_GREEN}" stroke-opacity="0.18" stroke-width="7"/>` +
      `</svg>`
  );
  const mark = await markBuffer(sharp, source, markSize);
  const discComposed = await sharp(disc)
    .composite([{ input: mark, gravity: "center" }])
    .png()
    .toBuffer();

  const discTop = 150;
  const discLeft = Math.round((SIZE - discSize) / 2);

  await sharp(overlay)
    .composite([{ input: discComposed, top: discTop, left: discLeft }])
    .png()
    .toFile(join(PUBLIC_DIR, "og-square.png"));
}

// ---------------------------------------------------------------------------
// Runner — generate each asset independently, log progress, track failures.
// ---------------------------------------------------------------------------

async function runAsset(label, fn) {
  try {
    const result = await fn();
    if (result === false) {
      // Soft-skip (e.g. favicon.ico). Already logged its own note.
      return { label, ok: true, skipped: true };
    }
    console.log(`[brand-assets] ✓ ${label}`);
    return { label, ok: true };
  } catch (err) {
    console.error(`[brand-assets] ✗ ${label} — ${err && err.message ? err.message : err}`);
    return { label, ok: false };
  }
}

async function reportSize(path) {
  try {
    const s = await stat(path);
    return `${(s.size / 1024).toFixed(1)} KB`;
  } catch {
    return "(missing)";
  }
}

async function main() {
  const sharp = await loadSharp();
  const source = await resolveSource();
  console.log(`[brand-assets] Using source mark: ${source.label}`);

  await mkdir(APP_DIR, { recursive: true });
  await mkdir(PUBLIC_DIR, { recursive: true });

  const results = [];
  results.push(await runAsset("app/icon.png (32x32)", () => makeAppIcon(sharp, source)));
  results.push(await runAsset("app/apple-icon.png (180x180)", () => makeAppleIcon(sharp, source)));
  results.push(await runAsset("public/favicon-32.png (32x32)", () => makeFavicon32(sharp, source)));
  results.push(await runAsset("public/favicon.ico (16/32/48)", () => makeFaviconIco(sharp, source)));
  results.push(await runAsset("public/og.png (1200x630)", () => makeOg(sharp, source)));
  results.push(await runAsset("public/og-square.png (1080x1080)", () => makeOgSquare(sharp, source)));

  // Summary with file sizes.
  console.log("\n[brand-assets] Summary:");
  const files = [
    join(APP_DIR, "icon.png"),
    join(APP_DIR, "apple-icon.png"),
    join(PUBLIC_DIR, "favicon-32.png"),
    join(PUBLIC_DIR, "favicon.ico"),
    join(PUBLIC_DIR, "og.png"),
    join(PUBLIC_DIR, "og-square.png"),
  ];
  for (const f of files) {
    console.log(`  - ${f.replace(ROOT + "/", "")}  ${await reportSize(f)}`);
  }

  const failed = results.filter((r) => !r.ok);
  if (failed.length > 0) {
    console.error(`\n[brand-assets] ${failed.length} asset(s) failed.`);
    process.exit(1);
  }
  console.log("\n[brand-assets] Done.");
  process.exit(0);
}

main().catch((error) => {
  console.error("[brand-assets] Fatal:", error);
  process.exit(1);
});
