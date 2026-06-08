import { WORKER_BASE_URL } from './constants';
import type {
  MixtapeConfig,
  CreateMixtapePayload,
  CreateMixtapeResponse,
} from './spotify';

/**
 * Creates a new mixtape slot in KV and saves the full config in one step.
 * Worker POST /mixtape/create accepts the full payload.
 */
export async function createMixtape(
  payload: CreateMixtapePayload
): Promise<CreateMixtapeResponse> {
  const res = await fetch(`${WORKER_BASE_URL}/mixtape/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to create mixtape: ${res.status} — ${body}`);
  }
  return res.json() as Promise<CreateMixtapeResponse>;
}

/**
 * Fetch a mixtape config by ID. Used by the Gift View server component.
 */
export async function getMixtape(mixtapeId: string): Promise<MixtapeConfig> {
  const res = await fetch(`${WORKER_BASE_URL}/mixtape/${mixtapeId}`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Mixtape not found: ${res.status}`);
  }
  return res.json() as Promise<MixtapeConfig>;
}

/**
 * Search Spotify via the Worker proxy (avoids exposing credentials client-side).
 */
export async function searchSpotify(query: string): Promise<import('./spotify').SpotifyTrack[]> {
  const res = await fetch(
    `${WORKER_BASE_URL}/mixtape/spotify/search?q=${encodeURIComponent(query)}`
  );
  if (!res.ok) {
    throw new Error(`Spotify search failed: ${res.status}`);
  }
  return res.json() as Promise<import('./spotify').SpotifyTrack[]>;
}
