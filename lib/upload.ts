import "server-only";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { UPLOAD_DIR, UPLOAD_URL_PREFIX } from "@/lib/upload-dir";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
  ["image/avif", "avif"],
]);

/**
 * Persists uploaded image files to /public/uploads and returns their public URLs.
 * Silently skips entries that are not valid image files.
 */
export async function saveImages(files: File[]): Promise<string[]> {
  await mkdir(UPLOAD_DIR, { recursive: true });
  const urls: string[] = [];

  for (const file of files) {
    if (!file || typeof file.arrayBuffer !== "function") continue;
    if (file.size === 0 || file.size > MAX_BYTES) continue;
    const ext = ALLOWED.get(file.type);
    if (!ext) continue;

    const name = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(UPLOAD_DIR, name), buffer);
    urls.push(`${UPLOAD_URL_PREFIX}/${name}`);
  }

  return urls;
}
