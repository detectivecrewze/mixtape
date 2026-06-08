"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import CassettePlayer from "@/components/mixtape/CassettePlayer";
import { CASSETTE_COLORS } from "@/lib/constants";

// ── Types ──────────────────────────────────────────────────────────────────────
interface BundleToken {
  id: string;
  remainingQuota: number;
  totalQuota: number;
  mixtapes: string[];
  label?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
// Map slot index to a cassette color
const SLOT_COLORS = ["#A2C4C9", "#F4D35E", "#E07A5F"];

const SLOT_LABEL = ["Your first", "Your second", "Your third"];

// ── Slot Card Component ────────────────────────────────────────────────────────
function SlotCard({
  index,
  mixtapeId,
  tokenId,
  isAvailable,
}: {
  index: number;
  mixtapeId?: string;
  tokenId: string;
  isAvailable: boolean;
}) {
  const router = useRouter();
  const color = SLOT_COLORS[index] ?? CASSETTE_COLORS[index % CASSETTE_COLORS.length].hex;
  const isFilled = !!mixtapeId;

  const handleCreate = () => {
    if (!isAvailable) return;
    // Redirect to studio with the token embedded so the API can deduct quota
    const rand = Math.random().toString(36).substring(2, 9);
    router.push(`/studio/bundle-${rand}?token=${tokenId}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.12, duration: 0.5, ease: "easeOut" }}
      className="relative w-full max-w-[280px]"
    >
      <div
        className="relative rounded-3xl overflow-hidden flex flex-col items-center gap-5 p-7"
        style={{
          background: "rgba(255,255,255,0.55)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.75)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
        }}
      >
        {/* Slot label */}
        <p
          className="text-[10px] uppercase tracking-[0.2em] text-black/40 font-bold"
          style={{ fontFamily: "var(--font-space-mono)" }}
        >
          {SLOT_LABEL[index]} mixtape
        </p>

        {/* Cassette */}
        <div className="relative">
          <div
            className="transition-all duration-500"
            style={{ opacity: isFilled ? 1 : 0.35, filter: isFilled ? "none" : "grayscale(0.5)" }}
          >
            <CassettePlayer color={color} isPlaying={false} size="sm" />
          </div>
          {!isFilled && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.06)", border: "1.5px dashed rgba(0,0,0,0.18)" }}
              >
                <span className="text-black/30 text-xl leading-none">+</span>
              </div>
            </div>
          )}
        </div>

        {/* Action */}
        {isFilled ? (
          <div className="flex flex-col items-center gap-2 w-full">
            <span
              className="text-[10px] font-bold tracking-widest uppercase"
              style={{ fontFamily: "var(--font-space-mono)", color: "#6aab6a" }}
            >
              ✓ Created
            </span>
            <a
              href={`/${mixtapeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center px-4 py-2.5 rounded-xl text-xs font-bold tracking-wider transition-transform active:scale-95"
              style={{
                fontFamily: "var(--font-space-mono)",
                background: "#0d0d0d",
                color: "white",
              }}
            >
              Open Mixtape →
            </a>
            <a
              href={`/studio/${mixtapeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center px-4 py-2 rounded-xl text-xs font-medium transition-colors"
              style={{
                fontFamily: "var(--font-space-mono)",
                background: "rgba(0,0,0,0.05)",
                color: "rgba(0,0,0,0.5)",
              }}
            >
              Edit in Studio
            </a>
          </div>
        ) : isAvailable ? (
          <button
            onClick={handleCreate}
            className="w-full px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-transform active:scale-95 hover:opacity-90"
            style={{
              fontFamily: "var(--font-space-mono)",
              background: "#0d0d0d",
              color: "white",
            }}
          >
            Create Mixtape
          </button>
        ) : (
          <div
            className="w-full text-center px-4 py-2.5 rounded-xl text-xs font-medium"
            style={{
              fontFamily: "var(--font-space-mono)",
              background: "rgba(0,0,0,0.04)",
              color: "rgba(0,0,0,0.25)",
            }}
          >
            Locked
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function BundlePage() {
  const params = useParams();
  const tokenId = (params?.tokenId as string)?.toUpperCase();

  const [token, setToken] = useState<BundleToken | null>(null);
  const [status, setStatus] = useState<"loading" | "found" | "not_found">("loading");

  const fetchToken = useCallback(async () => {
    if (!tokenId) return;
    try {
      const res = await fetch(`/api/tokens?id=${tokenId}`);
      if (res.ok) {
        setToken(await res.json());
        setStatus("found");
      } else {
        setStatus("not_found");
      }
    } catch {
      setStatus("not_found");
    }
  }, [tokenId]);

  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  // ── Loading ──
  if (status === "loading") {
    return (
      <main
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#b5d3e0" }}
      >
        <div
          className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{ borderColor: "rgba(0,0,0,0.08)", borderTopColor: "rgba(0,0,0,0.4)" }}
        />
      </main>
    );
  }

  // ── Not Found ──
  if (status === "not_found" || !token) {
    return (
      <main
        className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center"
        style={{ backgroundColor: "#b5d3e0" }}
      >
        <div className="text-5xl">💔</div>
        <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-space-mono)" }}>
          Token Not Found
        </h1>
        <p className="text-sm text-black/50 max-w-xs" style={{ fontFamily: "var(--font-space-mono)" }}>
          The bundle code you entered doesn't exist or has been revoked. Please check the code
          again.
        </p>
        <a
          href="/"
          className="mt-4 px-8 py-3 rounded-xl text-sm font-bold text-white"
          style={{ background: "#0d0d0d", fontFamily: "var(--font-space-mono)" }}
        >
          ← Back to Home
        </a>
      </main>
    );
  }

  // ── Build slot data ──
  const slots = Array.from({ length: token.totalQuota }).map((_, i) => ({
    index: i,
    mixtapeId: token.mixtapes[i] ?? undefined,
    isAvailable: i < token.mixtapes.length + token.remainingQuota && !token.mixtapes[i],
  }));

  const usedCount = token.mixtapes.length;

  return (
    <main
      className="min-h-screen flex flex-col items-center px-4 py-12 overflow-x-hidden relative gap-10 sm:gap-12"
      style={{ backgroundColor: "#b5d3e0" }}
    >
      {/* Subtle blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute"
          style={{
            width: 500,
            height: 500,
            top: -150,
            right: -100,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)",
            filter: "blur(50px)",
          }}
        />
        <div
          className="absolute"
          style={{
            width: 400,
            height: 400,
            bottom: -100,
            left: -80,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,200,180,0.25) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center relative z-10 flex flex-col items-center gap-4"
      >
        <p
          className="text-xs uppercase tracking-[0.3em] text-black/40"
          style={{ fontFamily: "var(--font-space-mono)" }}
        >
          mixtape bundle
        </p>
        <h1
          className="text-3xl sm:text-4xl font-bold tracking-tight text-black/80"
          style={{ fontFamily: "var(--font-space-mono)" }}
        >
          Your Mixtape Bundle
        </h1>
      </motion.div>

      {/* Quota pill */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="relative z-10"
      >
        <div
          className="px-6 py-2.5 rounded-full text-xs font-bold tracking-widest"
          style={{
            fontFamily: "var(--font-space-mono)",
            background: "rgba(255,255,255,0.6)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.8)",
            color: token.remainingQuota === 0 ? "rgba(0,0,0,0.35)" : "#0d0d0d",
          }}
        >
          {token.remainingQuota === 0
            ? "All mixtapes created ✓"
            : `${token.remainingQuota} of ${token.totalQuota} mixtapes remaining`}
        </div>
      </motion.div>

      {/* Slot Cards */}
      <div className="flex flex-col items-center sm:flex-row flex-wrap justify-center gap-8 sm:gap-5 w-full max-w-5xl relative z-10">
        {slots.map((slot) => (
          <SlotCard
            key={slot.index}
            index={slot.index}
            mixtapeId={slot.mixtapeId}
            tokenId={tokenId}
            isAvailable={slot.isAvailable}
          />
        ))}
      </div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-14 text-[11px] text-black/30 relative z-10"
        style={{ fontFamily: "var(--font-space-mono)" }}
      >
        mixtape — made with love · bundle code: {tokenId}
      </motion.p>
    </main>
  );
}
