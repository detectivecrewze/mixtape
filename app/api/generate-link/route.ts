import { NextRequest, NextResponse } from "next/server";
import { putToken, BundleToken, getToken } from "@/lib/kv";
import { nanoid } from "nanoid";

function generateTokenId(): string {
  const adjectives = ["LOVE", "SWEET", "DEAR", "WARM", "SOFT", "KIND", "PURE"];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const num = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${adj}-${num}`;
}

export async function POST(req: NextRequest) {
  // 1. Verifikasi GENERATOR_SECRET
  const authHeader = req.headers.get('Authorization');
  const secret = "digitalatelier2025";
  if (!authHeader || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const quota = 3;

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
      label: "Midtrans Purchase",
    };

    await putToken(id, token);

    const domainUrl = "https://mixtape.for-you-always.my.id";

    return NextResponse.json({
      success: true,
      token: id,
      url: domainUrl,
      message: 'Token berhasil dibuat'
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
