import React from "react";
import { motion } from "framer-motion";

interface MusicCardProps {
  title: string;
  artist: string;
  coverUrl?: string;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onPlayPause: () => void;
}

function formatTime(seconds: number) {
  if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function MusicCard({ title, artist, coverUrl, currentTime, duration, isPlaying, onPlayPause }: MusicCardProps) {
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white rounded-2xl p-3 px-4 shadow-xl shadow-black/5 w-full max-w-[320px] mx-auto mt-15 relative z-10"
    >
      <div className="flex items-center gap-3 mb-3">
        {/* Album Cover */}
        <div className="w-10 h-10 rounded-md bg-black/5 overflow-hidden flex-shrink-0 shadow-inner">
          {coverUrl ? (
            <img src={coverUrl} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-black/10 text-black/20">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18V5l12-2v13"></path>
                <circle cx="6" cy="18" r="3"></circle>
                <circle cx="18" cy="16" r="3"></circle>
              </svg>
            </div>
          )}
        </div>

        {/* Title & Artist */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-xs text-black truncate" style={{ fontFamily: "var(--font-space-mono)" }}>
            {title}
          </h3>
          <p className="text-[10px] text-black/50 truncate" style={{ fontFamily: "var(--font-space-mono)" }}>
            {artist}
          </p>
        </div>

        {/* Play/Pause Button */}
        <button 
          onClick={onPlayPause}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 transition-colors flex-shrink-0 text-black/80"
        >
          {isPlaying ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="ml-1">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-3 text-[9px] text-black/40 font-medium" style={{ fontFamily: "var(--font-space-mono)" }}>
        <span>{formatTime(currentTime)}</span>
        <div className="flex-1 h-1 bg-black/5 rounded-full overflow-hidden relative">
          <div 
            className="absolute top-0 left-0 h-full bg-black/20 rounded-full transition-all duration-300 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span>{formatTime(duration)}</span>
      </div>
    </motion.div>
  );
}
