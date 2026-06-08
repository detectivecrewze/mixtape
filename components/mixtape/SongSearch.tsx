"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { searchSpotify } from "@/lib/mixtape";
import type { SpotifyTrack } from "@/lib/spotify";
import { MAX_SONGS } from "@/lib/constants";

interface SongSearchProps {
  selectedSongs: SpotifyTrack[];
  onAdd: (track: SpotifyTrack) => void;
}

export default function SongSearch({ selectedSongs, onAdd }: SongSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SpotifyTrack[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxReached = selectedSongs.length >= MAX_SONGS;
  const selectedIds = new Set(selectedSongs.map((s) => s.trackId));

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    setIsSearching(true);
    setError(null);
    try {
      const data = await searchSpotify(q);
      setResults(data);
      setIsOpen(true);
    } catch {
      setError("Search failed. Please try again.");
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, doSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleAdd(track: SpotifyTrack) {
    onAdd(track);
    setQuery("");
    setResults([]);
    setIsOpen(false);
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search input */}
      <div
        className={`flex items-center gap-2 px-4 py-3 rounded-2xl border-2 bg-white transition-all ${
          maxReached ? "opacity-50 pointer-events-none" : "border-black/15 focus-within:border-black"
        }`}
      >
        {/* Search icon */}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-black/40 shrink-0">
          <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={maxReached ? "Maximum 4 songs reached" : "Search songs..."}
          disabled={maxReached}
          className="flex-1 text-sm bg-transparent outline-none placeholder:text-black/30"
          style={{ fontFamily: "var(--font-inter)" }}
          aria-label="Search songs on Spotify"
          id="song-search-input"
        />

        {/* Loading spinner */}
        {isSearching && (
          <svg className="animate-spin w-4 h-4 text-black/30 shrink-0" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        )}

        {/* Clear button */}
        {query && !isSearching && (
          <button
            type="button"
            onClick={() => { setQuery(""); setResults([]); setIsOpen(false); }}
            className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20 transition-colors shrink-0"
            aria-label="Clear search"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="mt-1 text-xs text-red-500 px-1">{error}</p>
      )}

      {/* Dropdown */}
      {isOpen && results.length > 0 && (
        <div
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-black/8 overflow-hidden z-50"
          style={{ maxHeight: 320, overflowY: "auto" }}
        >
          {results.map((track) => {
            const alreadyAdded = selectedIds.has(track.trackId);
            return (
              <div
                key={track.trackId}
                className="flex items-center gap-3 px-4 py-3 hover:bg-black/3 transition-colors border-b border-black/5 last:border-0"
              >
                {/* Album art */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={track.albumArt}
                  alt={`${track.title} album`}
                  width={40}
                  height={40}
                  className="rounded-md object-cover shrink-0"
                  style={{ width: 40, height: 40 }}
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{track.title}</p>
                  <p className="text-xs text-black/50 truncate">{track.artist}</p>
                </div>

                {/* Spotify badge */}
                <span className="text-[10px] font-bold text-[#1DB954] bg-[#1DB954]/10 rounded-full px-2 py-0.5 shrink-0 hidden sm:block">
                  Spotify
                </span>

                {/* Add button */}
                <button
                  type="button"
                  onClick={() => !alreadyAdded && handleAdd(track)}
                  disabled={alreadyAdded || maxReached}
                  aria-label={`Add ${track.title}`}
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: alreadyAdded ? "#4caf50" : "#111111",
                    color: "white",
                  }}
                >
                  {alreadyAdded ? (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M6 2V10M2 6H10" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* No results */}
      {isOpen && !isSearching && query && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-black/8 px-4 py-6 text-center z-50">
          <p className="text-sm text-black/40">No songs found for &ldquo;{query}&rdquo;</p>
        </div>
      )}
    </div>
  );
}
