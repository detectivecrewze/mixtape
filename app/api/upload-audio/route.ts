import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/lib/r2";

// POST /api/upload-audio — upload a voice note audio file
// Dual-mode: Cloudflare R2 in production, local public/uploads in development
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file");
  const mixtapeId = (formData.get("mixtapeId") as string) || "unknown";

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const f = file as File;

  // 10 MB limit
  if (f.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
  }

  const buffer = Buffer.from(await f.arrayBuffer());
  const isMp4 = f.type.includes("mp4");
  const ext = isMp4 ? "m4a" : "webm";
  const key = `${mixtapeId}/audio/${Date.now()}.${ext}`;

  try {
    const result = await uploadFile(key, buffer, f.type);
    return NextResponse.json({ success: true, url: result.url });
  } catch (err) {
    console.error("Audio upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
