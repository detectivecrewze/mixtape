/**
 * lib/auth.ts
 * Simple password-based session auth for /admin.
 * Password is set via ADMIN_PASSWORD env var.
 * Session token is a base64 hash of the password — stateless, resets on password change.
 */

const COOKIE_NAME = "admin_session";

function getStaticToken(): string {
  const pwd = process.env.ADMIN_PASSWORD || "";
  if (typeof Buffer !== "undefined") {
    return Buffer.from(`admin:${pwd}`).toString("base64");
  }
  return typeof btoa !== "undefined" ? btoa(`admin:${pwd}`) : "invalid";
}

export function verifyPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return password === expected;
}

export function createSession(): string {
  return getStaticToken();
}

export function getSessionCookieHeader(token: string | null, clear = false): string {
  if (clear) {
    return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
  }
  // 7 days
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`;
}

/** Use in API routes — reads from request cookie header */
export async function verifySession(request: Request): Promise<boolean> {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`)
  );
  const token = match ? match[1] : null;
  if (!token) return false;
  return token === getStaticToken();
}

export { COOKIE_NAME };
