/**
 * Mixtape Worker — mixtape.for-you-always.my.id
 *
 * Routes:
 *   POST /mixtape/create
 *   GET  /mixtape/:mixtapeId
 *   GET  /mixtape/spotify/search?q=
 *   POST /mixtape/upload          (placeholder)
 */

import { nanoid } from "nanoid";

/* ─── Env bindings ───────────────────────────────────────────────────────── */

export interface Env {
  MIXTAPE_KV: KVNamespace;
  SPOTIFY_CLIENT_ID: string;
  SPOTIFY_CLIENT_SECRET: string;
  APP_URL: string;
}

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface SpotifyTrack {
  trackId: string;
  title: string;
  artist: string;
  albumArt: string;
  spotifyUrl: string;
}

interface MixtapeConfig {
  mixtapeId: string;
  color: string;
  stickers: string[];
  songs: SpotifyTrack[];
  note: string;
  ownerId: string;
  createdAt: string;
}

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface SpotifySearchResponse {
  tracks: {
    items: Array<{
      id: string;
      name: string;
      artists: Array<{ name: string }>;
      album: {
        images: Array<{ url: string; width: number; height: number }>;
      };
      external_urls: { spotify: string };
    }>;
  };
}

/* ─── CORS headers ───────────────────────────────────────────────────────── */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function corsHeaders(extra?: Record<string, string>): Headers {
  const h = new Headers({ ...CORS, ...extra });
  return h;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders({ "Content-Type": "application/json" }),
  });
}

function error(message: string, status = 400): Response {
  return json({ error: message }, status);
}

/* ─── Spotify helpers ────────────────────────────────────────────────────── */

const SPOTIFY_TOKEN_KEY = "spotify:access_token";

async function getSpotifyToken(env: Env): Promise<string> {
  // Check cached token
  const cached = await env.MIXTAPE_KV.get(SPOTIFY_TOKEN_KEY);
  if (cached) return cached;

  // Fetch new token
  const credentials = btoa(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`);
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Spotify token error ${res.status}: ${body}`);
  }

  const data = (await res.json()) as SpotifyTokenResponse;

  // Cache token with TTL slightly shorter than actual expiry
  await env.MIXTAPE_KV.put(SPOTIFY_TOKEN_KEY, data.access_token, {
    expirationTtl: data.expires_in - 60, // 1 min buffer
  });

  return data.access_token;
}

async function searchSpotify(
  query: string,
  env: Env
): Promise<SpotifyTrack[]> {
  const token = await getSpotifyToken(env);

  const url = new URL("https://api.spotify.com/v1/search");
  url.searchParams.set("q", query);
  url.searchParams.set("type", "track");
  url.searchParams.set("limit", "8");
  url.searchParams.set("market", "ID");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Spotify search error ${res.status}: ${body}`);
  }

  const data = (await res.json()) as SpotifySearchResponse;

  return data.tracks.items.map((item) => ({
    trackId: item.id,
    title: item.name,
    artist: item.artists.map((a) => a.name).join(", "),
    albumArt:
      item.album.images.find((img) => img.width <= 300)?.url ??
      item.album.images[0]?.url ??
      "",
    spotifyUrl: item.external_urls.spotify,
  }));
}

/* ─── Route handlers ─────────────────────────────────────────────────────── */

/** POST /mixtape/create */
async function handleCreate(req: Request, env: Env): Promise<Response> {
  let body: Partial<MixtapeConfig>;
  try {
    body = (await req.json()) as Partial<MixtapeConfig>;
  } catch {
    return error("Invalid JSON body");
  }

  const { color, stickers, songs, note, ownerId } = body;

  if (!color) return error("color is required");

  const mixtapeId = nanoid(8);
  const config: MixtapeConfig = {
    mixtapeId,
    color: color ?? "#1a1a1a",
    stickers: stickers ?? [],
    songs: songs ?? [],
    note: note ?? "",
    ownerId: ownerId ?? "owner",
    createdAt: new Date().toISOString(),
  };

  await env.MIXTAPE_KV.put(`mixtape:${mixtapeId}`, JSON.stringify(config), {
    expirationTtl: 60 * 60 * 24 * 365, // 1 year
  });

  const appUrl = env.APP_URL ?? "https://mixtape.for-you-always.my.id";

  return json({
    mixtapeId,
    studioUrl: `${appUrl}/studio/${mixtapeId}`,
    giftUrl: `${appUrl}/${mixtapeId}`,
  });
}

/** GET /mixtape/:mixtapeId — also handles PATCH/update from studio */
async function handleGet(mixtapeId: string, env: Env): Promise<Response> {
  const raw = await env.MIXTAPE_KV.get(`mixtape:${mixtapeId}`);
  if (!raw) return error("Mixtape not found", 404);
  return json(JSON.parse(raw));
}

/** PUT /mixtape/:mixtapeId — update config after studio wizard completes */
async function handleUpdate(
  mixtapeId: string,
  req: Request,
  env: Env
): Promise<Response> {
  const existing = await env.MIXTAPE_KV.get(`mixtape:${mixtapeId}`);
  if (!existing) return error("Mixtape not found", 404);

  let updates: Partial<MixtapeConfig>;
  try {
    updates = (await req.json()) as Partial<MixtapeConfig>;
  } catch {
    return error("Invalid JSON body");
  }

  const current = JSON.parse(existing) as MixtapeConfig;
  const merged: MixtapeConfig = {
    ...current,
    color: updates.color ?? current.color,
    stickers: updates.stickers ?? current.stickers,
    songs: updates.songs ?? current.songs,
    note: updates.note ?? current.note,
  };

  await env.MIXTAPE_KV.put(`mixtape:${mixtapeId}`, JSON.stringify(merged), {
    expirationTtl: 60 * 60 * 24 * 365,
  });

  const appUrl = env.APP_URL ?? "https://mixtape.for-you-always.my.id";
  return json({
    mixtapeId,
    studioUrl: `${appUrl}/studio/${mixtapeId}`,
    giftUrl: `${appUrl}/${mixtapeId}`,
  });
}

/** GET /mixtape/spotify/search?q= */
async function handleSpotifySearch(
  url: URL,
  env: Env
): Promise<Response> {
  const q = url.searchParams.get("q");
  if (!q || q.trim().length < 2) {
    return json([]);
  }

  try {
    const tracks = await searchSpotify(q.trim(), env);
    return json(tracks);
  } catch (e) {
    console.error("Spotify search failed:", e);
    return error("Spotify search failed. Please try again.", 502);
  }
}

/** POST /mixtape/upload — placeholder for future R2 upload */
async function handleUpload(): Promise<Response> {
  return json({
    message: "Upload endpoint not yet implemented. Coming soon.",
    status: "placeholder",
  });
}

/* ─── Main fetch handler ─────────────────────────────────────────────────── */

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const method = req.method.toUpperCase();

    // Handle CORS preflight
    if (method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    const path = url.pathname; // e.g. /mixtape/create

    // POST /mixtape/create
    if (method === "POST" && path === "/mixtape/create") {
      return handleCreate(req, env);
    }

    // POST /mixtape/upload
    if (method === "POST" && path === "/mixtape/upload") {
      return handleUpload();
    }

    // GET /mixtape/spotify/search
    if (method === "GET" && path === "/mixtape/spotify/search") {
      return handleSpotifySearch(url, env);
    }

    // GET /mixtape/:id
    const getMatch = path.match(/^\/mixtape\/([A-Za-z0-9_-]{6,12})$/);
    if (method === "GET" && getMatch) {
      return handleGet(getMatch[1], env);
    }

    // PUT /mixtape/:id  (studio saves full config)
    const putMatch = path.match(/^\/mixtape\/([A-Za-z0-9_-]{6,12})$/);
    if (method === "PUT" && putMatch) {
      return handleUpdate(putMatch[1], req, env);
    }

    // 404 fallback
    return error("Not found", 404);
  },
} satisfies ExportedHandler<Env>;
