import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { getToken, putToken, listTokens, deleteToken, BundleToken } from "@/lib/kv";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function generateTokenId(): string {
  const adjectives = ["LOVE", "SWEET", "DEAR", "WARM", "SOFT", "KIND", "PURE"];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const num = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${adj}-${num}`;
}

// GET /api/tokens?id=LOVE-1234 — Validate a single token (public, for customers)
// GET /api/tokens — List all tokens (admin only)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  // Public: validate a single token by ID
  if (id) {
    const token = await getToken(id.toUpperCase());
    if (!token) {
      return NextResponse.json({ error: "Token tidak ditemukan." }, { status: 404 });
    }
    // Return safe subset (no need to expose everything)
    return NextResponse.json({
      id: token.id,
      remainingQuota: token.remainingQuota,
      totalQuota: token.totalQuota,
      mixtapes: token.mixtapes,
    });
  }

  // Admin: list all tokens
  if (!(await verifySession(req))) return unauthorized();

  const ids = await listTokens();
  const tokens = await Promise.all(
    ids.map(async (tid) => {
      const t = await getToken(tid);
      return t;
    })
  );

  return NextResponse.json(tokens.filter(Boolean).sort(
    (a, b) => new Date(b!.createdAt).getTime() - new Date(a!.createdAt).getTime()
  ));
}

// POST /api/tokens — Create a new token (admin only)
export async function POST(req: NextRequest) {
  if (!(await verifySession(req))) return unauthorized();

  const body = await req.json().catch(() => ({}));
  const quota = typeof body.quota === "number" ? body.quota : 3;
  const label = typeof body.label === "string" ? body.label.trim() : undefined;

  // Generate unique token ID
  let id = generateTokenId();
  let attempts = 0;
  while ((await getToken(id)) !== null && attempts < 10) {
    id = generateTokenId();
    attempts++;
  }

  const token: BundleToken = {
    id,
    remainingQuota: quota,
    totalQuota: quota,
    mixtapes: [],
    createdAt: new Date().toISOString(),
    ...(label ? { label } : {}),
  };

  await putToken(id, token);

  return NextResponse.json(token, { status: 201 });
}

// DELETE /api/tokens?id=LOVE-1234 — Delete a token (admin only)
export async function DELETE(req: NextRequest) {
  if (!(await verifySession(req))) return unauthorized();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await deleteToken(id);
  await deleteToken(id.toUpperCase());
  return NextResponse.json({ success: true });
}
