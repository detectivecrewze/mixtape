/**
 * lib/kv.ts
 * Dual-mode Key-Value store:
 *   - Production: Cloudflare KV via REST API
 *   - Development: local data/mixtapes.json file
 */

import fs from "fs";
import path from "path";

// ── Cloudflare KV helpers ─────────────────────────────────────────────────────

const BASE = () =>
  `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${process.env.KV_NAMESPACE_ID}`;

const cfHeaders = () => ({
  Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
  "Content-Type": "application/json",
});

export function isKVConfigured(): boolean {
  return !!(
    process.env.CLOUDFLARE_ACCOUNT_ID &&
    process.env.CLOUDFLARE_API_TOKEN &&
    process.env.KV_NAMESPACE_ID
  );
}

async function kvGet(key: string): Promise<unknown> {
  const res = await fetch(`${BASE()}/values/${encodeURIComponent(key)}`, {
    headers: cfHeaders(),
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`KV GET failed: ${res.status}`);
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function kvPut(key: string, value: unknown): Promise<void> {
  const body = typeof value === "string" ? value : JSON.stringify(value);
  const res = await fetch(`${BASE()}/values/${encodeURIComponent(key)}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}` },
    body,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`KV PUT failed: ${res.status}`);
}

async function kvDelete(key: string): Promise<void> {
  const res = await fetch(`${BASE()}/values/${encodeURIComponent(key)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}` },
  });
  if (!res.ok) throw new Error(`KV DELETE failed: ${res.status}`);
}

// ── Local file fallback helpers ───────────────────────────────────────────────

const LOCAL_FILE = () => path.join(process.cwd(), "data", "mixtapes.json");

function readLocal(): Record<string, unknown> {
  const fp = LOCAL_FILE();
  if (!fs.existsSync(fp)) return {};
  try {
    return JSON.parse(fs.readFileSync(fp, "utf-8"));
  } catch {
    return {};
  }
}

function writeLocal(data: Record<string, unknown>): void {
  const fp = LOCAL_FILE();
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.writeFileSync(fp, JSON.stringify(data, null, 2));
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function listMixtapes(): Promise<string[]> {
  if (isKVConfigured()) {
    const index = await kvGet("mixtape:_index");
    return Array.isArray(index) ? (index as string[]) : [];
  }
  const store = readLocal();
  return Object.keys(store);
}

export async function getMixtape(id: string): Promise<unknown> {
  if (isKVConfigured()) {
    return kvGet(`mixtape:${id}`);
  }
  const store = readLocal();
  return store[id] ?? null;
}

export async function putMixtape(id: string, data: unknown): Promise<void> {
  if (isKVConfigured()) {
    await kvPut(`mixtape:${id}`, data);
    const index = await listMixtapes();
    if (!index.includes(id)) {
      await kvPut("mixtape:_index", [...index, id]);
    }
    return;
  }
  const store = readLocal();
  store[id] = data;
  writeLocal(store);
}

export async function deleteMixtape(id: string): Promise<void> {
  if (isKVConfigured()) {
    await kvDelete(`mixtape:${id}`);
    const index = await listMixtapes();
    const newIndex = index.filter((x) => x !== id);
    await kvPut("mixtape:_index", newIndex);
    return;
  }
  const store = readLocal();
  delete store[id];
  writeLocal(store);
}
