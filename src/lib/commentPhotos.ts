import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

// Deliberately NOT under public/ - in this Next.js version, next start
// appears to snapshot the public folder's listing at server start, so
// files written there after boot 404 until the next restart. Storing
// uploads here and serving them through a Route Handler
// (src/app/uploads/comments/[filename]/route.ts) reads from disk on every
// request instead, so a photo is servable immediately after it's saved.
const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads", "comments");
const MAX_BYTES = 8 * 1024 * 1024;

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

// Returns the public URL path to the saved photo, or null if no photo was
// submitted. Throws on an invalid/oversized file so the caller can surface
// a clear error instead of silently dropping the attachment.
export async function saveCommentPhoto(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null;

  const ext = EXT_BY_MIME[file.type];
  if (!ext) {
    throw new Error(`Unsupported photo type: ${file.type || "unknown"}`);
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Photo is too large (max 8MB).");
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `${randomUUID()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), bytes);

  return `/uploads/comments/${filename}`;
}
