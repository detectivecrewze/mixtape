"use client";

import React from "react";

interface SpotifyEmbedProps {
  trackId: string;
  title?: string;
}

export default function SpotifyEmbed({ trackId, title }: SpotifyEmbedProps) {
  return (
    <div
      className="w-full overflow-hidden rounded-2xl shadow-sm"
      style={{ border: "1px solid rgba(0,0,0,0.06)" }}
    >
      <iframe
        title={title ? `Spotify: ${title}` : "Spotify track"}
        src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`}
        width="100%"
        height="80"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        style={{ border: 0, display: "block" }}
      />
    </div>
  );
}
