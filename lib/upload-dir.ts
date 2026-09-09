import path from "path";

/**
 * Where uploaded item photos are written and read from.
 *
 * Locally this is `public/uploads`, which Next serves statically. In a hosted
 * deployment set `UPLOAD_DIR` to a path on a persistent volume (outside
 * `public/`, so the SQLite file living alongside it isn't web-served) — the
 * `/uploads/*` route handler streams the files back from there.
 */
export const UPLOAD_DIR =
  process.env.UPLOAD_DIR ?? path.join(process.cwd(), "public", "uploads");

/** Public URL prefix the stored `ItemImage.url` values use. */
export const UPLOAD_URL_PREFIX = "/uploads";
