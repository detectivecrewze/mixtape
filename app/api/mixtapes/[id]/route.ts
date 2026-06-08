import { NextRequest, NextResponse } from "next/server";
import { getMixtape, deleteMixtape, putMixtape } from "@/lib/kv";
import { verifySession } from "@/lib/auth";

interface Params {
  params: Promise<{ id: string }>;
}

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

// GET /api/mixtapes/[id] — fetch single mixtape config (public)
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const data = await getMixtape(id);
  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(data);
}

// PUT /api/mixtapes/[id] — update metadata like renaming slug (admin only)
export async function PUT(req: NextRequest, { params }: Params) {
  if (!(await verifySession(req))) return unauthorized();

  const { id } = await params;
  const data = await req.json();

  const existing = await getMixtape(id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Handle renaming slug
  if (data.newId && data.newId !== id) {
    const checkExists = await getMixtape(data.newId);
    if (checkExists) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
    }
    // Duplicate data to new slug
    await putMixtape(data.newId, { ...(existing as object), ...data, newId: undefined, mixtapeId: data.newId });
    // Delete old slug
    await deleteMixtape(id);
    return NextResponse.json({ success: true, id: data.newId });
  }

  // Normal update
  await putMixtape(id, { ...(existing as object), ...data });
  return NextResponse.json({ success: true, id });
}

// DELETE /api/mixtapes/[id] — delete mixtape (admin only)
export async function DELETE(req: NextRequest, { params }: Params) {
  if (!(await verifySession(req))) return unauthorized();

  const { id } = await params;
  await deleteMixtape(id);
  return NextResponse.json({ success: true });
}
