export interface SpotifyTrack {
  trackId: string;
  title: string;
  artist: string;
  albumArt: string;
  spotifyUrl: string;
}

export interface MixtapeConfig {
  mixtapeId: string;
  color: string;         // hex string
  stickers: string[];    // array of StickerTypeId
  songs: SpotifyTrack[];
  note: string;
  ownerId: string;
  createdAt: string;     // ISO string
}

export interface CreateMixtapePayload {
  color: string;
  stickers: string[];
  songs: SpotifyTrack[];
  note: string;
  ownerId: string;
}

export interface CreateMixtapeResponse {
  mixtapeId: string;
  studioUrl: string;
  giftUrl: string;
}
