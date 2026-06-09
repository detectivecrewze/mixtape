"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import CassettePlayer from "@/components/mixtape/CassettePlayer";
import NoteCard from "@/components/mixtape/NoteCard";

// ── Token Modal ────────────────────────────────────────────────────────────────
function TokenModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [tokenInput, setTokenInput] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = tokenInput.trim().toUpperCase();
    if (!id) return;
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch(`/api/tokens?id=${encodeURIComponent(id)}`);
      if (res.ok) {
        router.push(`/bundle/${id}`);
      } else {
        const body = await res.json().catch(() => ({}));
        setErrorMsg(body.error || "Token tidak ditemukan. Cek kembali kodenya.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Koneksi gagal. Coba lagi.");
      setStatus("error");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full max-w-sm rounded-3xl p-8 flex flex-col gap-5"
        style={{
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(30px)",
          WebkitBackdropFilter: "blur(30px)",
          border: "1px solid rgba(255,255,255,0.9)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.12)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center">
          <p
            className="text-[10px] uppercase tracking-[0.3em] text-black/40 mb-2"
            style={{ fontFamily: "var(--font-space-mono)" }}
          >
            mixtape bundle
          </p>
          <h2
            className="text-xl font-bold text-black/80"
            style={{ fontFamily: "var(--font-space-mono)" }}
          >
            Enter Your Bundle Code
          </h2>
          <p
            className="text-xs text-black/40 mt-2"
            style={{ fontFamily: "var(--font-space-mono)" }}
          >
            Got a bundle? Enter your code to access your mixtape slots.
          </p>
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            value={tokenInput}
            onChange={(e) => {
              setTokenInput(e.target.value.toUpperCase());
              setStatus("idle");
              setErrorMsg("");
            }}
            placeholder="e.g. LOVE-A1B2"
            autoFocus
            className="w-full px-4 py-3.5 rounded-2xl text-sm font-bold text-center tracking-widest outline-none transition-all"
            style={{
              fontFamily: "var(--font-space-mono)",
              background: "rgba(0,0,0,0.05)",
              border: status === "error" ? "1.5px solid rgba(220,50,50,0.4)" : "1.5px solid rgba(0,0,0,0.08)",
              color: "#0d0d0d",
            }}
          />
          {errorMsg && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-center"
              style={{ fontFamily: "var(--font-space-mono)", color: "#c0392b" }}
            >
              {errorMsg}
            </motion.p>
          )}
          <button
            type="submit"
            disabled={status === "loading" || !tokenInput.trim()}
            className="w-full py-3.5 rounded-2xl text-sm font-bold tracking-wider text-white uppercase transition-all active:scale-95 disabled:opacity-40"
            style={{
              fontFamily: "var(--font-space-mono)",
              background: "#0d0d0d",
            }}
          >
            {status === "loading" ? "Checking..." : "Open My Bundle →"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-black/10" />
          <span className="text-[10px] text-black/30" style={{ fontFamily: "var(--font-space-mono)" }}>
            don't have one?
          </span>
          <div className="flex-1 h-px bg-black/10" />
        </div>

        <p className="text-center text-[11px] text-black/40" style={{ fontFamily: "var(--font-space-mono)" }}>
          Bundle codes are sent via DM after purchase. 🎁
        </p>

        <button
          onClick={onClose}
          className="text-center text-[11px] text-black/30 hover:text-black/50 transition-colors"
          style={{ fontFamily: "var(--font-space-mono)" }}
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
}

// ── Homepage ───────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <main
        className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden"
        style={{ backgroundColor: "#b5d3e0" }}
      >
        {/* ── Hero Composition ── */}
        <div className="relative w-full max-w-lg h-[400px] sm:h-[450px] flex items-center justify-center mb-12 sm:mb-8 pointer-events-none">
          
          {/* Note Card (Background, tilted) */}
          <motion.div
            initial={{ opacity: 0, y: 50, rotate: 0 }}
            animate={{ opacity: 1, y: -200, x: 0, rotate: -6 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute z-0 w-[280px] sm:w-[340px]"
          >
            <div className="transform scale-100 sm:scale-110 drop-shadow-2xl">
              <NoteCard 
                value={"I made this for you! Enjoy creating <3"} 
                readOnly={true} 
              />
            </div>
          </motion.div>

          {/* Scattered Cassettes */}
          <div className="absolute z-10 w-full h-full flex items-center justify-center transform scale-75 sm:scale-100 pointer-events-none">
            
            {/* 1. Blue Cassette (Top Left) */}
            <motion.div
              initial={{ opacity: 0, y: 20, x: -40, rotate: -30 }}
              animate={{ opacity: 1, y: -60, x: -110, rotate: -18 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="absolute"
              style={{ zIndex: 11 }}
            >
              <motion.div animate={{ y: [0, -8, 0], rotate: [-18, -16, -18] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
                <CassettePlayer color="#A2C4C9" isPlaying={false} size="sm" className="drop-shadow-2xl" />
              </motion.div>
            </motion.div>

            {/* 2. Yellow Cassette (Top Right) */}
            <motion.div
              initial={{ opacity: 0, y: 20, x: 40, rotate: 30 }}
              animate={{ opacity: 1, y: -30, x: 100, rotate: 12 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="absolute"
              style={{ zIndex: 12 }}
            >
              <motion.div animate={{ y: [0, -10, 0], rotate: [12, 10, 12] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}>
                <CassettePlayer color="#F4D35E" isPlaying={false} size="sm" className="drop-shadow-2xl" />
              </motion.div>
            </motion.div>

            {/* 3. Red Cassette (Bottom Left) */}
            <motion.div
              initial={{ opacity: 0, y: 60, x: -20, rotate: -10 }}
              animate={{ opacity: 1, y: 70, x: -80, rotate: -6 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="absolute"
              style={{ zIndex: 13 }}
            >
              <motion.div animate={{ y: [0, -6, 0], rotate: [-6, -4, -6] }} transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}>
                <CassettePlayer color="#E07A5F" isPlaying={false} size="sm" className="drop-shadow-2xl" />
              </motion.div>
            </motion.div>

            {/* 4. Green Cassette (Bottom Right) */}
            <motion.div
              initial={{ opacity: 0, y: 60, x: 20, rotate: 10 }}
              animate={{ opacity: 1, y: 90, x: 70, rotate: 22 }}
              transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
              className="absolute"
              style={{ zIndex: 14 }}
            >
              <motion.div animate={{ y: [0, -12, 0], rotate: [22, 24, 22] }} transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}>
                <CassettePlayer color="#8AB0AB" isPlaying={false} size="sm" className="drop-shadow-2xl" />
              </motion.div>
            </motion.div>

          </div>
          
        </div>

        {/* ── Call to Action Button ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
          className="z-20 relative mt-12 sm:mt-16"
        >
          <button
            id="create-mixtape-btn"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center px-12 py-4 sm:px-16 sm:py-5 rounded-2xl text-white font-bold tracking-wide transition-transform active:scale-95 hover:scale-105"
            style={{
              backgroundColor: "#0d0d0d",
              fontFamily: "var(--font-space-mono), monospace",
              fontSize: "0.85rem",
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
              minWidth: "240px",
            }}
          >
            Create a mixtape
          </button>
        </motion.div>
      </main>

      {/* Token Modal */}
      <AnimatePresence>
        {showModal && <TokenModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </>
  );
}
