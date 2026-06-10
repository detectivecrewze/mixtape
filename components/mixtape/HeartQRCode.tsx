"use client";

import React, { useMemo } from "react";
import QRCode from "qrcode";

// Pseudo-random generator for stable decorative dots
const randomDot = (x: number, y: number) => {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return n - Math.floor(n) > 0.45; // 55% density
};

// Math formula for a heart shape
const isInsideHeart = (gx: number, gy: number, G: number) => {
  const x = ((gx - G / 2) / (G / 2)) * 1.3;
  const y = -((gy - G / 2) / (G / 2)) * 1.3;
  const x2 = x * x;
  const y2 = y * y;
  const term1 = x2 + y2 - 1;
  const val = term1 * term1 * term1 - x2 * y2 * y;
  return val <= 0;
};

interface HeartQRCodeProps {
  url: string;
  color: string;       // foreground / accent color (e.g. cassette color)
  bgColor?: string;    // background color inside the QR box
  size?: number;
}

export default function HeartQRCode({
  url,
  color,
  bgColor = "#ffffff",
  size = 260,
}: HeartQRCodeProps) {
  const qrData = useMemo(() => {
    if (!url) return null;
    try {
      const qr = (QRCode as any).create(url, { errorCorrectionLevel: "H" });
      return qr.modules as { size: number; get: (x: number, y: number) => boolean };
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [url]);

  if (!qrData) return null;

  const N = qrData.size;
  const G = Math.floor(N * 2.5);
  const offsetX = Math.floor((G - N) / 2);
  // Shift QR code slightly upward so it sits in the wider part of the heart
  const offsetY = Math.floor((G - N) / 2) - Math.floor(N * 0.12);

  const cells: { x: number; y: number }[] = [];
  const decorativeCells: { x: number; y: number }[] = [];
  const padding = 2;

  const isFinder = (x: number, y: number) => {
    return (
      (x < 7 && y < 7) ||
      (x >= N - 7 && y < 7) ||
      (x < 7 && y >= N - 7)
    );
  };

  for (let gy = 0; gy < G; gy++) {
    for (let gx = 0; gx < G; gx++) {
      const inQrZoneX = gx >= offsetX - padding && gx < offsetX + N + padding;
      const inQrZoneY = gy >= offsetY - padding && gy < offsetY + N + padding;

      if (inQrZoneX && inQrZoneY) {
        const inActualQrX = gx >= offsetX && gx < offsetX + N;
        const inActualQrY = gy >= offsetY && gy < offsetY + N;

        if (inActualQrX && inActualQrY) {
          const qx = gx - offsetX;
          const qy = gy - offsetY;
          if (!isFinder(qx, qy) && qrData.get(qx, qy)) {
            cells.push({ x: gx, y: gy });
          }
        }
      } else {
        if (isInsideHeart(gx, gy, G) && randomDot(gx, gy)) {
          decorativeCells.push({ x: gx, y: gy });
        }
      }
    }
  }

  const renderFinder = (x: number, y: number) => {
    const absX = x + offsetX;
    const absY = y + offsetY;
    return (
      <g transform={`translate(${absX}, ${absY})`}>
        <rect x="0" y="0" width="7" height="7" rx="1.5" fill={color} />
        <rect x="1" y="1" width="5" height="5" rx="1" fill={bgColor} />
        <rect x="2" y="2" width="3" height="3" rx="0.5" fill={color} />
      </g>
    );
  };

  const heartPath =
    "M5 9.5 C5 9.5 0.5 6 0.5 3 C0.5 1 2.5 0 5 2.5 C7.5 0 9.5 1 9.5 3 C9.5 6 5 9.5 5 9.5 Z";

  return (
    <div style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${G} ${G}`}
        width={size}
        height={size}
        style={{ display: "block" }}
      >
        <rect width="100%" height="100%" fill="transparent" />

        {/* Decorative dots forming the outer heart shape */}
        <g fill={color} opacity="1">
          {decorativeCells.map((cell, i) => (
            <rect key={`dec-${i}`} x={cell.x + 0.1} y={cell.y + 0.1} width="0.8" height="0.8" rx="0.3" />
          ))}
        </g>

        {/* White background for the QR code area */}
        <rect
          x={offsetX - padding}
          y={offsetY - padding}
          width={N + padding * 2}
          height={N + padding * 2}
          fill={bgColor}
          rx="4"
        />

        {/* Finder Patterns */}
        {renderFinder(0, 0)}
        {renderFinder(N - 7, 0)}
        {renderFinder(0, N - 7)}

        {/* Data Modules */}
        <g fill={color}>
          {cells.map((cell, i) => (
            <rect key={`data-${i}`} x={cell.x + 0.05} y={cell.y + 0.05} width="0.9" height="0.9" rx="0.3" />
          ))}
        </g>

        {/* Center heart logo */}
        <g transform={`translate(${offsetX + Math.floor(N / 2) - 2.5}, ${offsetY + Math.floor(N / 2) - 2.5})`}>
          <rect x="-0.5" y="-0.5" width="6" height="6" fill={bgColor} />
          <g transform="scale(0.5)">
            <path d={heartPath} fill={color} />
          </g>
        </g>
      </svg>
    </div>
  );
}
