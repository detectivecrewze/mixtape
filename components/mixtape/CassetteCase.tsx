"use client";

import React, { useState, useRef } from "react";
import { motion, useAnimationFrame, useMotionValue } from "framer-motion";

interface PhotoConfig {
  url: string;
  caption?: string;
}

interface CassetteCaseProps {
  photos: PhotoConfig[];
  note?: string;
  className?: string;
  isPlaying?: boolean;
}

export default function CassetteCase({
  photos = [],
  note = "",
  className = "",
  isPlaying = false,
}: CassetteCaseProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  const displayPhotos =
    photos.length > 0
      ? photos
      : [
          { url: "/assets/mock1.jpeg", caption: "Our first date ❤️" },
          { url: "/assets/mock2.jpeg", caption: "That beautiful sunset..." },
          { url: "/assets/mock3.jpeg", caption: "Laughing until it hurts" },
          { url: "/assets/mock4.jpeg", caption: "Just you and me" },
        ];

  const totalPhotos = displayPhotos.length;
  // Duplicate for seamless infinite loop
  const loopPhotos = [...displayPhotos, ...displayPhotos, ...displayPhotos];

  const FRAME_WIDTH = 190;
  const GAP = 24;
  const STEP = FRAME_WIDTH + GAP;

  useAnimationFrame((t, delta) => {
    if (!containerRef.current || totalPhotos <= 1 || !isPlaying) return;
    
    // safe delta to prevent NaN on first frame
    const safeDelta = delta || 16;
    const speed = 0.06; // slightly slower for cinematic feel
    let newX = x.get() - (speed * safeDelta);
    
    const fullSetWidth = STEP * totalPhotos;
    
    // Seamless infinite loop snap
    if (newX <= -fullSetWidth) {
      newX += fullSetWidth;
    }
    x.set(newX);

    // Calculate active index (based on which step we are closest to)
    const activeIdx = Math.round((-newX) / STEP) % totalPhotos;
    if (activeIdx !== currentIndex) {
      setCurrentIndex(activeIdx);
    }
  });

  const INNER = {
    top: "4%",
    left: "4%",
    right: "4%",
    bottom: "4%",
    borderRadius: "4px",
  };

  return (
    <div className={`flex justify-center ${className}`}>
      <div
        className="relative shrink-0"
        style={{ width: 358, height: 230 }}
      >
        {/* Layer 1: Cassette Case PNG */}
        <img
          src="/assets/cassette-case.png"
          alt="Cassette case"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          style={{ zIndex: 1 }}
          draggable={false}
        />

        {/* Layer 2: Photo container (The Screen) */}
        <div
          ref={containerRef}
          className="absolute overflow-hidden"
          style={{ ...INNER, zIndex: 2, background: "#0c0d11" }}
        >
          {/* Continuous scrolling film strip */}
          <motion.div
            style={{ 
              display: "flex", 
              alignItems: "center", 
              height: "100%", 
              width: "max-content", // Let it grow as long as the items
              paddingLeft: "70px", // Centers the 190px frame in the ~329px container!
              x 
            }}
          >
            {loopPhotos.map((photo, i) => (
              <div 
                key={i} 
                style={{ 
                  position: "relative", 
                  width: `${FRAME_WIDTH}px`, 
                  height: `${FRAME_WIDTH}px`, 
                  flexShrink: 0,
                  marginRight: `${GAP}px`,
                  borderRadius: "2px",
                  overflow: "hidden",
                  backgroundColor: "#000",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.4)"
                }}
              >
                {/* Crisp Image perfectly filling the square */}
                <img
                  src={photo.url}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
                
                {/* Subtitle scrolling WITH the photo */}
                <div
                  className="absolute bottom-3 left-0 right-0 flex justify-center px-4"
                >
                  <p
                    className="text-white text-center leading-tight drop-shadow-md"
                    style={{
                      fontFamily: "var(--font-caveat)",
                      fontSize: "1.05rem",
                      textShadow: "1px 1px 2px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.8)",
                    }}
                  >
                    {photo.caption}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Idle State Overlay (PRESS PLAY) */}
          {!isPlaying && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0c0d11] z-10 pointer-events-none">
              <div className="w-8 h-px bg-[rgba(180,200,230,0.2)]" />
              <p 
                className="text-center uppercase font-bold"
                style={{
                  fontFamily: "var(--font-space-mono), monospace",
                  fontSize: "7.5px",
                  letterSpacing: "0.28em",
                  color: "rgba(180, 200, 230, 0.2)",
                  marginRight: "-0.28em" // optical centering fix for tracking
                }}
              >
                Press Play
              </p>
              <div className="w-8 h-px bg-[rgba(180,200,230,0.2)]" />
            </div>
          )}

          {/* Plastic Glare & Shadow Overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              zIndex: 3,
              boxShadow: "inset 0 2px 10px rgba(0,0,0,0.5)",
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 40%, rgba(0,0,0,0.2) 100%)",
            }}
          />
        </div>

        {/* Dots indicator */}
        {displayPhotos.length > 1 && (
          <div
            className="absolute flex gap-1 items-center justify-center pointer-events-none"
            style={{
              bottom: "5%",
              left: 0,
              right: 0,
              zIndex: 5,
            }}
          >
            {displayPhotos.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === currentIndex ? 14 : 6,
                  height: 6,
                  borderRadius: 3,
                  background:
                    i === currentIndex
                      ? "rgba(255,255,255,0.9)"
                      : "rgba(255,255,255,0.4)",
                  transition: "all 0.4s ease",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
