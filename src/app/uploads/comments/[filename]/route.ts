import { readFile } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads", "comments");

const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

// Filenames are always randomUUID().ext, generated server-side in
// saveCommentPhoto - reject anything else to rule out path traversal.
const SAFE_FILENAME = /^[a-f0-9-]+\.(jpg|png|webp|gif)$/i;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  if (!SAFE_FILENAME.test(filename)) {
    return new Response("Not found", { status: 404 });
  }

  const ext = filename.split(".").pop()!.toLowerCase();
  try {
    const data = await readFile(path.join(UPLOAD_DIR, filename));
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": MIME_BY_EXT[ext],
        // Filenames are content-addressed (random, never reused/overwritten).
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
