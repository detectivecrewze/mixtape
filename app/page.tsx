"use client";

import React from "react";
import { motion } from "framer-motion";
import CassettePlayer from "@/components/mixtape/CassettePlayer";
import NoteCard from "@/components/mixtape/NoteCard";

export default function HomePage() {
  return (
    <main
      className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: "#b5d3e0" }} // Beautiful pastel blue matching the competitor
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

        {/* Scattered Cassettes (Foreground, floating & tilted) */}
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
        <a
          href="https://for-you-always.my.id"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-12 py-4 sm:px-16 sm:py-5 rounded-2xl text-white font-bold tracking-wide transition-transform active:scale-95 hover:scale-105"
          style={{
            backgroundColor: "#0d0d0d",
            fontFamily: "var(--font-space-mono), monospace",
            fontSize: "0.85rem",
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            minWidth: "240px"
          }}
        >
          Create a mixtape
        </a>
      </motion.div>
    </main>
  );
}
