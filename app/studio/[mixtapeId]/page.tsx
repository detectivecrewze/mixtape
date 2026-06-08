"use client";

import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useReducer,
} from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import CassettePlayer from "@/components/mixtape/CassettePlayer";
import NoteCard from "@/components/mixtape/NoteCard";
import { CASSETTE_COLORS, PASTEL_MAP, type CassetteColorId } from "@/lib/constants";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getColorId(hex: string): CassetteColorId {
  const found = CASSETTE_COLORS.find((c) => c.hex === hex);
  return (found?.id ?? "blue") as CassetteColorId;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const WORKER = "https://valentine-upload.aldoramadhan16.workers.dev";
const MAX_PHOTOS = 20;
const TOTAL_STEPS = 7;

// ─── Types ────────────────────────────────────────────────────────────────────
interface PhotoItem {
  id: string;
  url: string | null;
  localPreview: string | null;
  caption: string;
  status: "uploading" | "success" | "error";
  errorMsg?: string;
}

interface LibMusic {
  url: string | null;
  title: string;
  artist: string;
  coverUrl: string | null;
}

interface UplMusic {
  url: string | null;
  title: string;
}

interface VoiceNote {
  url: string | null;
  duration: number | null;
  mimeType: string | null;
}

interface StudioState {
  color: string;
  photos: PhotoItem[];
  note: string;
  voiceNote: VoiceNote;
  musicMode: "library" | "upload";
  libMusic: LibMusic;
  uplMusic: UplMusic;
  voiceVolume: number;
  ambientVolume: number;
  password: string;
  passwordHint: string;
}

type VoiceState = "idle" | "requesting" | "recording" | "preview" | "saved";

interface Song {
  title: string;
  artist: string;
  audioUrl: string;
  coverUrl?: string;
}

// ─── Step Indicator ───────────────────────────────────────────────────────────
function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center" style={{ gap: 6, marginBottom: 40 }}>
      {Array.from({ length: total }, (_, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <React.Fragment key={n}>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300"
              style={{
                background: active ? "#111" : done ? "#111" : "rgba(0,0,0,0.12)",
                color: active || done ? "#fff" : "rgba(0,0,0,0.35)",
                fontFamily: "var(--font-space-mono)",
              }}
            >
              {done ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : n}
            </div>
            {n < total && (
              <div
                className="h-px w-6"
                style={{ background: done ? "#111" : "rgba(0,0,0,0.15)", transition: "background 0.3s" }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Step Title ───────────────────────────────────────────────────────────────
function StepTitle({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <h2
      className="text-center text-sm font-bold tracking-[0.22em] uppercase"
      style={{ fontFamily: "var(--font-space-mono)", marginBottom: 36, ...style }}
    >
      {children}
    </h2>
  );
}

// ─── Nav Buttons ──────────────────────────────────────────────────────────────
function NavButtons({
  step,
  onBack,
  onNext,
  nextLabel,
  nextDisabled,
  isLoading,
}: {
  step: number;
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  isLoading?: boolean;
}) {
  return (
    <div className="flex" style={{ gap: 12, marginTop: 48 }}>
      {step > 1 && (
        <button
          onClick={onBack}
          className="flex-1 py-5 rounded-2xl font-bold text-sm tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2"
          style={{
            fontFamily: "var(--font-space-mono)",
            border: "2px solid #111",
            background: "white",
            color: "#111",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>
      )}
      <button
        onClick={onNext}
        disabled={nextDisabled || isLoading}
        className="flex-1 py-5 rounded-2xl font-bold text-sm tracking-wider transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
        style={{
          fontFamily: "var(--font-space-mono)",
          background: nextDisabled || isLoading ? "#555" : "#111",
          color: "white",
        }}
      >
        {isLoading ? "Saving..." : (nextLabel ?? (
          <>
            Next
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 2l5 5-5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </>
        ))}
      </button>
    </div>
  );
}

// ─── Photo Uploader Helpers ───────────────────────────────────────────────────
async function compressImage(file: File): Promise<File> {
  const MAX_DIM = 1080;
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > height && width > MAX_DIM) {
        height = Math.round((height * MAX_DIM) / width);
        width = MAX_DIM;
      } else if (height > MAX_DIM) {
        width = Math.round((width * MAX_DIM) / height);
        height = MAX_DIM;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) return resolve(file);
          resolve(
            new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, "") + ".jpg",
              { type: "image/jpeg" }
            )
          );
        },
        "image/jpeg",
        0.75
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

async function uploadPhotoToR2(file: File, mixtapeId: string): Promise<string | null> {
  try {
    const compressed = await compressImage(file);
    const formData = new FormData();
    formData.append("file", compressed);
    formData.append("mixtapeId", mixtapeId);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) return null;
    const result = await res.json();
    return result.url ?? null;
  } catch {
    return null;
  }
}

// ─── Waveform Bar Component ───────────────────────────────────────────────────
function WaveformBars({ analyser }: { analyser: AnalyserNode | null }) {
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!analyser) return;
    const data = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      analyser.getByteFrequencyData(data);
      barsRef.current.forEach((bar, i) => {
        if (!bar) return;
        const v = data[i] || 0;
        const h = Math.max(4, Math.min(40, (v / 180) * 40));
        bar.style.height = `${h}px`;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [analyser]);

  return (
    <div className="flex items-center gap-[3px] h-12 justify-center">
      {Array.from({ length: 20 }, (_, i) => (
        <div
          key={i}
          ref={(el) => { barsRef.current[i] = el; }}
          className="w-[3px] rounded-full transition-none"
          style={{ height: 4, background: "#111", borderRadius: 4 }}
        />
      ))}
    </div>
  );
}

// ─── Main Studio Page ─────────────────────────────────────────────────────────
export default function StudioPage() {
  const params = useParams<{ mixtapeId: string }>();
  const mixtapeId = params?.mixtapeId ?? "";

  const [step, setStep] = useState(1);
  const [isPublishing, setIsPublishing] = useState(false);
  const [giftUrl, setGiftUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState("");

  // ── Main state ──────────────────────────────────────────────────────────────
  const [isInitializing, setIsInitializing] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [st, setSt] = useState<StudioState>({
    color: CASSETTE_COLORS[0].hex,
    photos: [],
    note: "",
    voiceNote: { url: null, duration: null, mimeType: null },
    musicMode: "library",
    libMusic: { url: null, title: "", artist: "", coverUrl: null },
    uplMusic: { url: null, title: "" },
    voiceVolume: 1.0,
    ambientVolume: 0.25,
    password: "",
    passwordHint: "",
  });

  // ── Fetch existing data ─────────────────────────────────────────────────────
  useEffect(() => {
    async function loadExisting() {
      try {
        const res = await fetch(`/api/mixtapes/${mixtapeId}`);
        if (res.status === 404) {
          setIsNotFound(true);
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setSt({
            color: data.color || CASSETTE_COLORS[0].hex,
            photos: (data.photos || []).map((p: any, i: number) => ({
              id: `existing_${i}`,
              url: p.url,
              localPreview: null,
              caption: p.caption || "",
              status: "success",
            })),
            note: data.note || "",
            voiceNote: data.voiceNote || { url: null, duration: null, mimeType: null },
            musicMode: data.backsound?.artist ? "library" : "upload",
            libMusic: {
              url: data.backsound?.url || null,
              title: data.backsound?.title || "",
              artist: data.backsound?.artist || "",
              coverUrl: null,
            },
            uplMusic: {
              url: data.backsound?.artist ? null : (data.backsound?.url || null),
              title: data.backsound?.artist ? "" : (data.backsound?.title || ""),
            },
            voiceVolume: data.voiceVolume ?? 1.0,
            ambientVolume: data.ambientVolume ?? 0.25,
            password: data.password || "",
            passwordHint: data.passwordHint || "",
          });
          
          if (data.voiceNote?.url) {
            setVoiceState("saved");
          }
        }
      } catch (err) {
        console.error("Failed to fetch existing mixtape:", err);
      } finally {
        setIsInitializing(false);
      }
    }
    loadExisting();
  }, [mixtapeId]);

  // ── Photo upload state ──────────────────────────────────────────────────────
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // ── Voice recorder state ────────────────────────────────────────────────────
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [recSeconds, setRecSeconds] = useState(0);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const previewBlobRef = useRef<string | null>(null);
  const previewMimeRef = useRef<string>("");
  const previewBlobObjRef = useRef<Blob | null>(null);

  // ── Music state ─────────────────────────────────────────────────────────────
  const [songs, setSongs] = useState<Song[]>([]);
  const [showLibrary, setShowLibrary] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [previewingSong, setPreviewingSong] = useState<string | null>(null);
  const libraryAudioRef = useRef<HTMLAudioElement | null>(null);
  const [musicUploading, setMusicUploading] = useState(false);
  const musicFileInputRef = useRef<HTMLInputElement>(null);

  // ── Combined mixer ──────────────────────────────────────────────────────────
  const mixerCtxRef = useRef<AudioContext | null>(null);
  const voiceGainRef = useRef<GainNode | null>(null);
  const ambientGainRef = useRef<GainNode | null>(null);
  const mixerVoiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const mixerAmbientAudioRef = useRef<HTMLAudioElement | null>(null);
  const [mixerPlaying, setMixerPlaying] = useState(false);

  // ── Autosave ref ────────────────────────────────────────────────────────────
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Toast helper ────────────────────────────────────────────────────────────
  const showToast = useCallback((msg: string, ms = 3000) => {
    setToast(msg);
    setTimeout(() => setToast(""), ms);
  }, []);

  // ── Autosave ────────────────────────────────────────────────────────────────
  const triggerAutosave = useCallback(
    (state: StudioState) => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
      autosaveTimer.current = setTimeout(async () => {
        try {
          const ambientUrl =
            state.musicMode === "library"
              ? state.libMusic.url
              : state.uplMusic.url;
          const payload = {
            color: state.color,
            photos: state.photos
              .filter((p) => p.status === "success")
              .map((p) => ({ url: p.url, caption: p.caption })),
            note: state.note,
            voiceNote: state.voiceNote,
            backsound: {
              url: ambientUrl,
              title:
                state.musicMode === "library"
                  ? state.libMusic.title
                  : state.uplMusic.title,
              artist: state.libMusic.artist,
            },
            voiceVolume: state.voiceVolume,
            ambientVolume: state.ambientVolume,
            password: state.password || null,
            passwordHint: state.passwordHint,
          };
          await fetch(`/api/autosave?id=${mixtapeId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        } catch {}
      }, 3000);
    },
    [mixtapeId]
  );

  const update = useCallback(
    (patch: Partial<StudioState>) => {
      setSt((prev) => {
        const next = { ...prev, ...patch };
        triggerAutosave(next);
        return next;
      });
    },
    [triggerAutosave]
  );

  // ── Fetch songs ─────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/assets/playlist.json")
      .then((r) => r.json())
      .then(setSongs)
      .catch(() => setSongs([]));
  }, []);

  // ── STEP 2: Photo handling ──────────────────────────────────────────────────
  const handlePhotoFiles = useCallback(
    async (files: File[]) => {
      const slots =
        MAX_PHOTOS -
        st.photos.filter(
          (p) => p.status === "success" || p.status === "uploading"
        ).length;
      const toProcess = files
        .filter(
          (f) =>
            f.type.startsWith("image/") ||
            f.name.toLowerCase().endsWith(".heic")
        )
        .slice(0, slots);

      if (!toProcess.length) return;

      const placeholders: PhotoItem[] = toProcess.map((_, idx) => ({
        id: `photo_${Date.now()}_${idx}`,
        url: null,
        localPreview: null,
        caption: "",
        status: "uploading",
      }));

      setSt((prev) => {
        const next = { ...prev, photos: [...prev.photos, ...placeholders] };
        triggerAutosave(next);
        return next;
      });

      // Upload with local preview
      toProcess.forEach(async (file, idx) => {
        const id = placeholders[idx].id;
        const preview = URL.createObjectURL(file);
        setSt((prev) => ({
          ...prev,
          photos: prev.photos.map((p) =>
            p.id === id ? { ...p, localPreview: preview } : p
          ),
        }));

        const url = await uploadPhotoToR2(file, mixtapeId);
        if (preview) URL.revokeObjectURL(preview);

        setSt((prev) => {
          const next = {
            ...prev,
            photos: prev.photos.map((p) =>
              p.id === id
                ? url
                  ? { ...p, url, status: "success" as const, localPreview: null }
                  : { ...p, status: "error" as const, localPreview: null, errorMsg: "Upload failed" }
                : p
            ),
          };
          triggerAutosave(next);
          return next;
        });
      });
    },
    [st.photos, triggerAutosave]
  );

  const removePhoto = useCallback((id: string) => {
    setSt((prev) => ({
      ...prev,
      photos: prev.photos.filter((p) => p.id !== id),
    }));
  }, []);

  const updateCaption = useCallback((id: string, caption: string) => {
    setSt((prev) => ({
      ...prev,
      photos: prev.photos.map((p) => (p.id === id ? { ...p, caption } : p)),
    }));
  }, []);

  const movePhoto = useCallback((index: number, direction: "left" | "right") => {
    setSt((prev) => {
      const arr = [...prev.photos];
      if (direction === "left" && index > 0) {
        [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
      } else if (direction === "right" && index < arr.length - 1) {
        [arr[index + 1], arr[index]] = [arr[index], arr[index + 1]];
      }
      return { ...prev, photos: arr };
    });
  }, []);

  // ── STEP 4: Voice Recorder ──────────────────────────────────────────────────
  const startRecording = async () => {
    setVoiceState("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = ctx;
      const analyserNode = ctx.createAnalyser();
      analyserNode.fftSize = 64;
      ctx.createMediaStreamSource(stream).connect(analyserNode);
      setAnalyser(analyserNode);

      const mimeType =
        ["audio/webm;codecs=opus", "audio/mp4", "audio/ogg;codecs=opus", "audio/webm"].find(
          (t) => { try { return MediaRecorder.isTypeSupported(t); } catch { return false; } }
        ) || "";

      const mr = new MediaRecorder(stream, mimeType ? { mimeType, audioBitsPerSecond: 64000 } : {});
      mediaRecorderRef.current = mr;
      audioChunksRef.current = [];

      mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        const type = mr.mimeType || mimeType || "audio/webm";
        const blob = new Blob(audioChunksRef.current, { type });
        previewBlobObjRef.current = blob;
        previewBlobRef.current = URL.createObjectURL(blob);
        previewMimeRef.current = type;
        setVoiceState("preview");
      };

      mr.start(200);
      setRecSeconds(0);
      setVoiceState("recording");

      timerRef.current = setInterval(() => {
        setRecSeconds((s) => {
          if (s >= 179) {
            stopRecording();
            return s;
          }
          return s + 1;
        });
      }, 1000);
    } catch {
      setVoiceState("idle");
      showToast("Mic access denied. Please allow microphone access.");
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setAnalyser(null);
    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current?.stop();
    }
  };

  const confirmRecording = async () => {
    if (!previewBlobObjRef.current) return;
    setVoiceState("requesting"); // reuse as "uploading" state
    showToast("Uploading voice note...");
    try {
      const isMp4 = previewMimeRef.current.includes("mp4");
      const ext = isMp4 ? "m4a" : "webm";
      const formData = new FormData();
      formData.append("file", previewBlobObjRef.current, `voice_${Date.now()}.${ext}`);
      formData.append("type", "audio");

      const res = await fetch("/api/upload-audio", { method: "POST", body: formData });
      const result = await res.json();
      if (!result.success) throw new Error("Upload failed");

      const vn: VoiceNote = { url: result.url, duration: recSeconds, mimeType: previewMimeRef.current };
      update({ voiceNote: vn });
      setVoiceState("saved");
      showToast("Voice note saved! 🎙️");
    } catch {
      setVoiceState("preview");
      showToast("Upload failed. Try again.");
    }
  };

  const resetVoice = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    setAnalyser(null);
    if (previewBlobRef.current) URL.revokeObjectURL(previewBlobRef.current);
    previewBlobRef.current = null;
    previewBlobObjRef.current = null;
    setRecSeconds(0);
    setVoiceState("idle");
    update({ voiceNote: { url: null, duration: null, mimeType: null } });
  };

  const handleVoiceFileUpload = async (file: File) => {
    if (!file.type.startsWith("audio/") && !file.name.match(/\.(mp3|m4a|wav|aac|ogg)$/i)) {
      showToast("Please upload an audio file (MP3, M4A, etc.)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast("File too large. Max 10MB.");
      return;
    }
    showToast("Uploading audio...");
    setVoiceState("requesting");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "audio");
      const res = await fetch("/api/upload-audio", { method: "POST", body: formData });
      const result = await res.json();
      if (!result.success) throw new Error();
      const dur = await new Promise<number>((resolve) => {
        const a = new Audio(URL.createObjectURL(file));
        a.onloadedmetadata = () => resolve(Math.round(a.duration));
        a.onerror = () => resolve(0);
        setTimeout(() => resolve(0), 4000);
      });
      const vn: VoiceNote = { url: result.url, duration: dur, mimeType: file.type };
      update({ voiceNote: vn });
      setVoiceState("saved");
      showToast("Audio added! ✅");
    } catch {
      setVoiceState("idle");
      showToast("Upload failed. Try again.");
    }
  };

  // ── STEP 5: Music ───────────────────────────────────────────────────────────
  const stopLibraryPreview = () => {
    if (libraryAudioRef.current) {
      libraryAudioRef.current.pause();
      libraryAudioRef.current = null;
    }
    setPreviewingSong(null);
  };

  const toggleSongPreview = (song: Song) => {
    if (previewingSong === song.audioUrl) {
      stopLibraryPreview();
      return;
    }
    stopLibraryPreview();
    const a = new Audio(song.audioUrl);
    a.volume = st.ambientVolume;
    a.play().catch(() => {});
    libraryAudioRef.current = a;
    setPreviewingSong(song.audioUrl);
    setTimeout(() => {
      if (libraryAudioRef.current?.src === song.audioUrl) stopLibraryPreview();
    }, 30000);
    a.addEventListener("ended", stopLibraryPreview);
  };

  const selectLibrarySong = (song: Song) => {
    stopLibraryPreview();
    update({
      musicMode: "library",
      libMusic: { url: song.audioUrl, title: song.title, artist: song.artist, coverUrl: song.coverUrl || null },
    });
    setShowLibrary(false);
    showToast(`"${song.title}" selected! 🎶`);
  };

  const handleMusicUpload = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) { showToast("File too large. Max 10MB."); return; }
    setMusicUploading(true);
    showToast("Uploading music... 🎶");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "audio");
      const res = await fetch("/api/upload-audio", { method: "POST", body: formData });
      const result = await res.json();
      if (!result.success) throw new Error();
      update({
        musicMode: "upload",
        uplMusic: { url: result.url, title: file.name.replace(/\.[^/.]+$/, "") },
      });
      showToast("Music uploaded! 🎶");
    } catch {
      showToast("Upload failed. Try again.");
    } finally {
      setMusicUploading(false);
    }
  };

  // CombinedMixer
  const stopMixer = () => {
    const now = mixerCtxRef.current?.currentTime ?? 0;
    voiceGainRef.current?.gain.setTargetAtTime(0, now, 0.1);
    ambientGainRef.current?.gain.setTargetAtTime(0, now, 0.2);
    setTimeout(() => {
      mixerVoiceAudioRef.current?.pause();
      mixerAmbientAudioRef.current?.pause();
      mixerVoiceAudioRef.current = null;
      mixerAmbientAudioRef.current = null;
      setMixerPlaying(false);
    }, 300);
  };

  const playMixer = async () => {
    if (mixerPlaying) { stopMixer(); return; }
    const voiceUrl = st.voiceNote.url;
    const ambientUrl = st.musicMode === "library" ? st.libMusic.url : st.uplMusic.url;
    if (!voiceUrl) { showToast("Record your voice note first! 🎙️"); return; }

    if (!mixerCtxRef.current) {
      mixerCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = mixerCtxRef.current;
    if (ctx.state === "suspended") await ctx.resume();

    if (voiceUrl) {
      const va = new Audio();
      va.crossOrigin = "anonymous";
      va.src = voiceUrl + (voiceUrl.includes("?") ? "&" : "?") + "cb=" + Date.now();
      const src = ctx.createMediaElementSource(va);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, ctx.currentTime);
      src.connect(gain);
      gain.connect(ctx.destination);
      voiceGainRef.current = gain;
      mixerVoiceAudioRef.current = va;
      va.play().then(() => gain.gain.setTargetAtTime(st.voiceVolume, ctx.currentTime, 0.1)).catch(() => {});
    }

    if (ambientUrl) {
      const aa = new Audio();
      aa.crossOrigin = "anonymous";
      aa.src = ambientUrl + (ambientUrl.includes("?") ? "&" : "?") + "cb=" + Date.now();
      aa.loop = true;
      const src2 = ctx.createMediaElementSource(aa);
      const gain2 = ctx.createGain();
      gain2.gain.setValueAtTime(0, ctx.currentTime);
      src2.connect(gain2);
      gain2.connect(ctx.destination);
      ambientGainRef.current = gain2;
      mixerAmbientAudioRef.current = aa;
      aa.play().then(() => gain2.gain.setTargetAtTime(st.ambientVolume, ctx.currentTime, 0.5)).catch(() => {});
    }

    setMixerPlaying(true);
  };

  // ── PUBLISH ─────────────────────────────────────────────────────────────────
  const handlePublish = async () => {
    const successPhotos = st.photos.filter((p) => p.status === "success");
    if (successPhotos.length < 1) {
      showToast("Please add at least 1 photo first! 📸");
      return;
    }
    setIsPublishing(true);
    try {
      const ambientUrl = st.musicMode === "library" ? st.libMusic.url : st.uplMusic.url;
      const payload = {
        color: st.color,
        photos: successPhotos.map((p) => ({ url: p.url, caption: p.caption })),
        note: st.note,
        voiceNote: st.voiceNote,
        backsound: {
          url: ambientUrl,
          title: st.musicMode === "library" ? st.libMusic.title : st.uplMusic.title,
          artist: st.libMusic.artist,
        },
        voiceVolume: st.voiceVolume,
        ambientVolume: st.ambientVolume,
        password: st.password || null,
        passwordHint: st.passwordHint,
        status: "published",
        publishedAt: new Date().toISOString(),
      };

      const res = await fetch("/api/mixtapes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mixtapeId, ...payload }),
      });
      const result = await res.json();
      if (!result.success) throw new Error();

      setGiftUrl(`${window.location.origin}/${mixtapeId}`);
      setStep(8); // done screen
    } catch {
      showToast("Failed to publish. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  // ── Render Steps ─────────────────────────────────────────────────────────────
  const renderStep = () => {
    switch (step) {
      // ── Step 1: Color ──────────────────────────────────────────────────────
      case 1:
        return (
          <motion.div key="s1" {...slideAnim}>
            <StepTitle>Pick Your Tape Color</StepTitle>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 40 }}>
              <CassettePlayer color={st.color} size="sm" isPlaying={false} />
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
              {CASSETTE_COLORS.map((c) => {
                const active = st.color === c.hex;
                return (
                  <button
                    key={c.id}
                    onClick={() => update({ color: c.hex })}
                    style={{
                      width: 44, height: 44,
                      borderRadius: "50%",
                      backgroundColor: c.hex,
                      border: active ? "3px solid #111" : "3px solid transparent",
                      boxShadow: active ? "0 0 0 2px white, 0 0 0 4px #111" : "0 2px 8px rgba(0,0,0,0.2)",
                      cursor: "pointer",
                      transition: "transform 0.15s",
                    }}
                    aria-label={c.label}
                    title={c.label}
                  />
                );
              })}
            </div>
            <p className="text-center text-xs text-black/40" style={{ fontFamily: "var(--font-space-mono)", marginTop: 8 }}>
              {CASSETTE_COLORS.find((c) => c.hex === st.color)?.label ?? ""}
            </p>
          </motion.div>
        );

      // ── Step 2: Photos ─────────────────────────────────────────────────────
      case 2:
        const successCount = st.photos.filter((p) => p.status === "success").length;
        return (
          <motion.div key="s2" {...slideAnim}>
            <StepTitle>Add Your Photos</StepTitle>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.heic"
              multiple
              className="hidden"
              onChange={(e) => { if (e.target.files) handlePhotoFiles(Array.from(e.target.files)); e.target.value = ""; }}
            />

            {st.photos.length === 0 ? (
              <div
                className="rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all"
                style={{ 
                  borderColor: isDragging ? "#111" : "rgba(0,0,0,0.2)", 
                  background: isDragging ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.5)",
                  paddingTop: 72,
                  paddingBottom: 72,
                  paddingLeft: 40,
                  paddingRight: 40
                }}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); handlePhotoFiles(Array.from(e.dataTransfer.files)); }}
              >
                <div className="flex flex-col items-center" style={{ gap: 24 }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{background:"rgba(0,0,0,0.07)"}}>
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                      <rect x="2" y="7" width="24" height="17" rx="3" stroke="#111" strokeWidth="1.8"/>
                      <circle cx="14" cy="15.5" r="4.5" stroke="#111" strokeWidth="1.8"/>
                      <path d="M9 7V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1" stroke="#111" strokeWidth="1.8"/>
                    </svg>
                  </div>
                  <p className="text-sm font-bold tracking-wide" style={{ fontFamily: "var(--font-space-mono)" }}>
                    Drop photos here
                  </p>
                  <p className="text-xs text-black/40">or tap to select · up to {MAX_PHOTOS} photos</p>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1 auto-rows-max">
                  {st.photos.map((photo, idx) => (
                    <div key={photo.id} className="flex flex-col rounded-xl overflow-hidden border border-black/10 bg-white shadow-sm h-full">
                      <div className="relative aspect-square w-full shrink-0 bg-gray-100">
                        {photo.status === "uploading" && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className="w-5 h-5 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
                            <span className="text-[9px] text-black/40 mt-2 uppercase tracking-widest">Uploading...</span>
                          </div>
                        )}
                        {(photo.url || photo.localPreview) && (
                          <img
                            src={photo.url ?? photo.localPreview ?? ""}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        )}
                        {photo.status === "error" && (
                          <div className="absolute inset-0 bg-red-50 flex items-center justify-center">
                            <span className="text-xs text-red-400 font-bold">Failed</span>
                          </div>
                        )}
                        <div className="absolute top-1 left-1 flex items-center gap-1">
                          {idx > 0 && (
                            <button
                              onClick={() => movePhoto(idx, "left")}
                              className="w-5 h-5 rounded-full text-white text-[9px] flex items-center justify-center hover:bg-black/80 transition-colors"
                              style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                            >
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </button>
                          )}
                          <div className="w-5 h-5 rounded-full text-white text-[9px] font-bold flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.6)", fontFamily: "var(--font-space-mono)" }}>
                            {idx + 1}
                          </div>
                          {idx < st.photos.length - 1 && (
                            <button
                              onClick={() => movePhoto(idx, "right")}
                              className="w-5 h-5 rounded-full text-white text-[9px] flex items-center justify-center hover:bg-black/80 transition-colors"
                              style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                            >
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </button>
                          )}
                        </div>
                        
                        <button
                          onClick={() => removePhoto(photo.id)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full text-white text-xs flex items-center justify-center hover:bg-red-500 transition-colors"
                          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
                          title="Hapus foto"
                        >
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M1 1l8 8M9 1L1 9" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                          </svg>
                        </button>
                      </div>
                      <div className="px-2 py-2">
                        <textarea
                          className="w-full text-[11px] resize-none bg-transparent outline-none text-center text-gray-600 placeholder-gray-300 leading-relaxed"
                          style={{ fontFamily: "var(--font-caveat)", fontSize: "13px" }}
                          placeholder="Add a caption..."
                          rows={2}
                          maxLength={45}
                          value={photo.caption}
                          onChange={(e) => updateCaption(photo.id, e.target.value)}
                        />
                      </div>
                    </div>
                  ))}

                  {/* Add more button */}
                  {st.photos.length < MAX_PHOTOS && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all hover:border-black/40 active:scale-95"
                      style={{ borderColor: "rgba(0,0,0,0.15)", background: "rgba(255,255,255,0.5)" }}
                    >
                      <span className="text-2xl">+</span>
                      <span className="text-[9px] text-black/40 uppercase tracking-widest" style={{ fontFamily: "var(--font-space-mono)" }}>Add More</span>
                    </button>
                  )}
                </div>
                <p className="text-center text-xs text-black/40 mt-3" style={{ fontFamily: "var(--font-space-mono)" }}>
                  {successCount}/{MAX_PHOTOS} photos · use arrows to reorder
                </p>
              </>
            )}
          </motion.div>
        );

      // ── Step 3: Note ───────────────────────────────────────────────────────
      case 3:
        return (
          <motion.div key="s3" {...slideAnim} className="flex flex-col items-center">
            <StepTitle style={{ marginBottom: 20 }}>Write a Little Note</StepTitle>
            
            <div className="w-full flex justify-center z-10 relative" style={{ marginBottom: "-0.5rem", transform: "rotate(-2deg)" }}>
              <div style={{ width: "100%", maxWidth: 290 }}>
                <NoteCard value={st.note} onChange={(v) => update({ note: v })} readOnly={false} />
              </div>
            </div>

            <div className="z-0 relative pointer-events-none">
              <CassettePlayer
                color={st.color}
                isPlaying={false}
                size="md"
              />
            </div>
          </motion.div>
        );

      // ── Step 4: Voice Note ─────────────────────────────────────────────────
      case 4:
        return (
          <motion.div key="s4" {...slideAnim}>
            <StepTitle>Record Your Voice</StepTitle>

            {/* IDLE */}
            {voiceState === "idle" && (
              <div className="flex flex-col items-center gap-4">
                <button 
                  onClick={startRecording}
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-2 shadow-lg transition-transform active:scale-90 cursor-pointer"
                  style={{ backgroundColor: "#111" }}
                >
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <rect x="11" y="4" width="10" height="16" rx="5" stroke="white" strokeWidth="2"/>
                    <path d="M6 17a10 10 0 0 0 20 0" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="16" y1="27" x2="16" y2="31" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="11" y1="31" x2="21" y2="31" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
                <p className="text-xs text-black/50 text-center" style={{ fontFamily: "var(--font-space-mono)" }}>
                  Click the mic to record a voice note for your mixtape
                </p>
                <div className="w-full border-t border-black/10 pt-4 mt-2 flex flex-col items-center gap-2">
                  <p className="text-xs text-black/40" style={{ fontFamily: "var(--font-space-mono)" }}>Or upload an audio file</p>
                  <input
                    type="file"
                    accept="audio/*,.mp3,.m4a,.wav"
                    className="hidden"
                    id="voice-file-input"
                    onChange={(e) => { if (e.target.files?.[0]) handleVoiceFileUpload(e.target.files[0]); e.target.value = ""; }}
                  />
                  <label
                    htmlFor="voice-file-input"
                    className="text-xs font-bold uppercase tracking-widest cursor-pointer underline underline-offset-2 text-black/50"
                    style={{ fontFamily: "var(--font-space-mono)" }}
                  >
                    Upload MP3 / M4A
                  </label>
                </div>
              </div>
            )}

            {/* REQUESTING / UPLOADING */}
            {voiceState === "requesting" && (
              <div className="flex flex-col items-center gap-3 py-6">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
                <p className="text-xs text-black/50" style={{ fontFamily: "var(--font-space-mono)" }}>Please wait...</p>
              </div>
            )}

            {/* RECORDING */}
            {voiceState === "recording" && (
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-bold text-red-500 uppercase tracking-widest" style={{ fontFamily: "var(--font-space-mono)" }}>
                    Recording {fmtTime(recSeconds)} / 3:00
                  </span>
                </div>
                <WaveformBars analyser={analyser} />
                <button
                  onClick={stopRecording}
                  className="px-8 py-3 rounded-2xl text-white text-sm font-bold tracking-wider transition-all active:scale-95"
                  style={{ background: "#111", fontFamily: "var(--font-space-mono)" }}
                >
                  ■ Stop
                </button>
              </div>
            )}

            {/* PREVIEW */}
            {voiceState === "preview" && (
              <div className="flex flex-col items-center gap-4">
                <p className="text-xs font-bold uppercase tracking-widest text-black/50" style={{ fontFamily: "var(--font-space-mono)" }}>
                  Preview your recording
                </p>
                {previewBlobRef.current && (
                  <audio controls src={previewBlobRef.current} className="w-full rounded-xl" />
                )}
                <div className="flex gap-3 w-full">
                  <button onClick={resetVoice} className="flex-1 py-3 rounded-2xl border-2 border-black text-sm font-bold" style={{ fontFamily: "var(--font-space-mono)" }}>
                    Re-record
                  </button>
                  <button onClick={confirmRecording} className="flex-1 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2" style={{ fontFamily: "var(--font-space-mono)", background: "#111", color: "#fff" }}>
                    Use This
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </div>
              </div>
            )}

            {/* SAVED */}
            {voiceState === "saved" && (
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <path d="M4 11l5 5 9-9" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="text-sm font-bold" style={{ fontFamily: "var(--font-space-mono)" }}>Voice note saved!</p>
                {st.voiceNote.url && <audio controls src={st.voiceNote.url} className="w-full rounded-xl" />}
                <button onClick={resetVoice} className="text-xs text-black/40 underline underline-offset-2" style={{ fontFamily: "var(--font-space-mono)" }}>
                  Delete and re-record
                </button>
              </div>
            )}

            <p className="text-center text-xs text-black/30 mt-4" style={{ fontFamily: "var(--font-space-mono)" }}>
              <span className="font-bold opacity-70">(Optional — skip if you prefer no voice)</span>
            </p>
          </motion.div>
        );

      // ── Step 5: Music ──────────────────────────────────────────────────────
      case 5:
        const hasMusic = st.musicMode === "library" ? !!st.libMusic.url : !!st.uplMusic.url;
        const musicTitle = st.musicMode === "library" ? st.libMusic.title : st.uplMusic.title;
        const musicArtist = st.libMusic.artist;
        return (
          <motion.div key="s5" {...slideAnim}>
            <StepTitle>Background Music</StepTitle>

            {/* Music Mode Tabs */}
            <div className="flex rounded-xl overflow-hidden border border-black/10 mb-4">
              {(["library", "upload"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => update({ musicMode: mode })}
                  className="flex-1 py-2 text-[10px] font-bold uppercase tracking-widest transition-all"
                  style={{
                    fontFamily: "var(--font-space-mono)",
                    background: st.musicMode === mode ? "#111" : "white",
                    color: st.musicMode === mode ? "white" : "#999",
                  }}
                >
                  {mode === "library" ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><circle cx="5.5" cy="5.5" r="4.5" stroke="currentColor" strokeWidth="1.3"/><path d="M4 3.5l4 2-4 2V3.5z" fill="currentColor"/></svg>
                      Song Library
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-1.5">
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 1v6M3 5l2.5 2.5L8 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M1 9h9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                      Upload MP3
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Library Tab */}
            {st.musicMode === "library" && (
              <div>
                {st.libMusic.url ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-black/10 bg-white/60 mb-3">
                    {st.libMusic.coverUrl && (
                      <img src={st.libMusic.coverUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{st.libMusic.title}</p>
                      <p className="text-xs text-black/40">{st.libMusic.artist}</p>
                    </div>
                    <button
                      onClick={() => update({ libMusic: { url: null, title: "", artist: "", coverUrl: null } })}
                      className="text-xs text-red-400 font-bold"
                    >
                     <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M1 1l8 8M9 1L1 9" stroke="#f87171" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                    </button>
                  </div>
                ) : (
                  <div 
                    className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-black/15 mb-3" 
                    style={{ padding: "40px 20px", gap: 16 }}
                  >
                    <p className="text-xs text-black/40" style={{ fontFamily: "var(--font-space-mono)" }}>No song selected yet</p>
                    <button
                      onClick={() => setShowLibrary(true)}
                      className="px-5 py-2.5 text-xs font-bold rounded-xl uppercase tracking-widest transition-transform active:scale-95"
                      style={{ fontFamily: "var(--font-space-mono)", background: "#111", color: "#fff" }}
                    >
                      Browse Library
                    </button>
                  </div>
                )}
                {st.libMusic.url && (
                  <button
                    onClick={() => setShowLibrary(true)}
                    className="w-full text-center text-xs font-bold uppercase tracking-widest underline underline-offset-2 text-black/40 mb-3"
                    style={{ fontFamily: "var(--font-space-mono)" }}
                  >
                    Change Song
                  </button>
                )}
              </div>
            )}

            {/* Upload Tab */}
            {st.musicMode === "upload" && (
              <div>
                {musicUploading ? (
                  <div className="flex flex-col items-center gap-2 py-6">
                    <div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
                    <p className="text-xs text-black/40" style={{ fontFamily: "var(--font-space-mono)" }}>Uploading music...</p>
                  </div>
                ) : st.uplMusic.url ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-black/10 bg-white/60 mb-3">
                    <span className="text-xl">🎵</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{st.uplMusic.title || "Uploaded Song"}</p>
                    </div>
                    <audio controls src={st.uplMusic.url} className="hidden" id="upl-audio-preview" />
                    <button
                      onClick={() => update({ uplMusic: { url: null, title: "" } })}
                      className="text-xs text-red-400 font-bold"
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M1 1l8 8M9 1L1 9" stroke="#f87171" strokeWidth="1.8" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div
                    className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer transition-all hover:border-black/40"
                    style={{ borderColor: "rgba(0,0,0,0.15)", padding: "40px 20px", gap: 12 }}
                    onClick={() => musicFileInputRef.current?.click()}
                  >
                    <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest mt-2" style={{ fontFamily: "var(--font-space-mono)" }}>
                      Click to upload MP3
                    </p>
                    <p className="text-[10px] text-black/30">Max 10MB</p>
                  </div>
                )}
                <input
                  ref={musicFileInputRef}
                  type="file"
                  accept="audio/*,.mp3,.m4a,.wav"
                  className="hidden"
                  onChange={(e) => { if (e.target.files?.[0]) handleMusicUpload(e.target.files[0]); e.target.value = ""; }}
                />
              </div>
            )}

            {/* Volume Sliders */}
            <div className="mt-4 space-y-3 p-3 rounded-xl bg-white/50 border border-black/10">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/40 mb-2" style={{ fontFamily: "var(--font-space-mono)" }}>
                Volume Mix
              </p>
              {[
                { label: "🎙️ Voice", key: "voiceVolume" as const },
                { label: "🎵 Music", key: "ambientVolume" as const },
              ].map(({ label, key }) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-xs text-black/50 w-16 shrink-0" style={{ fontFamily: "var(--font-space-mono)" }}>
                    {label}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={st[key]}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      update({ [key]: val });
                      if (key === "voiceVolume" && voiceGainRef.current && mixerCtxRef.current) {
                        voiceGainRef.current.gain.setTargetAtTime(val, mixerCtxRef.current.currentTime, 0.1);
                      }
                      if (key === "ambientVolume" && ambientGainRef.current && mixerCtxRef.current) {
                        ambientGainRef.current.gain.setTargetAtTime(val, mixerCtxRef.current.currentTime, 0.1);
                      }
                    }}
                    className="flex-1 accent-black"
                  />
                  <span className="text-xs text-black/40 w-8 text-right" style={{ fontFamily: "var(--font-space-mono)" }}>
                    {Math.round(st[key] * 100)}%
                  </span>
                </div>
              ))}

              {/* Preview Together button */}
              {st.voiceNote.url && hasMusic && (
                <button
                  onClick={mixerPlaying ? stopMixer : playMixer}
                  className="mx-auto flex items-center justify-center px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all mt-4 mb-1"
                  style={{
                    fontFamily: "var(--font-space-mono)",
                    background: mixerPlaying ? "#ef4444" : "#111",
                    color: "white",
                  }}
                >
                  {mixerPlaying ? (
                    <span className="flex items-center gap-2">
                      <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><rect x="2" y="2" width="4" height="10" rx="1" fill="white"/><rect x="8" y="2" width="4" height="10" rx="1" fill="white"/></svg>
                      Stop Preview
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="white" strokeWidth="1.5"/><path d="M5.5 4.5l5 2.5-5 2.5V4.5z" fill="white"/></svg>
                      Preview Together
                    </span>
                  )}
                </button>
              )}
            </div>

            <p className="text-center text-xs text-black/30 mt-3" style={{ fontFamily: "var(--font-space-mono)" }}>
              <span className="font-bold opacity-70">(Optional — your mixtape works without music too)</span>
            </p>
          </motion.div>
        );

      // ── Step 6: Password ───────────────────────────────────────────────────
      case 6:
        return (
          <motion.div key="s6" {...slideAnim}>
            <StepTitle>Protect Your Gift</StepTitle>
            <p className="text-center text-xs text-black/40 mb-5" style={{ fontFamily: "var(--font-space-mono)" }}>
              Add a password so only they can open it<br />
              <span className="font-bold opacity-70 text-black/70">(Optional — leave blank to skip)</span>
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/40 block mb-1" style={{ fontFamily: "var(--font-space-mono)" }}>
                  Hint (shown on password screen)
                </label>
                <input
                  type="text"
                  value={st.passwordHint}
                  onChange={(e) => update({ passwordHint: e.target.value })}
                  placeholder="e.g. The day we first met..."
                  className="w-full px-4 py-3 rounded-xl bg-white border border-black/15 text-sm outline-none focus:border-black/40 transition-colors"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/40 block mb-1" style={{ fontFamily: "var(--font-space-mono)" }}>
                  Password
                </label>
                <input
                  type="password"
                  value={st.password}
                  onChange={(e) => update({ password: e.target.value.replace(/\s/g, "") })}
                  placeholder="e.g. ourfirstdate"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-black/15 text-sm outline-none focus:border-black/40 transition-colors"
                  style={{ fontFamily: "var(--font-space-mono)", letterSpacing: st.password ? "0.2em" : "normal" }}
                />
              </div>
            </div>

            <div className="mt-5 p-3 rounded-xl bg-white/50 border border-black/10 text-center">
              <p className="text-xs text-black/40" style={{ fontFamily: "var(--font-space-mono)" }}>
                {st.password ? `Password set: "${st.password}"` : "No password — anyone with the link can open it"}
              </p>
            </div>
          </motion.div>
        );

      // ── Step 7: Review & Publish ───────────────────────────────────────────
      case 7:
        const readyPhotos = st.photos.filter((p) => p.status === "success");
        const activeMusic = st.musicMode === "library" ? st.libMusic : st.uplMusic;
        return (
          <motion.div key="s7" {...slideAnim}>
            <StepTitle>Ready to Publish!</StepTitle>

            <div className="flex justify-center mb-5">
              <CassettePlayer color={st.color} size="sm" isPlaying={false} />
            </div>

            {/* Summary */}
            <div className="space-y-2.5 mb-6">
              {([
                { label: "Color", value: CASSETTE_COLORS.find((c) => c.hex === st.color)?.label ?? st.color },
                { label: "Photos", value: `${readyPhotos.length} photo${readyPhotos.length !== 1 ? "s" : ""}` },
                { label: "Note", value: st.note ? `${st.note.trim().split(/\s+/).length} words` : "No note" },
                { label: "Voice", value: st.voiceNote.url ? `${fmtTime(st.voiceNote.duration ?? 0)} recorded` : "No voice note" },
                { label: "Music", value: activeMusic.url ? (activeMusic.title || "Uploaded song") : "No music" },
                { label: "Password", value: st.password ? "Protected" : "Open to anyone" },
              ] as { label: string; value: string }[]).map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/60 border border-black/10">
                  <span className="text-xs text-black/40" style={{ fontFamily: "var(--font-space-mono)" }}>
                    {label}
                  </span>
                  <span className="text-xs font-bold text-black/70" style={{ fontFamily: "var(--font-space-mono)" }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {readyPhotos.length < 1 && (
              <div className="flex items-center gap-2 justify-center text-xs text-red-400 font-bold p-4 rounded-xl bg-red-50 mb-4" style={{ fontFamily: "var(--font-space-mono)" }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1L13 13H1L7 1z" stroke="#f87171" strokeWidth="1.5" strokeLinejoin="round"/><path d="M7 6v3" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"/><circle cx="7" cy="11" r="0.75" fill="#f87171"/></svg>
                Please add at least 1 photo before publishing
              </div>
            )}

          </motion.div>
        );

      // ── Step 8: Done ───────────────────────────────────────────────────────
      case 8:
        return (
          <motion.div key="s8" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-6 text-center py-4">
            <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M6 16l8 8L26 8" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="text-base font-bold tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-space-mono)" }}>
              Your Mixtape is Live!
            </h2>
            <p className="text-xs text-black/50" style={{ fontFamily: "var(--font-space-mono)" }}>
              Share this link with someone special:
            </p>

            <div className="w-full p-4 rounded-xl bg-white border border-black/10">
              <input
                readOnly
                value={giftUrl}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                className="w-full text-xs text-center text-black/70 outline-none bg-transparent"
                style={{ fontFamily: "var(--font-space-mono)" }}
              />
            </div>

            <div className="flex gap-3 w-full">
              <button
                onClick={() => { navigator.clipboard.writeText(giftUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); }}
                className="flex-1 py-4 rounded-2xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                style={{
                  fontFamily: "var(--font-space-mono)",
                  background: copied ? "#4caf50" : "#111",
                  color: "white",
                }}
              >
                {copied ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l4 4 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="4" y="4" width="8" height="8" rx="1.5" stroke="white" strokeWidth="1.5"/><path d="M2 10V2h8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Copy Link
                  </>
                )}
              </button>
              <a
                href={giftUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-4 rounded-2xl font-bold text-sm text-center border-2 border-black transition-all active:scale-95 flex items-center justify-center gap-2"
                style={{ fontFamily: "var(--font-space-mono)" }}
              >
                View Gift
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M5 2l5 5-5 5" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>

            <p className="text-[9px] text-black/30" style={{ fontFamily: "var(--font-space-mono)" }}>
              Anyone with this link can open the gift view
            </p>
          </motion.div>
        );

      default:
        return null;
    }
  };

  const slideAnim = {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
    transition: { duration: 0.22 },
  };

  const nextDisabled =
    (step === 2 && st.photos.filter((p) => p.status === "uploading").length > 0);

  const nextLabel =
    step === 7 ? undefined :
    step === 6 ? "Review" :
    step === TOTAL_STEPS ? "Publish" : undefined;

  // ── Song Library Modal ──────────────────────────────────────────────────────
  const LibraryModal = () => (
    <AnimatePresence>
      {showLibrary && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          onClick={() => { stopLibraryPreview(); setShowLibrary(false); setSelectedSong(null); }}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-3xl w-full max-w-sm max-h-[80vh] flex flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-black/10">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em]" style={{ fontFamily: "var(--font-space-mono)" }}>
                Song Library
              </h3>
              <button onClick={() => { stopLibraryPreview(); setShowLibrary(false); setSelectedSong(null); }} className="text-lg">✕</button>
            </div>

            {/* Song list */}
            <div className="overflow-y-auto flex-1">
              {songs.length === 0 ? (
                <div className="text-center py-10 text-xs text-black/30" style={{ fontFamily: "var(--font-space-mono)" }}>Loading...</div>
              ) : (
                songs.map((song) => {
                  const isSelected = selectedSong?.audioUrl === song.audioUrl;
                  const isPreviewing = previewingSong === song.audioUrl;
                  return (
                    <div
                      key={song.audioUrl}
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50 border-b border-black/5"
                      style={{ background: isSelected ? "#fdf0f7" : undefined }}
                      onClick={() => setSelectedSong(song)}
                    >
                      {/* Cover / Preview button */}
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        {song.coverUrl ? (
                          <img src={song.coverUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg">🎵</div>
                        )}
                        <button
                          className="absolute inset-0 flex items-center justify-center transition-colors"
                          style={{ 
                            backgroundColor: isPreviewing ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.3)",
                            color: "#fff"
                          }}
                          onClick={(e) => { e.stopPropagation(); toggleSongPreview(song); }}
                        >
                          <span className="text-xs drop-shadow-md" style={{ opacity: isPreviewing ? 1 : 0.8 }}>
                            {isPreviewing ? "⏸" : "▶"}
                          </span>
                        </button>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate">{song.title}</p>
                        <p className="text-[10px] text-black/40 truncate">{song.artist}</p>
                      </div>

                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center shrink-0">
                          <span className="text-white text-[9px]">✓</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Confirm */}
            <div className="p-4 border-t border-black/10">
              <button
                disabled={!selectedSong}
                onClick={() => { if (selectedSong) selectLibrarySong(selectedSong); }}
                className="w-full py-3 rounded-2xl font-bold text-sm text-white transition-all active:scale-95 disabled:opacity-30"
                style={{ fontFamily: "var(--font-space-mono)", background: "#111" }}
              >
                {selectedSong ? `Select "${selectedSong.title}"` : "Select a Song"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ── Main Render ─────────────────────────────────────────────────────────────
  const bgColor = st.color ? PASTEL_MAP[getColorId(st.color)] : "#c9dff0";

  if (isInitializing) {
    return (
      <main
        className="min-h-screen flex flex-col items-center justify-center py-16 px-4"
        style={{ background: bgColor, transition: "background 0.5s ease" }}
      >
        <div
          className="w-10 h-10 border-4 rounded-full animate-spin"
          style={{ borderColor: "rgba(0,0,0,0.1)", borderTopColor: "#111" }}
        />
        <p className="mt-4 text-xs tracking-widest font-bold uppercase" style={{ color: "#111", fontFamily: "var(--font-space-mono)" }}>
          Loading Studio...
        </p>
      </main>
    );
  }

  if (isNotFound) {
    return (
      <main
        className="min-h-screen flex flex-col items-center justify-center py-16 px-4 text-center"
        style={{ background: bgColor, transition: "background 0.5s ease" }}
      >
        <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-space-mono)", color: "#111" }}>404</h1>
        <p className="text-sm font-bold uppercase tracking-widest mb-8" style={{ color: "rgba(0,0,0,0.5)", fontFamily: "var(--font-space-mono)" }}>
          Mixtape Not Found
        </p>
        <p className="text-md max-w-md" style={{ color: "#111", fontFamily: "var(--font-space-mono)" }}>
          The studio link you entered is invalid or the mixtape hasn't been created yet. Only admins can create new mixtapes from the dashboard.
        </p>
        <a 
          href="/"
          className="mt-8 py-3 px-6 rounded-xl font-bold text-sm tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2"
          style={{
            fontFamily: "var(--font-space-mono)",
            background: "#111",
            color: "white",
          }}
        >
          Go to Homepage
        </a>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-start py-16 px-4 overflow-y-auto"
      style={{ background: bgColor, transition: "background 0.5s ease" }}
    >
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-black/85 text-white text-xs font-bold tracking-wide backdrop-blur-sm shadow-xl"
            style={{ fontFamily: "var(--font-space-mono)" }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <LibraryModal />

      <div className="w-full max-w-[440px]">
        {/* Header */}
        <div className="text-center" style={{ marginBottom: 40 }}>
          <h1
            className="font-bold tracking-[0.25em] uppercase text-xl"
            style={{ fontFamily: "var(--font-space-mono)", marginBottom: 12 }}
          >
            Mixtape Studio
          </h1>
          <p className="text-xs text-black/40 flex items-center justify-center gap-1.5" style={{ fontFamily: "var(--font-space-mono)" }}>
            Create something beautiful
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M5 1v8M2 4l3-3 3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
            </svg>
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl shadow-xl border border-white/60"
          style={{ 
            background: "rgba(255,255,255,0.82)", 
            backdropFilter: "blur(16px)",
            paddingTop: 64,
            paddingBottom: 56,
            paddingLeft: 32,
            paddingRight: 32
          }}
        >
          {/* Step dots — only for steps 1-7 */}
          {step <= TOTAL_STEPS && <StepDots current={step} total={TOTAL_STEPS} />}

          {/* Step content */}
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>

          {/* Navigation */}
          {step <= TOTAL_STEPS && step < 7 && (
            <NavButtons
              step={step}
              onBack={() => setStep((s) => Math.max(1, s - 1))}
              onNext={() => setStep((s) => s + 1)}
              nextLabel={nextLabel}
              nextDisabled={nextDisabled}
            />
          )}
          {step === 7 && (
            <NavButtons
              step={step}
              onBack={() => setStep(6)}
              onNext={handlePublish}
              nextLabel="Publish"
              isLoading={isPublishing}
              nextDisabled={st.photos.filter((p) => p.status === "success").length < 1}
            />
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-[9px] text-black/30 mt-6" style={{ fontFamily: "var(--font-space-mono)" }}>
          mixtape — made with love
        </p>
      </div>
    </main>
  );
}
