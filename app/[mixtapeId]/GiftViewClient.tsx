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
  voiceVolume?: number;
  ambientVolume?: number;
  stickers?: string[];
  recipientName?: string;
  password?: string;
  passwordHint?: string;
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
  password: "test",
  passwordHint: "the word is test",
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

  // Sync iOS status bar & body background to gift theme color
  useEffect(() => {
    // Set body background (fixes home indicator / bottom safe area)
    document.body.style.backgroundColor = bgColor;

    // Set theme-color meta (fixes iOS status bar top)
    let meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta") as HTMLMetaElement;
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }
    meta.content = bgColor;

    // Cleanup on unmount
    return () => {
      document.body.style.backgroundColor = "";
      const m = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
      if (m) m.content = "";
    };
  }, [bgColor]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  const mixerCtxRef = useRef<AudioContext | null>(null);
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const mixerAmbientAudioRef = useRef<HTMLAudioElement | null>(null);

  // Set initial unlock state
  useEffect(() => {
    if (!activeConfig.password) {
      setIsUnlocked(true);
    }
  }, [activeConfig.password]);

  // Initialise audio context when play is clicked (required by iOS Safari)
  const initAudio = async () => {
    const voiceUrl = activeConfig.voiceNote?.url;
    const ambientUrl = activeConfig.backsound?.url;

    // 1. Voice Note - Standard HTMLAudioElement (Bypasses iOS WebKit WebM + WebAudio Bug)
    if (voiceUrl && !voiceAudioRef.current) {
      const va = new Audio();
      va.crossOrigin = "anonymous";
      va.src = voiceUrl + (voiceUrl.includes("?") ? "&" : "?") + "cb=" + Date.now();
      // Apply volume (works on Desktop, iOS forces 1.0 but background music will be ducked)
      va.volume = activeConfig.voiceVolume ?? 1.0;
      voiceAudioRef.current = va;
    }

    // 2. Background Music - Web Audio API (Allows precise volume control on iOS)
    if (ambientUrl && !mixerAmbientAudioRef.current) {
      if (!mixerCtxRef.current) {
        mixerCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = mixerCtxRef.current;
      if (ctx.state === "suspended") await ctx.resume();

      const aa = new Audio();
      aa.crossOrigin = "anonymous";
      aa.src = ambientUrl + (ambientUrl.includes("?") ? "&" : "?") + "cb=" + Date.now();
      aa.loop = true;
      const src2 = ctx.createMediaElementSource(aa);
      const gain2 = ctx.createGain();
      gain2.gain.value = activeConfig.ambientVolume ?? 0.25;
      src2.connect(gain2);
      gain2.connect(ctx.destination);
      mixerAmbientAudioRef.current = aa;
    }
  };

  const handlePlay = async () => {
    setIsPlaying(true);
    setHasStarted(true);
    await initAudio();
    // Start both audios
    voiceAudioRef.current?.play().catch(() => {});
    mixerAmbientAudioRef.current?.play().catch(() => {});
  };

  const handlePause = () => {
    setIsPlaying(false);
    voiceAudioRef.current?.pause();
    mixerAmbientAudioRef.current?.pause();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      voiceAudioRef.current?.pause();
      mixerAmbientAudioRef.current?.pause();
      mixerCtxRef.current?.close().catch(() => {});
    };
  }, []);

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
        {/* ── Retro Cassette Lock Screen ────────────────────────────────── */}
        <AnimatePresence>
          {!isUnlocked && (
            <motion.div
              key="lock-screen"
              initial={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(0px)" }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: "rgba(255,255,255,0.05)" }}
            >
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ scale: 1.1, opacity: 0, filter: "blur(10px)" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="transform scale-[0.85] sm:scale-100 origin-center"
              >
                <div className="relative inline-block">
                  {/* 1. The Actual Cassette (Blurred Behind) */}
                  <div className="relative" style={{ zIndex: 1 }}>
                    <CassettePlayer
                      color={activeConfig.color}
                      isPlaying={false}
                      size="lg"
                      className="opacity-90 block"
                    />
                  </div>
                  
                  {/* 2. The Frosted Glass Case Overlay */}
                  <div 
                    className="absolute inset-0 overflow-hidden"
                    style={{
                      zIndex: 2,
                      borderRadius: "16px",
                      background: "linear-gradient(135deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.15) 100%)",
                      backdropFilter: "blur(8px)",
                      borderTop: "1.5px solid rgba(255,255,255,0.7)",
                      borderLeft: "1.5px solid rgba(255,255,255,0.7)",
                      borderRight: "1px solid rgba(255,255,255,0.3)",
                      borderBottom: "1px solid rgba(255,255,255,0.3)",
                      boxShadow: "inset 0 0 20px rgba(255,255,255,0.3), 0 20px 40px rgba(0,0,0,0.15)"
                    }}
                  >
                    {/* Subtle mist effect texture */}
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/dust.png')" }}></div>
                    
                    {/* TOP: Label */}
                    <div className="absolute top-12 left-0 w-full flex justify-center z-10 pointer-events-none">
                      <div className="px-4 py-1.5 rounded-sm bg-white/70 shadow-sm border border-white/50">
                        <p className="text-[10px] font-bold tracking-[0.25em] text-black/70 uppercase whitespace-nowrap" style={{ fontFamily: "var(--font-space-mono)" }}>
                          Gift is Locked
                        </p>
                      </div>
                    </div>
                    
                    {/* MIDDLE: Form & Input */}
                    <div className="absolute inset-0 z-10 w-full flex flex-col items-center justify-center pointer-events-none">
                      <form 
                        id="unlock-form"
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (passwordInput === activeConfig.password) {
                            setIsUnlocked(true);
                          } else {
                            setPasswordError(true);
                          }
                        }} 
                        className="w-full flex flex-col items-center pointer-events-auto"
                      >
                        <div className="relative w-full px-2 flex flex-col items-center">
                          <input
                            type="password"
                            placeholder="Ketik sandi di sini..."
                            value={passwordInput}
                            onChange={(e) => {
                              setPasswordInput(e.target.value);
                              setPasswordError(false);
                            }}
                            className={`w-[85%] max-w-[320px] bg-white/50 border-[1.5px] border-black/20 backdrop-blur-md pb-2 pt-3 rounded-2xl shadow-inner text-center text-3xl font-bold text-black/80 placeholder-black/50 focus:outline-none transition-colors ${passwordError ? "border-red-400 bg-red-100/80" : "focus:border-black/40 focus:bg-white/70"}`}
                            style={{ fontFamily: "var(--font-caveat)", letterSpacing: "0.05em" }}
                          />
                          {passwordError && (
                            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute -bottom-6 w-full text-center text-[11px] text-red-600 font-bold tracking-wider uppercase drop-shadow-sm">
                              Sandi Salah
                            </motion.span>
                          )}
                          {activeConfig.passwordHint && !passwordError && (
                            <p className="absolute -bottom-7 w-full text-center text-xs text-black/80 font-bold tracking-widest drop-shadow-sm" style={{ fontFamily: "var(--font-space-mono)" }}>
                              Hint: {activeConfig.passwordHint}
                            </p>
                          )}
                        </div>
                      </form>
                    </div>

                    {/* BOTTOM: Button */}
                    <div className="absolute bottom-4 left-0 w-full flex justify-center z-10 pointer-events-none">
                      <button
                        type="submit"
                        form="unlock-form"
                        disabled={!passwordInput}
                        className="pointer-events-auto px-8 py-3 rounded-full text-xs font-bold tracking-[0.2em] text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 shadow-xl whitespace-nowrap"
                        style={{ background: "#111", fontFamily: "var(--font-space-mono)" }}
                      >
                        OPEN GIFT
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div 
          className="relative w-full flex flex-col items-center transition-all duration-[1200ms] z-10"
          style={{ 
            opacity: isUnlocked ? 1 : 0, 
            pointerEvents: isUnlocked ? "auto" : "none",
            filter: isUnlocked ? "blur(0px)" : "blur(12px)",
            transform: isUnlocked ? "scale(1)" : "scale(0.95)"
          }}
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
      </div>
    </main>
    </>
  );
}
