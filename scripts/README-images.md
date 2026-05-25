# Product image downloader

`download-images.mjs` pulls every product image from the source CDN
(`cdn.fcglcdn.com`) into `public/products/`, so the store can self-host its
catalogue images instead of depending on the upstream CDN.

It reads `data/products.json` (900 products, ~7,850 image filenames) and, for
each filename, downloads the requested sizes. It prefers the smaller `.webp`
variant and falls back to the original `.jpg` if the webp 404s.

## Quick start

Fast first pass — main image only (one size, `card`), ~900 files:

```bash
node scripts/download-images.mjs --main-only --sizes=card
```

Main image at both card + full sizes (~1,800 files):

```bash
node scripts/download-images.mjs --main-only
```

Full galleries, both sizes (~15,700 files — every image × card + full):

```bash
node scripts/download-images.mjs
```

The run is **resumable**: files already on disk are skipped, so you can stop
and re-run the same command at any time. Failed images log a warning and the
run continues; re-running retries only the missing files.

## Flags

| Flag | Default | Description |
| --- | --- | --- |
| `--sizes=card,full` | `card,full` | Comma-separated sizes: `thumb` (219×265), `card` (360×435), `full` (600×800). |
| `--main-only` | off | Download only the first image of each product. |
| `--concurrency=8` | `8` | Size of the download worker pool. |
| `--limit=N` | all | Process only the first `N` products (for testing). |
| `--delay=25` | `0` | Optional pause (ms) before each request, to be polite to the CDN. |

Examples:

```bash
# Test on 5 products, full galleries
node scripts/download-images.mjs --limit=5

# Gentle full run
node scripts/download-images.mjs --concurrency=4 --delay=25
```

## Output layout

Images are written **per product**:

```
public/products/<productId>/<basename>-<size>.<ext>
# e.g. public/products/20536575/20536575a-card.webp
#      public/products/20536575/20536575a-full.webp
```

A manifest is written to `public/products/manifest.json`, mapping each product
to the localized public paths it now has:

```json
{
  "20536575": {
    "card": ["/products/20536575/20536575a-card.webp", "..."],
    "full": ["/products/20536575/20536575a-full.webp", "..."]
  }
}
```

The manifest accumulates across runs (a `--main-only` pass followed by a full
pass merges, rather than clobbering).

## Serving the downloaded images

This is the important caveat. The app's `productImage()` helper in
`lib/utils.ts` builds URLs as:

```
<NEXT_PUBLIC_IMAGE_BASE>/<size-path>/<filename>
# size-path is one of 219x265 | 360x435 | 600x800
# default base is the source CDN
```

That is a **flat `<base>/<size>/<filename>` layout**. The downloader writes a
**per-product folder layout** with the size baked into the filename. The two do
**not** line up, so you cannot simply point `NEXT_PUBLIC_IMAGE_BASE` at
`/products` and have it work.

Recommended paths:

- **Production (recommended):** upload the contents of `public/products` to a
  bucket/CDN that exposes the flat `<size>/<filename>` layout the app expects
  (e.g. Supabase Storage, an S3/R2 bucket, or a CDN), then set
  `NEXT_PUBLIC_IMAGE_BASE` to that origin. Reshaping the per-product folders
  into `<size>/<filename>` (or adjusting `productImage()`) is part of that
  migration.
- **For now:** leave `NEXT_PUBLIC_IMAGE_BASE` unset. The app keeps using the
  source CDN by default and renders immediately. The local download exists so
  you have a self-hosted copy ready to migrate when you choose to.
