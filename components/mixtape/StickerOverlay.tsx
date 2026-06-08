"use client";

import React from "react";
import type { StickerTypeId } from "@/lib/constants";

/* ─── Individual sticker SVGs ─────────────────────────────────────────────── */

function StarsSticker() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Cluster of stars at various sizes/positions */}
      <polygon points="20,5 23,15 33,15 25,21 28,31 20,25 12,31 15,21 7,15 17,15"
        fill="#FFD700" />
      <polygon points="85,10 87,17 94,17 88,21 90,28 85,24 80,28 82,21 76,17 83,17"
        fill="#FFD700" opacity="0.9" />
      <polygon points="60,50 62,57 69,57 63,61 65,68 60,64 55,68 57,61 51,57 58,57"
        fill="#FFC107" />
      <polygon points="30,65 31.5,70 37,70 32.5,73 34,78 30,75 26,78 27.5,73 23,70 28.5,70"
        fill="#FFD700" opacity="0.85" />
      <polygon points="95,60 96.5,65 102,65 97.5,68 99,73 95,70 91,73 92.5,68 88,65 93.5,65"
        fill="#FFC107" opacity="0.9" />
      <polygon points="50,90 51.5,95 57,95 52.5,98 54,103 50,100 46,103 47.5,98 43,95 48.5,95"
        fill="#FFD700" />
      <circle cx="75" cy="90" r="3" fill="#FFD700" opacity="0.7" />
      <circle cx="15" cy="45" r="2.5" fill="#FFC107" opacity="0.8" />
      <circle cx="105" cy="35" r="2" fill="#FFD700" opacity="0.6" />
    </svg>
  );
}

function BowSticker() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Left wing */}
      <ellipse cx="42" cy="55" rx="28" ry="18" fill="#FF6B9D" transform="rotate(-15 42 55)" />
      <ellipse cx="42" cy="55" rx="20" ry="11" fill="#FF8FAF" transform="rotate(-15 42 55)" />
      {/* Right wing */}
      <ellipse cx="78" cy="55" rx="28" ry="18" fill="#FF6B9D" transform="rotate(15 78 55)" />
      <ellipse cx="78" cy="55" rx="20" ry="11" fill="#FF8FAF" transform="rotate(15 78 55)" />
      {/* Center knot */}
      <ellipse cx="60" cy="58" rx="10" ry="10" fill="#E91E63" />
      <ellipse cx="60" cy="58" rx="6" ry="6" fill="#FF6B9D" />
      {/* Ribbon tails */}
      <path d="M55 65 Q45 85 35 90" stroke="#FF6B9D" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M65 65 Q75 85 85 90" stroke="#FF6B9D" strokeWidth="5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function FlowersSticker() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Flower 1 — top left */}
      <g transform="translate(28,28)">
        <circle cx="0" cy="-12" r="8" fill="#FF9EBC" />
        <circle cx="12" cy="0" r="8" fill="#FF9EBC" />
        <circle cx="0" cy="12" r="8" fill="#FFAEC8" />
        <circle cx="-12" cy="0" r="8" fill="#FFAEC8" />
        <circle cx="0" cy="0" r="7" fill="#FFE082" />
      </g>
      {/* Flower 2 — bottom right */}
      <g transform="translate(85,85)">
        <circle cx="0" cy="-10" r="7" fill="#C8A8E9" />
        <circle cx="10" cy="0" r="7" fill="#C8A8E9" />
        <circle cx="0" cy="10" r="7" fill="#B89BD4" />
        <circle cx="-10" cy="0" r="7" fill="#B89BD4" />
        <circle cx="0" cy="0" r="6" fill="#FFE082" />
      </g>
      {/* Small flower — center */}
      <g transform="translate(60,52)">
        <circle cx="0" cy="-7" r="5" fill="#FF9EBC" />
        <circle cx="7" cy="0" r="5" fill="#FFAEC8" />
        <circle cx="0" cy="7" r="5" fill="#FF9EBC" />
        <circle cx="-7" cy="0" r="5" fill="#FFAEC8" />
        <circle cx="0" cy="0" r="5" fill="#FFF176" />
      </g>
      {/* Tiny dots */}
      <circle cx="75" cy="30" r="3" fill="#FF9EBC" opacity="0.7" />
      <circle cx="38" cy="90" r="3" fill="#C8A8E9" opacity="0.7" />
    </svg>
  );
}

function SparklesSticker() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Large sparkle center */}
      <path d="M60 15 L63 55 L103 60 L63 65 L60 105 L57 65 L17 60 L57 55 Z"
        fill="#FFD700" />
      {/* Medium sparkle top-right */}
      <path d="M90 10 L92 28 L110 30 L92 32 L90 50 L88 32 L70 30 L88 28 Z"
        fill="#FFC107" opacity="0.85" />
      {/* Small sparkle bottom-left */}
      <path d="M22 70 L23.5 82 L36 83 L23.5 84 L22 96 L20.5 84 L8 83 L20.5 82 Z"
        fill="#FFE082" opacity="0.9" />
      {/* Tiny dots */}
      <circle cx="50" cy="20" r="3" fill="#FFD700" opacity="0.6" />
      <circle cx="95" cy="80" r="2.5" fill="#FFC107" opacity="0.7" />
      <circle cx="30" cy="40" r="2" fill="#FFE082" opacity="0.8" />
    </svg>
  );
}

/* ─── Sticker map ─────────────────────────────────────────────────────────── */

const STICKER_MAP: Record<StickerTypeId, React.FC> = {
  stars: StarsSticker,
  bow: BowSticker,
  flowers: FlowersSticker,
  sparkles: SparklesSticker,
};

/* ─── StickerOverlay ──────────────────────────────────────────────────────── */

interface StickerOverlayProps {
  stickers: StickerTypeId[];
  /** If true, renders full-size stickers (gift view). Default = studio preview size */
  fullSize?: boolean;
}

/**
 * Renders selected stickers overlaid on top of the cassette case.
 * Positioned absolutely so the parent must be `position: relative`.
 */
export default function StickerOverlay({ stickers, fullSize = false }: StickerOverlayProps) {
  if (stickers.length === 0) return null;

  // Layout positions for up to 4 stickers in a 2×2 zone
  const positions = [
    { top: "6%",  left: "4%",  size: fullSize ? 64 : 48 },
    { top: "6%",  right: "4%", size: fullSize ? 60 : 44 },
    { bottom: "8%", left: "6%",  size: fullSize ? 56 : 42 },
    { bottom: "8%", right: "6%", size: fullSize ? 56 : 42 },
  ];

  return (
    <>
      {stickers.map((id, i) => {
        const pos = positions[i % positions.length];
        const StickerComponent = STICKER_MAP[id];
        return (
          <div
            key={`${id}-${i}`}
            style={{
              position: "absolute",
              width: pos.size,
              height: pos.size,
              ...pos,
              pointerEvents: "none",
              zIndex: 10,
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
            }}
          >
            <StickerComponent />
          </div>
        );
      })}
    </>
  );
}
