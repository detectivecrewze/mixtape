import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { listMixtapes, getMixtape, putMixtape } from "@/lib/kv";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

// GET /api/mixtapes — list all mixtapes (admin only)
export async function GET(req: NextRequest) {
  if (!(await verifySession(req))) return unauthorized();

  const ids = await listMixtapes();
  const list = await Promise.all(
    ids.map(async (id) => {
      const m = (await getMixtape(id)) as Record<string, unknown> | null;
      if (!m) return null;
      return {
        id,
        color: m.color,
        status: m.status,
        createdAt: m.createdAt,
        publishedAt: m.publishedAt,
        studioUrl: `/studio/${id}`,
        giftUrl: `/${id}`,
      };
    })
  );

  return NextResponse.json(list.filter(Boolean));
}

// POST /api/mixtapes — create or update a mixtape
// Creating a NEW mixtape requires admin session.
// Updating an EXISTING mixtape is allowed for anyone with the studio link.
export async function POST(req: NextRequest) {
  const data = (await req.json()) as Record<string, unknown>;
  const id = data.mixtapeId as string | undefined;
  if (!id) {
    return NextResponse.json({ error: "mixtapeId is required" }, { status: 400 });
  }

  const existing = await getMixtape(id) as Record<string, any> | null;

  // If mixtape doesn't exist yet, only admin can create it
  if (!existing) {
    if (!(await verifySession(req))) {
      return NextResponse.json(
        { error: "Mixtape not found. Only admin can create new mixtapes." },
        { status: 403 }
      );
    }
  }

  await putMixtape(id, {
    ...existing,
    ...data,
    updatedAt: new Date().toISOString(),
  });

  return NextResponse.json({ success: true, id });
}
