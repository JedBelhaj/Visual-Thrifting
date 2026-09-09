import { readFile, stat } from "fs/promises";
import path from "path";
import { UPLOAD_DIR } from "@/lib/upload-dir";

/**
 * Serves uploaded item photos from `UPLOAD_DIR`.
 *
 * Locally the files sit in `public/uploads` and Next's static handler answers
 * `/uploads/*` before this route is ever reached — it's dormant. In a hosted
 * deployment `UPLOAD_DIR` points at a persistent volume outside `public/`, and
 * this handler streams them back.
 */

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;

  // Resolve within UPLOAD_DIR and reject anything that escapes it.
  const resolved = path.resolve(UPLOAD_DIR, ...segments);
  const root = path.resolve(UPLOAD_DIR);
  if (resolved !== root && !resolved.startsWith(root + path.sep)) {
    return new Response("Not found", { status: 404 });
  }

  const ext = path.extname(resolved).toLowerCase();
  const contentType = CONTENT_TYPES[ext];
  if (!contentType) return new Response("Not found", { status: 404 });

  try {
    const info = await stat(resolved);
    if (!info.isFile()) return new Response("Not found", { status: 404 });
    const file = await readFile(resolved);
    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(info.size),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
