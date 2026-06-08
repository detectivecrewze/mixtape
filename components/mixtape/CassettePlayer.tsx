"use client";

import styles from "./CassettePlayer.module.css";

import React from "react";
import type { StickerTypeId } from "@/lib/constants";

interface CassettePlayerProps {
  /** Hex color string for the tape body */
  color: string;
  /** Whether audio is currently playing — animates the reel */
  isPlaying?: boolean;
  /** Whether to show the plastic case overlay */
  showCase?: boolean;
  /** Active stickers on the case */
  stickers?: StickerTypeId[];
  /** Size: 'sm' = 240px wide, 'md' = 320px, 'lg' = 400px */
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_MAP = { sm: 240, md: 320, lg: 400 };

/**
 * Full SVG cassette tape with optional plastic case overlay and stickers.
 * All colours are driven by the `color` prop.
 */
export default function CassettePlayer({
  color,
  isPlaying = false,
  showCase = false,
  stickers = [],
  size = "md",
  className = "",
}: CassettePlayerProps) {
  const w = SIZE_MAP[size];
  const h = Math.round(w * 0.62); // ~16:10 ratio

  // Derive a slightly lighter tint for reel windows and labels
  const isLight = color === "#A2C4C9" || color === "#F4D35E" || color === "#8AB0AB";
  const labelColor = isLight ? "#e8e0d0" : "#f5f0e8";
  const reelColor = isLight ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.12)";
  const reelStroke = isLight ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.25)";
  let bgSrc = "";
  if (color === "#8AB0AB") bgSrc = "/assets/green.png";
  else if (color === "#E07A5F") bgSrc = "/assets/red.png";
  else if (color === "#A2C4C9") bgSrc = "/assets/blue.png";
  else if (color === "#F4D35E") bgSrc = "/assets/yellow.png";

  return (
    <div
      className={`relative inline-block ${className}`}
      style={{ width: w, height: h }}
    >
      {/* ── Cassette Body Image ───────────────────────────────────── */}
      <img
        src="/assets/cassete.png"
        alt="Cassette"
        width={w}
        height={h}
        style={{
          display: "block",
          width: w,
          height: h,
          objectFit: "cover",
          filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.28))",
          borderRadius: 14,
          position: "relative",
          zIndex: 1,
        }}
      />

      {/* ── Sticker Overlay Pattern ───────────────────────────────────── */}
      {bgSrc && (
        <div
          style={{
            position: "absolute",
            top: "8.1%",
            right: "6.94%",
            bottom: "29.15%",
            left: "6.07%",
            zIndex: 2,
            pointerEvents: "none",
            borderRadius: "2px",
            overflow: "hidden"
          }}
        >
          <img
            src={bgSrc}
            alt="Pattern"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
      )}

      {/* ── Reel spin overlay (visible when playing) ────────────────── */}
      {isPlaying && (
        <>
          {/* Left reel */}
          <div
            className={styles.reelSpin}
            style={{
              position: "absolute",
              top: "37.22%",
              left: "25.43%",
              right: "64.45%",
              bottom: "47.09%",
              zIndex: 3,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.06)",
              pointerEvents: "none",
            }}
          />
          {/* Right reel */}
          <div
            className={styles.reelSpin}
            style={{
              position: "absolute",
              top: "37.22%",
              left: "64.74%",
              right: "25.14%",
              bottom: "47.09%",
              zIndex: 3,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.06)",
              pointerEvents: "none",
            }}
          />
        </>
      )}

    </div>
  );
}
