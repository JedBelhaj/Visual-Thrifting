import "server-only";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { put } from "@vercel/blob";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
  ["image/avif", "avif"],
]);

const LOCAL_DIR = path.join(process.cwd(), "public", "uploads");

/**
 * Persists uploaded image files and returns their public URLs.
 *
 * When `BLOB_READ_WRITE_TOKEN` is set (Vercel), files go to Vercel Blob and the
 * returned URL is the absolute Blob URL. Otherwise — local dev — they're written
 * to `public/uploads` and served statically at `/uploads/<name>`.
 *
 * Silently skips entries that are not valid image files.
 */
export async function saveImages(files: File[]): Promise<string[]> {
  const useBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
  if (!useBlob) await mkdir(LOCAL_DIR, { recursive: true });

  const urls: string[] = [];

  for (const file of files) {
    if (!file || typeof file.arrayBuffer !== "function") continue;
    if (file.size === 0 || file.size > MAX_BYTES) continue;
    const ext = ALLOWED.get(file.type);
    if (!ext) continue;

    const name = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    if (useBlob) {
      const blob = await put(`uploads/${name}`, buffer, {
        access: "public",
        contentType: file.type,
      });
      urls.push(blob.url);
    } else {
      await writeFile(path.join(LOCAL_DIR, name), buffer);
      urls.push(`/uploads/${name}`);
    }
  }

  return urls;
}
