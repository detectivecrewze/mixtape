import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/lib/r2";

// POST /api/upload — upload an image (photo)
// Used by the studio photo uploader
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file");
  const mixtapeId = (formData.get("mixtapeId") as string) || "unknown";

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const f = file as File;

  // Validate image type
  if (!f.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
  }

  // 10 MB limit
  if (f.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
  }

  const buffer = Buffer.from(await f.arrayBuffer());
  const ext = f.name.split(".").pop()?.toLowerCase() || "jpg";
  const key = `${mixtapeId}/photos/${Date.now()}.${ext}`;

  try {
    const result = await uploadFile(key, buffer, f.type);
    return NextResponse.json({ success: true, url: result.url });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
