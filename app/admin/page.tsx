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
  studioUrl: string;
  giftUrl: string;
}

// ── Icons ──────────────────────────────────────────────────────────────────────
const IconTape = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
const IconLogout = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
  </svg>
);
const IconGrid = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const IconSettings = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
  </svg>
);
const IconTrash = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
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
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        background: "#0d0d14",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "440px",
          margin: "0 16px",
          animation: "fadeIn 0.5s ease-out",
        }}
      >
        <div
          style={{
            borderRadius: "24px",
            padding: "40px 32px",
            background: "#16161a",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "32px" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
                background: "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(168,85,247,0.3))",
                border: "1px solid rgba(168,85,247,0.3)",
                boxShadow: "0 0 32px rgba(99,102,241,0.2)",
              }}
            >
              <div style={{ color: "#a78bfa" }}>
                <IconTape />
              </div>
            </div>
            <h1 style={{ fontSize: "24px", fontWeight: 600, color: "rgba(255,255,255,0.95)", margin: 0 }}>
              Mixtape Admin
            </h1>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.35)", marginTop: "4px", marginBottom: 0 }}>
              Masukkan password untuk akses
            </p>
          </div>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                padding: "12px 16px",
                borderRadius: "12px",
                background: "rgba(0,0,0,0.2)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <input
                type="password"
                placeholder="Password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "white",
                  outline: "none",
                  width: "100%",
                  fontSize: "15px",
                }}
              />
            </div>
            {error && <p style={{ color: "#f87171", fontSize: "13px", margin: 0 }}>{error}</p>}
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "14px",
                borderRadius: "12px",
                border: "none",
                background: "white",
                color: "black",
                fontWeight: 600,
                fontSize: "15px",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Loading..." : "Masuk"}
            </button>
          </form>
          <p style={{ textAlign: "center", fontSize: "12px", marginTop: "20px", color: "rgba(255,255,255,0.18)" }}>
            mixtape — made with love
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Dashboard ──────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [mixtapes, setMixtapes] = useState<MixtapeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
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

  const fetchMixtapes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/mixtapes");
      if (res.ok) setMixtapes(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch("/api/mixtapes")
      .then((r) => {
        if (r.ok) {
          setAuthed(true);
          r.json().then(setMixtapes).finally(() => setLoading(false));
        } else {
          setAuthed(false);
        }
      })
      .catch(() => setAuthed(false));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    window.location.reload();
  };

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(window.location.origin + text);
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
        body: JSON.stringify({
          mixtapeId: id,
          status: "draft",
          color: "#A2C4C9",
          createdAt: new Date().toISOString(),
        }),
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
      if (res.ok) {
        await fetchMixtapes();
        setShowRename(null);
        setRenameSlug("");
      } else {
        const err = await res.json();
        alert(err.error || "Gagal mengganti nama");
      }
    } finally {
      setRenaming(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`Hapus mixtape /${id}? Tindakan ini tidak bisa dibatalkan.`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/mixtapes/${id}`, { method: "DELETE" });
      if (res.ok) await fetchMixtapes();
      else alert("Gagal menghapus");
    } finally {
      setDeleting(null);
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
        
        {/* Header Area */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: "#16161a", border: "1px solid rgba(255,255,255,0.05)" }}>
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${activeTab === "all" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"}`}
            >
              Semua Mixtape
              <span className="px-2 py-0.5 rounded-md text-[10px] min-w-[20px] text-center flex items-center justify-center" style={{ background: activeTab === "all" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)" }}>
                {mixtapes.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("published")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${activeTab === "published" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"}`}
            >
              Published
              <span className="px-2 py-0.5 rounded-md text-[10px] min-w-[20px] text-center flex items-center justify-center" style={{ background: activeTab === "published" ? "#3b82f6" : "rgba(59,130,246,0.3)" }}>
                {mixtapes.filter(m => m.status === "published").length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("draft")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${activeTab === "draft" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"}`}
            >
              Live Drafts
              <span className="px-2 py-0.5 rounded-md text-[10px] min-w-[20px] text-center flex items-center justify-center" style={{ background: activeTab === "draft" ? "#eab308" : "rgba(234,179,8,0.3)" }}>
                {mixtapes.filter(m => m.status !== "published").length}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-xs">🔍</span>
              <input
                type="text"
                placeholder="Cari link..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#16161a] border border-white/5 rounded-xl py-2 pl-8 pr-3 text-sm text-white focus:outline-none focus:border-white/20 transition-all"
              />
            </div>
            <button
              onClick={() => setShowNew(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest text-white transition-all active:scale-95 shrink-0"
              style={{ background: "linear-gradient(135deg, #e11d48, #9d174d)" }}
            >
              + New
            </button>
          </div>
        </div>

        {/* Grid Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-[#16161a] rounded-2xl animate-pulse" />)}
          </div>
        ) : filteredMixtapes.length === 0 ? (
          <div className="text-center py-20 bg-[#16161a] rounded-2xl border border-white/5">
            <div className="text-4xl mb-4 opacity-50">💽</div>
            <h3 className="text-lg font-semibold text-white/90">Tidak ada mixtape</h3>
            <p className="text-sm text-white/40 mt-1">Buat mixtape pertama Anda dengan tombol + New</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredMixtapes.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative overflow-hidden bg-[#16161a] border border-white/5 hover:border-white/10 hover:shadow-2xl hover:shadow-black/50 rounded-2xl p-5 flex flex-col transition-all group"
                >
                  <div className="absolute top-0 left-0 right-0 h-[3px] opacity-70 group-hover:opacity-100 transition-opacity" style={{ background: m.color || "#e11d48", boxShadow: `0 0 10px ${m.color || "#e11d48"}80` }} />
                  <div className="flex justify-between items-start mb-2 mt-1">
                    <div className="text-[10px] font-mono text-white/40 mb-1">/{m.id}</div>
                    <div className="text-[10px] text-white/30">{m.createdAt ? new Date(m.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' }) : "Unknown"}</div>
                  </div>
                  <h3 className="text-[15px] font-medium text-white/90 truncate mb-5 tracking-tight text-center">
                    {m.id}
                  </h3>
                  
                  <div className="mt-auto flex flex-wrap gap-2">
                    <button onClick={() => window.open(m.studioUrl, "_blank")} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition-colors">
                      Studio
                    </button>
                    {m.status === "published" && (
                      <button onClick={() => window.open(m.giftUrl, "_blank")} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 transition-colors">
                        Preview
                      </button>
                    )}
                    <button onClick={() => copy(m.studioUrl, `s-${m.id}`)} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-green-500/30 text-green-400 hover:bg-green-500/10 transition-colors">
                      {copied === `s-${m.id}` ? "Copied!" : "Copy Link"}
                    </button>
                    <button onClick={() => { setRenameSlug(m.id); setShowRename(m); }} className="px-2 py-1.5 rounded-lg border border-white/10 text-white/60 hover:bg-white/5 transition-colors" title="Settings">
                      <IconSettings />
                    </button>
                    <button onClick={() => handleDelete(m.id)} disabled={deleting === m.id} className="px-2 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors" title="Delete">
                      <IconTrash />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

      </div>

      {/* ── Modals ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {/* New Modal */}
        {showNew && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowNew(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#141414] border border-white/10 rounded-2xl p-6 w-full max-w-sm"
            >
              <h2 className="text-lg font-bold mb-4">Buat Mixtape Baru</h2>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] uppercase tracking-widest text-white/50">URL Link (Slug)</label>
                  <button 
                    type="button"
                    onClick={() => {
                      const rand = Math.random().toString(36).substring(2, 9);
                      setNewSlug(`auto-${rand}`);
                    }}
                    className="text-[10px] text-pink-400 hover:text-pink-300 transition-colors font-medium flex items-center gap-1"
                  >
                    Auto Generate ✨
                  </button>
                </div>
                <input
                  type="text"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  placeholder="contoh: untuk-dia"
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowNew(false)} className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-xs font-semibold text-white/70 hover:bg-white/5">
                  Batal
                </button>
                <button onClick={handleCreate} disabled={creating || !newSlug} className="flex-1 px-4 py-3 rounded-xl border-none text-xs font-bold text-white uppercase tracking-widest disabled:opacity-50" style={{ background: "linear-gradient(135deg, #e11d48, #9d174d)" }}>
                  {creating ? "..." : "Buat"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Rename Modal */}
        {showRename && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowRename(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#141414] border border-white/10 rounded-2xl p-6 w-full max-w-sm"
            >
              <h2 className="text-lg font-bold mb-2">Pengaturan Mixtape</h2>
              <p className="text-xs text-yellow-500 mb-4">Peringatan: Mengganti URL Link akan mematikan link lama.</p>
              <div className="mb-4">
                <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-2">URL Link (Slug)</label>
                <input
                  type="text"
                  value={renameSlug}
                  onChange={(e) => setRenameSlug(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowRename(null)} className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-xs font-semibold text-white/70 hover:bg-white/5">
                  Batal
                </button>
                <button onClick={handleRename} disabled={renaming || !renameSlug} className="flex-1 px-4 py-3 rounded-xl border-none text-xs font-bold text-white uppercase tracking-widest disabled:opacity-50 bg-blue-600">
                  {renaming ? "..." : "Simpan"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
