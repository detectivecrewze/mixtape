"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Types ──────────────────────────────────────────────────────────────────────
interface MixtapeEntry {
  id: string;
  color: string;
  status: string;
  createdAt?: string;
  publishedAt?: string;
  token?: string | null;
  studioUrl: string;
  giftUrl: string;
}

interface BundleToken {
  id: string;
  remainingQuota: number;
  totalQuota: number;
  mixtapes: string[];
  createdAt: string;
  label?: string;
}

// ── Icons ──────────────────────────────────────────────────────────────────────
const IconTape = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="20" height="12" rx="2"/>
    <circle cx="8" cy="12" r="2"/>
    <circle cx="16" cy="12" r="2"/>
    <path d="M8 12h8"/>
    <path d="M5 6v-1a1 1 0 011-1h12a1 1 0 011 1v1"/>
  </svg>
);
const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 5v14M5 12h14"/>
  </svg>
);
const IconCopy = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2"/>
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
  </svg>
);
const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 13l4 4L19 7"/>
  </svg>
);
const IconExternalLink = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
  </svg>
);
const IconSettings = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
  </svg>
);
const IconKey = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
  </svg>
);
const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IconTrash = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
  </svg>
);
const IconToken = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);
const IconChevron = ({ open }: { open: boolean }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

// ── Login Screen ───────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        onLogin();
      } else {
        setError("Password salah. Coba lagi.");
      }
    } catch {
      setError("Koneksi gagal. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", background: "#0d0d14" }}>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)", filter: "blur(40px)" }} />
      <div style={{ position: "relative", width: "100%", maxWidth: "440px", margin: "0 16px" }}>
        <div style={{ borderRadius: "24px", padding: "40px 32px", background: "#16161a", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "32px" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px", background: "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(168,85,247,0.3))", border: "1px solid rgba(168,85,247,0.3)", boxShadow: "0 0 32px rgba(99,102,241,0.2)" }}>
              <div style={{ color: "#a78bfa" }}><IconTape /></div>
            </div>
            <h1 style={{ fontSize: "24px", fontWeight: 600, color: "rgba(255,255,255,0.95)", margin: 0 }}>Mixtape Admin</h1>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.35)", marginTop: "4px", marginBottom: 0 }}>Masukkan password untuk akses</p>
          </div>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", width: "100%", padding: "12px 16px", borderRadius: "12px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <input type="password" placeholder="Password..." value={password} onChange={(e) => setPassword(e.target.value)} style={{ background: "transparent", border: "none", color: "white", outline: "none", width: "100%", fontSize: "15px" }} />
            </div>
            {error && <p style={{ color: "#f87171", fontSize: "13px", margin: 0 }}>{error}</p>}
            <button type="submit" disabled={loading} style={{ padding: "14px", borderRadius: "12px", border: "none", background: "white", color: "black", fontWeight: 600, fontSize: "15px", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Loading..." : "Masuk"}
            </button>
          </form>
          <p style={{ textAlign: "center", fontSize: "12px", marginTop: "20px", color: "rgba(255,255,255,0.18)" }}>mixtape — made with love</p>
        </div>
      </div>
    </div>
  );
}

// ── Token Row Component ────────────────────────────────────────────────────────
function TokenRow({
  token,
  mixtapes,
  onDelete,
  onCopy,
  copied,
}: {
  token: BundleToken;
  mixtapes: MixtapeEntry[];
  onDelete: (id: string) => void;
  onCopy: (text: string, key: string) => void;
  copied: string | null;
}) {
  const [open, setOpen] = useState(false);
  const linked = mixtapes.filter((m) => m.token === token.id);
  const usedCount = token.totalQuota - token.remainingQuota;
  const isFull = token.remainingQuota === 0;

  return (
    <div className="rounded-2xl overflow-hidden border border-white/5 bg-[#16161a]">
      {/* Header row */}
      <div className="flex items-center gap-3 px-5 py-4">
        {/* Quota orb */}
        <div
          className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
          style={{
            background: isFull ? "rgba(239,68,68,0.15)" : "rgba(99,102,241,0.15)",
            color: isFull ? "#f87171" : "#a78bfa",
            border: `1px solid ${isFull ? "rgba(239,68,68,0.25)" : "rgba(99,102,241,0.25)"}`,
          }}
        >
          {token.remainingQuota}/{token.totalQuota}
        </div>

        {/* Token info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white/90 font-mono">{token.id}</span>
            {token.label && (
              <span className="text-[10px] px-2 py-0.5 rounded-md text-white/50 bg-white/5 truncate max-w-[120px]">
                {token.label}
              </span>
            )}
          </div>
          <div className="text-[11px] text-white/30 mt-0.5">
            {usedCount} of {token.totalQuota} used · Created {new Date(token.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onCopy(token.id, `tokenId-${token.id}`)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition-colors flex items-center gap-1.5"
          >
            {copied === `tokenId-${token.id}` ? <><IconCheck /> Copied ID!</> : <><IconCopy /> Copy ID</>}
          </button>
          <button
            onClick={() => onCopy(`/bundle/${token.id}`, `token-${token.id}`)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-green-500/30 text-green-400 hover:bg-green-500/10 transition-colors flex items-center gap-1.5"
          >
            {copied === `token-${token.id}` ? <><IconCheck /> Copied Link!</> : <><IconCopy /> Copy Link</>}
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            className="px-2.5 py-1.5 rounded-lg border border-white/10 text-white/50 hover:bg-white/5 transition-colors flex items-center gap-1"
          >
            <IconChevron open={open} />
          </button>
          <button
            onClick={() => onDelete(token.id)}
            className="px-2.5 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <IconTrash />
          </button>
        </div>
      </div>

      {/* Expanded view — linked mixtapes */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-white/5"
          >
            <div className="px-5 py-4 flex flex-col gap-2">
              <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">
                Mixtapes Created with This Token
              </p>
              {linked.length === 0 ? (
                <p className="text-xs text-white/30 italic">No mixtapes created yet.</p>
              ) : (
                linked.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: m.color || "#e11d48" }} />
                    <span className="text-xs font-mono text-white/70 flex-1">/{m.id}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${m.status === "published" ? "bg-blue-500/20 text-blue-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                      {m.status}
                    </span>
                    <a href={m.studioUrl} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white/70 transition-colors">
                      <IconExternalLink />
                    </a>
                  </div>
                ))
              )}
              {/* Empty slots */}
              {token.remainingQuota > 0 && (
                <div className="flex flex-col gap-1 mt-1">
                  {Array.from({ length: token.remainingQuota }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-white/10">
                      <div className="w-2 h-2 rounded-full shrink-0 bg-white/15" />
                      <span className="text-[11px] text-white/20 italic">Empty slot</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Dashboard ──────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [mixtapes, setMixtapes] = useState<MixtapeEntry[]>([]);
  const [tokens, setTokens] = useState<BundleToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTokens, setLoadingTokens] = useState(false);

  const [mainTab, setMainTab] = useState<"mixtapes" | "tokens">("mixtapes");
  const [activeTab, setActiveTab] = useState<"all" | "published" | "draft">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [showNew, setShowNew] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newSlug, setNewSlug] = useState("");

  const [showRename, setShowRename] = useState<MixtapeEntry | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [renameSlug, setRenameSlug] = useState("");

  const [deleting, setDeleting] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // Token generation modal
  const [showNewToken, setShowNewToken] = useState(false);
  const [newTokenLabel, setNewTokenLabel] = useState("");
  const [generatingToken, setGeneratingToken] = useState(false);

  const fetchMixtapes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/mixtapes");
      if (res.ok) setMixtapes(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTokens = useCallback(async () => {
    setLoadingTokens(true);
    try {
      const res = await fetch("/api/tokens");
      if (res.ok) setTokens(await res.json());
    } finally {
      setLoadingTokens(false);
    }
  }, []);

  useEffect(() => {
    fetch("/api/mixtapes")
      .then((r) => {
        if (r.ok) {
          setAuthed(true);
          r.json().then(setMixtapes).finally(() => setLoading(false));
          // Also fetch tokens
          fetch("/api/tokens").then((tr) => { if (tr.ok) tr.json().then(setTokens); });
        } else {
          setAuthed(false);
          setLoading(false);
        }
      })
      .catch(() => { setAuthed(false); setLoading(false); });
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    window.location.reload();
  };

  const copy = (text: string, key: string) => {
    const fullText = text.startsWith("/") ? window.location.origin + text : text;
    navigator.clipboard.writeText(fullText);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlug) return;
    setCreating(true);
    const id = newSlug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");
    try {
      await fetch("/api/mixtapes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mixtapeId: id, status: "draft", color: "#A2C4C9", createdAt: new Date().toISOString() }),
      });
      await fetchMixtapes();
      setShowNew(false);
      setNewSlug("");
    } finally {
      setCreating(false);
    }
  };

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRename || !renameSlug) return;
    setRenaming(true);
    const newId = renameSlug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");
    try {
      const res = await fetch(`/api/mixtapes/${showRename.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newId }),
      });
      if (res.ok) { await fetchMixtapes(); setShowRename(null); setRenameSlug(""); }
      else { const err = await res.json(); alert(err.error || "Gagal mengganti nama"); }
    } finally {
      setRenaming(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`Hapus mixtape /${id}? Tindakan ini tidak bisa dibatalkan.\n\nNOTE: Kuota bundle token TIDAK dikembalikan.`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/mixtapes/${id}`, { method: "DELETE" });
      if (res.ok) await fetchMixtapes();
      else alert("Gagal menghapus");
    } finally {
      setDeleting(null);
    }
  };

  const handleGenerateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratingToken(true);
    try {
      const res = await fetch("/api/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quota: 3, label: newTokenLabel.trim() || undefined }),
      });
      if (res.ok) {
        await fetchTokens();
        setShowNewToken(false);
        setNewTokenLabel("");
      } else {
        alert("Gagal membuat token");
      }
    } finally {
      setGeneratingToken(false);
    }
  };

  const handleDeleteToken = async (id: string) => {
    if (!confirm(`Hapus bundle token ${id}? Pelanggan tidak bisa lagi mengakses halaman bundle mereka.`)) return;
    try {
      await fetch(`/api/tokens?id=${id}`, { method: "DELETE" });
      await fetchTokens();
    } catch {
      alert("Gagal menghapus token");
    }
  };

  const filteredMixtapes = useMemo(() => {
    return mixtapes
      .filter((m) => (activeTab === "all" ? true : activeTab === "published" ? m.status === "published" : m.status !== "published"))
      .filter((m) => (searchQuery ? m.id.includes(searchQuery.toLowerCase()) : true))
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }, [mixtapes, activeTab, searchQuery]);

  if (authed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0d0d14" }}>
        <div className="w-7 h-7 rounded-full border-2 animate-spin" style={{ borderColor: "rgba(255,255,255,0.08)", borderTopColor: "rgba(167,139,250,0.6)" }} />
      </div>
    );
  }

  if (!authed) return <LoginScreen onLogin={() => { setAuthed(true); fetchMixtapes(); }} />;

  return (
    <div className="min-h-screen relative font-sans" style={{ background: "#0d0d14", color: "#f5f5f5" }}>
      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute" style={{ width: 800, height: 800, top: -200, left: -200, background: "radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 65%)", filter: "blur(60px)" }} />
      </div>

      {/* Topbar */}
      <div className="sticky top-0 z-20" style={{ background: "rgba(13,13,20,0.85)", borderBottom: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(20px)" }}>
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-serif italic text-xl">mixtape<span className="text-pink-500">·</span>admin</span>
          </div>
          <button onClick={handleLogout} className="px-4 py-1.5 rounded-lg text-xs font-medium border transition-all hover:bg-white/5" style={{ color: "rgba(255,255,255,0.5)", borderColor: "rgba(255,255,255,0.1)" }}>
            Logout
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-6 relative z-10">

        {/* ── Main Tab Switcher (Mixtapes vs Tokens) ── */}
        <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: "#16161a", border: "1px solid rgba(255,255,255,0.05)" }}>
          <button
            onClick={() => setMainTab("mixtapes")}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${mainTab === "mixtapes" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"}`}
          >
            <IconTape />
            Mixtapes
            <span className="px-2 py-0.5 rounded-md text-[10px]" style={{ background: mainTab === "mixtapes" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)" }}>
              {mixtapes.length}
            </span>
          </button>
          <button
            onClick={() => { setMainTab("tokens"); fetchTokens(); }}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${mainTab === "tokens" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"}`}
          >
            <IconToken />
            Bundle Tokens
            <span className="px-2 py-0.5 rounded-md text-[10px]" style={{ background: mainTab === "tokens" ? "rgba(99,102,241,0.4)" : "rgba(99,102,241,0.15)", color: mainTab === "tokens" ? "white" : "rgba(167,139,250,0.8)" }}>
              {tokens.length}
            </span>
          </button>
        </div>

        {/* ── MIXTAPES TAB ── */}
        {mainTab === "mixtapes" && (
          <>
            {/* Sub-tabs & search */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex gap-1 p-1 rounded-xl" style={{ background: "#16161a", border: "1px solid rgba(255,255,255,0.05)" }}>
                {(["all", "published", "draft"] as const).map((tab) => {
                  const count = tab === "all" ? mixtapes.length : tab === "published" ? mixtapes.filter(m => m.status === "published").length : mixtapes.filter(m => m.status !== "published").length;
                  const color = tab === "published" ? "#3b82f6" : tab === "draft" ? "#eab308" : undefined;
                  return (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === tab ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"}`}>
                      {tab === "all" ? "Semua" : tab === "published" ? "Published" : "Live Drafts"}
                      <span className="px-2 py-0.5 rounded-md text-[10px] min-w-[20px] text-center" style={{ background: activeTab === tab && color ? color : activeTab === tab ? "rgba(255,255,255,0.15)" : color ? `${color}4D` : "rgba(255,255,255,0.05)" }}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 mt-[1px] text-white/40 flex items-center justify-center"><IconSearch /></span>
                  <input type="text" placeholder="Cari link..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#16161a] border border-white/5 rounded-xl py-2 pl-8 pr-3 text-sm text-white focus:outline-none focus:border-white/20 transition-all" />
                </div>
                <button onClick={() => setShowNew(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest text-white transition-all active:scale-95 shrink-0"
                  style={{ background: "linear-gradient(135deg, #e11d48, #9d174d)" }}>
                  + New
                </button>
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => <div key={i} className="h-32 bg-[#16161a] rounded-2xl animate-pulse" />)}
              </div>
            ) : filteredMixtapes.length === 0 ? (
              <div className="text-center py-20 bg-[#16161a] rounded-2xl border border-white/5">
                <div className="text-white/30 mb-4 flex justify-center"><IconTape className="w-12 h-12" /></div>
                <h3 className="text-lg font-semibold text-white/90">Belum ada mixtape</h3>
                <p className="text-sm text-white/40 mt-1">Buat mixtape pertama Anda dengan tombol + New</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <AnimatePresence>
                  {filteredMixtapes.map((m) => (
                    <motion.div key={m.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                      className="relative overflow-hidden bg-[#16161a] border border-white/5 hover:border-white/10 hover:shadow-2xl hover:shadow-black/50 rounded-2xl p-5 flex flex-col transition-all group">
                      <div className="absolute top-0 left-0 right-0 h-[3px] opacity-70 group-hover:opacity-100 transition-opacity" style={{ background: m.color || "#e11d48", boxShadow: `0 0 10px ${m.color || "#e11d48"}80` }} />
                      <div className="flex justify-between items-start mb-2 mt-1">
                        <div className="text-[10px] font-mono text-white/40">/{m.id}</div>
                        <div className="text-[10px] text-white/30">{m.createdAt ? new Date(m.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "Unknown"}</div>
                      </div>
                      <h3 className="text-[15px] font-medium text-white/90 truncate mb-1 tracking-tight text-center">{m.id}</h3>
                      {/* Token badge */}
                      {m.token && (
                        <div className="text-center mb-3">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md" style={{ background: "rgba(99,102,241,0.15)", color: "#a78bfa" }}>
                            🔑 {m.token}
                          </span>
                        </div>
                      )}
                      <div className="mt-auto flex flex-wrap gap-2">
                        <button onClick={() => window.open(m.studioUrl, "_blank")} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition-colors">Studio</button>
                        {m.status === "published" && (
                          <button onClick={() => window.open(m.giftUrl, "_blank")} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 transition-colors">Preview</button>
                        )}
                        <button onClick={() => copy(m.studioUrl, `s-${m.id}`)} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-green-500/30 text-green-400 hover:bg-green-500/10 transition-colors">
                          {copied === `s-${m.id}` ? "Copied!" : "Copy Link"}
                        </button>
                        <button onClick={() => { setRenameSlug(m.id); setShowRename(m); }} className="px-2 py-1.5 rounded-lg border border-white/10 text-white/60 hover:bg-white/5 transition-colors"><IconSettings /></button>
                        <button onClick={() => handleDelete(m.id)} disabled={deleting === m.id} className="px-2 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"><IconTrash /></button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
        )}

        {/* ── TOKENS TAB ── */}
        {mainTab === "tokens" && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white/90">Bundle Tokens</h2>
                <p className="text-xs text-white/30 mt-0.5">Setiap token memberikan 3 kuota pembuatan mixtape kepada pembeli.</p>
              </div>
              <button
                onClick={() => setShowNewToken(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest text-white transition-all active:scale-95 flex items-center gap-2"
                style={{ background: "linear-gradient(135deg, #6366f1, #7c3aed)" }}
              >
                <IconPlus /> Generate Token
              </button>
            </div>

            {loadingTokens ? (
              <div className="flex flex-col gap-3">
                {[1, 2].map(i => <div key={i} className="h-16 bg-[#16161a] rounded-2xl animate-pulse" />)}
              </div>
            ) : tokens.length === 0 ? (
              <div className="text-center py-20 bg-[#16161a] rounded-2xl border border-white/5">
                <div className="text-white/30 mb-4 flex justify-center"><IconKey className="w-12 h-12" /></div>
                <h3 className="text-lg font-semibold text-white/90">Belum ada token</h3>
                <p className="text-sm text-white/40 mt-1">Tekan "Generate Token" untuk membuat kode bundle pertama.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {tokens.map((token) => (
                  <TokenRow
                    key={token.id}
                    token={token}
                    mixtapes={mixtapes}
                    onDelete={handleDeleteToken}
                    onCopy={copy}
                    copied={copied}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {/* New Mixtape Modal */}
        {showNew && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowNew(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#141414] border border-white/10 rounded-2xl p-6 w-full max-w-sm">
              <h2 className="text-lg font-bold mb-4">Buat Mixtape Satuan</h2>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] uppercase tracking-widest text-white/50">URL Link (Slug)</label>
                  <button type="button" onClick={() => { const rand = Math.random().toString(36).substring(2, 9); setNewSlug(`mixtape-${rand}`); }}
                    className="text-[10px] text-pink-400 hover:text-pink-300 transition-colors font-medium">Auto Generate</button>
                </div>
                <input type="text" value={newSlug} onChange={(e) => setNewSlug(e.target.value)} placeholder="contoh: untuk-dia"
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30" required />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowNew(false)} className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-xs font-semibold text-white/70 hover:bg-white/5">Batal</button>
                <button onClick={handleCreate} disabled={creating || !newSlug} className="flex-1 px-4 py-3 rounded-xl border-none text-xs font-bold text-white uppercase tracking-widest disabled:opacity-50" style={{ background: "linear-gradient(135deg, #e11d48, #9d174d)" }}>
                  {creating ? "..." : "Buat"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Rename Modal */}
        {showRename && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowRename(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#141414] border border-white/10 rounded-2xl p-6 w-full max-w-sm">
              <h2 className="text-lg font-bold mb-2">Pengaturan Mixtape</h2>
              <p className="text-xs text-yellow-500 mb-4">Peringatan: Mengganti URL Link akan mematikan link lama.</p>
              <div className="mb-4">
                <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-2">URL Link (Slug)</label>
                <input type="text" value={renameSlug} onChange={(e) => setRenameSlug(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30" required />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowRename(null)} className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-xs font-semibold text-white/70 hover:bg-white/5">Batal</button>
                <button onClick={handleRename} disabled={renaming || !renameSlug} className="flex-1 px-4 py-3 rounded-xl border-none text-xs font-bold text-white uppercase tracking-widest disabled:opacity-50 bg-blue-600">
                  {renaming ? "..." : "Simpan"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Generate Token Modal */}
        {showNewToken && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowNewToken(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#141414] border border-white/10 rounded-2xl p-6 w-full max-w-sm">
              <h2 className="text-lg font-bold mb-1">Generate Bundle Token</h2>
              <p className="text-xs text-white/40 mb-5">Token baru akan memiliki kuota 3 mixtape. Bagikan kodenya ke pembeli setelah pembayaran.</p>
              <div className="mb-5">
                <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-2">
                  Label Pembeli <span className="text-white/20">(opsional)</span>
                </label>
                <input
                  type="text"
                  value={newTokenLabel}
                  onChange={(e) => setNewTokenLabel(e.target.value)}
                  placeholder="contoh: Budi Santoso / IG @budi"
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30"
                  autoFocus
                />
                <p className="text-[10px] text-white/25 mt-1.5">Hanya untuk referensi Anda di admin. Tidak terlihat oleh pembeli.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setShowNewToken(false); setNewTokenLabel(""); }} className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-xs font-semibold text-white/70 hover:bg-white/5">Batal</button>
                <button onClick={handleGenerateToken} disabled={generatingToken}
                  className="flex-1 px-4 py-3 rounded-xl border-none text-xs font-bold text-white uppercase tracking-widest disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #6366f1, #7c3aed)" }}>
                  {generatingToken ? "..." : "Generate 🔑"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
