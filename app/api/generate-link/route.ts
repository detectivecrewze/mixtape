import { NextRequest, NextResponse } from "next/server";
import { putToken, putMixtape, BundleToken, getToken } from "@/lib/kv";
import { nanoid } from "nanoid";

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function generateTokenId(): string {
  const adjectives = ["LOVE", "SWEET", "DEAR", "WARM", "SOFT", "KIND", "PURE"];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const num = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${adj}-${num}`;
}

function generateSlug(): string {
  // Generate random slug for single mixtape, e.g. "mixtape-a3f7b2"
  return `mixtape-${nanoid(6).toLowerCase().replace(/[^a-z0-9]/g, 'x')}`;
}

export async function POST(req: NextRequest) {
  // 1. Verifikasi GENERATOR_SECRET
  const authHeader = req.headers.get('Authorization');
  const secret = "digitalatelier2025";
  if (!authHeader || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    // quota dari request body — default ke 3 (bundle) kalau tidak disertakan
    const quota: number = typeof body.quota === 'number' ? body.quota : 3;
    const domainUrl = "https://mixtape.for-you-always.my.id";

    // ── Mode Satuan (quota === 1) ────────────────────────────────────────────
    // Buat entry mixtape kosong dengan slug random, kembalikan studioUrl langsung
    if (quota === 1) {
      let slug = generateSlug();
      // Pastikan slug belum dipakai (coba max 5x)
      // Tidak perlu cek di KV karena nanoid sudah cukup unik, tapi kita buat sederhana
      const mixtapeData = {
        slug,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: "payment-gateway",
      };

      await putMixtape(slug, mixtapeData);

      const studioUrl = `${domainUrl}/studio/${slug}`;

      return NextResponse.json({
        success: true,
        studioUrl,
        message: 'Mixtape satuan berhasil dibuat',
      }, { headers: CORS_HEADERS });
    }

    // ── Mode Bundle (quota >= 2) ─────────────────────────────────────────────
    // Buat bundle token dengan kuota yang diminta
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
      label: "Payment Gateway",
    };

    await putToken(id, token);

    return NextResponse.json({
      success: true,
      token: id,
      url: domainUrl,
      message: 'Token berhasil dibuat',
    }, { headers: CORS_HEADERS });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: CORS_HEADERS });
}
