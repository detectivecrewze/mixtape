import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { listMixtapes, getMixtape, putMixtape, getToken, putToken } from "@/lib/kv";

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
        token: m.bundleToken ?? null, // expose which token created this
        studioUrl: `/studio/${id}`,
        giftUrl: `/${id}`,
      };
    })
  );

  return NextResponse.json(list.filter(Boolean));
}

// POST /api/mixtapes — create or update a mixtape
// Creating a NEW mixtape requires EITHER an admin session OR a valid bundle token with quota.
// Updating an EXISTING mixtape is allowed for anyone with the studio link.
export async function POST(req: NextRequest) {
  const data = (await req.json()) as Record<string, unknown>;
  const id = data.mixtapeId as string | undefined;
  if (!id) {
    return NextResponse.json({ error: "mixtapeId is required" }, { status: 400 });
  }

  const existing = await getMixtape(id) as Record<string, any> | null;
  const isNew = !existing;

  if (isNew) {
    const tokenId = data.bundleToken as string | undefined;

    // Path 1: Admin session — always allowed, no token needed
    if (await verifySession(req)) {
      // Admin creates freely, no token deduction
      await putMixtape(id, {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return NextResponse.json({ success: true, id });
    }

    // Path 2: Bundle token — must be valid and have remaining quota
    if (!tokenId) {
      return NextResponse.json(
        { error: "Mixtape not found. A valid bundle token is required to create a new mixtape." },
        { status: 403 }
      );
    }

    const token = await getToken(tokenId.toUpperCase());

    if (!token) {
      return NextResponse.json({ error: "Bundle token tidak ditemukan." }, { status: 403 });
    }

    if (token.remainingQuota <= 0) {
      return NextResponse.json(
        { error: "Kuota bundle token sudah habis." },
        { status: 403 }
      );
    }

    // Deduct quota and link mixtapeId to the token
    await putToken(token.id, {
      ...token,
      remainingQuota: token.remainingQuota - 1,
      mixtapes: [...token.mixtapes, id],
    });

    // Save mixtape with token reference
    await putMixtape(id, {
      ...data,
      bundleToken: token.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, id });
  }

  // Existing mixtape — anyone with the link can update (studio autosave)
  await putMixtape(id, {
    ...existing,
    ...data,
    updatedAt: new Date().toISOString(),
  });

  return NextResponse.json({ success: true, id });
}
