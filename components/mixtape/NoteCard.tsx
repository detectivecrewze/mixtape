"use client";

import React from "react";

interface NoteCardProps {
  value: string;
  onChange?: (val: string) => void;
  readOnly?: boolean;
  maxChars?: number;
}

const HOLE_POSITIONS = [1, 2, 3];

export default function NoteCard({
  value,
  onChange,
  readOnly = false,
  maxChars = 140,
}: NoteCardProps) {
  return (
    <div
      className="relative w-full rounded-xl shadow-sm overflow-hidden"
      style={{ minHeight: readOnly ? 80 : 120, background: "#fdfdf5" }}
    >
      {/* Hole-punch strip */}
      <div
        className="absolute left-0 top-0 bottom-0 flex flex-col items-center justify-around py-4"
        style={{ width: 32, background: "#f0ede0", borderRight: "1px solid #e0ddd0" }}
        aria-hidden="true"
      >
        {HOLE_POSITIONS.map((_, i) => (
          <div
            key={i}
            className="rounded-full"
            style={{
              width: 12,
              height: 12,
              background: "#aec6cf",
              boxShadow: "inset 0 1px 3px rgba(0,0,0,0.2)",
            }}
          />
        ))}
      </div>

      {/* Ruled paper area */}
      {readOnly ? (
        <div
          className="pr-4 text-base ruled-paper"
          style={{
            fontFamily: "var(--font-caveat)",
            fontSize: "1.05rem",
            paddingTop: 6,
            paddingBottom: 28,
            paddingLeft: 56,
            minHeight: 80,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            color: "#222",
          }}
        >
          {value || (
            <span className="text-black/30 italic">No note left...</span>
          )}
        </div>
      ) : (
        <div className="relative">
          <textarea
            id="mixtape-note"
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            maxLength={maxChars}
            placeholder="Write something sweet..."
            rows={3}
            className="w-full pr-4 text-base bg-transparent outline-none resize-none ruled-paper"
            style={{
              fontFamily: "var(--font-caveat)",
              fontSize: "1.05rem",
              paddingTop: 6,
              paddingBottom: 28,
              paddingLeft: 56,
              minHeight: 120,
              color: "#222",
            }}
            aria-label="Personal note for your mixtape"
          />
          {/* Character counter */}
          <span
            className="absolute bottom-3 right-4 text-xs tabular-nums"
            style={{
              fontFamily: "var(--font-space-mono)",
              color: value.length >= maxChars ? "#e53935" : "#aaaaaa",
            }}
          >
            {value.length}/{maxChars}
          </span>
        </div>
      )}
    </div>
  );
}
