/**
 * lib/r2.ts
 * Dual-mode file storage:
 *   - Production: Cloudflare R2 via REST API
 *   - Development: local public/uploads/ folder
 */

import fs from "fs";
import path from "path";

const BASE = () =>
  `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/r2/buckets/${process.env.R2_BUCKET_NAME}/objects`;

const authHeader = () => ({
  Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
});

export function isR2Configured(): boolean {
  return !!(
    process.env.CLOUDFLARE_ACCOUNT_ID &&
    process.env.CLOUDFLARE_API_TOKEN &&
    process.env.R2_BUCKET_NAME &&
    process.env.R2_PUBLIC_URL
  );
}

export function getPublicUrl(key: string): string {
  const base = (process.env.R2_PUBLIC_URL || "").replace(/\/$/, "");
  return `${base}/${key}`;
}

export async function uploadFile(
  key: string,
  buffer: Buffer,
  contentType: string
): Promise<{ url: string }> {
  if (isR2Configured()) {
    const res = await fetch(`${BASE()}/${encodeURIComponent(key)}`, {
      method: "PUT",
      headers: {
        ...authHeader(),
        "Content-Type": contentType,
      },
      body: new Uint8Array(buffer),
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`R2 upload failed: ${res.status} ${txt}`);
    }
    return { url: getPublicUrl(key) };
  }

  // Local fallback — save to public/uploads/
  const parts = key.split("/");
  const subdir = parts.length > 1 ? parts.slice(0, -1).join("/") : "";
  const filename = parts[parts.length - 1];
  const uploadDir = path.join(process.cwd(), "public", "uploads", subdir);
  fs.mkdirSync(uploadDir, { recursive: true });
  fs.writeFileSync(path.join(uploadDir, filename), buffer);
  const url = `/uploads/${key}`;
  return { url };
}
