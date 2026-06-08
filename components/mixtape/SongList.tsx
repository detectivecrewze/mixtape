"use client";

import React from "react";
import type { SpotifyTrack } from "@/lib/spotify";

interface SongListProps {
  songs: SpotifyTrack[];
  onRemove: (trackId: string) => void;
}

export default function SongList({ songs, onRemove }: SongListProps) {
  if (songs.length === 0) return null;

  return (
    <ul className="flex flex-col gap-2 mt-4">
      {songs.map((song, idx) => (
        <li
          key={song.trackId}
          className="flex items-center gap-3 p-3 rounded-xl bg-white border border-black/8 shadow-sm group"
        >
          {/* Track number */}
          <span
            className="text-xs font-bold text-black/30 w-5 text-right shrink-0"
            style={{ fontFamily: "var(--font-space-mono)" }}
          >
            {idx + 1}
          </span>

          {/* Album art */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={song.albumArt}
            alt={`${song.title} album art`}
            width={40}
            height={40}
            className="rounded-md object-cover shrink-0"
            style={{ width: 40, height: 40 }}
          />

          {/* Title + artist */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate leading-tight">{song.title}</p>
            <p className="text-xs text-black/50 truncate mt-0.5">{song.artist}</p>
          </div>

          {/* Spotify badge */}
          <span className="shrink-0 hidden sm:flex items-center gap-1 text-[10px] font-bold text-[#1DB954] bg-[#1DB954]/10 rounded-full px-2 py-0.5">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="#1DB954">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
            Spotify
          </span>

          {/* Remove button */}
          <button
            type="button"
            onClick={() => onRemove(song.trackId)}
            aria-label={`Remove ${song.title}`}
            className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all bg-black/5 hover:bg-red-100 hover:text-red-500 text-black/30 group-hover:text-black/50"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </li>
      ))}
    </ul>
  );
}
