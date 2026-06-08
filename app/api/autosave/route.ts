import { NextRequest, NextResponse } from "next/server";
import { putMixtape, getMixtape } from "@/lib/kv";

/**
 * POST /api/autosave?id=<mixtapeId>
 * Kept for backwards compatibility with the studio's autosave logic.
 * Saves the draft/published state directly to KV.
 */
export async function POST(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const data = await req.json();

  const existing = await getMixtape(id) as Record<string, any> | null;

  await putMixtape(id, {
    ...existing,
    ...data,
    mixtapeId: id,
    updatedAt: new Date().toISOString(),
  });

  return NextResponse.json({ success: true, id });
}
