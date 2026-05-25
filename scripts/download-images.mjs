#!/usr/bin/env node
// Download all OHMS product images from the source CDN so the store can
// self-host them. ESM, zero external deps (built-in fetch / fs / path).
//
// Usage:
//   node scripts/download-images.mjs                 # full galleries, card+full
//   node scripts/download-images.mjs --main-only     # first image per product
//   node scripts/download-images.mjs --sizes=card    # one size only
//   node scripts/download-images.mjs --limit=10      # first 10 products (test)
//   node scripts/download-images.mjs --concurrency=4 # tune the worker pool
//   node scripts/download-images.mjs --delay=25      # ms pause between requests
//
// Resumable: files already on disk are skipped. A failed image logs a warning
// and the run continues. Exit 0 on completion; non-zero only on fatal setup
// errors (e.g. missing data/products.json).

import { readFile, writeFile, mkdir, access, stat } from "node:fs/promises";
import { constants as FS } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PRODUCTS_JSON = path.join(ROOT, "data", "products.json");
const OUT_DIR = path.join(ROOT, "public", "products");
const MANIFEST_PATH = path.join(OUT_DIR, "manifest.json");

const CDN_BASE = "https://cdn.fcglcdn.com/brainbees/images/products";

// Mirrors lib/utils.ts SIZE_PATH so downloaded paths line up with the app.
const SIZE_PATH = {
  thumb: "219x265",
  card: "360x435",
  full: "600x800",
};

const DEFAULT_SIZES = ["card", "full"];
const DEFAULT_CONCURRENCY = 8;
const PROGRESS_EVERY = 50;
const REQUEST_TIMEOUT_MS = 30_000;

/** Narrow an unknown error to a readable message. */
function errorMessage(error) {
  if (error instanceof Error) return error.message;
  return String(error);
}

/** Parse `--key=value` and bare `--flag` argv into a typed options object. */
function parseArgs(argv) {
  const flags = new Set();
  const values = new Map();
  for (const arg of argv) {
    if (!arg.startsWith("--")) continue;
    const body = arg.slice(2);
    const eq = body.indexOf("=");
    if (eq === -1) {
      flags.add(body);
    } else {
      values.set(body.slice(0, eq), body.slice(eq + 1));
    }
  }

  const mainOnly = flags.has("main-only");

  const sizesRaw = values.get("sizes");
  const sizes = sizesRaw
    ? sizesRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : DEFAULT_SIZES;
  const invalidSize = sizes.find((s) => !(s in SIZE_PATH));
  if (invalidSize) {
    throw new Error(
      `Unknown size "${invalidSize}". Valid sizes: ${Object.keys(SIZE_PATH).join(", ")}`,
    );
  }

  const concurrency = toPositiveInt(
    values.get("concurrency"),
    DEFAULT_CONCURRENCY,
  );
  const limit = values.has("limit")
    ? toPositiveInt(values.get("limit"), 0)
    : undefined;
  const delayMs = values.has("delay")
    ? Math.max(0, Number(values.get("delay")) || 0)
    : 0;

  return { mainOnly, sizes, concurrency, limit, delayMs };
}

function toPositiveInt(raw, fallback) {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.floor(n);
}

/** Swap a filename's extension (e.g. "a.jpg" -> "a.webp"). */
function withExtension(filename, ext) {
  const base = filename.slice(0, -path.extname(filename).length);
  return `${base}.${ext}`;
}

async function fileExists(filePath) {
  try {
    await access(filePath, FS.F_OK);
    return true;
  } catch {
    return false;
  }
}

/** Fetch a URL and return its bytes, or null on a non-200 / network error. */
async function fetchBytes(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength === 0) return null;
    return buf;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Build the list of download jobs from the product catalogue.
 * Each job: { productId, size, filename, localPath }.
 * `filename` keeps the original .jpg name; webp preference happens per-attempt.
 */
function buildJobs(products, { sizes, mainOnly, limit }) {
  const selected =
    typeof limit === "number" ? products.slice(0, limit) : products;
  const jobs = [];
  for (const product of selected) {
    const id = String(product.id ?? "").trim();
    const images = Array.isArray(product.images) ? product.images : [];
    if (!id || images.length === 0) continue;
    const files = mainOnly ? images.slice(0, 1) : images;
    for (const size of sizes) {
      for (const filename of files) {
        const base = filename.slice(0, -path.extname(filename).length);
        jobs.push({
          productId: id,
          size,
          filename,
          base,
          dir: path.join(OUT_DIR, id),
        });
      }
    }
  }
  return jobs;
}

/**
 * Download one job, preferring .webp and falling back to the original .jpg.
 * Resumable: returns "skipped" without a network call if a local file exists.
 * Returns { status, localPath } where status is downloaded | skipped | failed.
 */
async function processJob(job, manifest, delayMs) {
  const sizePath = SIZE_PATH[job.size];
  // Resume check: any extension already present counts as done.
  const webpLocal = path.join(job.dir, `${job.base}-${job.size}.webp`);
  const jpgLocal = path.join(job.dir, `${job.base}-${job.size}.jpg`);
  for (const existing of [webpLocal, jpgLocal]) {
    if (await fileExists(existing)) {
      recordManifest(manifest, job, existing);
      return { status: "skipped", localPath: existing };
    }
  }

  const attempts = [
    { url: `${CDN_BASE}/${sizePath}/${withExtension(job.filename, "webp")}`, ext: "webp" },
    { url: `${CDN_BASE}/${sizePath}/${job.filename}`, ext: path.extname(job.filename).slice(1) || "jpg" },
  ];

  for (const attempt of attempts) {
    if (delayMs) await sleep(delayMs);
    const bytes = await fetchBytes(attempt.url);
    if (!bytes) continue;
    const localPath = path.join(job.dir, `${job.base}-${job.size}.${attempt.ext}`);
    try {
      await mkdir(job.dir, { recursive: true });
      await writeFile(localPath, bytes);
      recordManifest(manifest, job, localPath);
      return { status: "downloaded", localPath };
    } catch (error) {
      console.warn(
        `  ! write failed for ${job.productId}/${job.base}-${job.size}: ${errorMessage(error)}`,
      );
      return { status: "failed", localPath: null };
    }
  }

  console.warn(
    `  ! no source found for ${job.productId}/${job.filename} (${job.size}) — tried webp + ${path.extname(job.filename)}`,
  );
  return { status: "failed", localPath: null };
}

/** Record a localized path in the manifest as a repo-relative public URL. */
function recordManifest(manifest, job, localPath) {
  const rel = "/" + path.relative(path.join(ROOT, "public"), localPath).split(path.sep).join("/");
  const product = (manifest[job.productId] ??= {});
  const list = (product[job.size] ??= []);
  if (!list.includes(rel)) list.push(rel);
}

/**
 * Run jobs through a fixed-size promise pool. Returns counters.
 */
async function runPool(jobs, concurrency, manifest, delayMs) {
  const totals = { downloaded: 0, skipped: 0, failed: 0 };
  let nextIndex = 0;
  let processed = 0;

  async function worker() {
    while (true) {
      const index = nextIndex++;
      if (index >= jobs.length) return;
      const job = jobs[index];
      let result;
      try {
        result = await processJob(job, manifest, delayMs);
      } catch (error) {
        console.warn(
          `  ! unexpected error on ${job.productId}/${job.filename}: ${errorMessage(error)}`,
        );
        result = { status: "failed", localPath: null };
      }
      totals[result.status] += 1;
      processed += 1;
      if (processed % PROGRESS_EVERY === 0) {
        console.log(
          `  … ${processed}/${jobs.length} ` +
            `(downloaded ${totals.downloaded}, skipped ${totals.skipped}, failed ${totals.failed})`,
        );
      }
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, jobs.length || 1) },
    () => worker(),
  );
  await Promise.all(workers);
  return totals;
}

/** Load and lightly validate the product catalogue. Throws on fatal issues. */
async function loadProducts() {
  let raw;
  try {
    raw = await readFile(PRODUCTS_JSON, "utf8");
  } catch (error) {
    throw new Error(
      `Cannot read ${PRODUCTS_JSON}: ${errorMessage(error)}`,
    );
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error(
      `Invalid JSON in ${PRODUCTS_JSON}: ${errorMessage(error)}`,
    );
  }
  if (!Array.isArray(parsed)) {
    throw new Error(`Expected ${PRODUCTS_JSON} to be an array of products.`);
  }
  return parsed;
}

/** Merge into any existing manifest so repeated runs accumulate, not clobber. */
async function loadExistingManifest() {
  try {
    await stat(MANIFEST_PATH);
    const raw = await readFile(MANIFEST_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const products = await loadProducts();

  const jobs = buildJobs(products, options);
  if (jobs.length === 0) {
    console.log("Nothing to download (no matching products/images).");
    return;
  }

  console.log(
    `OHMS image download → ${OUT_DIR}\n` +
      `  products: ${products.length}` +
      (options.limit ? ` (limited to first ${options.limit})` : "") +
      `\n  sizes: ${options.sizes.join(", ")}` +
      (options.mainOnly ? " · main image only" : "") +
      `\n  jobs: ${jobs.length} · concurrency: ${options.concurrency}` +
      (options.delayMs ? ` · delay: ${options.delayMs}ms` : "") +
      `\n  preferring .webp, falling back to original extension\n`,
  );

  await mkdir(OUT_DIR, { recursive: true });
  const manifest = await loadExistingManifest();

  const start = Date.now();
  const totals = await runPool(
    jobs,
    options.concurrency,
    manifest,
    options.delayMs,
  );

  try {
    await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");
  } catch (error) {
    console.warn(`! failed to write manifest: ${errorMessage(error)}`);
  }

  const seconds = ((Date.now() - start) / 1000).toFixed(1);
  console.log(
    `\nDone in ${seconds}s — ` +
      `downloaded ${totals.downloaded}, skipped ${totals.skipped}, failed ${totals.failed}.\n` +
      `Manifest: ${MANIFEST_PATH}`,
  );
  if (totals.failed > 0) {
    console.log(
      `Note: ${totals.failed} image(s) failed. Re-run the same command to retry — existing files are skipped.`,
    );
  }
}

main().catch((error) => {
  // Fatal setup errors only (missing/invalid products.json, bad flags).
  console.error(`Fatal: ${errorMessage(error)}`);
  process.exit(1);
});
