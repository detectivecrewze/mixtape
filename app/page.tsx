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
      style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 32, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 32, opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
        className="w-full max-w-sm flex flex-col gap-6"
        style={{
          background: "rgba(255,255,255,0.82)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          border: "1px solid rgba(255,255,255,0.95)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.14), 0 4px 24px rgba(0,0,0,0.08)",
          borderRadius: "28px",
          padding: "36px 32px 28px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center flex flex-col items-center gap-2">
          {/* Icon */}
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-1"
            style={{ background: "rgba(0,0,0,0.05)" }}
          >
            <span style={{ fontSize: "22px" }}>🎁</span>
          </div>
          <p
            className="text-[9px] uppercase tracking-[0.35em]"
            style={{ fontFamily: "var(--font-space-mono)", color: "rgba(0,0,0,0.35)" }}
          >
            mixtape bundle
          </p>
          <h2
            className="text-[22px] font-bold leading-tight"
            style={{ fontFamily: "var(--font-space-mono)", color: "#0d0d0d", letterSpacing: "-0.01em" }}
          >
            Enter Your Bundle Code
          </h2>
          <p
            className="text-[11px] leading-relaxed"
            style={{ fontFamily: "var(--font-space-mono)", color: "rgba(0,0,0,0.38)" }}
          >
            Got a bundle? Enter your code to access your mixtape slots.
          </p>
        </div>

        {/* Input + Button */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div style={{ position: "relative" }}>
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
              className="w-full text-sm font-bold text-center tracking-widest outline-none transition-all"
              style={{
                fontFamily: "var(--font-space-mono)",
                background: status === "error" ? "rgba(220,50,50,0.04)" : "rgba(0,0,0,0.04)",
                border: status === "error"
                  ? "1.5px solid rgba(220,50,50,0.35)"
                  : tokenInput
                    ? "1.5px solid rgba(0,0,0,0.2)"
                    : "1.5px solid rgba(0,0,0,0.08)",
                borderRadius: "16px",
                padding: "14px 18px",
                color: "#0d0d0d",
                letterSpacing: "0.2em",
                transition: "border 0.2s ease, background 0.2s ease",
              }}
            />
          </div>

          {errorMsg && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[10px] text-center"
              style={{ fontFamily: "var(--font-space-mono)", color: "#c0392b" }}
            >
              {errorMsg}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={status === "loading" || !tokenInput.trim()}
            className="w-full text-[11px] font-bold tracking-widest text-white uppercase transition-all active:scale-95 disabled:opacity-40 hover:opacity-90"
            style={{
              fontFamily: "var(--font-space-mono)",
              background: "linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)",
              borderRadius: "14px",
              padding: "15px 18px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08)",
              border: "none",
              cursor: status === "loading" || !tokenInput.trim() ? "not-allowed" : "pointer",
            }}
          >
            {status === "loading" ? "Checking..." : "Open My Bundle →"}
          </button>
        </form>

        {/* Divider + Info */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: "rgba(0,0,0,0.08)" }} />
            <span
              className="text-[9px] uppercase tracking-widest"
              style={{ fontFamily: "var(--font-space-mono)", color: "rgba(0,0,0,0.3)" }}
            >
              don&apos;t have one?
            </span>
            <div className="flex-1 h-px" style={{ background: "rgba(0,0,0,0.08)" }} />
          </div>

          <p
            className="text-center text-[10px] leading-relaxed"
            style={{ fontFamily: "var(--font-space-mono)", color: "rgba(0,0,0,0.38)" }}
          >
            Bundle codes are sent via DM after purchase. 🎁
          </p>

          <button
            onClick={onClose}
            className="text-center text-[10px] transition-all hover:opacity-70"
            style={{
              fontFamily: "var(--font-space-mono)",
              color: "rgba(0,0,0,0.28)",
              paddingTop: "4px",
            }}
          >
            Close
          </button>
        </div>
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
