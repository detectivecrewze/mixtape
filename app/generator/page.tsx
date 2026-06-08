"use client";

import React, { useState } from "react";
import { WORKER_BASE_URL } from "@/lib/constants";

/**
 * Owner-only generator page.
 * Creates a blank mixtape slot in KV and returns the studio URL.
 * Access via: /generator
 */
export default function GeneratorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ studioUrl: string; giftUrl: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${WORKER_BASE_URL}/mixtape/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          color: "#1a1a1a",
          stickers: [],
          songs: [],
          note: "",
          ownerId: "owner",
        }),
      });
      if (!res.ok) throw new Error(`Worker returned ${res.status}`);
      const data = await res.json();
      setResult({ studioUrl: data.studioUrl, giftUrl: data.giftUrl });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center gap-8 px-4 py-12"
      style={{ background: "#aec6cf" }}
    >
      <div className="w-full max-w-md bg-white/70 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/50">
        <h1
          className="text-xl font-bold tracking-[0.25em] uppercase text-center mb-2"
          style={{ fontFamily: "var(--font-space-mono)" }}
        >
          Studio Link Generator
        </h1>
        <p className="text-center text-xs text-black/50 mb-8" style={{ fontFamily: "var(--font-space-mono)" }}>
          Owner use only · creates a new mixtape slot
        </p>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={isLoading}
          id="generate-studio-link-btn"
          className="w-full py-4 rounded-2xl text-sm font-bold tracking-widest uppercase transition-all active:scale-95 disabled:opacity-50"
          style={{
            backgroundColor: "#111111",
            color: "white",
            fontFamily: "var(--font-space-mono)",
          }}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
              </svg>
              Generating...
            </span>
          ) : (
            "Generate New Studio Link"
          )}
        </button>

        {error && (
          <p className="mt-4 text-sm text-red-500 text-center">{error}</p>
        )}

        {result && (
          <div className="mt-6 flex flex-col gap-4">
            {/* Studio URL */}
            <div>
              <label
                className="block text-[10px] font-bold tracking-widest uppercase text-black/50 mb-1.5"
                style={{ fontFamily: "var(--font-space-mono)" }}
              >
                Studio URL (send to yourself):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={result.studioUrl}
                  id="studio-url-output"
                  className="flex-1 px-3 py-2.5 rounded-xl bg-black/5 border border-black/10 text-sm outline-none text-black/70 select-all"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button
                  type="button"
                  onClick={() => handleCopy(result.studioUrl)}
                  id="copy-studio-url-btn"
                  className="px-4 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 shrink-0"
                  style={{
                    backgroundColor: copied ? "#4caf50" : "#111111",
                    color: "white",
                    fontFamily: "var(--font-space-mono)",
                  }}
                >
                  {copied ? "✓" : "Copy"}
                </button>
              </div>
            </div>

            {/* Gift URL preview */}
            <div>
              <label
                className="block text-[10px] font-bold tracking-widest uppercase text-black/50 mb-1.5"
                style={{ fontFamily: "var(--font-space-mono)" }}
              >
                Gift URL (will be shareable after creation):
              </label>
              <input
                type="text"
                readOnly
                value={result.giftUrl}
                id="gift-url-output"
                className="w-full px-3 py-2.5 rounded-xl bg-black/5 border border-black/10 text-sm outline-none text-black/50 select-all"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
            </div>

            <p className="text-[11px] text-black/40 text-center" style={{ fontFamily: "var(--font-space-mono)" }}>
              Open the Studio URL to customize the mixtape. The gift URL will be auto-generated on Finish.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
