import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, createSession, getSessionCookieHeader } from "@/lib/auth";

// POST /api/auth — login with ADMIN_PASSWORD
export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (!verifyPassword(password)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }
  const token = createSession();
  const response = NextResponse.json({ ok: true });
  response.headers.set("Set-Cookie", getSessionCookieHeader(token));
  return response;
}

// DELETE /api/auth — logout
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.headers.set("Set-Cookie", getSessionCookieHeader(null, true));
  return response;
}
