"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";

// Beautiful smooth-curved flower SVG
const FlowerSVG = ({ color }: { color: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M50 15C40 -5 20 5 35 35C5 20 -5 40 15 50C-5 60 5 80 35 65C20 95 40 105 50 85C60 105 80 95 65 65C95 80 105 60 85 50C105 40 95 20 65 35C80 5 60 -5 50 15Z" 
      fill={color} 
    />
    <circle cx="50" cy="50" r="12" fill="rgba(0,0,0,0.06)" />
  </svg>
);

export default function FloatingFlowers() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate 60 flowers with slightly reduced sizes to find the sweet spot
  const flowers = useMemo(() => {
    return Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 25 + 14, // 14px to 39px
      delay: Math.random() * -20, // Negative delay so they are already on screen when loaded
      duration: Math.random() * 15 + 20, // 20 to 35 seconds to reach the top
      opacity: Math.random() * 0.45 + 0.35, // 0.35 to 0.8 opacity
      sway: Math.random() * 60 + 30, // 30px to 90px sway
      direction: Math.random() > 0.5 ? 1 : -1,
    }));
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden="true">
      {flowers.map((f) => (
        <motion.div
          key={f.id}
          className="absolute bottom-0"
          style={{
            left: f.left,
            width: f.size,
            height: f.size,
            opacity: f.opacity,
          }}
          initial={{ y: "100px", x: 0, rotate: 0 }}
          animate={{
            y: "-110vh",
            x: [0, f.sway * f.direction, -f.sway * f.direction, 0],
            rotate: [0, 360 * f.direction],
          }}
          transition={{
            y: {
              duration: f.duration,
              repeat: Infinity,
              ease: "linear",
              delay: f.delay,
            },
            x: {
              duration: f.duration * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: f.delay,
            },
            rotate: {
              duration: f.duration * 0.8,
              repeat: Infinity,
              ease: "linear",
              delay: f.delay,
            },
          }}
        >
          {/* We use white so it beautifully complements any pastel background like light blue */}
          <FlowerSVG color="#ffffff" />
        </motion.div>
      ))}
    </div>
  );
}
