import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/admin-auth";
import { uploadToR2, deleteFromR2 } from "@/lib/r2-upload";

// Max file size: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml", "image/avif",
];

const ALLOWED_VIDEO_TYPES = [
  "video/mp4", "video/webm", "video/ogg", "video/quicktime",
];

const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

// POST: upload a file to R2
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Check R2 credentials are configured
    if (!process.env.R2_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID === "YOUR_ACCESS_KEY_ID" ||
        !process.env.R2_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY === "YOUR_SECRET_ACCESS_KEY") {
      return NextResponse.json(
        { error: "R2 credentials not configured. Add R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY to .env.local" },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "uploads";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large. Max 50MB." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `File type not allowed: ${file.type}. Allowed: images and videos.` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadToR2(buffer, file.name, file.type, folder);

    return NextResponse.json({
      success: true,
      file: {
        url: result.url,
        key: result.key,
        name: file.name,
        size: result.size,
        contentType: result.contentType,
        isVideo: ALLOWED_VIDEO_TYPES.includes(file.type),
        uploadedBy: session.email,
        uploadedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed. Check R2 credentials." }, { status: 500 });
  }
}

// DELETE: remove a file from R2
export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const key = url.searchParams.get("key");
  if (!key) return NextResponse.json({ error: "key required" }, { status: 400 });

  try {
    await deleteFromR2(key);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete error:", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
