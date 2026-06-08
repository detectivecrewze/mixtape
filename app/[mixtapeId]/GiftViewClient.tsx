"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CassettePlayer from "@/components/mixtape/CassettePlayer";
import CassetteCase from "@/components/mixtape/CassetteCase";
import NoteCard from "@/components/mixtape/NoteCard";
import FloatingFlowers from "@/components/mixtape/FloatingFlowers";
import { PASTEL_MAP, CASSETTE_COLORS } from "@/lib/constants";
import type { CassetteColorId } from "@/lib/constants";

// ── Types (new concept, no Spotify) ─────────────────────────────────────────
export interface PhotoConfig {
  url: string;
  caption?: string;
}

export interface VoiceConfig {
  url: string;
  duration?: number;
}

export interface BacksoundConfig {
  title: string;
  artist: string;
  url: string;
  volume?: number;
}

export interface MixtapeGiftConfig {
  mixtapeId: string;
  color: string;
  note?: string;
  photos: PhotoConfig[];
  voiceNote?: VoiceConfig;
  backsound?: BacksoundConfig;
  stickers?: string[];
  recipientName?: string;
  createdAt?: string;
}

// ── MOCKUP CONFIG for demo (replace with real data later) ───────────────────
const MOCKUP_CONFIG: MixtapeGiftConfig = {
  mixtapeId: "demo",
  color: "#1B3A6B",
  recipientName: "Sayang",
  note: "Setiap momen bersamamu terasa seperti lagu favorit yang tidak pernah berhenti aku putar...",
  photos: [
    { url: "/assets/mock1.jpeg" },
    { url: "/assets/mock2.jpeg" },
    { url: "/assets/mock3.jpeg" },
    { url: "/assets/mock4.jpeg" },
  ],
  voiceNote: undefined, // will be added later
  backsound: {
    title: "Everything u are",
    artist: "Hindia",
    url: "",
    volume: 0.25,
  },
};

// ── Helper ───────────────────────────────────────────────────────────────────
function getColorId(hex: string): CassetteColorId {
  const found = CASSETTE_COLORS.find((c) => c.hex === hex);
  return (found?.id ?? "navy") as CassetteColorId;
}

interface GiftViewClientProps {
  config?: MixtapeGiftConfig;
  useMockup?: boolean;
}

export default function GiftViewClient({
  config,
  useMockup = false,
}: GiftViewClientProps) {
  const activeConfig = useMockup || !config ? MOCKUP_CONFIG : config;
  const colorId = getColorId(activeConfig.color);
  const bgColor = PASTEL_MAP[colorId] ?? "#c8d9f0";

  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const voiceRef = useRef<HTMLAudioElement | null>(null);
  const backsoundRef = useRef<HTMLAudioElement | null>(null);

  // Initialise audio when config is ready
  useEffect(() => {
    if (activeConfig.voiceNote?.url) {
      voiceRef.current = new Audio(activeConfig.voiceNote.url);
    }
    if (activeConfig.backsound?.url) {
      backsoundRef.current = new Audio(activeConfig.backsound.url);
      backsoundRef.current.loop = true;
      backsoundRef.current.volume = activeConfig.backsound.volume ?? 0.25;
    }
    return () => {
      voiceRef.current?.pause();
      backsoundRef.current?.pause();
    };
  }, [activeConfig]);

  const handlePlay = () => {
    setIsPlaying(true);
    setHasStarted(true);
    voiceRef.current?.play().catch(() => {});
    backsoundRef.current?.play().catch(() => {});
  };

  const handlePause = () => {
    setIsPlaying(false);
    voiceRef.current?.pause();
    backsoundRef.current?.pause();
  };

  return (
    <>
      {/* ── Fixed Full Background ──────────────────────────────────────── */}
      <div
        className="fixed inset-0 -z-10 transition-colors duration-500"
        style={{
          backgroundColor: bgColor,
          backgroundImage: `radial-gradient(circle at 50% 50%, transparent 0%, rgba(0,0,0,0.05) 100%)`,
        }}
      />
      
      {/* ── Floating Flowers Animation ── */}
      <FloatingFlowers />

      <main
        className="min-h-screen relative flex flex-col items-center justify-start pb-36 px-4"
        style={{ paddingTop: "40px" }}
      >
        <FloatingFlowers />

        <div className="w-full max-w-sm flex flex-col items-center gap-0">



        {/* ── Note (Letter) ──────────────────────────────────────── */}
        {activeConfig.note && (
          <motion.div
            className="w-full flex justify-center z-10 relative"
            initial={{ opacity: 0, y: 15, rotate: 0 }}
            animate={{ opacity: 1, y: 0, rotate: -2 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.12 }}
            style={{ marginBottom: "-0.5rem" }} // Pull cassette up to overlap
          >
            <div style={{ width: "100%", maxWidth: 290 }}>
              <NoteCard value={activeConfig.note} readOnly={true} />
            </div>
          </motion.div>
        )}

        {/* ── Cassette ─────────────────────────────────────────── */}
        <motion.div
          className="z-0 relative"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.15 }}
        >
          <CassettePlayer
            color={activeConfig.color}
            isPlaying={isPlaying}
            size="md"
          />
        </motion.div>

        {/* ── Play / Pause button ───────────────────────────────── */}
        <motion.div
          className="flex flex-col items-center gap-2 mt-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.35 }}
        >
          <button
            onClick={isPlaying ? handlePause : handlePlay}
            className="relative flex items-center justify-center rounded-full"
            style={{
              width: 48,
              height: 48,
              background: "rgba(255, 255, 255, 0.4)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.8)",
              cursor: "pointer",
              boxShadow: isPlaying
                ? "0 0 0 6px rgba(255,255,255,0.2)"
                : "0 8px 32px rgba(0,0,0,0.08)",
              transition: "all 0.3s ease",
            }}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            <AnimatePresence mode="wait">
              {isPlaying ? (
                <motion.svg
                  key="pause"
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  width="20" height="20" viewBox="0 0 24 24" fill="rgba(0,0,0,0.85)"
                  stroke="rgba(0,0,0,0.85)" strokeWidth="1" strokeLinejoin="round"
                >
                  <rect x="6" y="5" width="4" height="14" rx="1.5" />
                  <rect x="14" y="5" width="4" height="14" rx="1.5" />
                </motion.svg>
              ) : (
                <motion.svg
                  key="play"
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  width="20" height="20" viewBox="0 0 24 24" fill="rgba(0,0,0,0.85)"
                  stroke="rgba(0,0,0,0.85)" strokeWidth="2" strokeLinejoin="round"
                >
                  <path d="M8 5.14v14l11-7-11-7z" />
                </motion.svg>
              )}
            </AnimatePresence>

            {/* Pulse ring when playing */}
            {isPlaying && (
              <motion.span
                className="absolute inset-0 rounded-full"
                style={{ border: "1px solid rgba(255,255,255,0.6)" }}
                animate={{ scale: [1, 1.5, 1.5], opacity: [0.6, 0, 0] }}
                transition={{ repeat: Infinity, duration: 1.6, ease: "easeOut" }}
              />
            )}
          </button>

          {/* Backsound label */}
          {/* Backsound label removed */}
        </motion.div>

        {/* ── Cassette Case with photo slideshow ───────────────── */}
        <motion.div
          className="w-full"
          style={{ marginTop: 24 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.5 }}
        >
          <CassetteCase
            photos={activeConfig.photos}
            note={activeConfig.note}
            isPlaying={isPlaying}
          />
        </motion.div>

        <div style={{ height: "20vh", minHeight: "150px" }} aria-hidden="true" />
      </div>
    </main>
    </>
  );
}
